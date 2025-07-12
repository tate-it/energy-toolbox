import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  type BasicInfoFormValues,
  basicInfoSchema,
} from '@/lib/xml-generator/schemas'
import { StepperProvider } from '@/providers/stepper-provider'
import { BasicInfoStepComponent as BasicInfoStep } from './basic-info-step'

// Regex patterns defined at top level for performance
const PIVA_UTENTE_REGEX = /PIVA Utente/i
const CODICE_OFFERTA_REGEX = /Codice Offerta/i
const REQUISITI_SPECIFICHE_REGEX = /Requisiti Specifiche SII/i
const PIVA_MIN_LENGTH_ERROR_REGEX =
  /La PIVA deve contenere almeno 11 caratteri/i
const CODICE_OFFERTA_REQUIRED_ERROR_REGEX =
  /(Il codice offerta è obbligatorio|Required)/i
const PIVA_FORMAT_ERROR_REGEX =
  /La PIVA deve contenere solo lettere maiuscole e numeri/i
const CODICE_OFFERTA_FORMAT_ERROR_REGEX =
  /Il codice offerta deve contenere solo lettere maiuscole e numeri/i
const PARTITA_IVA_HELP_REGEX =
  /Partita IVA italiana \(11-16 caratteri alfanumerici\)/i
const CODICE_OFFERTA_HELP_REGEX =
  /Codice offerta univoco \(max 32 caratteri alfanumerici\)/i
const PIVA_UTENTE_DESCRIPTION_REGEX =
  /Rappresenta la partita IVA dell'utente accreditato \(Alfanumerico, max 16 caratteri\)/i
const COD_OFFERTA_DESCRIPTION_REGEX =
  /Codice univoco utilizzato nel campo CODICE CONTRATTO durante le richieste di switching \(Alfanumerico, max 32 caratteri\)/i
const PIVA_ERROR_REGEX = /La PIVA deve/i
const CODICE_OFFERTA_ERROR_REGEX = /Il codice offerta deve/i

// Test wrapper component that provides form context and stepper context
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

  return (
    <StepperProvider variant="horizontal">
      <FormProvider {...form}>{children}</FormProvider>
    </StepperProvider>
  )
}

describe('BasicInfoStep', () => {
  it('renders all required fields', () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>,
    )

    expect(screen.getByLabelText(PIVA_UTENTE_REGEX)).toBeInTheDocument()
    expect(screen.getByLabelText(CODICE_OFFERTA_REGEX)).toBeInTheDocument()
    expect(screen.getByText(REQUISITI_SPECIFICHE_REGEX)).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>,
    )

    const pivaInput = screen.getByLabelText(PIVA_UTENTE_REGEX)
    const offerCodeInput = screen.getByLabelText(CODICE_OFFERTA_REGEX)

    // Enter invalid short values and trigger validation
    fireEvent.change(pivaInput, { target: { value: 'IT123' } })
    fireEvent.blur(pivaInput)

    fireEvent.change(offerCodeInput, { target: { value: '' } })
    fireEvent.blur(offerCodeInput)

    await waitFor(() => {
      expect(screen.getByText(PIVA_MIN_LENGTH_ERROR_REGEX)).toBeInTheDocument()
      expect(
        screen.getByText(CODICE_OFFERTA_REQUIRED_ERROR_REGEX),
      ).toBeInTheDocument()
    })
  })

  it('validates PIVA format correctly', async () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>,
    )

    const pivaInput = screen.getByLabelText(PIVA_UTENTE_REGEX)

    // Test invalid format (lowercase)
    fireEvent.change(pivaInput, { target: { value: 'it12345678901' } })
    fireEvent.blur(pivaInput)

    await waitFor(() => {
      expect(screen.getByText(PIVA_FORMAT_ERROR_REGEX)).toBeInTheDocument()
    })

    // Test valid format
    fireEvent.change(pivaInput, { target: { value: 'IT12345678901' } })
    fireEvent.blur(pivaInput)

    await waitFor(() => {
      expect(
        screen.queryByText(PIVA_FORMAT_ERROR_REGEX),
      ).not.toBeInTheDocument()
    })
  })

  it('validates offer code format correctly', async () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>,
    )

    const offerCodeInput = screen.getByLabelText(CODICE_OFFERTA_REGEX)

    // Test invalid format (special characters)
    fireEvent.change(offerCodeInput, { target: { value: 'offer-2024!' } })
    fireEvent.blur(offerCodeInput)

    await waitFor(() => {
      expect(
        screen.getByText(CODICE_OFFERTA_FORMAT_ERROR_REGEX),
      ).toBeInTheDocument()
    })

    // Test valid format
    fireEvent.change(offerCodeInput, { target: { value: 'OFFER2024001' } })
    fireEvent.blur(offerCodeInput)

    await waitFor(() => {
      expect(
        screen.queryByText(CODICE_OFFERTA_FORMAT_ERROR_REGEX),
      ).not.toBeInTheDocument()
    })
  })

  it('enforces maximum length limits', () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>,
    )

    const pivaInput = screen.getByLabelText(
      PIVA_UTENTE_REGEX,
    ) as HTMLInputElement
    const offerCodeInput = screen.getByLabelText(
      CODICE_OFFERTA_REGEX,
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

    const pivaInput = screen.getByLabelText(PIVA_UTENTE_REGEX)
    const offerCodeInput = screen.getByLabelText(CODICE_OFFERTA_REGEX)

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

    expect(screen.getByText(PARTITA_IVA_HELP_REGEX)).toBeInTheDocument()
    expect(screen.getByText(CODICE_OFFERTA_HELP_REGEX)).toBeInTheDocument()
    expect(screen.getByText(PIVA_UTENTE_DESCRIPTION_REGEX)).toBeInTheDocument()
    expect(screen.getByText(COD_OFFERTA_DESCRIPTION_REGEX)).toBeInTheDocument()
  })

  it('accepts valid data', async () => {
    render(
      <TestWrapper>
        <BasicInfoStep />
      </TestWrapper>,
    )

    const pivaInput = screen.getByLabelText(PIVA_UTENTE_REGEX)
    const offerCodeInput = screen.getByLabelText(CODICE_OFFERTA_REGEX)

    fireEvent.change(pivaInput, { target: { value: 'IT12345678901' } })
    fireEvent.change(offerCodeInput, { target: { value: 'OFFER2024001' } })

    fireEvent.blur(pivaInput)
    fireEvent.blur(offerCodeInput)

    await waitFor(() => {
      expect(screen.queryByText(PIVA_ERROR_REGEX)).not.toBeInTheDocument()
      expect(
        screen.queryByText(CODICE_OFFERTA_ERROR_REGEX),
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

    const pivaInput = screen.getByLabelText(
      PIVA_UTENTE_REGEX,
    ) as HTMLInputElement
    const offerCodeInput = screen.getByLabelText(
      CODICE_OFFERTA_REGEX,
    ) as HTMLInputElement

    expect(pivaInput.value).toBe('IT98765432109')
    expect(offerCodeInput.value).toBe('TESTCODE123')
  })
})
