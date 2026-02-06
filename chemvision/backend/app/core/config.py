"""Application configuration."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    environment: str = Field(default="development", description="Environment name")
    log_level: str = Field(default="INFO", description="Logging level")

    # CORS - use JSON array format in environment variable
    # Example: CORS_ORIGINS='["http://localhost:3000", "http://example.com"]'
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "http://frontend:3000"],
        description="Allowed CORS origins (JSON array format)",
    )

    # API
    max_upload_size: int = Field(
        default=10 * 1024 * 1024,  # 10 MB
        description="Maximum upload size in bytes",
    )


settings = Settings()
