"""Unit tests for the naming service."""

from app.services.naming import DEMO_MAPPINGS, name_to_smiles, smiles_to_name


class TestNameToSmiles:
    """Tests for name_to_smiles function."""

    def test_demo_case_isopentane(self) -> None:
        """Test the demo case for isopentane."""
        result = name_to_smiles("isopentane")
        assert result == "CC(C)CC"

    def test_case_insensitive_uppercase(self) -> None:
        """Test that matching is case-insensitive (uppercase)."""
        result = name_to_smiles("ISOPENTANE")
        assert result == "CC(C)CC"

    def test_case_insensitive_mixed(self) -> None:
        """Test that matching is case-insensitive (mixed case)."""
        result = name_to_smiles("IsoPentane")
        assert result == "CC(C)CC"

    def test_whitespace_stripping(self) -> None:
        """Test that leading/trailing whitespace is stripped."""
        result = name_to_smiles("  isopentane  ")
        assert result == "CC(C)CC"

    def test_unknown_name_returns_none(self) -> None:
        """Test that unknown names return None."""
        result = name_to_smiles("unknown-molecule-xyz")
        assert result is None

    def test_empty_string_returns_none(self) -> None:
        """Test that empty string returns None (after strip)."""
        result = name_to_smiles("")
        assert result is None

    def test_whitespace_only_returns_none(self) -> None:
        """Test that whitespace-only string returns None."""
        result = name_to_smiles("   ")
        assert result is None

    def test_all_demo_mappings_work(self) -> None:
        """Test that all entries in DEMO_MAPPINGS work correctly."""
        for name, expected_smiles in DEMO_MAPPINGS.items():
            result = name_to_smiles(name)
            assert result == expected_smiles, f"Failed for {name}"


class TestSmilesToName:
    """Tests for smiles_to_name function."""

    def test_returns_none_in_phase_1(self) -> None:
        """Test that smiles_to_name returns None in Phase 1."""
        result = smiles_to_name("CC(C)CC")
        assert result is None

    def test_returns_none_for_any_smiles(self) -> None:
        """Test that any SMILES input returns None."""
        test_cases = ["C", "CC", "CCO", "c1ccccc1", "CC(=O)O"]
        for smiles in test_cases:
            result = smiles_to_name(smiles)
            assert result is None, f"Expected None for {smiles}"

    def test_returns_none_for_empty_string(self) -> None:
        """Test that empty string returns None."""
        result = smiles_to_name("")
        assert result is None


class TestDemoMappings:
    """Tests for DEMO_MAPPINGS constant."""

    def test_demo_mappings_not_empty(self) -> None:
        """Test that DEMO_MAPPINGS has at least one entry."""
        assert len(DEMO_MAPPINGS) >= 1

    def test_demo_mappings_contains_isopentane(self) -> None:
        """Test that DEMO_MAPPINGS contains the isopentane entry."""
        assert "isopentane" in DEMO_MAPPINGS
        assert DEMO_MAPPINGS["isopentane"] == "CC(C)CC"

    def test_demo_mappings_keys_are_lowercase(self) -> None:
        """Test that all keys in DEMO_MAPPINGS are lowercase."""
        for key in DEMO_MAPPINGS:
            assert key == key.lower(), f"Key {key} is not lowercase"

    def test_demo_mappings_values_are_non_empty(self) -> None:
        """Test that all SMILES values are non-empty strings."""
        for name, smiles in DEMO_MAPPINGS.items():
            assert isinstance(smiles, str), f"SMILES for {name} is not a string"
            assert len(smiles) > 0, f"SMILES for {name} is empty"
