"""Unit tests for application configuration."""

import os
from unittest.mock import patch

import pytest
from pydantic import ValidationError

from app.core.config import Settings


class TestSettingsDefaults:
    """Tests for default Settings values."""

    def test_default_environment(self) -> None:
        """Test default environment value."""
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings()
            assert settings.environment == "development"

    def test_default_log_level(self) -> None:
        """Test default log level value."""
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings()
            assert settings.log_level == "INFO"

    def test_default_cors_origins(self) -> None:
        """Test default CORS origins value."""
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings()
            assert "http://localhost:3000" in settings.cors_origins
            assert "http://frontend:3000" in settings.cors_origins

    def test_default_max_upload_size(self) -> None:
        """Test default max upload size (10MB)."""
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings()
            assert settings.max_upload_size == 10 * 1024 * 1024


class TestSettingsFromEnv:
    """Tests for Settings loaded from environment variables."""

    def test_environment_from_env(self) -> None:
        """Test environment value from env variable."""
        with patch.dict(os.environ, {"ENVIRONMENT": "production"}, clear=True):
            settings = Settings()
            assert settings.environment == "production"

    def test_log_level_from_env(self) -> None:
        """Test log level from env variable."""
        with patch.dict(os.environ, {"LOG_LEVEL": "DEBUG"}, clear=True):
            settings = Settings()
            assert settings.log_level == "DEBUG"

    def test_max_upload_size_from_env(self) -> None:
        """Test max upload size from env variable."""
        with patch.dict(os.environ, {"MAX_UPLOAD_SIZE": "5242880"}, clear=True):
            settings = Settings()
            assert settings.max_upload_size == 5242880

    def test_cors_origins_from_env_json(self) -> None:
        """Test CORS origins from env variable as JSON array."""
        env_value = '["https://example.com", "https://api.example.com"]'
        with patch.dict(os.environ, {"CORS_ORIGINS": env_value}, clear=True):
            settings = Settings()
            assert "https://example.com" in settings.cors_origins
            assert "https://api.example.com" in settings.cors_origins


class TestSettingsCaseInsensitive:
    """Tests for case-insensitive environment variable names."""

    def test_lowercase_env_var(self) -> None:
        """Test lowercase env variable name."""
        with patch.dict(os.environ, {"environment": "staging"}, clear=True):
            settings = Settings()
            assert settings.environment == "staging"

    def test_uppercase_env_var(self) -> None:
        """Test uppercase env variable name."""
        with patch.dict(os.environ, {"ENVIRONMENT": "staging"}, clear=True):
            settings = Settings()
            assert settings.environment == "staging"


class TestSettingsType:
    """Tests for Settings type validation."""

    def test_max_upload_size_must_be_int(self) -> None:
        """Test that max_upload_size is converted to int."""
        with patch.dict(os.environ, {"MAX_UPLOAD_SIZE": "1000"}, clear=True):
            settings = Settings()
            assert isinstance(settings.max_upload_size, int)
            assert settings.max_upload_size == 1000

    def test_cors_origins_is_list(self) -> None:
        """Test that cors_origins is a list."""
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings()
            assert isinstance(settings.cors_origins, list)


class TestGlobalSettingsInstance:
    """Tests for the global settings instance."""

    def test_settings_import(self) -> None:
        """Test that global settings instance can be imported."""
        from app.core.config import settings

        assert settings is not None
        assert isinstance(settings, Settings)

    def test_settings_has_expected_attributes(self) -> None:
        """Test that settings has all expected attributes."""
        from app.core.config import settings

        assert hasattr(settings, "environment")
        assert hasattr(settings, "log_level")
        assert hasattr(settings, "cors_origins")
        assert hasattr(settings, "max_upload_size")
