# Continuous Integration (CI) Workflow

This document describes the GitHub Actions CI workflow for ChemVision.

## Workflow Overview

The CI workflow runs on every push to `main` or `develop` branches, and on all pull requests targeting these branches.

**Workflow file**: `.github/workflows/ci.yml`

## Jobs

### 1. Backend Tests (Python 3.11)

**Duration**: ~2-3 minutes

**Steps**:
1. Checkout code
2. Set up Python 3.11 with pip caching
3. Install backend dependencies
4. Run ruff linter
5. Run ruff format checker
6. Run mypy type checker
7. Run pytest with coverage
8. Upload coverage to Codecov

**Requirements**:
- All linting rules must pass
- Code must be properly formatted
- No type errors
- All tests must pass
- Coverage reports generated

### 2. Frontend Tests (Node 20)

**Duration**: ~3-4 minutes

**Steps**:
1. Checkout code
2. Enable Corepack for pnpm
3. Set up Node.js 20 with pnpm caching
4. Install frontend dependencies
5. Run ESLint
6. Run Vitest tests
7. Build production bundle

**Requirements**:
- All ESLint rules must pass (warnings are ok)
- All tests must pass
- Production build must succeed

### 3. Docker Build

**Duration**: ~2-3 minutes

**Steps**:
1. Checkout code
2. Set up Docker Buildx
3. Build backend Docker image (no push)
4. Build frontend Docker image (no push)

**Requirements**:
- Both images must build successfully
- Uses GitHub Actions cache for faster builds

## Local CI Simulation

Run the full CI workflow locally before pushing:

```bash
cd chemvision
./ci-check.sh
```

This script runs the same checks as GitHub Actions.

## CI Status

### Current Test Results

**Backend**:
- ✅ 11 tests passing
- ✅ 85% code coverage
- ✅ No type errors
- ✅ All linting rules pass

**Frontend**:
- ✅ 3 tests passing
- ✅ Build succeeds
- ✅ ESLint passes (1 warning acceptable)

**Docker**:
- ✅ Backend image builds
- ✅ Frontend image builds

## Troubleshooting

### Common CI Failures

**Backend**:

1. **Import errors**: Make sure all dependencies are in `pyproject.toml`
2. **Type errors**: Run `mypy app` locally first
3. **Linting errors**: Run `ruff check .` and `ruff format .`
4. **Test failures**: Run `pytest -v` locally

**Frontend**:

1. **Module not found**: Run `pnpm install` to ensure dependencies are up to date
2. **ESLint errors**: Run `pnpm lint` locally
3. **Test failures**: Run `pnpm test` locally
4. **Build errors**: Run `pnpm build` locally

**Docker**:

1. **Build context errors**: Ensure Dockerfiles have correct paths
2. **Dependency errors**: Check that base images are available

### Debugging Failed Workflows

1. Check the GitHub Actions logs for the specific failure
2. Look for the red ❌ next to the failing step
3. Run the same command locally to reproduce
4. Fix the issue and push again

## Branch Protection

Once enabled, the following rules apply:

- All CI checks must pass before merging
- At least one approval required
- Branch must be up to date with base branch

## Coverage Reporting

Coverage reports are uploaded to Codecov after successful test runs.

**View coverage**:
- Backend: Codecov badge in README (when enabled)
- Local: `backend/htmlcov/index.html`

## Performance

**Typical CI run times**:
- Backend job: 2-3 minutes
- Frontend job: 3-4 minutes
- Docker job: 2-3 minutes
- **Total**: ~5-7 minutes (runs in parallel)

## Caching Strategy

To speed up CI runs, we cache:

1. **Python dependencies**: Via `setup-python` action with `cache: 'pip'`
2. **Node modules**: Via `setup-node` action with `cache: 'pnpm'`
3. **Docker layers**: Via GitHub Actions cache (`type=gha`)

## Manual Workflow Dispatch

The workflow can be manually triggered from the GitHub Actions tab.

## Future Improvements

Planned enhancements:

- [ ] E2E tests with Playwright
- [ ] Performance benchmarks
- [ ] Security scanning (Bandit, npm audit)
- [ ] Dependency updates (Dependabot)
- [ ] Deploy previews for PRs
- [ ] Automated releases
