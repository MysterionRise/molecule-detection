# ChemVision QA Bug Report

**Date:** 2026-02-18
**Scope:** Full-stack application audit (backend, frontend, infrastructure, CI/CD)
**Methodology:** Automated test execution, static analysis, manual code review, multi-agent deep analysis

---

## Test Execution Summary

| Suite | Result | Details |
|-------|--------|---------|
| Backend pytest (Python 3.11) | 62/62 PASSED | 92.59% coverage (80% required) |
| Frontend vitest | 53/53 PASSED | 90.31% statements, 84.48% branches |
| Ruff lint | PASSED | No issues |
| Mypy type check | PASSED | 19 source files, strict mode |
| ESLint | 1 WARNING | `<img>` instead of `next/image` `<Image />` |

---

## Bugs Found

### CRITICAL (2)

---

#### BUG-01: CORS_ORIGINS env var format mismatch breaks Docker Compose environment

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Category** | Configuration |
| **Files** | `ops/docker-compose.yml:13`, `backend/app/core/config.py:20-25` |

**Description:**
`docker-compose.yml` sets `CORS_ORIGINS=http://localhost:3000,http://frontend:3000` (comma-separated string), but `config.py` declares `cors_origins: list[str]` with an explicit comment requiring JSON array format: `CORS_ORIGINS='["http://localhost:3000"]'`. Pydantic-settings v2 expects JSON for complex types like `list[str]`.

**Impact:**
Running `make dev` will either crash the backend on startup (pydantic `ValidationError`) or produce a single-element list `["http://localhost:3000,http://frontend:3000"]` that matches no real origin. All frontend cross-origin requests would be blocked by CORS, making the Docker development environment non-functional.

**Evidence:**
The test in `test_config.py:59-65` tests only JSON format, confirming the intended contract.

**Fix:**
Change `docker-compose.yml` line 13 to:
```yaml
CORS_ORIGINS=["http://localhost:3000","http://frontend:3000"]
```

---

#### BUG-02: Raw Python exception message leaked to HTTP clients

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Category** | Security — Information Disclosure |
| **File** | `backend/app/routers/convert.py:86` |

**Description:**
The `_handle_conversion` error handler embeds `str(e)` directly into the HTTP response:
```python
"message": f"Failed to perform {operation}: {str(e)}"
```
Internal exception details (file paths, database URIs, library internals, stack fragments) are returned verbatim to the client.

**Impact:**
When Phase 2 integrates ML models, chemistry libraries (RDKit, OPSIN), or databases, internal error details will leak. Example leaks: `FileNotFoundError: /app/models/ocsr_v2.pth`, `ConnectionRefusedError: localhost:5432`.

**Fix:**
Return a generic message to the client; log the actual error server-side only:
```python
logger.error(f"{operation}_error", **log_context, error=str(e))
raise HTTPException(
    status_code=500,
    detail={
        "error_code": "CONVERSION_ERROR",
        "message": f"Failed to perform {operation}",  # No str(e)
        "correlation_id": _get_correlation_id(),
    },
) from e
```

---

### HIGH (4)

---

#### BUG-03: File fully read into memory before size validation (DoS vector)

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | Security — Denial of Service |
| **File** | `backend/app/routers/convert.py:184-187` |

**Description:**
```python
image_bytes = await image.read()      # Line 184: reads ENTIRE file
if len(image_bytes) > settings.max_upload_size:  # Line 187: then checks size
```
The file is fully loaded into memory BEFORE the size check runs. Uvicorn has no default request body size limit.

**Impact:**
An attacker can POST a multi-GB file to `/api/image-to-structure`. The server reads the entire payload into RAM before rejecting it. Concurrent requests exhaust available memory.

**Fix:**
Use chunked/streaming reads with a running size counter, or configure a max body size at the ASGI/uvicorn level.

---

#### BUG-04: Unvalidated client-supplied correlation ID enables log injection

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | Security — Log Injection |
| **File** | `backend/app/main.py:63` |

**Description:**
```python
correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
```
No validation on the header value — no length limit, no character filter, no format check. This value is bound to structlog context, returned in response headers, and included in error response JSON bodies.

**Impact:**
Attackers can inject JSON-breaking characters, extremely long strings, or forged log entries to corrupt log aggregation systems or cause log storage bloat.

**Fix:**
Validate correlation ID as a UUID format or enforce max length + alphanumeric/hyphen restriction.

---

#### BUG-05: No rate limiting on any endpoint

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | Security — Availability |
| **File** | `backend/app/main.py` (all endpoints) |

**Description:**
No rate limiting middleware or per-endpoint throttling is configured. The image upload endpoint (`/api/image-to-structure`) is especially vulnerable since each request involves file I/O and (in Phase 2) ML inference.

**Impact:**
Unlimited requests can exhaust compute/memory resources, abuse future ML inference capacity, and enable brute-force attacks.

**Fix:**
Add rate limiting middleware (e.g., `slowapi` for FastAPI).

---

#### BUG-06: Dev dependencies and editable install in production Docker image

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | DevOps — Security/Image Bloat |
| **File** | `backend/Dockerfile:19` |

**Description:**
```dockerfile
pip install --no-cache-dir -e ".[dev]"
```
Installs ALL dev dependencies (pytest, ruff, mypy, bandit, httpx) and uses `-e` (editable/symlink) mode in the production container. No multi-stage build separates build-time from runtime dependencies.

**Impact:**
- Larger attack surface: testing/security tools available in production
- Significantly larger image size
- Editable install creates fragile symlink-based package
- `gcc` system dependency also remains in the final image

**Fix:**
Use multi-stage build; install only production deps (`pip install .` without `[dev]`) in the final stage.

---

### MEDIUM (13)

---

#### BUG-07: 422 validation error parsing is dead code in frontend API client

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Logic Bug |
| **File** | `frontend/lib/api.ts:89-105` |

**Description:**
The error parser checks:
```typescript
if (data.detail && typeof data.detail === 'object') { ... }  // Line 89
if (response.status === 422 && data.detail) { ... }          // Line 101
```
FastAPI 422 responses have `{"detail": [{...}, ...]}`. Since `typeof [] === 'object'` is `true` in JavaScript, the first branch always matches for 422 responses. The second branch (lines 100-105) is unreachable dead code. The first branch accesses `.message` and `.error_code` on an Array object, getting `undefined`, and falls back to `"An error occurred"` / `"UNKNOWN_ERROR"`.

**Impact:**
Users never see meaningful validation error messages. All 422 errors display generic "An error occurred" instead of field-specific validation messages from FastAPI.

---

#### BUG-08: Inconsistent error response format between global and endpoint handlers

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | API Contract |
| **Files** | `backend/app/main.py:96-98`, `backend/app/routers/convert.py:82-89` |

**Description:**
- **Global handler** (main.py:96) returns `JSONResponse(content=error.model_dump())` → `{"error_code": "INTERNAL_ERROR", "message": "..."}`
- **Endpoint handler** (convert.py:82) uses `HTTPException(detail={...})` → `{"detail": {"error_code": "...", ...}}`

The frontend checks for `data.detail` first (api.ts:89), so global 500 errors (without the `detail` wrapper) hit the fallback branch and may display incorrectly.

**Impact:**
Global 500 errors show "An error occurred" with "UNKNOWN_ERROR" instead of "INTERNAL_ERROR" and the actual message.

---

#### BUG-09: Frontend accepts all image/* types but backend only accepts PNG/JPEG

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Validation Mismatch |
| **Files** | `frontend/components/forms/ImageToStructureForm.tsx:21`, `backend/app/routers/convert.py:174` |

**Description:**
- Frontend JS validation: `if (!file.type.startsWith('image/'))` — accepts ANY image/* MIME type
- Backend validation: `if image.content_type not in ["image/png", "image/jpeg", "image/jpg"]`
- The HTML `<input accept="...">` correctly lists `"image/png,image/jpeg,image/jpg"`, but the JS validation (used for drag-and-drop) is more permissive.

**Impact:**
Users can drag-and-drop GIF/WebP/SVG, see a valid preview, click submit, and only then get a 400 error. Poor UX with misleading client-side acceptance.

---

#### BUG-10: Clipboard API called without error handling

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Error Handling |
| **File** | `frontend/components/results/ResultCard.tsx:18-21` |

**Description:**
```typescript
const handleCopy = async () => {
  await navigator.clipboard.writeText(result)  // No try/catch
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}
```
The Clipboard API requires HTTPS (or localhost) and user-activation. It throws in non-secure contexts, iframes, or with restricted browser permissions.

**Impact:**
Unhandled promise rejection in non-HTTPS environments. The `setCopied(true)` line never runs on failure (silent failure). Error propagates to React error boundary.

---

#### BUG-11: Docker Compose frontend targets `builder` stage instead of `runner`

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | DevOps |
| **File** | `ops/docker-compose.yml:29` |

**Description:**
`target: builder` builds the intermediate stage that runs `pnpm run build` (full production build), but the compose `command` override replaces it with `pnpm dev`. The production build runs and is immediately discarded.

**Impact:**
Slower `make dev` startup. The correct target for development would be `deps` (has node_modules installed) or remove `target` entirely.

---

#### BUG-12: Makefile `test` target hangs on frontend vitest in watch mode

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | DevOps |
| **File** | `Makefile:21` |

**Description:**
```makefile
cd frontend && pnpm test
```
The `package.json` "test" script maps to bare `vitest`, which starts in interactive watch mode. The CI workflow correctly uses `pnpm test --run` but the Makefile does not.

**Impact:**
`make test` completes backend tests then hangs forever on frontend, requiring Ctrl+C. Breaks any automated local testing workflow.

**Fix:**
Change to `cd frontend && pnpm test:run` (or `pnpm test --run`).

---

#### BUG-13: ci-check.sh `set -e` defeats failure-tracking pattern

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | DevOps — Script Bug |
| **File** | `ci-check.sh:6,23-37` |

**Description:**
`set -e` (line 6) causes the script to exit on any non-zero return code. The `run_check` function (lines 23-37) is designed to catch failures and increment a `FAILED` counter so the script can report all failures at the end. But `set -e` causes immediate exit when `run_check` returns 1 (line 36). The `FAILED` counter pattern is dead code.

**Impact:**
The script cannot report multiple failures. Developers fix issues one at a time rather than seeing all problems at once. The summary block (lines 79-92) will never report more than 1 failure.

**Fix:**
Remove `set -e` or restructure `run_check` to never return non-zero (use the `FAILED` counter to drive exit code at the end).

---

#### BUG-14: CORS_ORIGINS format: Docker Compose has no `depends_on` health condition

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | DevOps |
| **File** | `ops/docker-compose.yml:40-41` |

**Description:**
The frontend `depends_on: - backend` does not use `condition: service_healthy`. The backend has a healthcheck defined, but Compose will start the frontend as soon as the backend container starts, not when it's ready to accept connections.

**Impact:**
Race condition on startup: the frontend may attempt to reach the backend before it's ready, causing connection errors during development.

---

#### BUG-15: `image/jpg` is not a valid IANA MIME type

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Correctness |
| **File** | `backend/app/routers/convert.py:174` |

**Description:**
The content-type allowlist includes `"image/jpg"`, which is NOT an IANA-registered MIME type. The correct type is `"image/jpeg"`.

**Impact:**
Minor inconsistency. The magic bytes check provides a second layer of defense, but accepting a non-standard type normalizes incorrect behavior.

---

#### BUG-16: Duplicate pytest configuration in pyproject.toml AND pytest.ini

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Configuration |
| **Files** | `backend/pyproject.toml:41-53`, `backend/pytest.ini:1-13` |

**Description:**
Identical pytest config exists in both files. When both are present, `pytest.ini` takes precedence and `pyproject.toml`'s `[tool.pytest.ini_options]` is silently ignored.

**Impact:**
Configuration drift risk. A developer updating `pyproject.toml` will have changes silently ignored.

---

#### BUG-17: NEXT_PUBLIC_API_URL baked at build time, not runtime-configurable

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Configuration |
| **Files** | `frontend/next.config.js:4-6`, `frontend/lib/api.ts:56` |

**Description:**
`NEXT_PUBLIC_*` variables are inlined at BUILD time by Next.js. The frontend Dockerfile does not set this variable during the build stage. In dev mode (`pnpm dev`) this works because dev mode reads env vars at runtime, but for the production `runner` stage, the API URL would be permanently baked to `http://localhost:8000`.

**Impact:**
In production Docker deployment, the API URL cannot be changed at runtime without rebuilding the image.

---

#### BUG-18: No `.dockerignore` files exist

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | DevOps |
| **Files** | `backend/.dockerignore` (missing), `frontend/.dockerignore` (missing) |

**Description:**
Neither directory contains a `.dockerignore`. `COPY . .` in the frontend Dockerfile copies everything: `node_modules`, `.next`, `.git`, test fixtures, coverage reports, etc.

**Impact:**
Dramatically slower builds (unnecessary files in build context, especially `node_modules`). Risk of leaking `.env` or secrets into the image. Cache invalidation on every build.

---

#### BUG-19: Docker Compose uses deprecated `version` key and V1 CLI

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | DevOps |
| **Files** | `ops/docker-compose.yml:1`, `Makefile:15,36,39` |

**Description:**
- `docker-compose.yml` starts with `version: '3.8'` (deprecated in Compose V2)
- Makefile uses `docker-compose` (hyphenated V1 CLI, now EOL) instead of `docker compose`

**Impact:**
`make dev`, `make build`, and `make clean` fail on systems with only Docker Compose V2. The `version` key generates deprecation warnings.

---

### LOW (11)

---

#### BUG-20: Default tab shows non-functional Image feature

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | UX |
| **File** | `frontend/app/page.tsx:26` |

**Description:**
`<Tabs defaultValue="image">` shows the Image-to-Structure tab by default, but it returns 501. The only working feature is Name-to-Structure ("isopentane" demo). The footer even says "Try 'isopentane' for name-to-structure conversion."

**Impact:**
Poor first-impression UX. New users get "not implemented" on the default tab.

---

#### BUG-21: structlog ignores `settings.log_level`

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | Configuration |
| **File** | `backend/app/main.py:17-28` |

**Description:**
`structlog.configure()` runs at import time without referencing `settings.log_level`. The `log_level` field exists in `config.py` and can be set via `LOG_LEVEL` env var, but it has no effect on actual logging behavior.

**Impact:**
Operators cannot adjust log verbosity via environment variables.

---

#### BUG-22: OpenAPI docs exposed in all environments

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | Security |
| **File** | `backend/app/main.py:41-46` |

**Description:**
FastAPI is instantiated without `docs_url=None` for non-development environments. The `settings.environment` field exists but is not used to conditionally disable `/docs` and `/redoc`.

**Impact:**
API documentation accessible in production, revealing all endpoints and schemas.

---

#### BUG-23: No security response headers configured

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | Security |
| **Files** | `backend/app/main.py`, `frontend/next.config.js` |

**Description:**
Neither backend nor frontend configures security headers: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`.

**Impact:**
Missing defense-in-depth against XSS, clickjacking, MIME sniffing.

---

#### BUG-24: `allow_credentials=True` set unnecessarily in CORS

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | Security |
| **File** | `backend/app/main.py:52` |

**Description:**
`allow_credentials=True` enables `Access-Control-Allow-Credentials: true` in CORS responses. The application has no authentication in Phase 1.

**Impact:**
When authentication is added, cross-origin requests will automatically send credentials. Combined with any CORS misconfiguration, this enables CSRF.

---

#### BUG-25: Codecov action uses deprecated v3

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | DevOps |
| **File** | `.github/workflows/ci.yml:54` |

**Description:**
`codecov/codecov-action@v3` is deprecated (current is v5). Missing `CODECOV_TOKEN` required for v4+.

**Impact:**
Coverage upload may silently fail or stop working.

---

#### BUG-26: Trivy action pinned to `@master` (supply-chain risk)

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | Security — Supply Chain |
| **File** | `.github/workflows/security.yml:100` |

**Description:**
`aquasecurity/trivy-action@master` is pinned to a branch, not a SHA or version tag. If the master branch is compromised, malicious code runs in CI.

**Impact:**
Supply-chain attack vector in CI pipeline.

---

#### BUG-27: Security workflow `pnpm audit` failures suppressed with `|| true`

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | DevOps |
| **File** | `.github/workflows/security.yml:77` |

**Description:**
`pnpm audit || true` suppresses all npm dependency vulnerability findings. The security workflow gives a false sense of security for the frontend supply chain.

**Impact:**
High-severity npm vulnerabilities silently ignored.

---

#### BUG-28: CardTitle component ref type mismatch

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | TypeScript |
| **File** | `frontend/components/ui/card.tsx:22` |

**Description:**
`React.forwardRef<HTMLParagraphElement, ...>` but renders `<h3>`. Correct ref type should be `HTMLHeadingElement`.

**Impact:**
TypeScript type mismatch. No runtime effect since both are HTMLElement subtypes.

---

#### BUG-29: ESLint warning — `<img>` instead of `next/image` `<Image />`

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | Performance |
| **File** | `frontend/components/forms/ImageToStructureForm.tsx:171` |

**Description:**
Uses native `<img>` tag for the file preview instead of Next.js `<Image />`. ESLint flags this as `@next/next/no-img-element`.

**Impact:**
Missing automatic image optimization (lazy loading, format conversion, responsive sizing). Acceptable for data-URL previews but still flagged.

---

#### BUG-30: Frontend test download triggers jsdom "Not implemented: navigation" error

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | Test Quality |
| **File** | `frontend/tests/components/ResultCard.test.tsx` |

**Description:**
Download tests trigger `Error: Not implemented: navigation (except hash changes)` in jsdom stderr. Tests pass but with noisy error output.

**Impact:**
Misleading test output. Could mask real navigation-related errors.

---

## Summary

| Severity | Count |
|----------|-------|
| **Critical** | 2 |
| **High** | 4 |
| **Medium** | 13 |
| **Low** | 11 |
| **Total** | **30** |

## Priority Fix Order

1. **BUG-01** (Critical) — CORS format mismatch. Docker dev environment is likely non-functional.
2. **BUG-02** (Critical) — Exception message leak. Information disclosure vulnerability.
3. **BUG-03** (High) — Memory exhaustion DoS via unbounded file read.
4. **BUG-04** (High) — Log injection via unvalidated correlation ID.
5. **BUG-06** (High) — Dev deps in production image. Multi-stage build needed.
6. **BUG-12** (Medium) — `make test` hangs. Quick one-line fix.
7. **BUG-13** (Medium) — `ci-check.sh` set -e conflict. Defeats its own purpose.
8. **BUG-07/08** (Medium) — Error parsing dead code + inconsistent formats. Fix together.
9. **BUG-09** (Medium) — Image type validation mismatch between frontend/backend.
10. **BUG-18** (Medium) — Add `.dockerignore` files. Quick wins for build speed/security.
