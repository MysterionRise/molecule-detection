"""Tests for conversion endpoints."""

from fastapi.testclient import TestClient


class TestNameToStructure:
    """Tests for name-to-structure endpoint."""

    def test_demo_case_isopentane(self, client: TestClient) -> None:
        """Test the demo case for isopentane."""
        response = client.post(
            "/api/name-to-structure",
            json={"name": "isopentane"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["smiles"] == "CC(C)CC"
        assert data["source"] == "demo"

    def test_demo_case_case_insensitive(self, client: TestClient) -> None:
        """Test that name matching is case-insensitive."""
        response = client.post(
            "/api/name-to-structure",
            json={"name": "IsoPentane"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["smiles"] == "CC(C)CC"

    def test_unknown_name_returns_501(self, client: TestClient) -> None:
        """Test that unknown names return 501 Not Implemented."""
        response = client.post(
            "/api/name-to-structure",
            json={"name": "some-unknown-molecule"},
        )

        assert response.status_code == 501
        data = response.json()
        assert "detail" in data
        error = data["detail"]
        assert error["error_code"] == "NOT_IMPLEMENTED"
        assert "correlation_id" in error
        assert isinstance(error["correlation_id"], str)

    def test_validation_empty_name(self, client: TestClient) -> None:
        """Test that empty name fails validation."""
        response = client.post(
            "/api/name-to-structure",
            json={"name": ""},
        )

        assert response.status_code == 422  # Validation error


class TestStructureToName:
    """Tests for structure-to-name endpoint."""

    def test_returns_501_not_implemented(self, client: TestClient) -> None:
        """Test that structure-to-name returns 501 in Phase 1."""
        response = client.post(
            "/api/structure-to-name",
            json={"smiles": "CC(C)CC"},
        )

        assert response.status_code == 501
        data = response.json()
        assert "detail" in data
        error = data["detail"]
        assert error["error_code"] == "NOT_IMPLEMENTED"
        assert "correlation_id" in error

    def test_validation_empty_smiles(self, client: TestClient) -> None:
        """Test that empty SMILES fails validation."""
        response = client.post(
            "/api/structure-to-name",
            json={"smiles": ""},
        )

        assert response.status_code == 422


class TestImageToStructure:
    """Tests for image-to-structure endpoint."""

    def test_returns_501_not_implemented(self, client: TestClient) -> None:
        """Test that image-to-structure returns 501 in Phase 1."""
        # Create a minimal PNG file (1x1 transparent pixel)
        png_bytes = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
            b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        )

        response = client.post(
            "/api/image-to-structure",
            files={"image": ("test.png", png_bytes, "image/png")},
        )

        assert response.status_code == 501
        data = response.json()
        assert "detail" in data
        error = data["detail"]
        assert error["error_code"] == "NOT_IMPLEMENTED"
        assert "correlation_id" in error

    def test_invalid_image_type(self, client: TestClient) -> None:
        """Test that invalid image types are rejected."""
        response = client.post(
            "/api/image-to-structure",
            files={"image": ("test.txt", b"not an image", "text/plain")},
        )

        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        error = data["detail"]
        assert error["error_code"] == "INVALID_IMAGE_TYPE"


class TestCorrelationId:
    """Tests for correlation ID handling."""

    def test_correlation_id_in_response_headers(self, client: TestClient) -> None:
        """Test that correlation ID is returned in response headers."""
        response = client.get("/health")

        assert "X-Correlation-ID" in response.headers
        assert len(response.headers["X-Correlation-ID"]) > 0

    def test_correlation_id_persists_from_request(self, client: TestClient) -> None:
        """Test that correlation ID from request is preserved."""
        test_id = "test-correlation-id-12345"

        response = client.get(
            "/health",
            headers={"X-Correlation-ID": test_id},
        )

        assert response.headers["X-Correlation-ID"] == test_id
