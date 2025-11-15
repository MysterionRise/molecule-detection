# ADR 0001: Monorepo Architecture with Separate Frontend and Backend

**Date**: 2025-01-15

**Status**: Accepted

## Context

We need to build a web application for molecular structure recognition and chemical nomenclature conversion. The application has distinct concerns:
- ML/Deep Learning inference (Python ecosystem)
- Modern web interface (JavaScript/TypeScript ecosystem)
- Potential for future mobile apps or CLI tools

## Decision

We will use a **monorepo architecture** with clear separation between frontend and backend:

```
chemvision/
├── frontend/    # Next.js TypeScript app
├── backend/     # FastAPI Python app
├── ml/          # ML training code and models
└── ops/         # Infrastructure and deployment
```

### Rationale

**Why Monorepo**:
- Single source of truth for the entire project
- Easier coordination of changes across stack
- Simplified CI/CD with unified testing
- Shared documentation and tooling configuration

**Why Separation**:
- Different technology stacks (Python vs Node.js)
- Independent deployment capabilities
- Clear API contract between services
- Each component can scale independently

**Frontend (Next.js)**:
- Modern React framework with excellent DX
- Built-in SSR/SSG for better performance
- Strong TypeScript support
- Easy deployment to Vercel/Netlify/Docker

**Backend (FastAPI)**:
- Python-first for ML ecosystem compatibility
- Automatic OpenAPI documentation
- High performance (async/await)
- Excellent type safety with Pydantic

## Consequences

**Positive**:
- Clear separation of concerns
- Each stack uses its native tooling
- Easy to onboard specialists (frontend devs, ML engineers)
- Can deploy services independently if needed

**Negative**:
- More complex local development setup
- Need to manage CORS and API contracts
- Duplicate some configuration (linting, CI)

**Mitigations**:
- Docker Compose for easy local development
- Shared Makefile for common tasks
- Clear API schemas with Pydantic/Zod
- Automated E2E tests to catch integration issues
