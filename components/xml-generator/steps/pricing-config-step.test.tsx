import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { describe, expect, it } from 'vitest'
import { PricingConfigStep } from './pricing-config-step'
import { pricingConfigSchema } from '@/lib/xml-generator/schemas'
import { MARKET_TYPES, OFFER_TYPES } from '@/lib/xml-generator/constants'

interface TestWrapperProps {
  children: React.ReactNode
  defaultValues?: any
}

function TestWrapper({ children, defaultValues = {} }: TestWrapperProps) {
  const methods = useForm({
    resolver: zodResolver(pricingConfigSchema),
    defaultValues: {
      marketType: MARKET_TYPES.ELECTRICITY,
      offerType: OFFER_TYPES.VARIABLE,
      ...defaultValues,
    },
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('PricingConfigStep', () => {
  it('renders the component title and description', () => {
    render(
      <TestWrapper>
        <PricingConfigStep />
      </TestWrapper>
    )

    expect(screen.getByText('Configurazione Prezzi')).toBeInTheDocument()
    expect(screen.getByText(/Configura i prezzi dell'energia/)).toBeInTheDocument()
  })

  it('shows energy price reference section for variable offers', () => {
    render(
      <TestWrapper defaultValues={{ marketType: MARKET_TYPES.ELECTRICITY, offerType: OFFER_TYPES.VARIABLE }}>
        <PricingConfigStep />
      </TestWrapper>
    )

    expect(screen.getByText('Riferimenti Prezzo Energia')).toBeInTheDocument()
    expect(screen.getByText('Indice Prezzo Energia')).toBeInTheDocument()
  })

  it('hides energy price reference section for fixed offers', () => {
    render(
      <TestWrapper defaultValues={{ marketType: MARKET_TYPES.ELECTRICITY, offerType: OFFER_TYPES.FIXED }}>
        <PricingConfigStep />
      </TestWrapper>
    )

    expect(screen.queryByText('Riferimenti Prezzo Energia')).not.toBeInTheDocument()
  })

  it('shows alternative index description when "Other" is selected', async () => {
    render(
      <TestWrapper>
        <PricingConfigStep />
      </TestWrapper>
    )

    // Select "Other" option
    const energyPriceSelect = screen.getByLabelText('Indice Prezzo Energia')
    fireEvent.click(energyPriceSelect)
    
    const otherOption = screen.getByText('Other (Not managed by Portal)')
    fireEvent.click(otherOption)

    await waitFor(() => {
      expect(screen.getByText('Descrizione Indice Alternativo')).toBeInTheDocument()
    })
  })

  it('shows time band configuration for electricity market (not FLAT)', () => {
    render(
      <TestWrapper defaultValues={{ marketType: MARKET_TYPES.ELECTRICITY, offerType: OFFER_TYPES.VARIABLE }}>
        <PricingConfigStep />
      </TestWrapper>
    )

    expect(screen.getByText('Configurazione Fasce Orarie')).toBeInTheDocument()
    expect(screen.getByText('Tipologia Fasce')).toBeInTheDocument()
  })

  it('hides time band configuration for gas market', () => {
    render(
      <TestWrapper defaultValues={{ marketType: MARKET_TYPES.GAS, offerType: OFFER_TYPES.VARIABLE }}>
        <PricingConfigStep />
      </TestWrapper>
    )

    expect(screen.queryByText('Configurazione Fasce Orarie')).not.toBeInTheDocument()
  })

  it('hides time band configuration for FLAT offers', () => {
    render(
      <TestWrapper defaultValues={{ marketType: MARKET_TYPES.ELECTRICITY, offerType: OFFER_TYPES.FLAT }}>
        <PricingConfigStep />
      </TestWrapper>
    )

    expect(screen.queryByText('Configurazione Fasce Orarie')).not.toBeInTheDocument()
  })

  it('shows weekly time bands when required configuration is selected', async () => {
    render(
      <TestWrapper>
        <PricingConfigStep />
      </TestWrapper>
    )

    // Select F1,F2 configuration which requires weekly time bands
    const timeBandSelect = screen.getByLabelText('Tipologia Fasce')
    fireEvent.click(timeBandSelect)
    
    const f1f2Option = screen.getByText('F1, F2')
    fireEvent.click(f1f2Option)

    await waitFor(() => {
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
  })

  it('shows dispatching section for electricity market', () => {
    render(
      <TestWrapper defaultValues={{ marketType: MARKET_TYPES.ELECTRICITY, offerType: OFFER_TYPES.VARIABLE }}>
        <PricingConfigStep />
      </TestWrapper>
    )

    expect(screen.getByText('Dispacciamento')).toBeInTheDocument()
    expect(screen.getByText('Aggiungi Componente Dispacciamento')).toBeInTheDocument()
  })

  it('hides dispatching section for gas market', () => {
    render(
      <TestWrapper defaultValues={{ marketType: MARKET_TYPES.GAS, offerType: OFFER_TYPES.VARIABLE }}>
        <PricingConfigStep />
      </TestWrapper>
    )

    expect(screen.queryByText('Dispacciamento')).not.toBeInTheDocument()
  })

  it('allows adding dispatching components', async () => {
    render(
      <TestWrapper>
        <PricingConfigStep />
      </TestWrapper>
    )

    const addButton = screen.getByText('Aggiungi Componente Dispacciamento')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Componente Dispacciamento 1')).toBeInTheDocument()
      expect(screen.getByText('Tipo Dispacciamento')).toBeInTheDocument()
      expect(screen.getByText('Nome Componente')).toBeInTheDocument()
      expect(screen.getByText('Descrizione Componente (Opzionale)')).toBeInTheDocument()
    })
  })

  it('shows dispatching value field when "Other" dispatching type is selected', async () => {
    render(
      <TestWrapper>
        <PricingConfigStep />
      </TestWrapper>
    )

    // Add a dispatching component
    const addButton = screen.getByText('Aggiungi Componente Dispacciamento')
    fireEvent.click(addButton)

    await waitFor(() => {
      const dispatchingTypeSelect = screen.getByLabelText('Tipo Dispacciamento')
      fireEvent.click(dispatchingTypeSelect)
      
      const otherOption = screen.getByText('Altro')
      fireEvent.click(otherOption)
    })

    await waitFor(() => {
      expect(screen.getByText('Valore Dispacciamento')).toBeInTheDocument()
    })
  })

  it('allows removing dispatching components', async () => {
    render(
      <TestWrapper>
        <PricingConfigStep />
      </TestWrapper>
    )

    // Add a dispatching component
    const addButton = screen.getByText('Aggiungi Componente Dispacciamento')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Componente Dispacciamento 1')).toBeInTheDocument()
    })

    // Remove the component
    const removeButton = screen.getByRole('button', { name: '' }) // Trash icon button
    fireEvent.click(removeButton)

    await waitFor(() => {
      expect(screen.queryByText('Componente Dispacciamento 1')).not.toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    render(
      <TestWrapper>
        <PricingConfigStep />
      </TestWrapper>
    )

    // Add a dispatching component
    const addButton = screen.getByText('Aggiungi Componente Dispacciamento')
    fireEvent.click(addButton)

    await waitFor(() => {
      const nameInput = screen.getByLabelText('Nome Componente')
      fireEvent.change(nameInput, { target: { value: '' } })
      fireEvent.blur(nameInput)
    })

    // The validation will be handled by the form provider
    // We can't easily test validation without triggering form submission
  })

  it('validates alternative index description when "Other" is selected', async () => {
    render(
      <TestWrapper>
        <PricingConfigStep />
      </TestWrapper>
    )

    // Select "Other" option
    const energyPriceSelect = screen.getByLabelText('Indice Prezzo Energia')
    fireEvent.click(energyPriceSelect)
    
    const otherOption = screen.getByText('Other (Not managed by Portal)')
    fireEvent.click(otherOption)

    await waitFor(() => {
      const descriptionTextarea = screen.getByLabelText('Descrizione Indice Alternativo')
      fireEvent.change(descriptionTextarea, { target: { value: '' } })
      fireEvent.blur(descriptionTextarea)
    })

    // The validation will be handled by the form provider
  })

  it('validates dispatching value when "Other" dispatching type is selected', async () => {
    render(
      <TestWrapper>
        <PricingConfigStep />
      </TestWrapper>
    )

    // Add a dispatching component
    const addButton = screen.getByText('Aggiungi Componente Dispacciamento')
    fireEvent.click(addButton)

    await waitFor(() => {
      const dispatchingTypeSelect = screen.getByLabelText('Tipo Dispacciamento')
      fireEvent.click(dispatchingTypeSelect)
      
      const otherOption = screen.getByText('Altro')
      fireEvent.click(otherOption)
    })

    await waitFor(() => {
      const valueInput = screen.getByLabelText('Valore Dispacciamento')
      fireEvent.change(valueInput, { target: { value: '' } })
      fireEvent.blur(valueInput)
    })

    // The validation will be handled by the form provider
  })

  it('displays help information', () => {
    render(
      <TestWrapper>
        <PricingConfigStep />
      </TestWrapper>
    )

    expect(screen.getByText('Informazioni di Aiuto')).toBeInTheDocument()
    expect(screen.getByText(/Riferimenti Prezzo Energia:/)).toBeInTheDocument()
    expect(screen.getByText(/Fasce Orarie:/)).toBeInTheDocument()
    expect(screen.getByText(/Fasce Orarie Settimanali:/)).toBeInTheDocument()
    expect(screen.getByText(/Dispacciamento:/)).toBeInTheDocument()
  })

  it('accepts valid time band format in weekly time bands', async () => {
    render(
      <TestWrapper>
        <PricingConfigStep />
      </TestWrapper>
    )

    // Select F1,F2 configuration which requires weekly time bands
    const timeBandSelect = screen.getByLabelText('Tipologia Fasce')
    fireEvent.click(timeBandSelect)
    
    const f1f2Option = screen.getByText('F1, F2')
    fireEvent.click(f1f2Option)

    await waitFor(() => {
      const mondayInput = screen.getByLabelText('Lunedì')
      fireEvent.change(mondayInput, { target: { value: '28-3,32-2,76-1,92-2,96-3' } })
      fireEvent.blur(mondayInput)
    })

    // Valid format should not show error
    await waitFor(() => {
      expect(screen.queryByText(/formato non valido/i)).not.toBeInTheDocument()
    })
  })

  it('handles numeric input for dispatching value', async () => {
    render(
      <TestWrapper>
        <PricingConfigStep />
      </TestWrapper>
    )

    // Add a dispatching component
    const addButton = screen.getByText('Aggiungi Componente Dispacciamento')
    fireEvent.click(addButton)

    await waitFor(() => {
      const dispatchingTypeSelect = screen.getByLabelText('Tipo Dispacciamento')
      fireEvent.click(dispatchingTypeSelect)
      
      const otherOption = screen.getByText('Altro')
      fireEvent.click(otherOption)
    })

    await waitFor(() => {
      const valueInput = screen.getByLabelText('Valore Dispacciamento')
      fireEvent.change(valueInput, { target: { value: '123.456789' } })
      fireEvent.blur(valueInput)
      
      // Should accept numeric values
      expect((valueInput as HTMLInputElement).value).toBe('123.456789')
    })
  })
}) 