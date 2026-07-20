import os
from pathlib import Path
from dotenv import load_dotenv

base_dir = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=base_dir / ".env")

class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./snapcheck_v2.db"
    )

    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "change-this-in-production"
    )

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15

    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    CLOUDINARY_URL: str = os.getenv(
        "CLOUDINARY_URL",
        ""
    )

    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    BACKEND_CORS_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.getenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
]
    COOKIE_SECURE: bool = (
    os.getenv("COOKIE_SECURE", "false").lower() == "true"
    )

    COOKIE_SAMESITE: str = os.getenv(
        "COOKIE_SAMESITE",
        "lax",
    )
    
    # Production Storage Quotas Configuration
    STORAGE_SCAN_IMAGE_LIMIT: int = int(os.getenv("STORAGE_SCAN_IMAGE_LIMIT", "500"))
    STORAGE_GRADE_RECORD_LIMIT: int = int(os.getenv("STORAGE_GRADE_RECORD_LIMIT", "2000"))

settings = Settings()