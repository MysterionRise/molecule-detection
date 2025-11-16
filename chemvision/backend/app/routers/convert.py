"""Conversion endpoints for molecular structure and naming."""

import uuid

import structlog
from fastapi import APIRouter, File, HTTPException, UploadFile, status

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


def _get_correlation_id() -> str:
    """Get current correlation ID from context."""
    return structlog.contextvars.get_contextvars().get("correlation_id", str(uuid.uuid4()))


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

    try:
        smiles = naming.name_to_smiles(request.name)

        if smiles is NotImplemented:
            raise _not_implemented_error("Name to structure conversion")

        logger.info("name_to_structure_success", name=request.name, smiles=smiles)

        return StructureResponse(smiles=smiles, source="demo")

    except HTTPException:
        raise
    except Exception as e:
        logger.error("name_to_structure_error", name=request.name, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_code": "CONVERSION_ERROR",
                "message": f"Failed to convert name to structure: {str(e)}",
                "correlation_id": _get_correlation_id(),
            },
        ) from e


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

    try:
        name = naming.smiles_to_name(request.smiles)

        if name is NotImplemented:
            raise _not_implemented_error("Structure to name conversion")

        logger.info("structure_to_name_success", smiles=request.smiles, name=name)

        return NameResponse(name=name, source="ml")

    except HTTPException:
        raise
    except Exception as e:
        logger.error("structure_to_name_error", smiles=request.smiles, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_code": "CONVERSION_ERROR",
                "message": f"Failed to convert structure to name: {str(e)}",
                "correlation_id": _get_correlation_id(),
            },
        ) from e


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

    try:
        image_bytes = await image.read()

        smiles = ocsr.image_to_smiles(image_bytes)

        if smiles is NotImplemented:
            raise _not_implemented_error("Image to structure conversion (OCSR)")

        logger.info("image_to_structure_success", filename=image.filename, smiles=smiles)

        return StructureResponse(smiles=smiles, source="ml")

    except HTTPException:
        raise
    except Exception as e:
        logger.error("image_to_structure_error", filename=image.filename, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_code": "CONVERSION_ERROR",
                "message": f"Failed to convert image to structure: {str(e)}",
                "correlation_id": _get_correlation_id(),
            },
        ) from e
