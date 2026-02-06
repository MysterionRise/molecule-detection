"""Unit tests for the OCSR service."""

from app.services.ocsr import image_to_smiles


class TestImageToSmiles:
    """Tests for image_to_smiles function."""

    def test_returns_none_in_phase_1(self) -> None:
        """Test that image_to_smiles returns None in Phase 1."""
        # Minimal valid PNG bytes
        png_bytes = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
            b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        result = image_to_smiles(png_bytes)
        assert result is None

    def test_returns_none_for_empty_bytes(self) -> None:
        """Test that empty bytes return None."""
        result = image_to_smiles(b"")
        assert result is None

    def test_returns_none_for_jpeg_bytes(self) -> None:
        """Test that JPEG-like bytes return None."""
        # Minimal JPEG header
        jpeg_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
        result = image_to_smiles(jpeg_bytes)
        assert result is None

    def test_returns_none_for_arbitrary_bytes(self) -> None:
        """Test that arbitrary bytes return None."""
        arbitrary_bytes = b"not an image at all"
        result = image_to_smiles(arbitrary_bytes)
        assert result is None

    def test_returns_none_for_large_input(self) -> None:
        """Test that large input returns None."""
        large_bytes = b"\x00" * 1024 * 1024  # 1MB of null bytes
        result = image_to_smiles(large_bytes)
        assert result is None

    def test_function_signature_accepts_bytes(self) -> None:
        """Test that function accepts bytes type."""
        # Type check - should not raise
        result = image_to_smiles(bytes())
        assert result is None

    def test_returns_none_consistently(self) -> None:
        """Test that multiple calls return None consistently."""
        png_bytes = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
            b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        for _ in range(5):
            result = image_to_smiles(png_bytes)
            assert result is None
