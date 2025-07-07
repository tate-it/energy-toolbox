import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  type BasicInfoFormValues,
  basicInfoSchema,
} from '@/lib/xml-generator/schemas'
import { BasicInfoStep } from './BasicInfoStep'

// Test wrapper component that provides form context
function TestWrapper({
  children,
  defaultValues = {},
}: {
  children: React.ReactNode
  defaultValues?: Partial<BasicInfoFormValues>
}) {
  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues,
    mode: 'onBlur', // Trigger validation on blur
  })

  return <FormProvider {...form}>{children}</FormProvider>
}

describe('BasicInfoStep', () => {
  it('renders all required fields', () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>,
    )

    expect(screen.getByLabelText(/PIVA Utente/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Codice Offerta/i)).toBeInTheDocument()
    expect(screen.getByText(/Requisiti Specifiche SII/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>,
    )

    const pivaInput = screen.getByLabelText(/PIVA Utente/i)
    const offerCodeInput = screen.getByLabelText(/Codice Offerta/i)

    // Enter invalid short values and trigger validation
    fireEvent.change(pivaInput, { target: { value: 'IT123' } })
    fireEvent.blur(pivaInput)

    fireEvent.change(offerCodeInput, { target: { value: '' } })
    fireEvent.blur(offerCodeInput)

    await waitFor(() => {
      expect(
        screen.getByText(/La PIVA deve contenere almeno 11 caratteri/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Il codice offerta è obbligatorio/i),
      ).toBeInTheDocument()
    })
  })

  it('validates PIVA format correctly', async () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>,
    )

    const pivaInput = screen.getByLabelText(/PIVA Utente/i)

    // Test invalid format (lowercase)
    fireEvent.change(pivaInput, { target: { value: 'it12345678901' } })
    fireEvent.blur(pivaInput)

    await waitFor(() => {
      expect(
        screen.getByText(
          /La PIVA deve contenere solo lettere maiuscole e numeri/i,
        ),
      ).toBeInTheDocument()
    })

    // Test valid format
    fireEvent.change(pivaInput, { target: { value: 'IT12345678901' } })
    fireEvent.blur(pivaInput)

    await waitFor(() => {
      expect(
        screen.queryByText(
          /La PIVA deve contenere solo lettere maiuscole e numeri/i,
        ),
      ).not.toBeInTheDocument()
    })
  })

  it('validates offer code format correctly', async () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>,
    )

    const offerCodeInput = screen.getByLabelText(/Codice Offerta/i)

    // Test invalid format (special characters)
    fireEvent.change(offerCodeInput, { target: { value: 'offer-2024!' } })
    fireEvent.blur(offerCodeInput)

    await waitFor(() => {
      expect(
        screen.getByText(
          /Il codice offerta deve contenere solo lettere maiuscole e numeri/i,
        ),
      ).toBeInTheDocument()
    })

    // Test valid format
    fireEvent.change(offerCodeInput, { target: { value: 'OFFER2024001' } })
    fireEvent.blur(offerCodeInput)

    await waitFor(() => {
      expect(
        screen.queryByText(
          /Il codice offerta deve contenere solo lettere maiuscole e numeri/i,
        ),
      ).not.toBeInTheDocument()
    })
  })

  it('enforces maximum length limits', async () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>,
    )

    const pivaInput = screen.getByLabelText(/PIVA Utente/i) as HTMLInputElement
    const offerCodeInput = screen.getByLabelText(
      /Codice Offerta/i,
    ) as HTMLInputElement

    expect(pivaInput.maxLength).toBe(16)
    expect(offerCodeInput.maxLength).toBe(32)
  })

  it('converts input to uppercase automatically', () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>,
    )

    const pivaInput = screen.getByLabelText(/PIVA Utente/i)
    const offerCodeInput = screen.getByLabelText(/Codice Offerta/i)

    // Check that inputs have uppercase styling
    expect(pivaInput).toHaveClass('uppercase')
    expect(offerCodeInput).toHaveClass('uppercase')
    expect(pivaInput).toHaveStyle({ textTransform: 'uppercase' })
    expect(offerCodeInput).toHaveStyle({ textTransform: 'uppercase' })
  })

  it('displays helpful information about field requirements', () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>,
    )

    expect(
      screen.getByText(
        /Partita IVA italiana \(11-16 caratteri alfanumerici\)/i,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /Codice offerta univoco \(max 32 caratteri alfanumerici\)/i,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /PIVA_UTENTE: Rappresenta la partita IVA dell'utente accreditato/i,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /COD_OFFERTA: Codice univoco utilizzato nel campo CODICE CONTRATTO/i,
      ),
    ).toBeInTheDocument()
  })

  it('accepts valid data', async () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>,
    )

    const pivaInput = screen.getByLabelText(/PIVA Utente/i)
    const offerCodeInput = screen.getByLabelText(/Codice Offerta/i)

    fireEvent.change(pivaInput, { target: { value: 'IT12345678901' } })
    fireEvent.change(offerCodeInput, { target: { value: 'OFFER2024001' } })

    fireEvent.blur(pivaInput)
    fireEvent.blur(offerCodeInput)

    await waitFor(() => {
      expect(screen.queryByText(/La PIVA deve/i)).not.toBeInTheDocument()
      expect(
        screen.queryByText(/Il codice offerta deve/i),
      ).not.toBeInTheDocument()
    })
  })

  it('loads default values correctly', () => {
    const defaultValues = {
      pivaUtente: 'IT98765432109',
      codOfferta: 'TESTCODE123',
    }

    render(
      <TestWrapper defaultValues={defaultValues}>
        <BasicInfoStep />
      </TestWrapper>,
    )

    const pivaInput = screen.getByLabelText(/PIVA Utente/i) as HTMLInputElement
    const offerCodeInput = screen.getByLabelText(
      /Codice Offerta/i,
    ) as HTMLInputElement

    expect(pivaInput.value).toBe('IT98765432109')
    expect(offerCodeInput.value).toBe('TESTCODE123')
  })
})
