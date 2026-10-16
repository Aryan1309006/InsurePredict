import os
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Try to connect to MongoDB and build indexes
    logger.info("Starting up InsurePredict API...")
    try:
        if MongoDBManager.ping():
            logger.info("Connected to MongoDB successfully.")
            MongoDBManager.init_indexes()
        else:
            logger.warning("MongoDB ping failed on startup. Will reconnect on demand.")
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB on startup: {e}")
    yield
    # Shutdown: Close database connection pool
    logger.info("Shutting down InsurePredict API...")
    MongoDBManager.close()


app = FastAPI(
    title="InsurePredict API",
    description="Machine Learning Powered Health Insurance Cost Prediction API with Authentication and MongoDB Atlas",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS configuration
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "https://insure-predict.vercel.app",
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
    allow_origin_regex=r"https://.*\.vercel\.app",
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
        "database": "connected" if MongoDBManager.ping() else "disconnected",
        "docs_url": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting InsurePredict API on {host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port)

