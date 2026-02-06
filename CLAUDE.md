# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChemVision is a web application for molecular structure recognition and chemical nomenclature conversion. It provides three core operations:
- **Image → Structure**: Extract SMILES notation from molecular diagrams (OCSR)
- **Name → Structure**: Convert IUPAC chemical names to SMILES
- **Structure → Name**: Generate IUPAC names from SMILES

Currently in Phase 1 (POC) - only "isopentane" → "CC(C)CC" works as a demo; other operations return HTTP 501.

## Repository Structure

```
chemvision/
├── frontend/      # Next.js 14 (App Router, TypeScript, Tailwind, shadcn/ui)
├── backend/       # FastAPI (Python 3.11+, Pydantic v2, structlog)
├── ml/            # ML training code (placeholder for Phase 2+)
├── ops/           # Docker Compose configuration
└── ADRs/          # Architecture Decision Records
```

## Development Commands

All commands run from `/chemvision/` directory:

```bash
make dev      # Start frontend (3000) + backend (8000) with Docker Compose
make test     # Run all tests (backend pytest + frontend vitest)
make lint     # Run all linters (ruff, mypy, eslint)
make fmt      # Format all code (ruff format, prettier)
make build    # Build Docker images
make clean    # Clean up containers and artifacts
```

### Running Tests Individually

**Backend:**
```bash
cd chemvision/backend
pytest -v --cov=app --cov-report=term-missing
pytest tests/test_convert_endpoints.py -v  # Single test file
```

**Frontend:**
```bash
cd chemvision/frontend
pnpm test        # Watch mode
pnpm test --run  # Single run
pnpm test:ui     # Vitest UI
```

## Architecture

### Backend (FastAPI)
- **Entry point**: `backend/app/main.py`
- **Routers**: `backend/app/routers/convert.py` - Three conversion endpoints
- **Services**: `backend/app/services/` - Business logic (naming.py, ocsr.py)
- **Schemas**: `backend/app/models/schemas.py` - Pydantic request/response models
- **Config**: `backend/app/core/config.py` - Environment-based settings

### Frontend (Next.js)
- **Entry point**: `frontend/app/page.tsx` - Main tabbed interface
- **Forms**: `frontend/components/forms/` - One form per conversion type
- **UI Components**: `frontend/components/ui/` - shadcn/ui base components
- **Path alias**: `@/*` maps to project root

### API Endpoints
- `POST /api/name-to-structure` - IUPAC name → SMILES
- `POST /api/structure-to-name` - SMILES → IUPAC name
- `POST /api/image-to-structure` - Image → SMILES
- `GET /health` - Health check

### Error Response Format
All errors follow this structure:
```json
{
  "error_code": "NOT_IMPLEMENTED",
  "message": "Human-readable description",
  "details": null,
  "correlation_id": "uuid"
}
```

## Code Quality Standards

- **Backend**: 85%+ test coverage, strict mypy type checking, ruff linting
- **Frontend**: ESLint (next/core-web-vitals), Prettier formatting
- **Pre-commit hooks**: Configured in `.pre-commit-config.yaml`

Run `./ci-check.sh` before pushing to validate all CI checks locally.

## Key Configuration Files

- `chemvision/Makefile` - Development commands
- `chemvision/ADRs/` - Read for architectural context
- `chemvision/ops/docker-compose.yml` - Local development setup
- `.github/workflows/ci.yml` - CI pipeline definition
