# ADR 0004: Testing Strategy

## Status

Accepted

## Context

ChemVision started as a Phase 1 POC with minimal testing. To elevate the project to enterprise-grade quality for portfolio showcase, we need a comprehensive testing strategy that ensures reliability, maintainability, and confidence in code changes.

### Current State (Before)

- Backend: 11 tests covering only API endpoints
- Frontend: 3 tests covering only static page rendering
- No coverage enforcement
- No service-layer unit tests
- No component interaction tests

### Requirements

1. High test coverage (80%+ enforced)
2. Fast feedback loop for developers
3. Tests that catch real bugs, not just increase coverage numbers
4. Maintainable test code

## Decision

### Coverage Requirements

We enforce 80% minimum coverage for both frontend and backend:

- **Backend**: Configured via `pyproject.toml` with `fail_under = 80`
- **Frontend**: Configured via `vitest.config.ts` with thresholds for lines, branches, functions, and statements

### Testing Pyramid

We follow the testing pyramid with emphasis on:

```
        /\
       /  \
      / E2E \          (Future: Playwright/Cypress)
     /--------\
    /Integration\      (API endpoint tests)
   /--------------\
  /   Unit Tests   \   (Services, Components, Utilities)
 /------------------\
```

### Backend Testing Strategy

#### Unit Tests (Services)

- Test business logic in isolation
- Mock external dependencies
- Focus on edge cases and error handling

**Files:**
- `test_naming_service.py` - Chemical naming conversion logic
- `test_ocsr_service.py` - Image recognition service
- `test_config.py` - Configuration validation

#### Integration Tests (Endpoints)

- Test full request/response cycle
- Use TestClient from FastAPI
- Verify HTTP status codes, response schemas, error formats

**Files:**
- `test_convert_endpoints.py` - All conversion endpoints
- `test_health.py` - Health check endpoint
- `test_exception_handler.py` - Error handling and middleware

#### Test Configuration

```python
# pytest.ini / pyproject.toml
testpaths = ["app/tests"]
asyncio_mode = "auto"
addopts = ["--cov=app", "--cov-fail-under=80"]
```

### Frontend Testing Strategy

#### Unit Tests (Utilities)

- Test API client functions
- Mock fetch for network requests
- Verify error handling and response parsing

**Files:**
- `tests/lib/api.test.ts` - API client methods

#### Component Tests (Forms)

- Test user interactions (typing, clicking, file upload)
- Mock API responses
- Verify form validation, loading states, error displays

**Files:**
- `tests/components/NameToStructureForm.test.tsx`
- `tests/components/StructureToNameForm.test.tsx`
- `tests/components/ImageToStructureForm.test.tsx`
- `tests/components/ResultCard.test.tsx`

#### Test Configuration

```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  thresholds: {
    lines: 80,
    branches: 80,
    functions: 80,
    statements: 80,
  },
}
```

### Testing Tools

| Layer | Backend | Frontend |
|-------|---------|----------|
| Framework | pytest | vitest |
| Mocking | unittest.mock | vitest (vi) |
| HTTP Client | httpx/TestClient | fetch mock |
| Coverage | pytest-cov | @vitest/coverage-v8 |
| Assertions | pytest assert | @testing-library/jest-dom |
| User Events | N/A | @testing-library/user-event |

### Test File Organization

```
backend/app/tests/
├── conftest.py              # Shared fixtures
├── test_health.py           # Health endpoint
├── test_convert_endpoints.py # API endpoints
├── test_naming_service.py   # Naming service unit tests
├── test_ocsr_service.py     # OCSR service unit tests
├── test_config.py           # Configuration tests
└── test_exception_handler.py # Error handling tests

frontend/tests/
├── setup.ts                 # Test setup
├── page.test.tsx            # Page rendering
├── lib/
│   └── api.test.ts          # API client tests
└── components/
    ├── NameToStructureForm.test.tsx
    ├── StructureToNameForm.test.tsx
    ├── ImageToStructureForm.test.tsx
    └── ResultCard.test.tsx
```

### CI Integration

Tests run on every push and PR:

```yaml
# Backend
pytest -v --cov=app --cov-fail-under=80

# Frontend
pnpm test:coverage
```

Coverage reports uploaded to Codecov for tracking trends.

## Consequences

### Positive

- 80%+ coverage ensures most code paths are tested
- Service-layer tests catch logic bugs early
- Component tests verify user interactions work correctly
- Fast pytest/vitest runs enable quick feedback
- Enforced thresholds prevent coverage regression

### Negative

- More test code to maintain
- Initial time investment to write comprehensive tests
- Some tests may be brittle if implementation changes

### Mitigations

- Focus tests on behavior, not implementation details
- Use meaningful test names that describe expected behavior
- Group related tests in classes for organization
- Regularly review and refactor tests

## Future Considerations

1. **E2E Tests**: Add Playwright or Cypress for full user journey testing
2. **Visual Regression**: Chromatic or Percy for UI change detection
3. **Performance Tests**: Artillery or k6 for load testing
4. **Mutation Testing**: Stryker or mutmut to verify test effectiveness
5. **Contract Tests**: Pact for API consumer/provider contracts

## References

- [Testing Pyramid - Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html)
- [pytest Documentation](https://docs.pytest.org/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
