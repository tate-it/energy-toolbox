import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import type { PaymentConditionsFormValues } from '@/lib/xml-generator/schemas'
import { paymentConditionsSchema } from '@/lib/xml-generator/schemas'
import { PaymentConditionsStepComponent as PaymentConditionsStep } from './payment-conditions-step'

// Regex literals defined at top level to avoid performance issues
const PAYMENT_METHODS_DESCRIPTION_REGEX =
  /Definisci i metodi di pagamento accettati/
const PAYMENT_METHODS_SECTION_REGEX =
  /Specifica i metodi di pagamento disponibili/
const CONTRACTUAL_CONDITIONS_REGEX =
  /Aggiungi le condizioni contrattuali specifiche/
const PAYMENT_TYPE_REGEX = /Tipo di Pagamento/
const CONDITION_TYPE_REGEX = /Tipo di Condizione/
const LIMITING_CONDITION_REGEX = /Condizione Limitante/

const TestWrapper = ({
  children,
  formData = {},
}: {
  children: React.ReactNode
  formData?: Partial<PaymentConditionsFormValues>
}) => {
  const form = useForm<PaymentConditionsFormValues>({
    resolver: zodResolver(paymentConditionsSchema),
    defaultValues: {
      paymentMethods: [],
      contractualConditions: [],
      ...formData,
    },
    mode: 'onChange',
  })

  return <FormProvider {...form}>{children}</FormProvider>
}

describe('PaymentConditionsStep', () => {
  it('renders the component title and description', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    expect(
      screen.getByText('Metodi di Pagamento e Condizioni'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(PAYMENT_METHODS_DESCRIPTION_REGEX),
    ).toBeInTheDocument()
  })

  it('renders payment methods section', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    expect(screen.getByText('Metodi di Pagamento')).toBeInTheDocument()
    expect(screen.getByText(PAYMENT_METHODS_SECTION_REGEX)).toBeInTheDocument()
  })

  it('renders contractual conditions section', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    expect(screen.getByText('Condizioni Contrattuali')).toBeInTheDocument()
    expect(screen.getByText(CONTRACTUAL_CONDITIONS_REGEX)).toBeInTheDocument()
  })

  it('allows adding new payment methods', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Metodo di Pagamento')
    fireEvent.click(addButton)

    expect(screen.getByText('Metodo di Pagamento 1')).toBeInTheDocument()
    expect(screen.getByText('Tipo di Pagamento *')).toBeInTheDocument()
  })

  it('shows payment method type options', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Metodo di Pagamento')
    fireEvent.click(addButton)

    const paymentTypeSelect = screen.getByRole('combobox', {
      name: PAYMENT_TYPE_REGEX,
    })
    fireEvent.click(paymentTypeSelect)

    expect(screen.getAllByText('Bank direct debit')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Postal direct debit')[0]).toBeInTheDocument()
    expect(
      screen.getAllByText('Credit card direct debit')[0],
    ).toBeInTheDocument()
    expect(screen.getAllByText('Pre-filled bulletin')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Other')[0]).toBeInTheDocument()
  })

  it('shows description field when "Other" payment method is selected', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Metodo di Pagamento')
    fireEvent.click(addButton)

    const paymentTypeSelect = screen.getByRole('combobox', {
      name: PAYMENT_TYPE_REGEX,
    })
    fireEvent.click(paymentTypeSelect)

    const otherOption = screen.getAllByText('Other')[0]
    fireEvent.click(otherOption)

    expect(screen.getByText('Descrizione *')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(
        'Descrivi il metodo di pagamento alternativo...',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Obbligatorio quando si seleziona "Altro". Massimo 3000 caratteri.',
      ),
    ).toBeInTheDocument()
  })

  it('allows removing payment methods when multiple exist', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Metodo di Pagamento')
    fireEvent.click(addButton)
    fireEvent.click(addButton) // Add second payment method

    expect(screen.getByText('Metodo di Pagamento 1')).toBeInTheDocument()
    expect(screen.getByText('Metodo di Pagamento 2')).toBeInTheDocument()

    const removeButtons = screen.getAllByRole('button', { name: '' })
    const removeButton = removeButtons.find((button) =>
      button.querySelector('svg')?.getAttribute('class')?.includes('h-3 w-3'),
    )

    if (removeButton) {
      fireEvent.click(removeButton)
    }

    expect(screen.getByText('Metodo di Pagamento 1')).toBeInTheDocument()
    expect(screen.queryByText('Metodo di Pagamento 2')).not.toBeInTheDocument()
  })

  it('allows adding new contractual conditions', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Condizione Contrattuale')
    fireEvent.click(addButton)

    expect(screen.getByText('Condizione Contrattuale 1')).toBeInTheDocument()
    expect(screen.getByText('Tipo di Condizione *')).toBeInTheDocument()
    expect(screen.getByText('Condizione Limitante *')).toBeInTheDocument()
    expect(
      screen.getByText('Descrizione della Condizione *'),
    ).toBeInTheDocument()
  })

  it('shows condition type options', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Condizione Contrattuale')
    fireEvent.click(addButton)

    const conditionTypeSelect = screen.getByRole('combobox', {
      name: CONDITION_TYPE_REGEX,
    })
    fireEvent.click(conditionTypeSelect)

    expect(screen.getAllByText('Activation')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Deactivation')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Withdrawal')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Multi-year Offer')[0]).toBeInTheDocument()
    expect(
      screen.getAllByText('Early Withdrawal Charges')[0],
    ).toBeInTheDocument()
    expect(screen.getAllByText('Other')[0]).toBeInTheDocument()
  })

  it('shows limiting condition options', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Condizione Contrattuale')
    fireEvent.click(addButton)

    const limitingSelect = screen.getByRole('combobox', {
      name: LIMITING_CONDITION_REGEX,
    })
    fireEvent.click(limitingSelect)

    expect(screen.getAllByText('Yes, it is limiting')[0]).toBeInTheDocument()
    expect(screen.getAllByText('No, it is not limiting')[0]).toBeInTheDocument()
  })

  it('shows alternative description field when "Other" condition type is selected', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Condizione Contrattuale')
    fireEvent.click(addButton)

    const conditionTypeSelect = screen.getByRole('combobox', {
      name: CONDITION_TYPE_REGEX,
    })
    fireEvent.click(conditionTypeSelect)

    const otherOption = screen.getAllByText('Other')[0]
    fireEvent.click(otherOption)

    expect(screen.getByText('Descrizione Alternativa *')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(
        'Descrivi il tipo di condizione alternativa...',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Obbligatorio quando si seleziona "Altro". Massimo 3000 caratteri.',
      ),
    ).toBeInTheDocument()
  })

  it('allows removing contractual conditions', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Condizione Contrattuale')
    fireEvent.click(addButton)
    fireEvent.click(addButton) // Add second condition

    expect(screen.getByText('Condizione Contrattuale 1')).toBeInTheDocument()
    expect(screen.getByText('Condizione Contrattuale 2')).toBeInTheDocument()

    const removeButtons = screen.getAllByRole('button', { name: '' })
    const removeButton = removeButtons.find((button) =>
      button.querySelector('svg')?.getAttribute('class')?.includes('h-3 w-3'),
    )

    if (removeButton) {
      fireEvent.click(removeButton)
    }

    expect(screen.getByText('Condizione Contrattuale 1')).toBeInTheDocument()
    expect(
      screen.queryByText('Condizione Contrattuale 2'),
    ).not.toBeInTheDocument()
  })

  it('handles form input changes for payment methods', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Metodo di Pagamento')
    fireEvent.click(addButton)

    const paymentTypeSelect = screen.getByRole('combobox', {
      name: PAYMENT_TYPE_REGEX,
    })
    fireEvent.click(paymentTypeSelect)

    const otherOption = screen.getAllByText('Other')[0]
    fireEvent.click(otherOption)

    const descriptionInput = screen.getByPlaceholderText(
      'Descrivi il metodo di pagamento alternativo...',
    )
    fireEvent.change(descriptionInput, {
      target: { value: 'Custom payment method' },
    })

    expect(descriptionInput).toHaveValue('Custom payment method')
  })

  it('handles form input changes for contractual conditions', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    const addButton = screen.getByText('Aggiungi Condizione Contrattuale')
    fireEvent.click(addButton)

    const conditionTypeSelect = screen.getByRole('combobox', {
      name: CONDITION_TYPE_REGEX,
    })
    fireEvent.click(conditionTypeSelect)

    const otherOption = screen.getAllByText('Other')[0]
    fireEvent.click(otherOption)

    const altDescriptionInput = screen.getByPlaceholderText(
      'Descrivi il tipo di condizione alternativa...',
    )
    fireEvent.change(altDescriptionInput, {
      target: { value: 'Custom condition type' },
    })

    expect(altDescriptionInput).toHaveValue('Custom condition type')

    const descriptionInput = screen.getByPlaceholderText(
      'Descrivi dettagliatamente la condizione contrattuale...',
    )
    fireEvent.change(descriptionInput, {
      target: { value: 'Detailed condition description' },
    })

    expect(descriptionInput).toHaveValue('Detailed condition description')
  })

  it('shows validation help text', () => {
    render(
      <TestWrapper>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    const addConditionButton = screen.getByText(
      'Aggiungi Condizione Contrattuale',
    )
    fireEvent.click(addConditionButton)

    expect(screen.getByText('Massimo 3000 caratteri')).toBeInTheDocument()
  })

  it('handles pre-filled form data', () => {
    const formData = {
      paymentMethods: [
        {
          paymentMethodType: '01' as const,
          description: '',
        },
      ],
      contractualConditions: [
        {
          conditionType: '01' as const,
          alternativeDescription: '',
          description: 'Test condition',
          isLimiting: '01' as const,
        },
      ],
    }

    render(
      <TestWrapper formData={formData}>
        <PaymentConditionsStep />
      </TestWrapper>,
    )

    expect(screen.getByText('Metodo di Pagamento 1')).toBeInTheDocument()
    expect(screen.getByText('Condizione Contrattuale 1')).toBeInTheDocument()
  })
})
