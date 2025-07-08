import { render, screen, fireEvent } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CompanyComponentsStep } from './company-components-step'
import { companyComponentsSchema } from '@/lib/xml-generator/schemas'
import type { CompanyComponentsFormValues } from '@/lib/xml-generator/schemas'
import { MARKET_TYPES } from '@/lib/xml-generator/constants'

const TestWrapper = ({ 
  children, 
  formData = {} 
}: { 
  children: React.ReactNode
  formData?: any
}) => {
  const form = useForm<CompanyComponentsFormValues>({
    resolver: zodResolver(companyComponentsSchema),
    defaultValues: {
      regulatedComponents: [],
      companyComponents: [],
    },
  })

  return <FormProvider {...form}>{children}</FormProvider>
}

describe('CompanyComponentsStep', () => {
  it('renders the component title and description', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    expect(screen.getByText('Componenti Impresa')).toBeInTheDocument()
    expect(screen.getByText(/Definisci i componenti regolati/)).toBeInTheDocument()
  })

  it('renders regulated components section', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    expect(screen.getByText('Componenti Regolate')).toBeInTheDocument()
    expect(screen.getByText(/Seleziona i componenti regolati/)).toBeInTheDocument()
  })

  it('shows electricity components for electricity market type', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <CompanyComponentsStep formData={formData} />
      </TestWrapper>
    )

    expect(screen.getByText('PCV (01)')).toBeInTheDocument()
    expect(screen.getByText('PPE (02)')).toBeInTheDocument()
    expect(screen.getByText('Elettricità')).toBeInTheDocument()
  })

  it('shows gas components for gas market type', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.GAS,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <CompanyComponentsStep formData={formData} />
      </TestWrapper>
    )

    expect(screen.getByText('CCR (03)')).toBeInTheDocument()
    expect(screen.getByText('CPR (04)')).toBeInTheDocument()
    expect(screen.getByText('GRAD (05)')).toBeInTheDocument()
    expect(screen.getByText('Gas')).toBeInTheDocument()
  })

  it('renders company components section', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    expect(screen.getByText('Componenti Aziendali')).toBeInTheDocument()
    expect(screen.getByText(/Aggiungi i componenti aziendali/)).toBeInTheDocument()
  })

  it('allows adding new company components', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    const addButton = screen.getByText('Aggiungi Componente Aziendale')
    fireEvent.click(addButton)

    expect(screen.getByText('Componente 1')).toBeInTheDocument()
    expect(screen.getByText('Nome Componente *')).toBeInTheDocument()
    expect(screen.getByText('Tipo Componente *')).toBeInTheDocument()
    expect(screen.getByText('Macroarea *')).toBeInTheDocument()
    expect(screen.getByText('Descrizione *')).toBeInTheDocument()
  })

  it('shows price intervals section when company component is added', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    const addButton = screen.getByText('Aggiungi Componente Aziendale')
    fireEvent.click(addButton)

    expect(screen.getByText('Intervalli di Prezzo')).toBeInTheDocument()
    expect(screen.getByText('Intervallo 1')).toBeInTheDocument()
    expect(screen.getByText('Prezzo *')).toBeInTheDocument()
    expect(screen.getByText('Unità di Misura *')).toBeInTheDocument()
  })

  it('shows consumption range fields in price intervals', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    const addButton = screen.getByText('Aggiungi Componente Aziendale')
    fireEvent.click(addButton)

    expect(screen.getByText('Consumo Da')).toBeInTheDocument()
    expect(screen.getByText('Consumo A')).toBeInTheDocument()
    expect(screen.getByText('Fascia Componente')).toBeInTheDocument()
  })

  it('shows validity period fields in price intervals', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    const addButton = screen.getByText('Aggiungi Componente Aziendale')
    fireEvent.click(addButton)

    expect(screen.getByText('Data Inizio Validità')).toBeInTheDocument()
    expect(screen.getByText('Data Fine Validità')).toBeInTheDocument()
    expect(screen.getAllByText('Formato: gg/mm/aaaa')).toHaveLength(2)
  })

  it('allows adding multiple price intervals', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    const addComponentButton = screen.getByText('Aggiungi Componente Aziendale')
    fireEvent.click(addComponentButton)

    const addIntervalButton = screen.getByText('Aggiungi Intervallo di Prezzo')
    fireEvent.click(addIntervalButton)

    expect(screen.getByText('Intervallo 1')).toBeInTheDocument()
    expect(screen.getByText('Intervallo 2')).toBeInTheDocument()
  })

  it('shows component type options', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    const addButton = screen.getByText('Aggiungi Componente Aziendale')
    fireEvent.click(addButton)

    const componentTypeSelect = screen.getByText('Seleziona tipo componente')
    fireEvent.click(componentTypeSelect)

    expect(screen.getByText('STANDARD - Price included')).toBeInTheDocument()
    expect(screen.getByText('OPTIONAL - Price not included')).toBeInTheDocument()
  })

  it('shows macro area options', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    const addButton = screen.getByText('Aggiungi Componente Aziendale')
    fireEvent.click(addButton)

    const macroAreaSelect = screen.getByText('Seleziona macroarea')
    fireEvent.click(macroAreaSelect)

    expect(screen.getByText('Fixed commercialization fee')).toBeInTheDocument()
    expect(screen.getByText('Energy commercialization fee')).toBeInTheDocument()
    expect(screen.getByText('Energy price component')).toBeInTheDocument()
  })

  it('shows unit of measure options', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    const addButton = screen.getByText('Aggiungi Componente Aziendale')
    fireEvent.click(addButton)

    const unitSelect = screen.getByText('Seleziona unità')
    fireEvent.click(unitSelect)

    expect(screen.getByText('€/Year')).toBeInTheDocument()
    expect(screen.getByText('€/kW')).toBeInTheDocument()
    expect(screen.getByText('€/kWh')).toBeInTheDocument()
    expect(screen.getByText('€/Sm³')).toBeInTheDocument()
  })

  it('shows component time band options', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    const addButton = screen.getByText('Aggiungi Componente Aziendale')
    fireEvent.click(addButton)

    const timeBandSelect = screen.getByText('Seleziona fascia (opzionale)')
    fireEvent.click(timeBandSelect)

    expect(screen.getByText('Monorario/F1')).toBeInTheDocument()
    expect(screen.getByText('F2')).toBeInTheDocument()
    expect(screen.getByText('F3')).toBeInTheDocument()
    expect(screen.getByText('Peak')).toBeInTheDocument()
    expect(screen.getByText('OffPeak')).toBeInTheDocument()
  })

  it('allows removing company components when multiple exist', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    const addButton = screen.getByText('Aggiungi Componente Aziendale')
    fireEvent.click(addButton)
    fireEvent.click(addButton) // Add second component

    expect(screen.getByText('Componente 1')).toBeInTheDocument()
    expect(screen.getByText('Componente 2')).toBeInTheDocument()

    const removeButtons = screen.getAllByRole('button', { name: '' })
    const removeButton = removeButtons.find(button => 
      button.querySelector('svg')?.getAttribute('class')?.includes('h-4 w-4')
    )
    
    if (removeButton) {
      fireEvent.click(removeButton)
    }

    expect(screen.getByText('Componente 1')).toBeInTheDocument()
    expect(screen.queryByText('Componente 2')).not.toBeInTheDocument()
  })

  it('allows removing price intervals when multiple exist', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    const addComponentButton = screen.getByText('Aggiungi Componente Aziendale')
    fireEvent.click(addComponentButton)

    const addIntervalButton = screen.getByText('Aggiungi Intervallo di Prezzo')
    fireEvent.click(addIntervalButton)

    expect(screen.getByText('Intervallo 1')).toBeInTheDocument()
    expect(screen.getByText('Intervallo 2')).toBeInTheDocument()

    const removeButtons = screen.getAllByRole('button', { name: '' })
    const removeButton = removeButtons.find(button => 
      button.querySelector('svg')?.getAttribute('class')?.includes('h-3 w-3')
    )
    
    if (removeButton) {
      fireEvent.click(removeButton)
    }

    expect(screen.getByText('Intervallo 1')).toBeInTheDocument()
    expect(screen.queryByText('Intervallo 2')).not.toBeInTheDocument()
  })

  it('shows validation help text', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    const addButton = screen.getByText('Aggiungi Componente Aziendale')
    fireEvent.click(addButton)

    expect(screen.getByText('Massimo 3000 caratteri')).toBeInTheDocument()
    expect(screen.getAllByText('Formato: gg/mm/aaaa')).toHaveLength(2)
  })

  it('handles regulated components selection', () => {
    const formData = {
      offerDetails: {
        marketType: MARKET_TYPES.ELECTRICITY,
      },
    }

    render(
      <TestWrapper formData={formData}>
        <CompanyComponentsStep formData={formData} />
      </TestWrapper>
    )

    const pcvCheckbox = screen.getByRole('checkbox', { name: /PCV \(01\)/ })
    fireEvent.click(pcvCheckbox)

    expect(pcvCheckbox).toBeChecked()
  })

  it('handles form input changes', () => {
    render(
      <TestWrapper>
        <CompanyComponentsStep formData={{}} />
      </TestWrapper>
    )

    const addButton = screen.getByText('Aggiungi Componente Aziendale')
    fireEvent.click(addButton)

    const nameInput = screen.getByPlaceholderText('Inserisci il nome del componente')
    fireEvent.change(nameInput, { target: { value: 'Test Component' } })

    expect(nameInput).toHaveValue('Test Component')

    const descriptionInput = screen.getByPlaceholderText('Inserisci la descrizione del componente')
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })

    expect(descriptionInput).toHaveValue('Test Description')

    const priceInput = screen.getByPlaceholderText('0.00')
    fireEvent.change(priceInput, { target: { value: '10.50' } })

    expect(priceInput).toHaveValue(10.5)
  })
}) 