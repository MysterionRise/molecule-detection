"""Pydantic models for request/response validation."""

from typing import Literal, Optional

from pydantic import BaseModel, Field


# Health
class HealthResponse(BaseModel):
    """Health check response."""

    status: Literal["ok"] = Field(description="Health status")


# Errors
class ErrorResponse(BaseModel):
    """Standard error response."""

    error_code: str = Field(description="Machine-readable error code")
    message: str = Field(description="Human-readable error message")
    details: Optional[dict] = Field(default=None, description="Additional error details")
    correlation_id: str = Field(description="Request correlation ID for tracking")


# Name to Structure
class NameToStructureRequest(BaseModel):
    """Request to convert IUPAC name to SMILES."""

    name: str = Field(
        description="IUPAC chemical name",
        min_length=1,
        max_length=500,
        examples=["isopentane", "3,4-dimethylhexane"],
    )


class StructureResponse(BaseModel):
    """Response containing a molecular structure."""

    smiles: str = Field(description="SMILES notation of the molecule")
    source: Literal["demo", "ml", "tool"] = Field(
        description="Source of the conversion (demo/ml/tool)"
    )


# Structure to Name
class StructureToNameRequest(BaseModel):
    """Request to convert SMILES to IUPAC name."""

    smiles: str = Field(
        description="SMILES notation",
        min_length=1,
        max_length=1000,
        examples=["CC(C)CC", "CCCCCC"],
    )


class NameResponse(BaseModel):
    """Response containing an IUPAC name."""

    name: str = Field(description="IUPAC chemical name")
    source: Literal["demo", "ml", "tool"] = Field(
        description="Source of the conversion (demo/ml/tool)"
    )
