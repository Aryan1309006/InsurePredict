import os
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from app.config import settings
from app.database.mongodb import MongoDBManager
from app.routes.api import router as api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("insurepredict")


async def _init_database_background():
    """
    Connect and build indexes in a worker thread so the web server starts
    and binds to the dynamic port immediately without blocking event loop.
    """
    try:
        connected = await asyncio.to_thread(MongoDBManager.ping)
        if connected:
            logger.info("Connected to MongoDB Atlas successfully.")
            await asyncio.to_thread(MongoDBManager.init_indexes)
        else:
            logger.warning(
                "MongoDB Atlas connection was not established on startup. "
                "The web server is running and ready. Ensure MONGODB_URI is set "
                "and Render outbound traffic (or 0.0.0.0/0) is allowed in Atlas Network Access."
            )
    except Exception as e:
        logger.warning(f"Background database connection attempt: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start InsurePredict API immediately and initialize DB in background
    logger.info("Starting up InsurePredict API...")
    db_task = asyncio.create_task(_init_database_background())
    yield
    # Shutdown: Close database connection pool
    logger.info("Shutting down InsurePredict API...")
    if not db_task.done():
        db_task.cancel()
    MongoDBManager.close()


app = FastAPI(
    title="InsurePredict API",
    description="Machine Learning Powered Health Insurance Cost Prediction API with Authentication and MongoDB Atlas",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS configuration
allowed_origins = [
    "https://insure-predict.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
if settings.FRONTEND_URL:
    clean_frontend = settings.FRONTEND_URL.strip().rstrip("/")
    if clean_frontend and clean_frontend not in allowed_origins:
        allowed_origins.append(clean_frontend)

allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    for orig in allowed_origins_env.split(","):
        o = orig.strip().rstrip("/")
        if o and o not in allowed_origins:
            allowed_origins.append(o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https://insure-predict(-[a-zA-Z0-9_-]+)?\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Specific handler for MongoDB connectivity errors
@app.exception_handler(ConnectionFailure)
@app.exception_handler(ServerSelectionTimeoutError)
async def mongodb_exception_handler(request: Request, exc: Exception):
    logger.error(f"MongoDB connection error: {exc}")
    return JSONResponse(
        status_code=503,
        content={
            "error": "DatabaseUnavailable",
            "message": "Database service is currently unreachable. Please verify MongoDB Atlas connection settings."
        }
    )


# Safe exception handler that preserves HTTPExceptions
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, (HTTPException, StarletteHTTPException)):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=getattr(exc, "headers", None)
        )
    logger.error(f"Unhandled server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": "An error occurred while processing your request. Please try again later."
        }
    )


app.include_router(api_router)


@app.get("/")
def root():
    return {
        "app": "InsurePredict API",
        "status": "online",
        "database": "connected" if MongoDBManager.is_connected() else "disconnected",
        "docs_url": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting InsurePredict API on {host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port)

