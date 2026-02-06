import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultCard } from '@/components/results/ResultCard'

// Store original clipboard
const originalClipboard = navigator.clipboard

describe('ResultCard', () => {
  const user = userEvent.setup()
  const mockWriteText = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock navigator.clipboard using defineProperty
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    })
    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => 'blob:test-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    // Restore original clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    })
    vi.restoreAllMocks()
  })

  it('renders SMILES result correctly', () => {
    render(<ResultCard title="SMILES Notation" result="CC(C)CC" source="demo" type="smiles" />)

    expect(screen.getByText('SMILES Notation')).toBeInTheDocument()
    expect(screen.getByText('CC(C)CC')).toBeInTheDocument()
    expect(screen.getByText('Successfully converted')).toBeInTheDocument()
  })

  it('renders name result correctly', () => {
    render(<ResultCard title="IUPAC Name" result="isopentane" source="ml" type="name" />)

    expect(screen.getByText('IUPAC Name')).toBeInTheDocument()
    expect(screen.getByText('isopentane')).toBeInTheDocument()
  })

  it('shows correct source badge for demo', () => {
    render(<ResultCard title="Test" result="test" source="demo" type="smiles" />)

    expect(screen.getByText('Demo')).toBeInTheDocument()
  })

  it('shows correct source badge for ML', () => {
    render(<ResultCard title="Test" result="test" source="ml" type="smiles" />)

    expect(screen.getByText('ML Model')).toBeInTheDocument()
  })

  it('shows correct source badge for tool', () => {
    render(<ResultCard title="Test" result="test" source="tool" type="smiles" />)

    expect(screen.getByText('Chemical Tool')).toBeInTheDocument()
  })

  it('copies result to clipboard when copy button clicked', async () => {
    render(<ResultCard title="Test" result="CC(C)CC" source="demo" type="smiles" />)

    const copyButton = screen.getByRole('button', { name: /Copy/i })
    await user.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith('CC(C)CC')
  })

  it('shows copied confirmation after copying', async () => {
    render(<ResultCard title="Test" result="CC(C)CC" source="demo" type="smiles" />)

    const copyButton = screen.getByRole('button', { name: /Copy/i })
    await user.click(copyButton)

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })

  it('downloads SMILES result correctly', async () => {
    render(<ResultCard title="Test" result="CC(C)CC" source="demo" type="smiles" />)

    const downloadButton = screen.getByRole('button', { name: /Download/i })
    await user.click(downloadButton)

    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('downloads name result correctly', async () => {
    render(<ResultCard title="Test" result="isopentane" source="ml" type="name" />)

    const downloadButton = screen.getByRole('button', { name: /Download/i })
    await user.click(downloadButton)

    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('has accessible copy button', () => {
    render(<ResultCard title="Test" result="test" source="demo" type="smiles" />)

    const copyButton = screen.getByRole('button', { name: /Copy to clipboard/i })
    expect(copyButton).toBeInTheDocument()
  })

  it('has accessible download button', () => {
    render(<ResultCard title="Test" result="test" source="demo" type="smiles" />)

    const downloadButton = screen.getByRole('button', { name: /Download result/i })
    expect(downloadButton).toBeInTheDocument()
  })

  it('displays result in monospace font area', () => {
    render(<ResultCard title="Test" result="CC(C)CC" source="demo" type="smiles" />)

    const resultArea = screen.getByText('CC(C)CC')
    expect(resultArea.closest('div')).toHaveClass('font-mono')
  })

  it('uses aria-live for dynamic result', () => {
    render(<ResultCard title="Test" result="CC(C)CC" source="demo" type="smiles" />)

    const resultArea = screen.getByText('CC(C)CC').closest('[aria-live]')
    expect(resultArea).toHaveAttribute('aria-live', 'polite')
  })
})
