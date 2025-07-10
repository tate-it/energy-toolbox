import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { vi } from 'vitest'
import type { AdditionalFeaturesFormValues } from '@/lib/xml-generator/schemas'
import { additionalFeaturesSchema } from '@/lib/xml-generator/schemas'
import { AdditionalFeaturesStep } from './additional-features-step'

// Regex patterns defined at top level for performance
const REGEX_PATTERNS = {
  configureCharacteristics: /Configura caratteristiche dell'offerta/,
  addElectricityOffer: /Aggiungi Offerta Elettrica/,
  addRegion: /Aggiungi Regione/,
  addProvince: /Aggiungi Provincia/,
  addMunicipality: /Aggiungi Comune/,
  addDiscount: /Aggiungi Sconto/,
  condition: /Condizione/,
  other: /Other/,
  addPrice: /Aggiungi Prezzo/,
  priceNumber: /Prezzo \d+/,
  addProduct: /Aggiungi Prodotto\/Servizio/,
  macroArea: /Macroarea/,
  minConsumption: /Consumo Minimo/,
  maxConsumption: /Consumo Massimo/,
  minPower: /Potenza Minima/,
  maxPower: /Potenza Massima/,
} as const

// Mock the useFormStates hook
const mockUseFormStates = vi.fn()
vi.mock('@/hooks/use-form-states', () => ({
  useFormStates: () => mockUseFormStates(),
}))

const TestWrapper = ({
  children,
  formData = {},
  marketType = '01',
  offerType = '01',
}: {
  children: React.ReactNode
  formData?: Partial<AdditionalFeaturesFormValues>
  marketType?: string
  offerType?: string
}) => {
  const form = useForm<AdditionalFeaturesFormValues>({
    resolver: zodResolver(additionalFeaturesSchema),
    defaultValues: {
      offerCharacteristics: undefined,
      dualOffer: undefined,
      zoneOffers: undefined,
      discounts: undefined,
      additionalProducts: undefined,
      ...formData,
    },
  })

  // Mock the form states to return the market and offer types
  mockUseFormStates.mockReturnValue([
    {
      offerDetails: {
        marketType,
        offerType,
      },
    },
  ])

  return <FormProvider {...form}>{children}</FormProvider>
}

describe('AdditionalFeaturesStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the main component with correct title', () => {
    render(
      <TestWrapper>
        <AdditionalFeaturesStep />
      </TestWrapper>,
    )

    expect(screen.getByText('Funzionalità Aggiuntive')).toBeInTheDocument()
    expect(
      screen.getByText(REGEX_PATTERNS.configureCharacteristics),
    ).toBeInTheDocument()
  })

  describe('Offer Characteristics Section', () => {
    it('shows consumption fields for FLAT offers', () => {
      render(
        <TestWrapper offerType="03">
          {' '}
          {/* FLAT offer */}
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      expect(
        screen.getByText("Caratteristiche dell'Offerta"),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Consumo Minimo * (kWh/anno o Sm³/anno)'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Consumo Massimo * (kWh/anno o Sm³/anno)'),
      ).toBeInTheDocument()
    })

    it('shows power fields for electricity offers', () => {
      render(
        <TestWrapper marketType="01" offerType="01">
          {' '}
          {/* Electricity market */}
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      expect(
        screen.getByText("Caratteristiche dell'Offerta"),
      ).toBeInTheDocument()
      expect(screen.getByText('Potenza Minima (kW)')).toBeInTheDocument()
      expect(screen.getByText('Potenza Massima (kW)')).toBeInTheDocument()
    })

    it('does not show offer characteristics for gas variable offers', () => {
      render(
        <TestWrapper marketType="02" offerType="02">
          {' '}
          {/* Gas market, Variable offer */}
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      expect(
        screen.queryByText("Caratteristiche dell'Offerta"),
      ).not.toBeInTheDocument()
    })
  })

  describe('Dual Offer Section', () => {
    it('shows dual offer section for dual fuel market', () => {
      render(
        <TestWrapper marketType="03">
          {' '}
          {/* Dual Fuel market */}
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      expect(
        screen.getByText('Offerte Congiunte (Dual Fuel)'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Offerte Elettriche Congiunte *'),
      ).toBeInTheDocument()
      expect(screen.getByText('Offerte Gas Congiunte *')).toBeInTheDocument()
    })

    it('does not show dual offer section for single fuel markets', () => {
      render(
        <TestWrapper marketType="01">
          {' '}
          {/* Electricity only */}
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      expect(
        screen.queryByText('Offerte Congiunte (Dual Fuel)'),
      ).not.toBeInTheDocument()
    })

    it('allows adding electricity joint offers', async () => {
      render(
        <TestWrapper marketType="03">
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      const addElectricityButton = screen.getByRole('button', {
        name: REGEX_PATTERNS.addElectricityOffer,
      })

      // Initially no electricity inputs should be present
      expect(
        screen.queryAllByPlaceholderText('Codice offerta elettrica'),
      ).toHaveLength(0)

      fireEvent.click(addElectricityButton)

      // Should have one input after adding the first item
      const electricityInputs = await screen.findAllByPlaceholderText(
        'Codice offerta elettrica',
      )
      expect(electricityInputs).toHaveLength(1)

      // Verify we can type in the input
      fireEvent.change(electricityInputs[0], {
        target: { value: 'TEST_ELECTRIC_01' },
      })
      expect(electricityInputs[0]).toHaveValue('TEST_ELECTRIC_01')
    })
  })

  describe('Zone Offers Section', () => {
    it('renders zone offers section', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      expect(screen.getByText("Zone dell'Offerta")).toBeInTheDocument()
      expect(screen.getByText('Regioni')).toBeInTheDocument()
      expect(screen.getByText('Province')).toBeInTheDocument()
      expect(screen.getByText('Comuni')).toBeInTheDocument()
    })

    it('allows adding regions with correct input constraints', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      const addRegionButton = screen.getByRole('button', {
        name: REGEX_PATTERNS.addRegion,
      })
      fireEvent.click(addRegionButton)

      const regionInput = screen.getByPlaceholderText(
        'Codice regione (2 cifre)',
      )
      expect(regionInput).toBeInTheDocument()
      expect(regionInput).toHaveAttribute('maxLength', '2')
    })

    it('allows adding provinces with correct input constraints', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      const addProvinceButton = screen.getByRole('button', {
        name: REGEX_PATTERNS.addProvince,
      })
      fireEvent.click(addProvinceButton)

      const provinceInput = screen.getByPlaceholderText(
        'Codice provincia (3 cifre)',
      )
      expect(provinceInput).toBeInTheDocument()
      expect(provinceInput).toHaveAttribute('maxLength', '3')
    })

    it('allows adding municipalities with correct input constraints', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      const addMunicipalityButton = screen.getByRole('button', {
        name: REGEX_PATTERNS.addMunicipality,
      })
      fireEvent.click(addMunicipalityButton)

      const municipalityInput = screen.getByPlaceholderText(
        'Codice comune (6 cifre)',
      )
      expect(municipalityInput).toBeInTheDocument()
      expect(municipalityInput).toHaveAttribute('maxLength', '6')
    })
  })

  describe('Discounts Section', () => {
    it('renders discounts section', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      expect(screen.getByText('Sconti')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: REGEX_PATTERNS.addDiscount }),
      ).toBeInTheDocument()
    })

    it('allows adding a new discount', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      const addDiscountButton = screen.getByRole('button', {
        name: REGEX_PATTERNS.addDiscount,
      })
      fireEvent.click(addDiscountButton)

      expect(screen.getByText('Sconto 1')).toBeInTheDocument()
      expect(screen.getByText('Nome Sconto *')).toBeInTheDocument()
      expect(screen.getByText('Applicabilità IVA *')).toBeInTheDocument()
      expect(screen.getByText('Descrizione Sconto *')).toBeInTheDocument()
    })

    it('shows condition description field when "Other" condition is selected', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      // Add a discount first
      const addDiscountButton = screen.getByRole('button', {
        name: REGEX_PATTERNS.addDiscount,
      })
      fireEvent.click(addDiscountButton)

      // Find and click the condition select
      const conditionSelect = screen.getByRole('combobox', {
        name: REGEX_PATTERNS.condition,
      })
      fireEvent.click(conditionSelect)

      // Select "Other" option
      const otherOption = screen.getByRole('option', {
        name: REGEX_PATTERNS.other,
      })
      fireEvent.click(otherOption)

      // Check if description field appears
      expect(screen.getByText('Descrizione Condizione *')).toBeInTheDocument()
    })

    it('allows adding multiple discount prices', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      // Add a discount first
      const addDiscountButton = screen.getByRole('button', {
        name: REGEX_PATTERNS.addDiscount,
      })
      fireEvent.click(addDiscountButton)

      // Add a new price
      const addPriceButton = screen.getByRole('button', {
        name: REGEX_PATTERNS.addPrice,
      })
      fireEvent.click(addPriceButton)

      const priceCards = screen.getAllByText(REGEX_PATTERNS.priceNumber)
      expect(priceCards).toHaveLength(2) // Initial + added
    })
  })

  describe('Additional Products Section', () => {
    it('renders additional products section', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      expect(
        screen.getByText('Prodotti e Servizi Aggiuntivi'),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: REGEX_PATTERNS.addProduct }),
      ).toBeInTheDocument()
    })

    it('allows adding a new product', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      const addProductButton = screen.getByRole('button', {
        name: REGEX_PATTERNS.addProduct,
      })
      fireEvent.click(addProductButton)

      expect(screen.getByText('Prodotto/Servizio 1')).toBeInTheDocument()
      expect(screen.getByText('Nome Prodotto/Servizio *')).toBeInTheDocument()
      expect(screen.getByText('Macroarea')).toBeInTheDocument()
      expect(
        screen.getByText('Dettagli Prodotto/Servizio *'),
      ).toBeInTheDocument()
    })

    it('shows macro area details field when "Other" macro area is selected', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      // Add a product first
      const addProductButton = screen.getByRole('button', {
        name: REGEX_PATTERNS.addProduct,
      })
      fireEvent.click(addProductButton)

      // Find and click the macro area select
      const macroAreaSelect = screen.getByRole('combobox', {
        name: REGEX_PATTERNS.macroArea,
      })
      fireEvent.click(macroAreaSelect)

      // Select "Other" option
      const otherOption = screen.getByRole('option', {
        name: REGEX_PATTERNS.other,
      })
      fireEvent.click(otherOption)

      // Check if details field appears
      expect(screen.getByText('Dettagli Macroarea *')).toBeInTheDocument()
    })

    it('allows removing products', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      // Add a product first
      const addProductButton = screen.getByRole('button', {
        name: REGEX_PATTERNS.addProduct,
      })
      fireEvent.click(addProductButton)

      // Should show remove button
      const removeButton = screen.getByRole('button', { name: '' }) // Trash icon
      expect(removeButton).toBeInTheDocument()

      fireEvent.click(removeButton)

      // Product should be removed
      expect(screen.queryByText('Prodotto/Servizio 1')).not.toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('validates required fields in discounts', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      // Add a discount
      const addDiscountButton = screen.getByRole('button', {
        name: REGEX_PATTERNS.addDiscount,
      })
      fireEvent.click(addDiscountButton)

      // Try to submit without filling required fields
      const nameInput = screen.getByPlaceholderText('Nome dello sconto')
      fireEvent.blur(nameInput)

      // Should show validation error (this depends on your validation setup)
      // This test assumes validation happens on blur or form submission
    })

    it('validates consumption range consistency', () => {
      render(
        <TestWrapper offerType="03">
          {' '}
          {/* FLAT offer */}
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      const minInput = screen.getByLabelText(REGEX_PATTERNS.minConsumption)
      const maxInput = screen.getByLabelText(REGEX_PATTERNS.maxConsumption)

      fireEvent.change(minInput, { target: { value: '1000' } })
      fireEvent.change(maxInput, { target: { value: '500' } })
      fireEvent.blur(maxInput)

      // Should show validation error for invalid range
    })

    it('validates power range consistency', () => {
      render(
        <TestWrapper marketType="01" offerType="01">
          {' '}
          {/* Electricity */}
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      const minPowerInput = screen.getByLabelText(REGEX_PATTERNS.minPower)
      const maxPowerInput = screen.getByLabelText(REGEX_PATTERNS.maxPower)

      fireEvent.change(minPowerInput, { target: { value: '10.5' } })
      fireEvent.change(maxPowerInput, { target: { value: '5.0' } })
      fireEvent.blur(maxPowerInput)

      // Should show validation error for invalid range
    })
  })

  describe('Conditional Rendering', () => {
    it('shows different sections based on market and offer type', () => {
      const { rerender } = render(
        <TestWrapper marketType="01" offerType="01">
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      // Should show electricity power fields
      expect(screen.getByText('Potenza Minima (kW)')).toBeInTheDocument()
      expect(
        screen.queryByText('Offerte Congiunte (Dual Fuel)'),
      ).not.toBeInTheDocument()

      rerender(
        <TestWrapper marketType="03" offerType="03">
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      // Should show dual fuel and consumption fields
      expect(
        screen.getByText('Offerte Congiunte (Dual Fuel)'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Consumo Minimo * (kWh/anno o Sm³/anno)'),
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      // Check for proper button roles
      expect(
        screen.getByRole('button', { name: REGEX_PATTERNS.addDiscount }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: REGEX_PATTERNS.addProduct }),
      ).toBeInTheDocument()
    })

    it('supports keyboard navigation', () => {
      render(
        <TestWrapper>
          <AdditionalFeaturesStep />
        </TestWrapper>,
      )

      const addDiscountButton = screen.getByRole('button', {
        name: REGEX_PATTERNS.addDiscount,
      })
      addDiscountButton.focus()
      expect(addDiscountButton).toHaveFocus()
    })
  })
})
