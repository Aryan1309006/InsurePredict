import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend root or current directory
backend_dir = Path(__file__).resolve().parent.parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "insurepredict")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-insurepredict-jwt-key-change-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Cookie security settings
    COOKIE_NAME: str = "insurepredict_session"
    COOKIE_SAMESITE: str = "lax"
    
    @property
    def COOKIE_SECURE(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

settings = Settings()
