"""Conversion endpoints for molecular structure and naming."""

import uuid
from collections.abc import Awaitable, Callable
from typing import TypeVar

import structlog
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.models.schemas import (
    ErrorResponse,
    NameResponse,
    NameToStructureRequest,
    StructureResponse,
    StructureToNameRequest,
)
from app.services import naming, ocsr

logger = structlog.get_logger()
router = APIRouter()

T = TypeVar("T")

# Image magic bytes
_PNG_MAGIC = b"\x89PNG"
_JPEG_MAGIC = b"\xff\xd8"


def _get_correlation_id() -> str:
    """Get current correlation ID from context."""
    ctx_vars = structlog.contextvars.get_contextvars()
    correlation_id = ctx_vars.get("correlation_id")
    return str(correlation_id) if correlation_id is not None else str(uuid.uuid4())


def _not_implemented_error(operation: str) -> HTTPException:
    """Create a standardized 501 Not Implemented error."""
    correlation_id = _get_correlation_id()

    logger.warning("not_implemented", operation=operation, correlation_id=correlation_id)

    error = ErrorResponse(
        error_code="NOT_IMPLEMENTED",
        message=f"{operation} is not yet implemented. This will be available in Phase 2.",
        correlation_id=correlation_id,
    )

    return HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=error.model_dump(),
    )


async def _handle_conversion(
    operation: str,
    convert_fn: Callable[[], Awaitable[T] | T],
    log_context: dict[str, str],
) -> T:
    """Shared error handling for conversion endpoints.

    Args:
        operation: Human-readable operation name for error messages.
        convert_fn: Callable that performs the conversion and returns a result or None.
        log_context: Additional context for structured logging.
    """
    try:
        result = convert_fn()
        if isinstance(result, Awaitable):
            result = await result

        if result is None:
            raise _not_implemented_error(operation)

        logger.info(f"{operation}_success", **log_context)
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"{operation}_error", **log_context, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_code": "CONVERSION_ERROR",
                "message": f"Failed to perform {operation}: {str(e)}",
                "correlation_id": _get_correlation_id(),
            },
        ) from e


def _validate_image_magic_bytes(image_bytes: bytes) -> None:
    """Validate that image bytes match expected magic bytes for PNG or JPEG."""
    if not (image_bytes[:4] == _PNG_MAGIC or image_bytes[:2] == _JPEG_MAGIC):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error_code": "INVALID_IMAGE_DATA",
                "message": "File content does not match a valid PNG or JPEG image",
                "correlation_id": _get_correlation_id(),
            },
        )


@router.post(
    "/name-to-structure",
    response_model=StructureResponse,
    responses={
        501: {"model": ErrorResponse, "description": "Not implemented"},
    },
)
async def name_to_structure(request: NameToStructureRequest) -> StructureResponse:
    """
    Convert an IUPAC chemical name to SMILES notation.

    Phase 1: Only "isopentane" is supported as a demo.
    Phase 2: Will integrate OPSIN or equivalent for full IUPAC parsing.
    """
    logger.info("name_to_structure_request", name=request.name)

    smiles = await _handle_conversion(
        operation="name_to_structure",
        convert_fn=lambda: naming.name_to_smiles(request.name),
        log_context={"name": request.name},
    )

    return StructureResponse(smiles=smiles, source="demo")


@router.post(
    "/structure-to-name",
    response_model=NameResponse,
    responses={
        501: {"model": ErrorResponse, "description": "Not implemented"},
    },
)
async def structure_to_name(request: StructureToNameRequest) -> NameResponse:
    """
    Convert SMILES notation to an IUPAC chemical name.

    Phase 1: Not implemented (returns 501).
    Phase 2: Will use ML model or rule-based approach.
    """
    logger.info("structure_to_name_request", smiles=request.smiles)

    name = await _handle_conversion(
        operation="structure_to_name",
        convert_fn=lambda: naming.smiles_to_name(request.smiles),
        log_context={"smiles": request.smiles},
    )

    return NameResponse(name=name, source="ml")


@router.post(
    "/image-to-structure",
    response_model=StructureResponse,
    responses={
        501: {"model": ErrorResponse, "description": "Not implemented"},
    },
)
async def image_to_structure(image: UploadFile = File(...)) -> StructureResponse:
    """
    Extract SMILES notation from a molecular structure image (OCSR).

    Phase 1: Not implemented (returns 501).
    Phase 2: Will use baseline image-to-sequence model.
    """
    logger.info(
        "image_to_structure_request", filename=image.filename, content_type=image.content_type
    )

    # Validate content type
    if image.content_type not in ["image/png", "image/jpeg", "image/jpg"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error_code": "INVALID_IMAGE_TYPE",
                "message": "Only PNG and JPEG images are supported",
                "correlation_id": _get_correlation_id(),
            },
        )

    image_bytes = await image.read()

    # Enforce upload size limit
    if len(image_bytes) > settings.max_upload_size:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail={
                "error_code": "FILE_TOO_LARGE",
                "message": f"Image exceeds maximum upload size of {settings.max_upload_size} bytes",
                "correlation_id": _get_correlation_id(),
            },
        )

    # Validate magic bytes match actual image format
    _validate_image_magic_bytes(image_bytes)

    smiles = await _handle_conversion(
        operation="image_to_structure",
        convert_fn=lambda: ocsr.image_to_smiles(image_bytes),
        log_context={"filename": image.filename or "unknown"},
    )

    return StructureResponse(smiles=smiles, source="ml")
