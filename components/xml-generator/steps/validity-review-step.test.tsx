import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFormStates } from '@/hooks/use-form-states'
import {
  type ValidityReviewFormValues,
  validityReviewSchema,
} from '@/lib/xml-generator/schemas'
import { ValidityReviewStepComponent as ValidityReviewStep } from './validity-review-step'

// Mock useFormStates hook
vi.mock('@/hooks/use-form-states')

// Mock XML builder functions
vi.mock('@/lib/xml-generator/xml-builder', () => ({
  buildXML: vi.fn(
    () => `<?xml version="1.0" encoding="UTF-8"?>
<Offerta>
    <IdentificativiOfferta>
        <PIVA_UTENTE>IT12345678901</PIVA_UTENTE>
        <COD_OFFERTA>TESTOFFERTA123</COD_OFFERTA>
    </IdentificativiOfferta>
    <DettaglioOfferta>
        <TIPO_MERCATO>01</TIPO_MERCATO>
        <TIPO_CLIENTE>01</TIPO_CLIENTE>
        <TIPO_OFFERTA>01</TIPO_OFFERTA>
        <NOME_OFFERTA>Test Offer</NOME_OFFERTA>
    </DettaglioOfferta>
</Offerta>`,
  ),
  downloadXML: vi.fn(),
  generateXMLFilename: vi.fn(() => 'IT12345678901_INSERIMENTO_TEST_OFFER.XML'),
}))

// Mock react-syntax-highlighter
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children, ...props }: { children: string }) => (
    <pre data-testid="syntax-highlighter" {...props}>
      <code>{children}</code>
    </pre>
  ),
}))

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  vscDarkPlus: {},
}))

// Regex patterns for testing
const PERCENTAGE_REGEX = /\d+%/
const SECTIONS_REGEX = /\d+\/7 sezioni/
const REVIEW_TITLE_REGEX = /Validità e Revisione Finale/i
const COMPLETION_STATUS_REGEX = /Stato Completamento/i
const VALIDITY_PERIOD_REGEX = /Periodo di Validità/i
const START_DATE_REGEX = /Data di Inizio \*/i
const END_DATE_REGEX = /Data di Fine/i
const DATA_SUMMARY_REGEX = /Riepilogo Dati Inseriti/i
const REVIEW_CONFIRMATION_REGEX = /Conferma Revisione/i
const CHECKBOX_LABEL_REGEX =
  /Confermo di aver revisionato tutti i dati inseriti/i
const NOTES_LABEL_REGEX = /Note Aggiuntive \(Opzionale\)/i
const XML_PREVIEW_REGEX = /Anteprima XML/i
const GENERATE_PREVIEW_REGEX = /genera anteprima xml/i
const XML_FILE_PREVIEW_REGEX = /anteprima del file xml/i
const HIDE_REGEX = /nascondi/i
const DOWNLOAD_XML_REGEX = /scarica xml/i

// Mock form data for testing
const mockFormData = {
  basicInfo: {
    pivaUtente: 'IT12345678901',
    codOfferta: 'TESTOFFERTA123',
  },
  offerDetails: {
    marketType: '01' as const,
    clientType: '01' as const,
    offerType: '01' as const,
    offerName: 'Test Offer',
    offerDescription: 'Test Description',
    duration: 12,
    guarantees: 'No guarantees',
    contractActivationTypes: ['01' as const],
    singleOffer: 'SI' as const,
  },
  activationContacts: {
    activationMethods: ['01' as const, '02' as const],
    phone: '+39123456789',
    vendorWebsite: 'https://example.com',
    offerUrl: 'https://example.com/offer',
  },
  pricingConfig: {
    dispatching: [
      {
        dispatchingType: '01' as const,
        componentName: 'Test Component',
        componentDescription: 'Test Description',
      },
    ],
  },
  companyComponents: {
    companyComponents: [
      {
        name: 'Test Component',
        description: 'Test Description',
        componentType: '01' as const,
        macroArea: '01' as const,
        priceIntervals: [
          {
            price: 100,
            unitOfMeasure: '01' as const,
          },
        ],
      },
    ],
  },
  paymentConditions: {
    paymentMethods: [
      {
        paymentMethodType: '01' as const,
        description: 'Credit Card',
      },
    ],
  },
  additionalFeatures: {
    discounts: [
      {
        name: 'Test Discount',
        description: 'Test Discount Description',
        vatApplicability: '01' as const,
        condition: {
          applicationCondition: '01' as const,
        },
        discountPrices: [
          {
            discountType: '01' as const,
            unitOfMeasure: '01' as const,
            price: 50,
          },
        ],
      },
    ],
  },
  validityReview: {
    validityPeriod: {
      startDate: '',
      endDate: '',
    },
    reviewConfirmed: false,
    notes: '',
  },
}

// Test wrapper component that provides form context
function TestWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode
  defaultValues?: ValidityReviewFormValues
}) {
  const form = useForm<ValidityReviewFormValues>({
    resolver: zodResolver(validityReviewSchema),
    defaultValues: defaultValues || {
      validityPeriod: {
        startDate: '',
        endDate: '',
      },
      reviewConfirmed: false,
      notes: '',
    },
  })

  return <FormProvider {...form}>{children}</FormProvider>
}

describe('ValidityReviewStep', () => {
  beforeEach(() => {
    // Mock useFormStates to return mock data
    vi.mocked(useFormStates).mockReturnValue([mockFormData, vi.fn()])
  })

  it('renders the component with all sections', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    // Check main title
    expect(screen.getByText(REVIEW_TITLE_REGEX)).toBeInTheDocument()

    // Check all section titles
    expect(screen.getByText(COMPLETION_STATUS_REGEX)).toBeInTheDocument()
    expect(screen.getByText(VALIDITY_PERIOD_REGEX)).toBeInTheDocument()
    expect(screen.getByText(DATA_SUMMARY_REGEX)).toBeInTheDocument()
    expect(screen.getByText(REVIEW_CONFIRMATION_REGEX)).toBeInTheDocument()
    // Use getAllByText for XML Preview since it appears multiple times
    const xmlPreviewElements = screen.getAllByText(XML_PREVIEW_REGEX)
    expect(xmlPreviewElements.length).toBeGreaterThan(0)
  })

  it('displays completion status correctly', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    // Should show completion progress
    expect(screen.getByText(PERCENTAGE_REGEX)).toBeInTheDocument()
    expect(screen.getByText(SECTIONS_REGEX)).toBeInTheDocument()
  })

  it('renders validity period form fields', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    // Check form fields
    expect(screen.getByLabelText(START_DATE_REGEX)).toBeInTheDocument()
    expect(screen.getByLabelText(END_DATE_REGEX)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('gg/mm/aaaa')).toBeInTheDocument()
  })

  it('displays form summary with mock data', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    // Check that form data is displayed
    expect(screen.getByText('IT12345678901')).toBeInTheDocument()
    expect(screen.getByText('TESTOFFERTA123')).toBeInTheDocument()
    expect(screen.getByText('Test Offer')).toBeInTheDocument()
    expect(screen.getByText('+39123456789')).toBeInTheDocument()
  })

  it('renders review confirmation checkbox', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    const checkbox = screen.getByRole('checkbox', {
      name: CHECKBOX_LABEL_REGEX,
    })
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it('renders notes textarea', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    const textarea = screen.getByLabelText(NOTES_LABEL_REGEX)
    expect(textarea).toBeInTheDocument()
    expect(textarea).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('allows user to input start date', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    const startDateInput = screen.getByLabelText(START_DATE_REGEX)
    fireEvent.change(startDateInput, { target: { value: '01/01/2024' } })
    expect(startDateInput).toHaveValue('01/01/2024')
  })

  it('allows user to input end date', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    const endDateInput = screen.getByLabelText(END_DATE_REGEX)
    fireEvent.change(endDateInput, { target: { value: '31/12/2024' } })
    expect(endDateInput).toHaveValue('31/12/2024')
  })

  it('allows user to check review confirmation', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    const checkbox = screen.getByRole('checkbox', {
      name: CHECKBOX_LABEL_REGEX,
    })
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('allows user to input notes', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    const textarea = screen.getByLabelText(NOTES_LABEL_REGEX)
    fireEvent.change(textarea, { target: { value: 'Test notes' } })
    expect(textarea).toHaveValue('Test notes')
  })

  it('displays "Non specificata" for missing basic info', () => {
    const emptyMockData = {
      basicInfo: {},
      offerDetails: {},
      activationContacts: {},
      pricingConfig: {},
      companyComponents: {},
      paymentConditions: {},
      additionalFeatures: {},
      validityReview: {
        validityPeriod: { startDate: '', endDate: '' },
        reviewConfirmed: false,
        notes: '',
      },
    }

    vi.mocked(useFormStates).mockReturnValue([emptyMockData, vi.fn()])

    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    expect(screen.getAllByText('Non specificata')).toHaveLength(2)
    expect(screen.getAllByText('Non specificato')).toHaveLength(5)
  })

  it('calculates completion percentage correctly for empty data', () => {
    const emptyMockData = {
      basicInfo: {},
      offerDetails: {},
      activationContacts: {},
      pricingConfig: {},
      companyComponents: {},
      paymentConditions: {},
      additionalFeatures: {},
      validityReview: {
        validityPeriod: { startDate: '', endDate: '' },
        reviewConfirmed: false,
        notes: '',
      },
    }

    vi.mocked(useFormStates).mockReturnValue([emptyMockData, vi.fn()])

    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    // Should show lower completion percentage when data is missing
    expect(screen.getByText(SECTIONS_REGEX)).toBeInTheDocument()
  })

  it('displays market type labels correctly', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    // Should translate market type code to label
    expect(screen.getByText('Elettrico')).toBeInTheDocument()
  })

  it('shows XML preview placeholder', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    // Use getAllByText for XML Preview since it appears multiple times
    const xmlPreviewElements = screen.getAllByText(XML_PREVIEW_REGEX)
    expect(xmlPreviewElements.length).toBeGreaterThan(0)
  })

  it('handles missing form states gracefully', () => {
    vi.mocked(useFormStates).mockReturnValue([
      {
        basicInfo: {},
        offerDetails: {},
        activationContacts: {},
        pricingConfig: {},
        companyComponents: {},
        paymentConditions: {},
        additionalFeatures: {},
        validityReview: {
          validityPeriod: { startDate: '', endDate: '' },
          reviewConfirmed: false,
          notes: '',
        },
      },
      vi.fn(),
    ])

    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    // Should not crash and show default values
    expect(screen.getAllByText('Non specificata')).toHaveLength(2)
  })

  it('shows component counts in summary cards', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    // Check summary cards show counts (using getAllByText for multiple matching elements)
    expect(screen.getAllByText('1 componenti')).toHaveLength(2) // pricing and company components
    expect(screen.getByText('1 metodi')).toBeInTheDocument()
    expect(screen.getByText('1 sconti')).toBeInTheDocument()
  })

  it('displays duration in months', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    expect(screen.getByText('12 mesi')).toBeInTheDocument()
  })

  it('shows activation methods count', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    expect(screen.getByText('2 metodi selezionati')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    // Check that form fields have proper labels
    expect(screen.getByLabelText(START_DATE_REGEX)).toBeInTheDocument()
    expect(screen.getByLabelText(END_DATE_REGEX)).toBeInTheDocument()
    expect(screen.getByLabelText(NOTES_LABEL_REGEX)).toBeInTheDocument()

    // Check checkbox has proper label
    expect(
      screen.getByRole('checkbox', { name: CHECKBOX_LABEL_REGEX }),
    ).toBeInTheDocument()
  })

  it('renders with default form values', () => {
    const defaultValues: ValidityReviewFormValues = {
      validityPeriod: {
        startDate: '01/01/2024',
        endDate: '31/12/2024',
      },
      reviewConfirmed: true,
      notes: 'Test notes',
    }

    render(
      <TestWrapper defaultValues={defaultValues}>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    expect(screen.getByDisplayValue('01/01/2024')).toBeInTheDocument()
    expect(screen.getByDisplayValue('31/12/2024')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test notes')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: CHECKBOX_LABEL_REGEX }),
    ).toBeChecked()
  })

  it('displays progress bar with correct styling', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    // Check for the presence of progress text and percentage display
    expect(screen.getByText('Progresso completamento')).toBeInTheDocument()
    expect(screen.getByText(PERCENTAGE_REGEX)).toBeInTheDocument()

    // Check that progress bar container exists
    const progressContainer = screen
      .getByText('Progresso completamento')
      .closest('div')
    expect(progressContainer).toBeInTheDocument()
  })

  it('shows badge with completion status', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    const badge = screen.getByText(SECTIONS_REGEX)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('inline-flex') // Badge styling
  })

  it('mostra il pulsante per generare anteprima XML', () => {
    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    const previewButton = screen.getByRole('button', {
      name: GENERATE_PREVIEW_REGEX,
    })
    expect(previewButton).toBeInTheDocument()
  })

  it('genera e mostra anteprima XML quando si clicca il pulsante', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    const previewButton = screen.getByRole('button', {
      name: GENERATE_PREVIEW_REGEX,
    })

    await user.click(previewButton)

    // Verifica che l'anteprima sia mostrata
    await waitFor(() => {
      expect(screen.getByText(XML_FILE_PREVIEW_REGEX)).toBeInTheDocument()
    })

    // Verifica che ci siano i pulsanti di azione
    expect(screen.getByRole('button', { name: HIDE_REGEX })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: DOWNLOAD_XML_REGEX }),
    ).toBeInTheDocument()
  })

  it('nasconde anteprima XML quando si clicca Nascondi', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    const previewButton = screen.getByRole('button', {
      name: GENERATE_PREVIEW_REGEX,
    })

    await user.click(previewButton)

    await waitFor(() => {
      expect(screen.getByText(XML_FILE_PREVIEW_REGEX)).toBeInTheDocument()
    })

    const hideButton = screen.getByRole('button', { name: HIDE_REGEX })
    await user.click(hideButton)

    // L'anteprima dovrebbe essere nascosta e il pulsante genera dovrebbe riapparire
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: GENERATE_PREVIEW_REGEX }),
      ).toBeInTheDocument()
    })
  })

  it('mostra errore se la generazione XML fallisce', async () => {
    const user = userEvent.setup()

    // Import the mocked module and set it to throw an error
    const { buildXML } = await import('@/lib/xml-generator/xml-builder')
    vi.mocked(buildXML).mockImplementationOnce(() => {
      throw new Error('XML generation failed')
    })

    render(
      <TestWrapper>
        <ValidityReviewStep />
      </TestWrapper>,
    )

    const previewButton = screen.getByRole('button', {
      name: GENERATE_PREVIEW_REGEX,
    })

    await user.click(previewButton)

    // The button should still be visible if there was an error
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: GENERATE_PREVIEW_REGEX }),
      ).toBeInTheDocument()
    })

    // Check that we're not showing the preview content
    expect(
      screen.queryByRole('button', { name: HIDE_REGEX }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: DOWNLOAD_XML_REGEX }),
    ).not.toBeInTheDocument()
  })
})
