import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NameToStructureForm } from '@/components/forms/NameToStructureForm'
import { apiClient, ApiError } from '@/lib/api'

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    nameToStructure: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(
      message: string,
      public errorCode: string,
      public correlationId: string,
      public statusCode: number
    ) {
      super(message)
      this.name = 'ApiError'
    }
  },
}))

describe('NameToStructureForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with all elements', () => {
    render(<NameToStructureForm />)

    expect(screen.getByText('IUPAC Name to Structure')).toBeInTheDocument()
    expect(screen.getByLabelText(/IUPAC Chemical Name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e.g., isopentane/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Convert to SMILES/i })).toBeInTheDocument()
  })

  it('shows validation error for empty input', async () => {
    render(<NameToStructureForm />)

    const submitButton = screen.getByRole('button', { name: /Convert to SMILES/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Please enter a chemical name/i)
    })
  })

  it('submits form and displays result on success', async () => {
    const mockResponse = { smiles: 'CC(C)CC', source: 'demo' as const }
    vi.mocked(apiClient.nameToStructure).mockResolvedValueOnce(mockResponse)

    render(<NameToStructureForm />)

    const input = screen.getByLabelText(/IUPAC Chemical Name/i)
    await user.type(input, 'isopentane')

    const submitButton = screen.getByRole('button', { name: /Convert to SMILES/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('CC(C)CC')).toBeInTheDocument()
      expect(screen.getByText('Demo')).toBeInTheDocument()
    })

    expect(apiClient.nameToStructure).toHaveBeenCalledWith('isopentane')
  })

  it('shows loading state during submission', async () => {
    // Mock a slow response
    vi.mocked(apiClient.nameToStructure).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ smiles: 'CC', source: 'demo' }), 100))
    )

    render(<NameToStructureForm />)

    const input = screen.getByLabelText(/IUPAC Chemical Name/i)
    await user.type(input, 'test')

    const submitButton = screen.getByRole('button', { name: /Convert to SMILES/i })
    await user.click(submitButton)

    // Button should be disabled during loading
    expect(submitButton).toBeDisabled()
  })

  it('displays error message on API error', async () => {
    const error = new ApiError('Conversion failed', 'CONVERSION_ERROR', 'test-id', 500)
    vi.mocked(apiClient.nameToStructure).mockRejectedValueOnce(error)

    render(<NameToStructureForm />)

    const input = screen.getByLabelText(/IUPAC Chemical Name/i)
    await user.type(input, 'invalid-molecule')

    const submitButton = screen.getByRole('button', { name: /Convert to SMILES/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Conversion failed')).toBeInTheDocument()
    })
  })

  it('displays generic error for non-API errors', async () => {
    vi.mocked(apiClient.nameToStructure).mockRejectedValueOnce(new Error('Network error'))

    render(<NameToStructureForm />)

    const input = screen.getByLabelText(/IUPAC Chemical Name/i)
    await user.type(input, 'test')

    const submitButton = screen.getByRole('button', { name: /Convert to SMILES/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    })
  })

  it('clears previous result when submitting new request', async () => {
    const mockResponse = { smiles: 'CC(C)CC', source: 'demo' as const }
    vi.mocked(apiClient.nameToStructure).mockResolvedValue(mockResponse)

    render(<NameToStructureForm />)

    const input = screen.getByLabelText(/IUPAC Chemical Name/i)

    // First submission
    await user.type(input, 'isopentane')
    await user.click(screen.getByRole('button', { name: /Convert to SMILES/i }))

    await waitFor(() => {
      expect(screen.getByText('CC(C)CC')).toBeInTheDocument()
    })

    // Clear and submit again
    await user.clear(input)
    await user.type(input, 'another')

    // Mock error for second call
    vi.mocked(apiClient.nameToStructure).mockRejectedValueOnce(
      new ApiError('Not found', 'NOT_FOUND', 'id', 404)
    )

    await user.click(screen.getByRole('button', { name: /Convert to SMILES/i }))

    await waitFor(() => {
      // Previous result should be cleared
      expect(screen.queryByText('CC(C)CC')).not.toBeInTheDocument()
      expect(screen.getByText('Not found')).toBeInTheDocument()
    })
  })
})
