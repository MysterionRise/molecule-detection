# ChemVision

> Production-quality web application for molecular structure recognition and chemical nomenclature conversion

ChemVision combines optical chemical structure recognition (OCSR) with bidirectional IUPAC name-structure conversion in an elegant, accessible web interface.

## Features

- **Image → Structure**: Upload molecular diagrams and extract SMILES notation
- **Name → Structure**: Convert IUPAC chemical names to SMILES
- **Structure → Name**: Generate IUPAC names from SMILES notation
- Clean, responsive UI with drag-and-drop support
- Real-time validation and error handling
- Copy-to-clipboard functionality for all outputs

## Quick Start

### Using Docker (Recommended)

```bash
# Start the full stack
make dev

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Native Development

**Backend (Python 3.11+)**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or `.venv\Scripts\activate` on Windows
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

**Frontend (Node 20+)**

```bash
cd frontend
pnpm install
pnpm dev
```

## API Examples

### Name to Structure

```bash
curl -X POST http://localhost:8000/api/name-to-structure \
  -H "Content-Type: application/json" \
  -d '{"name": "isopentane"}'

# Response (Phase 1 demo):
# {"smiles": "CC(C)CC", "source": "demo"}
```

### Structure to Name

```bash
curl -X POST http://localhost:8000/api/structure-to-name \
  -H "Content-Type: application/json" \
  -d '{"smiles": "CC(C)CC"}'

# Response (Phase 1):
# {"error_code": "NOT_IMPLEMENTED", "message": "...", "correlation_id": "..."}
```

### Image to Structure

```bash
curl -X POST http://localhost:8000/api/image-to-structure \
  -F "image=@molecule.png"

# Response (Phase 1):
# {"error_code": "NOT_IMPLEMENTED", "message": "...", "correlation_id": "..."}
```

## Development

### Running Tests

**All tests (backend + frontend):**
```bash
make test
```

**Or run the comprehensive test script:**
```bash
./run-tests.sh
```

**Backend only:**
```bash
cd backend
python -m pytest -v --cov=app --cov-report=term-missing
```

**Frontend only:**
```bash
cd frontend
pnpm test --run  # Single run
pnpm test        # Watch mode
```

**Test Coverage:**
- Backend: 85% coverage (137 statements, 20 missed)
- Frontend: 3 tests passing
- Coverage reports: `backend/htmlcov/index.html`

### Code Formatting

```bash
make fmt
```

### Linting

```bash
make lint
```

## Architecture

ChemVision is a monorepo with clear separation of concerns:

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI (Python 3.11+), Pydantic v2, structured logging
- **ML**: Placeholder services for future PyTorch/RDKit integration
- **Ops**: Docker Compose for local dev, GitHub Actions for CI

See [ADRs](./ADRs) for architectural decision records.

## Roadmap

### Phase 1: POC & DevEx (Current)

**Status**: ✅ Complete

- ✅ Monorepo structure with frontend and backend
- ✅ FastAPI with one working demo (isopentane → CC(C)CC)
- ✅ Next.js UI with three conversion tabs
- ✅ Comprehensive test coverage (80%+)
- ✅ CI/CD with GitHub Actions
- ✅ Docker development environment

**Acceptance Criteria**:
- `make dev` brings up frontend (3000) and backend (8000)
- `make test` runs all tests and passes
- POST `{"name": "isopentane"}` returns `{"smiles": "CC(C)CC"}`
- All other conversions return HTTP 501 with standard error format

### Phase 2: MVP Functionality

**Goal**: Implement real conversion capabilities

**Backend**:
- Integrate OPSIN (Java wrapper) or Python alternative for name→structure
- Add structure→name via small Transformer or rule-based approach
- Implement baseline image→structure model for clean diagrams
- Persist model artifacts and configuration

**Frontend**:
- Confidence scores and live streaming for ML outputs
- Download buttons for results (.smi files)
- Full accessibility audit (WCAG 2.1 AA)
- Mobile responsiveness polish

**Quality**:
- Playwright E2E tests for all three workflows
- Docker image publishing on tagged releases
- Performance benchmarks

**Acceptance Criteria**:
- Name→SMILES passes 20+ curated hydrocarbon test cases
- Image→SMILES correctly processes clean test image suite
- Round-trip validation: SMILES → name → SMILES preserves molecular graph
- E2E tests cover happy paths and error states
- Mobile UI tested on iOS Safari and Android Chrome

### Phase 3: Production Grade

**Goal**: Enterprise-ready system with state-of-the-art ML

**ML Enhancements**:
- Replace baseline models with production-quality alternatives:
  - OCSR: ViT/CNN hybrid or fine-tuned Donut/Pix2Struct
  - Naming: Transformer with stereochemistry support
- Confidence scoring and automatic fallbacks
- Support for rings, stereochemistry, functional groups
- Validation with RDKit molecular graph canonicalization

**System**:
- **Observability**: OpenTelemetry traces, structured logs, request correlation
- **Security**: Rate limiting, OAuth2/JWT, SAST (Bandit), Dependabot
- **Scalability**: Batch APIs, background job queue, resumable uploads
- **Reliability**: Error budgets, SLOs, zero-downtime deployments

**Benchmarks**:
- Public benchmark harness with CI tracking
- External OCSR dataset evaluation (e.g., USPTO, JPO)
- IUPAC naming accuracy vs. commercial tools

**Acceptance Criteria**:
- OCSR ≥90% accuracy on clean diagrams, ~100% on curated test set
- Bidirectional name↔structure conversion ≥95% on held-out pairs
- Round-trip consistency ≥98%
- SLOs documented and monitored
- Security audit passed
- Load tested to 1000 req/min sustained

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Run `make test && make lint`
5. Commit with clear messages
6. Push and open a Pull Request

## License

MIT License - see [LICENSE](./LICENSE)

## Acknowledgments

- Built on the original [molecule-detection](https://github.com/MysterionRise/molecule-detection) project
- Inspired by modern cheminformatics tools and the RDKit community
