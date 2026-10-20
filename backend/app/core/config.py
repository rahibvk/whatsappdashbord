"""
IndaureX SaaS Platform — Application Settings
Loads configuration from environment variables / .env file.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── App ──
    APP_NAME: str = "IndaureX SaaS Platform"
    DEBUG: bool = False

    # ── Database ──
    DATABASE_URL: str = "postgresql://indaurex:indaurex_secret@localhost:5432/indaurex_db"

    # ── JWT ──
    JWT_SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # ── Fernet Encryption ──
    FERNET_SECRET_KEY: str = "change-me"

    # ── Webhook ──
    WEBHOOK_BASE_URL: str = "http://localhost:8000/v1/twilio/webhook"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
