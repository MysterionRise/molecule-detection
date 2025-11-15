import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    expect(screen.getByText('ChemVision')).toBeInTheDocument()
  })

  it('renders all three tab triggers', () => {
    render(<Home />)
    expect(screen.getByText('Image → Structure')).toBeInTheDocument()
    expect(screen.getByText('Name → Structure')).toBeInTheDocument()
    expect(screen.getByText('Structure → Name')).toBeInTheDocument()
  })

  it('shows Phase 1 POC message in footer', () => {
    render(<Home />)
    expect(screen.getByText(/Phase 1 POC/)).toBeInTheDocument()
  })
})
