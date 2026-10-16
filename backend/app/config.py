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
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production" if os.getenv("RENDER") else "development")
    
    # Cookie security settings
    COOKIE_NAME: str = "insurepredict_session"
    
    @property
    def COOKIE_SAMESITE(self) -> str:
        explicit = os.getenv("COOKIE_SAMESITE")
        if explicit:
            return explicit
        # Cross-site cookie between Vercel and Render requires SameSite=None
        if self.ENVIRONMENT.lower() == "production" or "vercel.app" in self.FRONTEND_URL:
            return "none"
        return "lax"
    
    @property
    def COOKIE_SECURE(self) -> bool:
        # SameSite=None requires Secure=True in modern browsers
        return self.COOKIE_SAMESITE.lower() == "none" or self.ENVIRONMENT.lower() == "production"

settings = Settings()
