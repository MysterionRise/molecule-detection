// API Types
export interface StructureResponse {
  smiles: string
  source: string
}

export interface NameResponse {
  name: string
  source: string
}

// Custom Error Class
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// API Client
class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }

  async imageToStructure(file: File): Promise<StructureResponse> {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${this.baseUrl}/api/ocsr`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to extract structure from image' }))
      throw new ApiError(error.error || error.message || 'Failed to extract structure from image', response.status)
    }

    return response.json()
  }

  async nameToStructure(name: string): Promise<StructureResponse> {
    const response = await fetch(`${this.baseUrl}/api/name2structure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to convert name to structure' }))
      throw new ApiError(error.error || error.message || 'Failed to convert name to structure', response.status)
    }

    return response.json()
  }

  async structureToName(smiles: string): Promise<NameResponse> {
    const response = await fetch(`${this.baseUrl}/api/structure2name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ smiles }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to convert structure to name' }))
      throw new ApiError(error.error || error.message || 'Failed to convert structure to name', response.status)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
