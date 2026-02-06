import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageToStructureForm } from '@/components/forms/ImageToStructureForm'
import { apiClient, ApiError } from '@/lib/api'

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    imageToStructure: vi.fn(),
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

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:test-url')
const mockRevokeObjectURL = vi.fn()
global.URL.createObjectURL = mockCreateObjectURL
global.URL.revokeObjectURL = mockRevokeObjectURL

describe('ImageToStructureForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with all elements', () => {
    render(<ImageToStructureForm />)

    expect(screen.getByText('Image to Structure')).toBeInTheDocument()
    expect(screen.getByLabelText(/Molecular Structure Image/i)).toBeInTheDocument()
    expect(screen.getByText(/Drop image here or click to upload/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Extract SMILES/i })).toBeInTheDocument()
  })

  it('shows file upload instructions', () => {
    render(<ImageToStructureForm />)

    expect(screen.getByText(/PNG or JPEG, max 10MB/i)).toBeInTheDocument()
  })

  it('button is disabled when no file selected', () => {
    render(<ImageToStructureForm />)

    const submitButton = screen.getByRole('button', { name: /Extract SMILES/i })
    expect(submitButton).toBeDisabled()
  })

  it('accepts valid image file via input', async () => {
    render(<ImageToStructureForm />)

    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument()
    })
  })

  it('shows file size after upload', async () => {
    render(<ImageToStructureForm />)

    const content = new Uint8Array(1024).fill(0) // 1KB file
    const file = new File([content], 'test.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/1\.0 KB/i)).toBeInTheDocument()
    })
  })

  it('shows error for non-image files', async () => {
    render(<ImageToStructureForm />)

    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    // Manually trigger onChange since userEvent.upload validates file types
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText(/Please select a valid image file/i)).toBeInTheDocument()
    })
  })

  it('shows error for files over 10MB', async () => {
    render(<ImageToStructureForm />)

    // Create a file larger than 10MB
    const content = new Uint8Array(11 * 1024 * 1024).fill(0)
    const file = new File([content], 'large.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText(/File size must be less than 10MB/i)).toBeInTheDocument()
    })
  })

  it('allows clearing selected file', async () => {
    render(<ImageToStructureForm />)

    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument()
    })

    const clearButton = screen.getByRole('button', { name: /Remove image/i })
    await user.click(clearButton)

    await waitFor(() => {
      expect(screen.queryByText('test.png')).not.toBeInTheDocument()
      expect(screen.getByText(/Drop image here or click to upload/i)).toBeInTheDocument()
    })
  })

  it('submits form and displays result on success', async () => {
    const mockResponse = { smiles: 'CCO', source: 'ml' as const }
    vi.mocked(apiClient.imageToStructure).mockResolvedValueOnce(mockResponse)

    render(<ImageToStructureForm />)

    const file = new File(['test'], 'molecule.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(input, file)

    const submitButton = screen.getByRole('button', { name: /Extract SMILES/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('CCO')).toBeInTheDocument()
      expect(screen.getByText('ML Model')).toBeInTheDocument()
    })

    expect(apiClient.imageToStructure).toHaveBeenCalledWith(file)
  })

  it('shows loading state during submission', async () => {
    vi.mocked(apiClient.imageToStructure).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ smiles: 'CC', source: 'ml' }), 100))
    )

    render(<ImageToStructureForm />)

    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(input, file)

    const submitButton = screen.getByRole('button', { name: /Extract SMILES/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
  })

  it('displays error message on API error', async () => {
    const error = new ApiError('OCSR is not yet implemented.', 'NOT_IMPLEMENTED', 'test-id', 501)
    vi.mocked(apiClient.imageToStructure).mockRejectedValueOnce(error)

    render(<ImageToStructureForm />)

    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(input, file)

    const submitButton = screen.getByRole('button', { name: /Extract SMILES/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('OCSR is not yet implemented.')).toBeInTheDocument()
    })
  })

  it('handles drag and drop', async () => {
    render(<ImageToStructureForm />)

    const dropZone = screen.getByText(/Drop image here or click to upload/i).closest('div')!

    const file = new File(['test'], 'dropped.png', { type: 'image/png' })

    // Simulate drag enter
    fireEvent.dragEnter(dropZone, {
      dataTransfer: { files: [file] },
    })

    // The drop zone should show active state (tested by visual change)
    fireEvent.dragOver(dropZone, {
      dataTransfer: { files: [file] },
    })

    // Simulate drop
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    })

    await waitFor(() => {
      expect(screen.getByText('dropped.png')).toBeInTheDocument()
    })
  })

  it('handles drag leave', () => {
    render(<ImageToStructureForm />)

    const dropZone = screen.getByText(/Drop image here or click to upload/i).closest('div')!

    fireEvent.dragEnter(dropZone)
    fireEvent.dragLeave(dropZone)

    // Form should still be in initial state
    expect(screen.getByText(/Drop image here or click to upload/i)).toBeInTheDocument()
  })
})
