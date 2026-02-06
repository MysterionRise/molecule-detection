/**
 * API client for ChemVision backend communication.
 */

// Types matching backend schemas
export interface StructureResponse {
  smiles: string
  source: 'demo' | 'ml' | 'tool'
}

export interface NameResponse {
  name: string
  source: 'demo' | 'ml' | 'tool'
}

export interface ErrorDetail {
  error_code: string
  message: string
  details: Record<string, unknown> | null
  correlation_id: string
}

/**
 * Custom error class for API errors with correlation ID support.
 */
export class ApiError extends Error {
  public readonly errorCode: string
  public readonly correlationId: string
  public readonly details: Record<string, unknown> | null
  public readonly statusCode: number

  constructor(
    message: string,
    errorCode: string,
    correlationId: string,
    statusCode: number,
    details: Record<string, unknown> | null = null
  ) {
    super(message)
    this.name = 'ApiError'
    this.errorCode = errorCode
    this.correlationId = correlationId
    this.statusCode = statusCode
    this.details = details
  }
}

/**
 * Get the API base URL from environment or default to localhost.
 */
function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC env variable
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }
  // Server-side: use internal Docker network or localhost
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

/**
 * Parse error response from the API.
 */
async function parseErrorResponse(response: Response): Promise<ApiError> {
  const correlationId = response.headers.get('X-Correlation-ID') || 'unknown'

  try {
    const data = await response.json()

    // Handle FastAPI's HTTPException format (wrapped in "detail")
    if (data.detail && typeof data.detail === 'object') {
      const detail = data.detail as ErrorDetail
      return new ApiError(
        detail.message || 'An error occurred',
        detail.error_code || 'UNKNOWN_ERROR',
        detail.correlation_id || correlationId,
        response.status,
        detail.details
      )
    }

    // Handle validation errors (422)
    if (response.status === 422 && data.detail) {
      const validationErrors = Array.isArray(data.detail)
        ? data.detail.map((e: { msg: string }) => e.msg).join(', ')
        : 'Validation error'
      return new ApiError(validationErrors, 'VALIDATION_ERROR', correlationId, response.status)
    }

    // Fallback for other error formats
    return new ApiError(
      data.message || data.detail || 'An error occurred',
      data.error_code || 'UNKNOWN_ERROR',
      correlationId,
      response.status,
      data.details || null
    )
  } catch {
    // JSON parsing failed
    return new ApiError(
      `Request failed with status ${response.status}`,
      'REQUEST_FAILED',
      correlationId,
      response.status
    )
  }
}

/**
 * API client for ChemVision endpoints.
 */
export const apiClient = {
  /**
   * Convert IUPAC chemical name to SMILES notation.
   */
  async nameToStructure(name: string): Promise<StructureResponse> {
    const response = await fetch(`${getApiUrl()}/api/name-to-structure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      throw await parseErrorResponse(response)
    }

    return response.json() as Promise<StructureResponse>
  },

  /**
   * Convert SMILES notation to IUPAC chemical name.
   */
  async structureToName(smiles: string): Promise<NameResponse> {
    const response = await fetch(`${getApiUrl()}/api/structure-to-name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ smiles }),
    })

    if (!response.ok) {
      throw await parseErrorResponse(response)
    }

    return response.json() as Promise<NameResponse>
  },

  /**
   * Extract SMILES notation from a molecular structure image.
   */
  async imageToStructure(file: File): Promise<StructureResponse> {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${getApiUrl()}/api/image-to-structure`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw await parseErrorResponse(response)
    }

    return response.json() as Promise<StructureResponse>
  },
}
