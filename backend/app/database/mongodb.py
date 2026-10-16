import logging
import re
from typing import Optional, Any
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from pymongo.database import Database
from pymongo.collection import Collection
from app.config import settings

logger = logging.getLogger("insurepredict.database")


def _sanitize_error(err: Any) -> str:
    """Sanitize database error messages to prevent leaking connection credentials."""
    text = str(err)
    # Redact username:password from mongodb URIs if present in error message
    return re.sub(r"://([^:@]+):([^@]+)@", r"://\1:****@", text)


class MongoDBManager:
    _client: Optional[MongoClient] = None
    _db: Optional[Database] = None
    _is_connected: bool = False

    @classmethod
    def is_connected(cls) -> bool:
        return cls._is_connected

    @classmethod
    def get_client(cls) -> MongoClient:
        if cls._client is None:
            if not settings.MONGODB_URI:
                cls._is_connected = False
                raise ConnectionFailure("MONGODB_URI is not configured in environment variables.")
            try:
                # 5 second timeout for server selection
                cls._client = MongoClient(
                    settings.MONGODB_URI,
                    serverSelectionTimeoutMS=5000,
                    connectTimeoutMS=5000,
                    socketTimeoutMS=10000,
                    appname="InsurePredict"
                )
            except Exception as e:
                cls._is_connected = False
                safe_msg = _sanitize_error(e)
                logger.error(f"Failed to initialize MongoClient: {safe_msg}")
                raise ConnectionFailure(f"Could not initialize MongoDB client: {safe_msg}")
        return cls._client

    @classmethod
    def get_database(cls) -> Database:
        if cls._db is None:
            client = cls.get_client()
            cls._db = client[settings.DATABASE_NAME]
        return cls._db

    @classmethod
    def ping(cls) -> bool:
        if not settings.MONGODB_URI:
            cls._is_connected = False
            return False
        try:
            client = cls.get_client()
            client.admin.command("ping")
            cls._is_connected = True
            return True
        except Exception as e:
            cls._is_connected = False
            safe_msg = _sanitize_error(e)
            logger.warning(f"MongoDB ping failed: {safe_msg}")
            return False

    @classmethod
    def init_indexes(cls):
        """Create required indexes on collections."""
        try:
            db = cls.get_database()
            # Unique index on users.email
            users_col = db["users"]
            users_col.create_index([("email", ASCENDING)], unique=True, name="uniq_user_email")
            
            # Index on predictions (user_id and created_at)
            preds_col = db["predictions"]
            preds_col.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)], name="idx_user_created_at")
            logger.info("MongoDB indexes verified and ready.")
        except Exception as e:
            logger.warning(f"MongoDB index creation encountered an issue: {e}")

    @classmethod
    def get_users_collection(cls) -> Collection:
        db = cls.get_database()
        return db["users"]

    @classmethod
    def get_predictions_collection(cls) -> Collection:
        db = cls.get_database()
        return db["predictions"]

    @classmethod
    def close(cls):
        if cls._client is not None:
            cls._client.close()
            cls._client = None
            cls._db = None
            logger.info("MongoDB connection closed.")


def get_db() -> Database:
    try:
        return MongoDBManager.get_database()
    except (ConnectionFailure, ServerSelectionTimeoutError) as err:
        logger.error(f"Database unavailable: {err}")
        raise ConnectionFailure("Database service is currently unreachable.")

def get_users_col() -> Collection:
    return MongoDBManager.get_users_collection()

def get_predictions_col() -> Collection:
    return MongoDBManager.get_predictions_collection()
