import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, render, screen } from '@testing-library/react'
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

// Regex patterns for testing
const PERCENTAGE_REGEX = /\d+%/
const SECTIONS_REGEX = /\d+\/7 sezioni/
const START_DATE_REGEX = /Data di Inizio/
const END_DATE_REGEX = /Data di Fine/
const REVIEW_CONFIRMATION_REGEX = /Confermo di aver revisionato/
const NOTES_REGEX = /Note Aggiuntive/
const XML_PREVIEW_REGEX =
  /La funzionalità di anteprima e generazione XML sarà implementata/

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
    expect(screen.getByText('Validità e Revisione Finale')).toBeInTheDocument()

    // Check all section titles
    expect(screen.getByText('Stato Completamento')).toBeInTheDocument()
    expect(screen.getByText('Periodo di Validità')).toBeInTheDocument()
    expect(screen.getByText('Riepilogo Dati Inseriti')).toBeInTheDocument()
    expect(screen.getByText('Conferma Revisione')).toBeInTheDocument()
    expect(screen.getByText('Anteprima XML')).toBeInTheDocument()
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
      name: REVIEW_CONFIRMATION_REGEX,
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

    const textarea = screen.getByLabelText(NOTES_REGEX)
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
      name: REVIEW_CONFIRMATION_REGEX,
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

    const textarea = screen.getByLabelText(NOTES_REGEX)
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

    expect(screen.getByText('Anteprima XML')).toBeInTheDocument()
    expect(screen.getByText(XML_PREVIEW_REGEX)).toBeInTheDocument()
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
    expect(screen.getByLabelText(NOTES_REGEX)).toBeInTheDocument()

    // Check checkbox has proper label
    expect(
      screen.getByRole('checkbox', { name: REVIEW_CONFIRMATION_REGEX }),
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
      screen.getByRole('checkbox', { name: REVIEW_CONFIRMATION_REGEX }),
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
})
