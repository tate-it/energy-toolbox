import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import XmlGeneratorPage from './page'

describe('XmlGeneratorPage', () => {
  it('renders the page title', () => {
    render(<XmlGeneratorPage />)
    
    const title = screen.getByText('Generate SII Compliant XML Offers')
    expect(title).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<XmlGeneratorPage />)
    
    const description = screen.getByText(/Use this tool to create XML files/)
    expect(description).toBeInTheDocument()
  })

  it('renders the placeholder for multi-step form', () => {
    render(<XmlGeneratorPage />)
    
    const placeholder = screen.getByText('Multi-step form component will be integrated here')
    expect(placeholder).toBeInTheDocument()
  })
}) 