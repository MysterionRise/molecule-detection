"""Optical Chemical Structure Recognition (OCSR) service."""


def image_to_smiles(image_bytes: bytes) -> str | type[NotImplemented]:
    """
    Extract SMILES notation from a molecular structure image.

    Phase 1: Not implemented (returns NotImplemented).
    Phase 2: Will implement baseline image-to-sequence model.
    Phase 3: Will use production-quality ViT/CNN hybrid.

    Args:
        image_bytes: Raw image bytes (PNG or JPEG)

    Returns:
        SMILES string if recognition successful, NotImplemented otherwise
    """
    # Phase 1: Not implemented
    return NotImplemented
