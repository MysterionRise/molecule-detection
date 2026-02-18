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
├── docs/          # Project documentation (GAP_ANALYSIS.md, etc.)
├── ADRs/          # Architecture Decision Records (0001–0004)
├── .github/       # CI workflows, Dependabot config, CI.md
└── SECURITY.md    # Security policy and vulnerability reporting
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
make install  # Install dependencies locally (pip + pnpm)
```

Run `./ci-check.sh` before pushing to validate all CI checks locally. There is also `./run-tests.sh` for running tests specifically.

### Running Tests Individually

**Backend:**
```bash
cd chemvision/backend
pytest -v --cov=app --cov-report=term-missing
pytest app/tests/test_convert_endpoints.py -v  # Single test file
```

**Frontend:**
```bash
cd chemvision/frontend
pnpm test        # Watch mode
pnpm test --run  # Single run
pnpm test:ui     # Vitest UI
```

### Testing Standards

- **Backend**: 80%+ coverage enforced via `pytest.ini` (currently 92%+). 8 test files covering endpoints, services, config, and error handling. Uses pytest-asyncio (`asyncio_mode = "auto"`).
- **Frontend**: 80%+ coverage enforced via vitest thresholds (lines, branches, functions, statements). Tests cover all form components, ResultCard, API client, and main page. Uses @testing-library/react and jsdom.
- **ADR 0004** (`ADRs/0004-testing-strategy.md`) documents the full testing strategy.

## Architecture

### Backend (FastAPI)
- **Entry point**: `backend/app/main.py`
- **Routers**: `backend/app/routers/convert.py` - Three conversion endpoints
- **Services**: `backend/app/services/` - Business logic (naming.py, ocsr.py)
- **Schemas**: `backend/app/models/schemas.py` - Pydantic request/response models
- **Config**: `backend/app/core/config.py` - Environment-based settings via pydantic-settings
- **Middleware**: Correlation ID tracking via structlog context vars
- **Image validation**: Magic bytes check for PNG/JPEG; configurable upload size limit (`settings.max_upload_size`, default 10MB)
- **CORS**: Configured via `settings.cors_origins` (JSON array from environment)

### Frontend (Next.js)
- **Entry point**: `frontend/app/page.tsx` - Main tabbed interface
- **Forms**: `frontend/components/forms/` - One form per conversion type (React Hook Form + Zod validation)
- **Results**: `frontend/components/results/ResultCard.tsx` - Result display with copy/download
- **UI Components**: `frontend/components/ui/` - shadcn/ui base components (Tailwind Merge, CVA, Lucide React icons)
- **API Client**: `frontend/lib/api.ts` - API client with `ApiError` class
- **Path alias**: `@/*` maps to project root
- **Test setup**: `frontend/tests/setup.ts` - Testing Library configuration

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

- **Backend**: 80%+ test coverage, strict mypy type checking (with Pydantic plugin), ruff linting
- **Frontend**: ESLint (next/core-web-vitals + TypeScript + JSX a11y), Prettier formatting, strict TypeScript
- **Pre-commit hooks**: Configured in `.pre-commit-config.yaml`

## Security

- **SECURITY.md**: Vulnerability reporting procedures and security measures
- **Bandit**: SAST scanning for Python code
- **detect-secrets**: Pre-commit hook with `.secrets.baseline`
- **Dependency auditing**: `pip-audit` (Python) and `pnpm audit` (Node.js)
- **Trivy**: Container image scanning
- **Docker**: Non-root user in backend container
- **Dependabot**: Weekly updates for pip, npm, Docker, and GitHub Actions (`.github/dependabot.yml`)

## Key Configuration Files

- `chemvision/Makefile` - Development commands
- `chemvision/ADRs/` - Architecture Decision Records (0001–0004)
- `chemvision/ops/docker-compose.yml` - Local development setup
- `.github/workflows/ci.yml` - CI pipeline definition
- `.github/CI.md` - Detailed CI workflow documentation
- `chemvision/commitlint.config.js` - Conventional commits enforcement
- `chemvision/CONTRIBUTING.md` - Contribution guidelines
- `chemvision/SECURITY.md` - Security policy
- `chemvision/CI-CHECKLIST.md` - CI verification checklist
- `chemvision/CODEOWNERS` - Code ownership rules
- `chemvision/.editorconfig` - Editor configuration
- `chemvision/docs/GAP_ANALYSIS.md` - Architecture improvements documentation
