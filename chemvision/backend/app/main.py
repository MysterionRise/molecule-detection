"""FastAPI application entrypoint."""

import re
import uuid
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.rate_limit import limiter
from app.models.schemas import ErrorResponse, HealthResponse
from app.routers import convert

# Configure structured logging
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.BoundLogger,
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=False,
)

logger = structlog.get_logger()

_CORRELATION_ID_RE = re.compile(r"^[a-zA-Z0-9\-]{1,128}$")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan handler."""
    logger.info("application_startup", version="0.1.0", environment=settings.environment)
    yield
    logger.info("application_shutdown")


app = FastAPI(
    title="ChemVision API",
    description="Molecular structure recognition and chemical nomenclature conversion",
    version="0.1.0",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Correlation-ID"],
)


@app.middleware("http")
async def add_correlation_id(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    """Add correlation ID to all requests."""
    raw_id = request.headers.get("X-Correlation-ID", "")
    correlation_id = raw_id if _CORRELATION_ID_RE.match(raw_id) else str(uuid.uuid4())
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(correlation_id=correlation_id)

    response = await call_next(request)
    response.headers["X-Correlation-ID"] = correlation_id
    return response


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(status="ok")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler."""
    correlation_id = structlog.contextvars.get_contextvars().get("correlation_id", "unknown")

    logger.error(
        "unhandled_exception",
        exc_type=type(exc).__name__,
        exc_message=str(exc),
        path=request.url.path,
    )

    error = ErrorResponse(
        error_code="INTERNAL_ERROR",
        message="An unexpected error occurred",
        correlation_id=correlation_id,
    )

    return JSONResponse(
        status_code=500,
        content=error.model_dump(),
    )


# Register routers
app.include_router(convert.router, prefix="/api", tags=["conversions"])
