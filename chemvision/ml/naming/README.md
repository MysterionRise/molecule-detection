# Chemical Naming

This directory will contain models and code for bidirectional IUPAC name ↔ SMILES conversion.

## Phase 2 Plan

- Integrate OPSIN (Java) for name→structure
- Implement small Transformer for structure→name
- Rule-based fallbacks for common cases

## Phase 3 Plan

- Production Transformer with full IUPAC support
- Stereochemistry and complex functional groups
- Confidence-based fallback strategies
- Round-trip validation

## Directory Structure (Future)

```
naming/
├── data/
│   ├── iupac_smiles_pairs/  # Training pairs
│   └── scripts/              # Data collection
├── models/
│   ├── name_to_smiles/       # OPSIN integration
│   ├── smiles_to_name/       # Transformer models
│   └── checkpoints/          # Trained weights
├── training/
│   ├── train.py
│   ├── evaluate.py
│   └── config/
└── validation/
    └── round_trip_tests.py  # Consistency checks
```

## Potential Approaches

- **Name→SMILES**: OPSIN (Java), ChemDataExtractor, custom parser
- **SMILES→Name**: Transformer seq2seq, fine-tuned T5/BART, RDKit + rules
- **Pre-trained**: ChemBERTa, MolBERT embeddings
