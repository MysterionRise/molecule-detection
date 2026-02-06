"""Tests for global exception handler and middleware."""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app


class TestGlobalExceptionHandler:
    """Tests for the global exception handler."""

    def test_unhandled_exception_returns_500(self, client: TestClient) -> None:
        """Test that unhandled exceptions return 500 status."""
        # We'll use a mock to force an exception in an endpoint
        with patch("app.services.naming.name_to_smiles", side_effect=RuntimeError("Test error")):
            response = client.post(
                "/api/name-to-structure",
                json={"name": "test"},
            )
            # The endpoint catches exceptions and returns 500
            assert response.status_code == 500

    def test_exception_response_format(self, client: TestClient) -> None:
        """Test that exception response has correct format."""
        with patch("app.services.naming.name_to_smiles", side_effect=RuntimeError("Test error")):
            response = client.post(
                "/api/name-to-structure",
                json={"name": "test"},
            )
            data = response.json()
            assert "detail" in data
            error = data["detail"]
            assert "error_code" in error
            assert "message" in error
            assert "correlation_id" in error

    def test_exception_includes_correlation_id(self, client: TestClient) -> None:
        """Test that exceptions include correlation ID."""
        with patch("app.services.naming.name_to_smiles", side_effect=RuntimeError("Test error")):
            response = client.post(
                "/api/name-to-structure",
                json={"name": "test"},
            )
            assert "X-Correlation-ID" in response.headers
            data = response.json()
            assert data["detail"]["correlation_id"] is not None


class TestCorrelationIdMiddleware:
    """Tests for correlation ID middleware."""

    def test_generates_correlation_id_if_missing(self, client: TestClient) -> None:
        """Test that correlation ID is generated if not provided."""
        response = client.get("/health")
        assert "X-Correlation-ID" in response.headers
        correlation_id = response.headers["X-Correlation-ID"]
        assert len(correlation_id) > 0
        # UUID format check
        assert len(correlation_id) == 36

    def test_preserves_provided_correlation_id(self, client: TestClient) -> None:
        """Test that provided correlation ID is preserved."""
        test_id = "custom-correlation-id-12345"
        response = client.get(
            "/health",
            headers={"X-Correlation-ID": test_id},
        )
        assert response.headers["X-Correlation-ID"] == test_id

    def test_correlation_id_propagates_to_error_response(self, client: TestClient) -> None:
        """Test that correlation ID appears in error responses."""
        test_id = "error-correlation-id-67890"
        response = client.post(
            "/api/name-to-structure",
            json={"name": "unknown-molecule"},
            headers={"X-Correlation-ID": test_id},
        )
        assert response.status_code == 501
        # Header should have the ID
        assert response.headers["X-Correlation-ID"] == test_id
        # Error body should also have it
        data = response.json()
        assert data["detail"]["correlation_id"] == test_id

    def test_different_requests_get_different_ids(self, client: TestClient) -> None:
        """Test that different requests get different correlation IDs."""
        response1 = client.get("/health")
        response2 = client.get("/health")
        id1 = response1.headers["X-Correlation-ID"]
        id2 = response2.headers["X-Correlation-ID"]
        assert id1 != id2


class TestHealthEndpoint:
    """Tests for health check endpoint via exception handler context."""

    def test_health_returns_200(self, client: TestClient) -> None:
        """Test that health endpoint returns 200."""
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_response_format(self, client: TestClient) -> None:
        """Test health response format."""
        response = client.get("/health")
        data = response.json()
        assert data == {"status": "ok"}


class TestEndpointExceptionHandling:
    """Tests for exception handling in specific endpoints."""

    def test_name_to_structure_handles_service_error(self, client: TestClient) -> None:
        """Test name-to-structure handles service errors gracefully."""
        with patch(
            "app.services.naming.name_to_smiles", side_effect=ValueError("Invalid input")
        ):
            response = client.post(
                "/api/name-to-structure",
                json={"name": "test"},
            )
            assert response.status_code == 500
            data = response.json()
            assert data["detail"]["error_code"] == "CONVERSION_ERROR"

    def test_structure_to_name_handles_service_error(self, client: TestClient) -> None:
        """Test structure-to-name handles service errors gracefully."""
        with patch(
            "app.services.naming.smiles_to_name", side_effect=ValueError("Invalid SMILES")
        ):
            response = client.post(
                "/api/structure-to-name",
                json={"smiles": "CC"},
            )
            assert response.status_code == 500
            data = response.json()
            assert data["detail"]["error_code"] == "CONVERSION_ERROR"

    def test_image_to_structure_handles_service_error(self, client: TestClient) -> None:
        """Test image-to-structure handles service errors gracefully."""
        png_bytes = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
            b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        with patch(
            "app.services.ocsr.image_to_smiles", side_effect=ValueError("Image processing error")
        ):
            response = client.post(
                "/api/image-to-structure",
                files={"image": ("test.png", png_bytes, "image/png")},
            )
            assert response.status_code == 500
            data = response.json()
            assert data["detail"]["error_code"] == "CONVERSION_ERROR"
