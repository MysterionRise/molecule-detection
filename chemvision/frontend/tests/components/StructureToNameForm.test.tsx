import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StructureToNameForm } from '@/components/forms/StructureToNameForm'
import { apiClient, ApiError } from '@/lib/api'

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    structureToName: vi.fn(),
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

describe('StructureToNameForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with all elements', () => {
    render(<StructureToNameForm />)

    expect(screen.getByText('Structure to IUPAC Name')).toBeInTheDocument()
    expect(screen.getByLabelText(/SMILES Notation/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e.g., CC\(C\)CC/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Convert to IUPAC Name/i })).toBeInTheDocument()
  })

  it('shows validation error for empty input', async () => {
    render(<StructureToNameForm />)

    const submitButton = screen.getByRole('button', { name: /Convert to IUPAC Name/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Please enter a SMILES notation/i)
    })
  })

  it('submits form and displays result on success', async () => {
    const mockResponse = { name: 'isopentane', source: 'ml' as const }
    vi.mocked(apiClient.structureToName).mockResolvedValueOnce(mockResponse)

    render(<StructureToNameForm />)

    const textarea = screen.getByLabelText(/SMILES Notation/i)
    await user.type(textarea, 'CC(C)CC')

    const submitButton = screen.getByRole('button', { name: /Convert to IUPAC Name/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('isopentane')).toBeInTheDocument()
      expect(screen.getByText('ML Model')).toBeInTheDocument()
    })

    expect(apiClient.structureToName).toHaveBeenCalledWith('CC(C)CC')
  })

  it('shows loading state during submission', async () => {
    vi.mocked(apiClient.structureToName).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ name: 'test', source: 'ml' }), 100))
    )

    render(<StructureToNameForm />)

    const textarea = screen.getByLabelText(/SMILES Notation/i)
    await user.type(textarea, 'CC')

    const submitButton = screen.getByRole('button', { name: /Convert to IUPAC Name/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
  })

  it('displays error message on API error', async () => {
    const error = new ApiError(
      'Structure to name conversion is not yet implemented.',
      'NOT_IMPLEMENTED',
      'test-id',
      501
    )
    vi.mocked(apiClient.structureToName).mockRejectedValueOnce(error)

    render(<StructureToNameForm />)

    const textarea = screen.getByLabelText(/SMILES Notation/i)
    await user.type(textarea, 'CC')

    const submitButton = screen.getByRole('button', { name: /Convert to IUPAC Name/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Structure to name conversion is not yet implemented.')
      ).toBeInTheDocument()
    })
  })

  it('displays generic error for non-API errors', async () => {
    vi.mocked(apiClient.structureToName).mockRejectedValueOnce(new Error('Network failure'))

    render(<StructureToNameForm />)

    const textarea = screen.getByLabelText(/SMILES Notation/i)
    await user.type(textarea, 'CC')

    const submitButton = screen.getByRole('button', { name: /Convert to IUPAC Name/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    })
  })

  it('uses textarea for multi-line SMILES input', () => {
    render(<StructureToNameForm />)

    const textarea = screen.getByLabelText(/SMILES Notation/i)
    expect(textarea.tagName.toLowerCase()).toBe('textarea')
    expect(textarea).toHaveAttribute('rows', '4')
  })
})
