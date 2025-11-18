"""Chemical naming service for IUPAC <-> SMILES conversion."""

# Phase 1: Single demo mapping for testing
DEMO_MAPPINGS = {
    "isopentane": "CC(C)CC",
    # Add more demo cases as needed
}


def name_to_smiles(name: str) -> str | None:
    """
    Convert IUPAC chemical name to SMILES notation.

    Phase 1: Returns SMILES only for demo mappings, None otherwise.
    Phase 2: Will integrate OPSIN or Python-based IUPAC parser.

    Args:
        name: IUPAC chemical name (case-insensitive)

    Returns:
        SMILES string if conversion successful, None otherwise
    """
    name_normalized = name.strip().lower()

    if name_normalized in DEMO_MAPPINGS:
        return DEMO_MAPPINGS[name_normalized]

    return None


def smiles_to_name(smiles: str) -> str | None:
    """
    Convert SMILES notation to IUPAC chemical name.

    Phase 1: Not implemented (returns None).
    Phase 2: Will use ML model or rule-based approach.

    Args:
        smiles: SMILES notation string

    Returns:
        IUPAC name if conversion successful, None otherwise
    """
    # Phase 1: Not implemented
    return None
