# CI Pre-Push Checklist

Use this checklist before pushing to ensure CI will pass.

## Quick Checks

```bash
# Option 1: Run full CI simulation
./ci-check.sh

# Option 2: Run individual checks
make test  # Runs backend + frontend tests
make lint  # Runs all linters
```

## Manual Checklist

### Backend (Python)

- [ ] `ruff check .` passes with no errors
- [ ] `ruff format --check .` passes (code is formatted)
- [ ] `mypy app` passes with no type errors
- [ ] `pytest -v` all tests pass
- [ ] Coverage is at least 80%

### Frontend (TypeScript)

- [ ] `pnpm lint` passes (warnings ok)
- [ ] `pnpm test --run` all tests pass
- [ ] `pnpm build` succeeds

### Docker

- [ ] Backend Dockerfile builds: `docker build -t test backend`
- [ ] Frontend Dockerfile builds: `docker build -t test frontend`

## Common Issues

### Backend

**Import errors**:
```bash
cd backend && pip install -e ".[dev]"
```

**Type errors**:
```bash
mypy app --show-error-codes
```

**Formatting**:
```bash
ruff format .
```

### Frontend

**Missing dependencies**:
```bash
cd frontend && pnpm install
```

**Lint errors**:
```bash
pnpm lint --fix
```

**Build errors**: Check console for specific error message

## CI Workflow Files

- `.github/workflows/ci.yml` - Main CI configuration
- `.github/CI.md` - Detailed CI documentation
- `ci-check.sh` - Local CI simulation script
- `run-tests.sh` - Test runner script

## After Push

1. Check GitHub Actions tab for workflow run
2. Wait for all jobs to complete (~5-7 minutes)
3. If any job fails, check the logs
4. Fix issues and push again

## CI Status Badge

The README shows the current CI status:

[![CI](https://github.com/MysterionRise/molecule-detection/actions/workflows/ci.yml/badge.svg)](https://github.com/MysterionRise/molecule-detection/actions/workflows/ci.yml)

- ✅ Green = All checks passed
- ❌ Red = Some checks failed
- 🟡 Yellow = CI is running
