import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { vi } from 'vitest'
import { useFormStates } from '@/hooks/use-form-states'
import {
  ENERGY_PRICE_INDICES,
  MARKET_TYPES,
  OFFER_TYPES,
  TIME_BAND_CONFIGURATIONS,
} from '@/lib/xml-generator/constants'
import type { PricingConfigFormValues } from '@/lib/xml-generator/schemas'
import { pricingConfigSchema } from '@/lib/xml-generator/schemas'
import { PricingConfigStep } from './pricing-config-step'

// Mock the useFormStates hook
vi.mock('@/hooks/use-form-states')

// Regex patterns for testing
const CONFIGURE_ENERGY_PRICES_REGEX = /Configura i prezzi dell'energia/
const VARIABLE_OFFER_MANDATORY_REGEX =
  /Obbligatorio solo per offerte a prezzo variabile/
const ELECTRICITY_MARKET_MANDATORY_REGEX =
  /Obbligatorio per il mercato elettrico/
const ENERGY_PRICE_VARIABLE_OFFER_REGEX =
  /Indice di prezzo per le offerte a prezzo variabile/
const ALTERNATIVE_INDEX_DESCRIPTION_REGEX =
  /Descrizione dell'indice alternativo/
const TIME_BAND_CONFIGURATION_REGEX =
  /Tipo di configurazione delle fasce orarie/
const DISPATCHING_COMPONENTS_REGEX =
  /Componenti di dispacciamento per le offerte elettriche/
const NO_DISPATCHING_COMPONENTS_REGEX =
  /Nessun componente di dispacciamento aggiunto/
const DISPATCHING_TYPE_REGEX = /Tipo Dispacciamento/
const NUMERIC_VALUE_REGEX = /Valore numerico con separatore decimale/
const ENERGY_PRICE_INDEX_REGEX = /Indice Prezzo Energia/
const TIME_BAND_TYPE_REGEX = /Tipologia Fasce/
const OPTIONAL_DESCRIPTION_REGEX =
  /Descrizione opzionale del componente \(max 255 caratteri\)/

const TestWrapper = ({
  children,
  formData = {},
}: {
  children: React.ReactNode
  formData?: Record<string, unknown>
}) => {
  const form = useForm<PricingConfigFormValues>({
    resolver: zodResolver(pricingConfigSchema),
    defaultValues: {
      energyPriceIndex: undefined,
      alternativeIndexDescription: '',
      timeBandConfiguration: undefined,
      weeklyTimeBands: {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: '',
        holidays: '',
      },
      dispatching: [],
    },
    mode: 'onChange',
  })

  // Set up the mock for useFormStates
  const mockFormStates = {
    basicInfo: {},
    offerDetails: {
      marketType: '',
      offerType: '',
      ...(formData.offerDetails || {}),
    },
    pricingConfig: {
      energyPriceIndex: '',
      timeBandConfiguration: '',
      ...(formData.pricingConfig || {}),
    },
    activationContacts: {},
    companyComponents: {},
    paymentConditions: {},
    additionalFeatures: {},
    validityReview: {},
    ...formData,
  } as unknown as ReturnType<typeof useFormStates>[0]

  // Reset the mock for each test to avoid interference
  vi.mocked(useFormStates).mockClear()
  vi.mocked(useFormStates).mockReturnValue([mockFormStates, vi.fn()])

  return <FormProvider {...form}>{children}</FormProvider>
}

describe('PricingConfigStep', () => {
  it('renders the component title and description', () => {
    render(
      <TestWrapper>
        <PricingConfigStep />
      </TestWrapper>,
    )

    expect(screen.getByText('Configurazione Prezzi')).toBeInTheDocument()
    expect(screen.getByText(CONFIGURE_ENERGY_PRICES_REGEX)).toBeInTheDocument()
  })

  it('renders help information section', () => {
    render(
      <TestWrapper>
        <PricingConfigStep />
      </TestWrapper>,
    )

    expect(screen.getByText('Informazioni di Aiuto')).toBeInTheDocument()
    expect(screen.getByText(VARIABLE_OFFER_MANDATORY_REGEX)).toBeInTheDocument()
    expect(
      screen.getAllByText(ELECTRICITY_MARKET_MANDATORY_REGEX),
    ).toHaveLength(2)
  })

  it('shows energy price references section for variable offer types', () => {
    const formData = {
      offerDetails: {
        offerType: OFFER_TYPES.VARIABLE,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    expect(screen.getByText('Riferimenti Prezzo Energia')).toBeInTheDocument()
    expect(screen.getByText('Indice Prezzo Energia')).toBeInTheDocument()
    expect(
      screen.getByText(ENERGY_PRICE_VARIABLE_OFFER_REGEX),
    ).toBeInTheDocument()
  })

  it('does not show energy price references section for fixed offer types', () => {
    const formData = {
      offerDetails: {
        offerType: OFFER_TYPES.FIXED,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    expect(
      screen.queryByText('Riferimenti Prezzo Energia'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Indice Prezzo Energia')).not.toBeInTheDocument()
  })

  it('shows alternative index description when OTHER energy price index is selected', () => {
    const formData = {
      offerDetails: {
        offerType: OFFER_TYPES.VARIABLE,
      },
      pricingConfig: {
        energyPriceIndex: ENERGY_PRICE_INDICES.OTHER,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    expect(
      screen.getByText('Descrizione Indice Alternativo'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(ALTERNATIVE_INDEX_DESCRIPTION_REGEX),
    ).toBeInTheDocument()
  })

  it('shows time band configuration section for electricity market non-flat offers', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
        offerType: OFFER_TYPES.VARIABLE,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    expect(screen.getByText('Configurazione Fasce Orarie')).toBeInTheDocument()
    expect(screen.getByText('Tipologia Fasce')).toBeInTheDocument()
    expect(screen.getByText(TIME_BAND_CONFIGURATION_REGEX)).toBeInTheDocument()
  })

  it('does not show time band configuration section for gas market', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.GAS,
        offerType: OFFER_TYPES.VARIABLE,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    expect(
      screen.queryByText('Configurazione Fasce Orarie'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Tipologia Fasce')).not.toBeInTheDocument()
  })

  it('does not show time band configuration section for flat offers', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
        offerType: OFFER_TYPES.FLAT,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    expect(
      screen.queryByText('Configurazione Fasce Orarie'),
    ).not.toBeInTheDocument()
  })

  it('shows weekly time bands section when appropriate time band configuration is selected', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
        offerType: OFFER_TYPES.VARIABLE,
      },
      pricingConfig: {
        timeBandConfiguration: TIME_BAND_CONFIGURATIONS.F1_F2,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    expect(screen.getByText('Fasce Orarie Settimanali')).toBeInTheDocument()
    expect(screen.getByText('Lunedì')).toBeInTheDocument()
    expect(screen.getByText('Martedì')).toBeInTheDocument()
    expect(screen.getByText('Mercoledì')).toBeInTheDocument()
    expect(screen.getByText('Giovedì')).toBeInTheDocument()
    expect(screen.getByText('Venerdì')).toBeInTheDocument()
    expect(screen.getByText('Sabato')).toBeInTheDocument()
    expect(screen.getByText('Domenica')).toBeInTheDocument()
    expect(screen.getByText('Festività')).toBeInTheDocument()
  })

  it('shows dispatching section for electricity market', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    expect(screen.getByText('Dispacciamento')).toBeInTheDocument()
    expect(screen.getByText(DISPATCHING_COMPONENTS_REGEX)).toBeInTheDocument()
    expect(
      screen.getByText('Aggiungi Componente Dispacciamento'),
    ).toBeInTheDocument()
  })

  it('does not show dispatching section for gas market', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.GAS,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    expect(screen.queryByText('Dispacciamento')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Aggiungi Componente Dispacciamento'),
    ).not.toBeInTheDocument()
  })

  it('shows empty state message when no dispatching components are added', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    expect(
      screen.getByText(NO_DISPATCHING_COMPONENTS_REGEX),
    ).toBeInTheDocument()
    expect(screen.getByText('Aggiungi il primo componente')).toBeInTheDocument()
  })

  it('allows adding dispatching components', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Componente Dispacciamento')
    fireEvent.click(addButton)

    expect(screen.getByText('Componente Dispacciamento 1')).toBeInTheDocument()
    expect(screen.getByText('Tipo Dispacciamento')).toBeInTheDocument()
    expect(screen.getByText('Nome Componente')).toBeInTheDocument()
    expect(
      screen.getByText('Descrizione Componente (Opzionale)'),
    ).toBeInTheDocument()
  })

  it('shows dispatching value field when OTHER dispatching type is selected', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Componente Dispacciamento')
    fireEvent.click(addButton)

    const dispatchingTypeSelect = screen.getByRole('combobox', {
      name: DISPATCHING_TYPE_REGEX,
    })
    fireEvent.click(dispatchingTypeSelect)

    // Select "Other" option
    const otherOption = screen.getByText('Altro')
    fireEvent.click(otherOption)

    expect(screen.getByText('Valore Dispacciamento')).toBeInTheDocument()
    expect(screen.getByText(NUMERIC_VALUE_REGEX)).toBeInTheDocument()
  })

  it('allows removing dispatching components', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Componente Dispacciamento')
    fireEvent.click(addButton)

    expect(screen.getByText('Componente Dispacciamento 1')).toBeInTheDocument()

    const removeButton = screen.getByRole('button', { name: '' })
    fireEvent.click(removeButton)

    expect(
      screen.queryByText('Componente Dispacciamento 1'),
    ).not.toBeInTheDocument()
  })

  it('shows energy price index options', () => {
    const formData = {
      offerDetails: {
        offerType: OFFER_TYPES.VARIABLE,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    const energyPriceSelect = screen.getByRole('combobox', {
      name: ENERGY_PRICE_INDEX_REGEX,
    })
    fireEvent.click(energyPriceSelect)

    expect(screen.getByText('PUN (Quarterly)')).toBeInTheDocument()
    expect(screen.getByText('TTF (Quarterly)')).toBeInTheDocument()
    expect(
      screen.getByText('Other (Not managed by Portal)'),
    ).toBeInTheDocument()
  })

  it('shows time band configuration options', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
        offerType: OFFER_TYPES.VARIABLE,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    const timeBandSelect = screen.getByRole('combobox', {
      name: TIME_BAND_TYPE_REGEX,
    })
    fireEvent.click(timeBandSelect)

    expect(screen.getByText('Monorario')).toBeInTheDocument()
    expect(screen.getByText('F1, F2')).toBeInTheDocument()
    expect(screen.getByText('F1, F2, F3 (Standard)')).toBeInTheDocument()
  })

  it('shows dispatching type options', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Componente Dispacciamento')
    fireEvent.click(addButton)

    const dispatchingTypeSelect = screen.getByRole('combobox', {
      name: DISPATCHING_TYPE_REGEX,
    })
    fireEvent.click(dispatchingTypeSelect)

    expect(screen.getByText('Disp. del.111/06')).toBeInTheDocument()
    expect(screen.getByText('PD')).toBeInTheDocument()
    expect(screen.getByText('Altro')).toBeInTheDocument()
  })

  it('handles form input changes', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Componente Dispacciamento')
    fireEvent.click(addButton)

    const componentNameInput = screen.getByPlaceholderText(
      'Nome del componente...',
    )
    fireEvent.change(componentNameInput, {
      target: { value: 'Test Component' },
    })

    expect(componentNameInput).toHaveValue('Test Component')

    const descriptionInput = screen.getByPlaceholderText(
      'Descrizione del componente...',
    )
    fireEvent.change(descriptionInput, {
      target: { value: 'Test Description' },
    })

    expect(descriptionInput).toHaveValue('Test Description')
  })

  it('handles weekly time bands input', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
        offerType: OFFER_TYPES.VARIABLE,
      },
      pricingConfig: {
        timeBandConfiguration: TIME_BAND_CONFIGURATIONS.F1_F2,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    const mondayInput = screen.getAllByPlaceholderText(
      'es. 28-3,32-2,76-1,92-2,96-3',
    )[0]
    fireEvent.change(mondayInput, {
      target: { value: '28-3,32-2,76-1,92-2,96-3' },
    })

    expect(mondayInput).toHaveValue('28-3,32-2,76-1,92-2,96-3')
  })

  it('handles alternative index description input', () => {
    const formData = {
      offerDetails: {
        offerType: OFFER_TYPES.VARIABLE,
      },
      pricingConfig: {
        energyPriceIndex: ENERGY_PRICE_INDICES.OTHER,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    const descriptionInput = screen.getByPlaceholderText(
      "Descrivi l'indice alternativo...",
    )
    fireEvent.change(descriptionInput, {
      target: { value: 'Alternative index description' },
    })

    expect(descriptionInput).toHaveValue('Alternative index description')
  })

  it('handles dispatching value input for OTHER dispatching type', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Componente Dispacciamento')
    fireEvent.click(addButton)

    const dispatchingTypeSelect = screen.getByRole('combobox', {
      name: DISPATCHING_TYPE_REGEX,
    })
    fireEvent.click(dispatchingTypeSelect)

    const otherOption = screen.getByText('Altro')
    fireEvent.click(otherOption)

    const dispatchingValueInput = screen.getByPlaceholderText('0.000000')
    fireEvent.change(dispatchingValueInput, { target: { value: '10.123456' } })

    expect(dispatchingValueInput).toHaveValue(10.123_456)
  })

  it('allows adding multiple dispatching components', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Componente Dispacciamento')
    fireEvent.click(addButton)
    fireEvent.click(addButton)

    expect(screen.getByText('Componente Dispacciamento 1')).toBeInTheDocument()
    expect(screen.getByText('Componente Dispacciamento 2')).toBeInTheDocument()
  })

  it('shows validation help text', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <PricingConfigStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Componente Dispacciamento')
    fireEvent.click(addButton)

    expect(screen.getByText(OPTIONAL_DESCRIPTION_REGEX)).toBeInTheDocument()

    // Select "Other" dispatching type to show the dispatching value field
    const dispatchingTypeSelect = screen.getByRole('combobox', {
      name: DISPATCHING_TYPE_REGEX,
    })
    fireEvent.click(dispatchingTypeSelect)

    const otherOption = screen.getByText('Altro')
    fireEvent.click(otherOption)

    expect(screen.getByText(NUMERIC_VALUE_REGEX)).toBeInTheDocument()
  })
})
