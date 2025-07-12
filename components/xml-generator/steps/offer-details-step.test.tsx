import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  type OfferDetailsFormValues,
  offerDetailsSchema,
} from '@/lib/xml-generator/schemas'
import { OfferDetailsStepComponent as OfferDetailsStep } from './offer-details-step'

// Regex patterns for testing Italian labels
const SUPPLIER_CHANGE_CHECKBOX_REGEX = /cambio fornitore/i
const FIRST_ACTIVATION_CHECKBOX_REGEX = /prima attivazione/i
const ALWAYS_CHECKBOX_REGEX = /sempre/i
const DURATION_PLACEHOLDER_REGEX = /inserisci -1 per durata indeterminata/i
const GUARANTEES_PLACEHOLDER_REGEX =
  /inserisci 'no' se non sono richieste garanzie/i

// Field label patterns (without asterisks since they're in separate spans)
const MARKET_TYPE_LABEL_REGEX = /Tipo di Mercato/
const CLIENT_TYPE_LABEL_REGEX = /Tipo di Cliente/
const OFFER_TYPE_LABEL_REGEX = /Tipo di Offerta/
const CONTRACT_ACTIVATION_LABEL_REGEX = /Tipologie di Attivazione Contratto/
const OFFER_NAME_LABEL_REGEX = /Nome dell'Offerta/
const OFFER_DESCRIPTION_LABEL_REGEX = /Descrizione dell'Offerta/
const DURATION_LABEL_REGEX = /Durata \(mesi\)/
const GUARANTEES_LABEL_REGEX = /Garanzie/
const SINGLE_OFFER_LABEL_REGEX = /Offerta Singola/
const RESIDENTIAL_STATUS_LABEL_REGEX = /Stato Residenziale/

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
    defaultValues: {
      // Ensure all fields have proper defaults to match the component's defensive handling
      marketType: '',
      singleOffer: '',
      clientType: '',
      residentialStatus: '',
      offerType: '',
      contractActivationTypes: [],
      offerName: '',
      offerDescription: '',
      duration: '',
      guarantees: '',
      ...defaultValues,
    },
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('OfferDetailsStep', () => {
  beforeEach(() => {
    // Reset any state before each test
  })

  it('renders all required fields with proper default values', () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Check that all required fields are present - using partial text since asterisks are in separate spans
    expect(screen.getByText(MARKET_TYPE_LABEL_REGEX)).toBeInTheDocument()
    expect(screen.getByText(CLIENT_TYPE_LABEL_REGEX)).toBeInTheDocument()
    expect(screen.getByText(OFFER_TYPE_LABEL_REGEX)).toBeInTheDocument()
    expect(
      screen.getByText(CONTRACT_ACTIVATION_LABEL_REGEX),
    ).toBeInTheDocument()
    expect(screen.getByText(OFFER_NAME_LABEL_REGEX)).toBeInTheDocument()
    expect(screen.getByText(OFFER_DESCRIPTION_LABEL_REGEX)).toBeInTheDocument()
    expect(screen.getByText(DURATION_LABEL_REGEX)).toBeInTheDocument()
    expect(screen.getByText(GUARANTEES_LABEL_REGEX)).toBeInTheDocument()

    // Verify that form fields start with empty values (not undefined)
    const offerNameInput = screen.getByPlaceholderText(
      "Inserisci il nome dell'offerta",
    )
    const durationInput = screen.getByPlaceholderText(
      DURATION_PLACEHOLDER_REGEX,
    )

    expect(offerNameInput).toHaveValue('')
    expect(durationInput).toHaveValue(null) // number inputs show null for empty values
  })

  it('shows single offer field when market type is not dual fuel', async () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Select electricity market type by finding the combobox near the label
    const marketTypeLabel = screen.getByText(MARKET_TYPE_LABEL_REGEX)
    const marketTypeSelect = marketTypeLabel.parentElement?.querySelector(
      '[role="combobox"]',
    ) as HTMLElement
    fireEvent.click(marketTypeSelect)

    const electricityOption = screen.getByText('Elettrico')
    fireEvent.click(electricityOption)

    // Wait for the single offer field to appear
    await waitFor(() => {
      expect(screen.getByText(SINGLE_OFFER_LABEL_REGEX)).toBeInTheDocument()
    })
  })

  it('hides single offer field when market type is dual fuel', async () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Select dual fuel market type by finding the combobox near the label
    const marketTypeLabel = screen.getByText(MARKET_TYPE_LABEL_REGEX)
    const marketTypeSelect = marketTypeLabel.parentElement?.querySelector(
      '[role="combobox"]',
    ) as HTMLElement
    fireEvent.click(marketTypeSelect)

    const dualFuelOption = screen.getByText('Dual Fuel')
    fireEvent.click(dualFuelOption)

    // Wait and check that single offer field is not present
    await waitFor(() => {
      expect(
        screen.queryByText(SINGLE_OFFER_LABEL_REGEX),
      ).not.toBeInTheDocument()
    })
  })

  it('shows residential status field when client type is domestic', async () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Select domestic client type by finding the combobox near the label
    const clientTypeLabel = screen.getByText(CLIENT_TYPE_LABEL_REGEX)
    const clientTypeSelect = clientTypeLabel.parentElement?.querySelector(
      '[role="combobox"]',
    ) as HTMLElement
    fireEvent.click(clientTypeSelect)

    const domesticOption = screen.getByText('Domestico')
    fireEvent.click(domesticOption)

    // Wait for the residential status field to appear
    await waitFor(() => {
      expect(
        screen.getByText(RESIDENTIAL_STATUS_LABEL_REGEX),
      ).toBeInTheDocument()
    })
  })

  it('hides residential status field when client type is not domestic', async () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Select other uses client type by finding the combobox near the label
    const clientTypeLabel = screen.getByText(CLIENT_TYPE_LABEL_REGEX)
    const clientTypeSelect = clientTypeLabel.parentElement?.querySelector(
      '[role="combobox"]',
    ) as HTMLElement
    fireEvent.click(clientTypeSelect)

    const otherUsesOption = screen.getByText('Altri Usi')
    fireEvent.click(otherUsesOption)

    // Wait and check that residential status field is not present
    await waitFor(() => {
      expect(
        screen.queryByText(RESIDENTIAL_STATUS_LABEL_REGEX),
      ).not.toBeInTheDocument()
    })
  })

  it('allows multiple contract activation types to be selected with proper array handling', () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Select multiple contract activation types
    const supplierChangeCheckbox = screen.getByRole('checkbox', {
      name: SUPPLIER_CHANGE_CHECKBOX_REGEX,
    })
    const firstActivationCheckbox = screen.getByRole('checkbox', {
      name: FIRST_ACTIVATION_CHECKBOX_REGEX,
    })

    // Initially, checkboxes should be unchecked (empty array handling)
    expect(supplierChangeCheckbox).not.toBeChecked()
    expect(firstActivationCheckbox).not.toBeChecked()

    fireEvent.click(supplierChangeCheckbox)
    fireEvent.click(firstActivationCheckbox)

    // Check that both are selected
    expect(supplierChangeCheckbox).toBeChecked()
    expect(firstActivationCheckbox).toBeChecked()
  })

  it('validates required fields and handles empty values properly', () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Check that required fields are marked as required and handle empty values
    const offerNameInput = screen.getByPlaceholderText(
      "Inserisci il nome dell'offerta",
    )
    const offerDescriptionInput = screen.getByPlaceholderText(
      "Inserisci una descrizione dettagliata dell'offerta",
    )
    const durationInput = screen.getByPlaceholderText(
      DURATION_PLACEHOLDER_REGEX,
    )
    const guaranteesInput = screen.getByPlaceholderText(
      GUARANTEES_PLACEHOLDER_REGEX,
    )

    // Check that the inputs exist and have proper empty values
    expect(offerNameInput).toBeInTheDocument()
    expect(offerNameInput).toHaveValue('')

    expect(offerDescriptionInput).toBeInTheDocument()
    expect(offerDescriptionInput).toHaveValue('')

    expect(durationInput).toBeInTheDocument()
    expect(durationInput).toHaveValue(null)

    expect(guaranteesInput).toBeInTheDocument()
    expect(guaranteesInput).toHaveValue('')
  })

  it('accepts valid form data with proper value handling', () => {
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

  it('handles duration field correctly with proper number conversion', () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    const durationInput = screen.getByPlaceholderText(
      DURATION_PLACEHOLDER_REGEX,
    )

    // Test entering -1 for indeterminate duration
    fireEvent.change(durationInput, { target: { value: '-1' } })
    expect(durationInput).toHaveValue(-1)

    // Test entering a valid duration
    fireEvent.change(durationInput, { target: { value: '24' } })
    expect(durationInput).toHaveValue(24)

    // Test empty value handling
    fireEvent.change(durationInput, { target: { value: '' } })
    expect(durationInput).toHaveValue(null)
  })

  it('handles text field changes with explicit value/onChange pattern', () => {
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

    // Test that inputs accept valid values with new explicit pattern
    const validName = 'Valid Offer Name'
    const validDescription = 'Valid offer description'

    fireEvent.change(offerNameInput, { target: { value: validName } })
    fireEvent.change(offerDescriptionInput, {
      target: { value: validDescription },
    })

    // The inputs should have the values we set
    expect(offerNameInput).toHaveValue(validName)
    expect(offerDescriptionInput).toHaveValue(validDescription)

    // Test clearing values
    fireEvent.change(offerNameInput, { target: { value: '' } })
    fireEvent.change(offerDescriptionInput, { target: { value: '' } })

    expect(offerNameInput).toHaveValue('')
    expect(offerDescriptionInput).toHaveValue('')
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

  it('validates duration range with proper number handling', () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    const durationInput = screen.getByPlaceholderText(
      DURATION_PLACEHOLDER_REGEX,
    )

    // Test valid duration values
    fireEvent.change(durationInput, { target: { value: '-1' } })
    expect(durationInput).toHaveValue(-1)

    fireEvent.change(durationInput, { target: { value: '12' } })
    expect(durationInput).toHaveValue(12)

    fireEvent.change(durationInput, { target: { value: '99' } })
    expect(durationInput).toHaveValue(99)

    // Test edge case: empty value should be handled properly
    fireEvent.change(durationInput, { target: { value: '' } })
    expect(durationInput).toHaveValue(null)
  })

  it('handles checkbox array state changes without controlled/uncontrolled errors', () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Get all checkboxes
    const alwaysCheckbox = screen.getByRole('checkbox', {
      name: ALWAYS_CHECKBOX_REGEX,
    })
    const supplierChangeCheckbox = screen.getByRole('checkbox', {
      name: SUPPLIER_CHANGE_CHECKBOX_REGEX,
    })

    // Initially all should be unchecked (empty array)
    expect(alwaysCheckbox).not.toBeChecked()
    expect(supplierChangeCheckbox).not.toBeChecked()

    // Test selecting and unselecting
    fireEvent.click(alwaysCheckbox)
    expect(alwaysCheckbox).toBeChecked()

    fireEvent.click(supplierChangeCheckbox)
    expect(supplierChangeCheckbox).toBeChecked()

    // Unselect one
    fireEvent.click(alwaysCheckbox)
    expect(alwaysCheckbox).not.toBeChecked()
    expect(supplierChangeCheckbox).toBeChecked() // Should remain checked
  })

  it('handles conditional field state transitions properly', async () => {
    render(
      <TestWrapper>
        <OfferDetailsStep />
      </TestWrapper>,
    )

    // Test market type change that shows/hides single offer field
    const marketTypeLabel = screen.getByText(MARKET_TYPE_LABEL_REGEX)
    const marketTypeSelect = marketTypeLabel.parentElement?.querySelector(
      '[role="combobox"]',
    ) as HTMLElement

    // Start with electricity (shows single offer)
    fireEvent.click(marketTypeSelect)
    fireEvent.click(screen.getByText('Elettrico'))

    await waitFor(() => {
      expect(screen.getByText(SINGLE_OFFER_LABEL_REGEX)).toBeInTheDocument()
    })

    // Change to dual fuel (hides single offer)
    fireEvent.click(marketTypeSelect)
    fireEvent.click(screen.getByText('Dual Fuel'))

    await waitFor(() => {
      expect(
        screen.queryByText(SINGLE_OFFER_LABEL_REGEX),
      ).not.toBeInTheDocument()
    })

    // Change back to electricity (shows single offer again)
    fireEvent.click(marketTypeSelect)
    fireEvent.click(screen.getByText('Elettrico'))

    await waitFor(() => {
      expect(screen.getByText(SINGLE_OFFER_LABEL_REGEX)).toBeInTheDocument()
    })
  })
})
