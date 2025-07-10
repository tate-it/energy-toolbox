import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { describe, it, expect } from 'vitest'
import { ActivationContactsStep } from './activation-contacts-step'
import { activationContactsSchema, type ActivationContactsFormValues } from '@/lib/xml-generator/schemas'

// Test wrapper component with form provider
function TestWrapper({ children, defaultValues }: { children: React.ReactNode; defaultValues?: Partial<ActivationContactsFormValues> }) {
  const methods = useForm<ActivationContactsFormValues>({
    resolver: zodResolver(activationContactsSchema),
    defaultValues: {
      activationMethods: [],
      activationDescription: '',
      phone: '',
      vendorWebsite: '',
      offerUrl: '',
      ...defaultValues,
    },
  })

  return (
    <FormProvider {...methods}>
      {children}
    </FormProvider>
  )
}

describe('ActivationContactsStep', () => {
  it('renders the component with correct Italian labels', () => {
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    expect(screen.getByText('Attivazione e Contatti')).toBeInTheDocument()
    expect(screen.getByText('Configura i metodi di attivazione e le informazioni di contatto per l\'offerta')).toBeInTheDocument()
    expect(screen.getByText('Metodi di Attivazione')).toBeInTheDocument()
    expect(screen.getByText('Informazioni di Contatto')).toBeInTheDocument()
  })

  it('displays all activation method options with Italian labels', () => {
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    expect(screen.getByText('Attivazione solo web')).toBeInTheDocument()
    expect(screen.getByText('Attivazione qualsiasi canale')).toBeInTheDocument()
    expect(screen.getByText('Punto vendita')).toBeInTheDocument()
    expect(screen.getByText('Teleselling')).toBeInTheDocument()
    expect(screen.getByText('Agenzia')).toBeInTheDocument()
    expect(screen.getByText('Altro')).toBeInTheDocument()
  })

  it('displays contact information fields with Italian labels', () => {
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    expect(screen.getByText('Numero di Telefono')).toBeInTheDocument()
    expect(screen.getByText('Sito Web del Venditore')).toBeInTheDocument()
    expect(screen.getByText('URL dell\'Offerta')).toBeInTheDocument()
  })

  it('allows selecting multiple activation methods', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    const webOnlyCheckbox = screen.getByRole('checkbox', { name: /attivazione solo web/i })
    const anyChannelCheckbox = screen.getByRole('checkbox', { name: /attivazione qualsiasi canale/i })

    await user.click(webOnlyCheckbox)
    await user.click(anyChannelCheckbox)

    expect(webOnlyCheckbox).toBeChecked()
    expect(anyChannelCheckbox).toBeChecked()
  })

  it('shows activation description field when "Altro" is selected', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    const otherCheckbox = screen.getByRole('checkbox', { name: /altro/i })
    await user.click(otherCheckbox)

    expect(screen.getByText('Descrizione Metodo Attivazione')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Descrivi il metodo di attivazione alternativo...')).toBeInTheDocument()
  })

  it('hides activation description field when "Altro" is deselected', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    const otherCheckbox = screen.getByRole('checkbox', { name: /altro/i })
    
    // Select "Altro"
    await user.click(otherCheckbox)
    expect(screen.getByText('Descrizione Metodo Attivazione')).toBeInTheDocument()

    // Deselect "Altro"
    await user.click(otherCheckbox)
    expect(screen.queryByText('Descrizione Metodo Attivazione')).not.toBeInTheDocument()
  })

  it('accepts valid phone number input', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    const phoneInput = screen.getByLabelText(/numero di telefono/i)
    await user.type(phoneInput, '+39 02 1234567')

    expect(phoneInput).toHaveValue('+39 02 1234567')
  })

  it('accepts valid URL inputs for vendor website and offer URL', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    const vendorWebsiteInput = screen.getByLabelText(/sito web del venditore/i)
    const offerUrlInput = screen.getByLabelText(/url dell'offerta/i)

    await user.type(vendorWebsiteInput, 'https://www.esempio.it')
    await user.type(offerUrlInput, 'https://www.esempio.it/offerta')

    expect(vendorWebsiteInput).toHaveValue('https://www.esempio.it')
    expect(offerUrlInput).toHaveValue('https://www.esempio.it/offerta')
  })

  it('displays required field indicators', () => {
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    // Check for required asterisks
    const requiredFields = screen.getAllByText('*')
    expect(requiredFields.length).toBeGreaterThan(0)
  })

  it('shows help text for form fields', () => {
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    expect(screen.getByText('Numero di telefono per il supporto clienti (massimo 15 caratteri)')).toBeInTheDocument()
    expect(screen.getByText('URL del sito web aziendale (opzionale, massimo 100 caratteri)')).toBeInTheDocument()
    expect(screen.getByText('URL specifico dell\'offerta (opzionale, massimo 100 caratteri)')).toBeInTheDocument()
  })

  it('renders with pre-filled values when provided', () => {
    const defaultValues: Partial<ActivationContactsFormValues> = {
      activationMethods: ['01', '03'],
      phone: '+39 02 1234567',
      vendorWebsite: 'https://www.esempio.it',
      offerUrl: 'https://www.esempio.it/offerta',
    }

    render(
      <TestWrapper defaultValues={defaultValues}>
        <ActivationContactsStep />
      </TestWrapper>
    )

    const webOnlyCheckbox = screen.getByRole('checkbox', { name: /attivazione solo web/i })
    const pointOfSaleCheckbox = screen.getByRole('checkbox', { name: /punto vendita/i })
    const phoneInput = screen.getByLabelText(/numero di telefono/i)
    const vendorWebsiteInput = screen.getByLabelText(/sito web del venditore/i)
    const offerUrlInput = screen.getByLabelText(/url dell'offerta/i)

    expect(webOnlyCheckbox).toBeChecked()
    expect(pointOfSaleCheckbox).toBeChecked()
    expect(phoneInput).toHaveValue('+39 02 1234567')
    expect(vendorWebsiteInput).toHaveValue('https://www.esempio.it')
    expect(offerUrlInput).toHaveValue('https://www.esempio.it/offerta')
  })

  it('shows activation description field when "Altro" is pre-selected', () => {
    const defaultValues: Partial<ActivationContactsFormValues> = {
      activationMethods: ['99'],
      activationDescription: 'Custom activation method',
    }

    render(
      <TestWrapper defaultValues={defaultValues}>
        <ActivationContactsStep />
      </TestWrapper>
    )

    expect(screen.getByText('Descrizione Metodo Attivazione')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Custom activation method')).toBeInTheDocument()
  })

  it('allows deselecting activation methods', async () => {
    const user = userEvent.setup()
    
    const defaultValues: Partial<ActivationContactsFormValues> = {
      activationMethods: ['01', '02'],
    }

    render(
      <TestWrapper defaultValues={defaultValues}>
        <ActivationContactsStep />
      </TestWrapper>
    )

    const webOnlyCheckbox = screen.getByRole('checkbox', { name: /attivazione solo web/i })
    const anyChannelCheckbox = screen.getByRole('checkbox', { name: /attivazione qualsiasi canale/i })

    expect(webOnlyCheckbox).toBeChecked()
    expect(anyChannelCheckbox).toBeChecked()

    await user.click(webOnlyCheckbox)
    expect(webOnlyCheckbox).not.toBeChecked()
    expect(anyChannelCheckbox).toBeChecked()
  })

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    // Check that checkboxes have proper labels
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(checkbox => {
      expect(checkbox).toHaveAccessibleName()
    })

    // Check that inputs have proper labels
    const phoneInput = screen.getByLabelText(/numero di telefono/i)
    const vendorWebsiteInput = screen.getByLabelText(/sito web del venditore/i)
    const offerUrlInput = screen.getByLabelText(/url dell'offerta/i)

    expect(phoneInput).toHaveAccessibleName()
    expect(vendorWebsiteInput).toHaveAccessibleName()
    expect(offerUrlInput).toHaveAccessibleName()
  })
}) 