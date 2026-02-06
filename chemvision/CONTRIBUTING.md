# Contributing to ChemVision

Thank you for your interest in contributing to ChemVision! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 20+ with pnpm
- Docker and Docker Compose
- Git

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chemvision
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   pip install -e ".[dev]"
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   pnpm install
   ```

4. **Install pre-commit hooks**
   ```bash
   pip install pre-commit
   pre-commit install
   pre-commit install --hook-type commit-msg
   ```

5. **Start development servers**
   ```bash
   make dev
   ```

## Code Quality Standards

### Testing Requirements

All code changes must maintain or improve test coverage:

- **Backend**: Minimum 80% coverage (enforced)
  ```bash
  cd backend
  pytest -v --cov=app --cov-fail-under=80
  ```

- **Frontend**: Minimum 80% coverage (enforced)
  ```bash
  cd frontend
  pnpm test:coverage
  ```

### Linting

Run all linters before submitting:

```bash
make lint
```

This runs:
- `ruff check` and `ruff format` for Python
- `mypy` for Python type checking
- `eslint` for TypeScript/React

### Pre-commit Hooks

Pre-commit hooks are configured to run automatically on each commit:

- Trailing whitespace removal
- End-of-file fixing
- YAML validation
- Large file detection
- Merge conflict detection
- Private key detection
- Secret detection (detect-secrets)
- Ruff linting and formatting
- MyPy type checking
- Commit message linting (commitlint)

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, whitespace) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `build` | Build system or dependencies |
| `ci` | CI configuration changes |
| `chore` | Other changes (maintenance) |
| `revert` | Reverts a previous commit |
| `security` | Security improvements |

### Examples

```bash
feat(api): add image-to-structure endpoint
fix(frontend): correct validation error display
docs: update API documentation
test(backend): add naming service unit tests
security: add non-root Docker user
```

### Rules

- Subject must be lowercase
- Subject must not be empty
- Subject must not end with a period
- Header must be 100 characters or less

## Pull Request Guidelines

### Before Submitting

1. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Write tests** for your changes
   - Unit tests for business logic
   - Integration tests for API endpoints
   - Component tests for UI changes

3. **Run the full test suite**
   ```bash
   make test
   ```

4. **Run linting**
   ```bash
   make lint
   ```

5. **Run pre-commit on all files**
   ```bash
   pre-commit run --all-files
   ```

### PR Requirements

- [ ] Tests pass with 80%+ coverage
- [ ] Linting passes
- [ ] Pre-commit hooks pass
- [ ] Conventional commit messages used
- [ ] Documentation updated if needed
- [ ] No secrets or credentials committed

### PR Description

Include:
- Summary of changes
- Related issue numbers
- Test plan / verification steps
- Screenshots for UI changes

## Project Structure

```
chemvision/
├── frontend/          # Next.js frontend
│   ├── app/           # App router pages
│   ├── components/    # React components
│   ├── lib/           # Utilities and API client
│   └── tests/         # Frontend tests
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── core/      # Configuration
│   │   ├── models/    # Pydantic schemas
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Business logic
│   │   └── tests/     # Backend tests
├── ops/               # Docker Compose config
├── ADRs/              # Architecture Decision Records
└── docs/              # Documentation
```

## Architecture Decisions

Major architectural decisions are documented in `ADRs/`. Read these before making significant changes:

- `0001-project-structure.md`
- `0002-frontend-framework.md`
- `0003-backend-framework.md`
- `0004-testing-strategy.md`

## Getting Help

- Review existing issues and PRs
- Check the ADRs for architectural context
- Read CLAUDE.md for project overview

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
