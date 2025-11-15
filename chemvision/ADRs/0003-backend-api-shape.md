# ADR 0003: Backend API Design and Error Handling

**Date**: 2025-01-15

**Status**: Accepted

## Context

The backend API needs to support three conversion operations with clear contracts, error handling, and future extensibility. We need a consistent approach to:
- Request/response formats
- Error messages
- Logging and observability
- Validation

## Decision

### API Endpoints

```
POST /api/name-to-structure
Request:  { "name": string }
Response: { "smiles": string, "source": "demo"|"ml"|"tool" }

POST /api/structure-to-name
Request:  { "smiles": string }
Response: { "name": string, "source": "demo"|"ml"|"tool" }

POST /api/image-to-structure
Request:  multipart/form-data with "image" field
Response: { "smiles": string, "source": "demo"|"ml"|"tool" }

GET /health
Response: { "status": "ok" }
```

### Error Format

All errors follow a standard shape:

```json
{
  "error_code": "NOT_IMPLEMENTED",
  "message": "Human-readable description",
  "details": { /* optional context */ },
  "correlation_id": "uuid-v4"
}
```

**Error Codes**:
- `NOT_IMPLEMENTED`: Phase 1 placeholder (HTTP 501)
- `INVALID_IMAGE_TYPE`: Wrong file format (HTTP 400)
- `CONVERSION_ERROR`: Processing failed (HTTP 500)
- `VALIDATION_ERROR`: Invalid input (HTTP 422)
- `INTERNAL_ERROR`: Unexpected error (HTTP 500)

### Correlation IDs

Every request gets a correlation ID (UUID v4):
- Generated server-side if not provided
- Returned in `X-Correlation-ID` header
- Included in error responses
- Logged with all events for tracing

### Structured Logging

Use `structlog` for JSON logging:
```python
logger.info("name_to_structure_request", name=name, correlation_id=id)
logger.error("conversion_failed", error=str(e), correlation_id=id)
```

### Validation

Pydantic v2 models for all requests/responses:
- Automatic OpenAPI schema generation
- Type coercion and validation
- Clear error messages for invalid input

## Alternatives Considered

**GraphQL**: Overkill for simple CRUD-like operations

**gRPC**: Better for service-to-service, not web browser

**REST without standards**: Harder to maintain, inconsistent errors

**Custom error codes per endpoint**: More complex, harder to document

## Consequences

**Positive**:
- Predictable error handling for frontend
- Easy debugging with correlation IDs
- Automatic API documentation via OpenAPI
- Type safety with Pydantic
- Future-proof with `source` field

**Negative**:
- Slightly more verbose responses
- Need to thread correlation IDs through code

**Mitigations**:
- Middleware handles correlation ID injection
- Standard error response model reused everywhere
- Clear examples in documentation
