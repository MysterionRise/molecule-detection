# OCSR (Optical Chemical Structure Recognition)

This directory will contain training code, datasets, and models for converting molecular structure images to SMILES notation.

## Phase 2 Plan

- Implement baseline image-to-sequence model
- Data preprocessing pipeline for molecular diagrams
- Training scripts with evaluation metrics

## Phase 3 Plan

- Production ViT/CNN hybrid architecture
- Fine-tuned models for various diagram styles
- Confidence scoring and validation
- Support for complex structures with stereochemistry

## Directory Structure (Future)

```
ocsr/
├── data/
│   ├── raw/           # Original image datasets
│   ├── processed/     # Preprocessed training data
│   └── scripts/       # Data processing utilities
├── models/
│   ├── baseline/      # Phase 2 baseline models
│   └── production/    # Phase 3 production models
├── training/
│   ├── train.py
│   ├── evaluate.py
│   └── config/
└── notebooks/         # Exploratory analysis
```

## Datasets to Consider

- USPTO patent images
- PubChem rendered structures
- Synthetic generated diagrams
- Hand-drawn molecular structures
