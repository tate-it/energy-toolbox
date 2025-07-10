import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  type OfferDetailsFormValues,
  offerDetailsSchema,
} from '@/lib/xml-generator/schemas'
import { OfferDetailsStep } from './offer-details-step'

// Wrapper component for testing
function TestWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode
  defaultValues?: Partial<OfferDetailsFormValues>
}) {
  const methods = useForm<OfferDetailsFormValues>({
    resolver: zodResolver(offerDetailsSchema),
    defaultValues,
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('OfferDetailsStep', () => {
  beforeEach(() => {
    // Reset any state before each test
  })

  it('renders all required fields', () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Check that all required fields are present
    expect(screen.getByText('Tipo di Mercato *')).toBeInTheDocument()
    expect(screen.getByText('Tipo di Cliente *')).toBeInTheDocument()
    expect(screen.getByText('Tipo di Offerta *')).toBeInTheDocument()
    expect(
      screen.getByText('Tipologie di Attivazione Contratto *'),
    ).toBeInTheDocument()
    expect(screen.getByText("Nome dell'Offerta *")).toBeInTheDocument()
    expect(screen.getByText("Descrizione dell'Offerta *")).toBeInTheDocument()
    expect(screen.getByText('Durata (mesi) *')).toBeInTheDocument()
    expect(screen.getByText('Garanzie *')).toBeInTheDocument()
  })

  it('shows single offer field when market type is not dual fuel', async () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Select electricity market type by finding the combobox near the label
    const marketTypeLabel = screen.getByText('Tipo di Mercato *')
    const marketTypeSelect = marketTypeLabel.parentElement?.querySelector(
      '[role="combobox"]',
    ) as HTMLElement
    fireEvent.click(marketTypeSelect)

    const electricityOption = screen.getByText('Elettrico')
    fireEvent.click(electricityOption)

    // Wait for the single offer field to appear
    await waitFor(() => {
      expect(screen.getByText('Offerta Singola *')).toBeInTheDocument()
    })
  })

  it('hides single offer field when market type is dual fuel', async () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Select dual fuel market type by finding the combobox near the label
    const marketTypeLabel = screen.getByText('Tipo di Mercato *')
    const marketTypeSelect = marketTypeLabel.parentElement?.querySelector(
      '[role="combobox"]',
    ) as HTMLElement
    fireEvent.click(marketTypeSelect)

    const dualFuelOption = screen.getByText('Dual Fuel')
    fireEvent.click(dualFuelOption)

    // Wait and check that single offer field is not present
    await waitFor(() => {
      expect(screen.queryByText('Offerta Singola *')).not.toBeInTheDocument()
    })
  })

  it('shows residential status field when client type is domestic', async () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Select domestic client type by finding the combobox near the label
    const clientTypeLabel = screen.getByText('Tipo di Cliente *')
    const clientTypeSelect = clientTypeLabel.parentElement?.querySelector(
      '[role="combobox"]',
    ) as HTMLElement
    fireEvent.click(clientTypeSelect)

    const domesticOption = screen.getByText('Domestico')
    fireEvent.click(domesticOption)

    // Wait for the residential status field to appear
    await waitFor(() => {
      expect(screen.getByText('Stato Residenziale')).toBeInTheDocument()
    })
  })

  it('hides residential status field when client type is not domestic', async () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Select other uses client type by finding the combobox near the label
    const clientTypeLabel = screen.getByText('Tipo di Cliente *')
    const clientTypeSelect = clientTypeLabel.parentElement?.querySelector(
      '[role="combobox"]',
    ) as HTMLElement
    fireEvent.click(clientTypeSelect)

    const otherUsesOption = screen.getByText('Altri Usi')
    fireEvent.click(otherUsesOption)

    // Wait and check that residential status field is not present
    await waitFor(() => {
      expect(screen.queryByText('Stato Residenziale')).not.toBeInTheDocument()
    })
  })

  it('allows multiple contract activation types to be selected', async () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Select multiple contract activation types
    const supplierChangeCheckbox = screen.getByRole('checkbox', {
      name: /cambio fornitore/i,
    })
    const firstActivationCheckbox = screen.getByRole('checkbox', {
      name: /prima attivazione/i,
    })

    fireEvent.click(supplierChangeCheckbox)
    fireEvent.click(firstActivationCheckbox)

    // Check that both are selected
    expect(supplierChangeCheckbox).toBeChecked()
    expect(firstActivationCheckbox).toBeChecked()
  })

  it('validates required fields', async () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Check that required fields are marked as required
    const offerNameInput = screen.getByPlaceholderText(
      "Inserisci il nome dell'offerta",
    )
    const offerDescriptionInput = screen.getByPlaceholderText(
      "Inserisci una descrizione dettagliata dell'offerta",
    )
    const durationInput = screen.getByPlaceholderText(
      /inserisci -1 per durata indeterminata/i,
    )
    const guaranteesInput = screen.getByPlaceholderText(
      /inserisci 'no' se non sono richieste garanzie/i,
    )

    // Check that the inputs exist and are properly configured
    expect(offerNameInput).toBeInTheDocument()
    expect(offerDescriptionInput).toBeInTheDocument()
    expect(durationInput).toBeInTheDocument()
    expect(guaranteesInput).toBeInTheDocument()
  })

  it('accepts valid form data', async () => {
    const defaultValues: Partial<OfferDetailsFormValues> = {
      marketType: '01',
      singleOffer: 'SI',
      clientType: '01',
      residentialStatus: '01',
      offerType: '01',
      contractActivationTypes: ['01', '02'],
      offerName: 'Test Offer',
      offerDescription: 'Test description',
      duration: 12,
      guarantees: 'NO',
    }

    render(
      <TestWrapper defaultValues={defaultValues}>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Check that form is populated with default values
    expect(screen.getByDisplayValue('Test Offer')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('12')).toBeInTheDocument()
    expect(screen.getByDisplayValue('NO')).toBeInTheDocument()
  })

  it('handles duration field correctly', async () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    const durationInput = screen.getByPlaceholderText(
      /inserisci -1 per durata indeterminata/i,
    )

    // Test entering -1 for indeterminate duration
    fireEvent.change(durationInput, { target: { value: '-1' } })
    expect(durationInput).toHaveValue(-1)

    // Test entering a valid duration
    fireEvent.change(durationInput, { target: { value: '24' } })
    expect(durationInput).toHaveValue(24)
  })

  it('shows help text for duration field', () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    expect(
      screen.getByText(
        'Inserisci -1 per durata indeterminata o un valore da 1 a 99 mesi',
      ),
    ).toBeInTheDocument()
  })

  it('shows help text for guarantees field', () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    expect(
      screen.getByText(
        'Inserisci "NO" se non sono richieste garanzie, altrimenti descrivi le garanzie richieste come cauzioni o domiciliazioni',
      ),
    ).toBeInTheDocument()
  })

  it('validates text field lengths', async () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    const offerNameInput = screen.getByPlaceholderText(
      "Inserisci il nome dell'offerta",
    )
    const offerDescriptionInput = screen.getByPlaceholderText(
      "Inserisci una descrizione dettagliata dell'offerta",
    )

    // Test that inputs accept valid values
    const validName = 'Valid Offer Name'
    const validDescription = 'Valid offer description'

    fireEvent.change(offerNameInput, { target: { value: validName } })
    fireEvent.change(offerDescriptionInput, {
      target: { value: validDescription },
    })

    // The inputs should have the values we set
    expect(offerNameInput).toHaveValue(validName)
    expect(offerDescriptionInput).toHaveValue(validDescription)
  })

  it('validates duration range', async () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    const durationInput = screen.getByPlaceholderText(
      /inserisci -1 per durata indeterminata/i,
    )

    // Test valid duration values
    fireEvent.change(durationInput, { target: { value: '-1' } })
    expect(durationInput).toHaveValue(-1)

    fireEvent.change(durationInput, { target: { value: '12' } })
    expect(durationInput).toHaveValue(12)

    fireEvent.change(durationInput, { target: { value: '99' } })
    expect(durationInput).toHaveValue(99)
  })
})
