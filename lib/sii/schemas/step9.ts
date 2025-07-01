/**
 * Step 9: Payment Methods Schema (Metodi di Pagamento)
 * Zod validation schema for SII XML Generator Step 9
 * 
 * Fields:
 * - MODALITA_PAGAMENTO: Payment method selection (mandatory, enum-based)
 * - DESCRIZIONE: Additional description for payment method (optional, max 1000 characters)
 * 
 * Validation Rules:
 * - Payment method must be from valid SII enumeration
 * - Description required when "Altro" payment method is selected
 * - Description character limit per SII specification
 * - Business logic validation for payment method appropriateness
 * - Italian error messages and labels
 */

import { z } from 'zod'
import {
  MODALITA_PAGAMENTO,
  MODALITA_PAGAMENTO_LABELS,
  type ModalitaPagamento
} from '../constants'

/**
 * Payment method validation schema
 * Must be one of the valid SII payment methods
 */
export const ModalitaPagamentoSchema = z.enum(
  Object.keys(MODALITA_PAGAMENTO) as [keyof typeof MODALITA_PAGAMENTO, ...Array<keyof typeof MODALITA_PAGAMENTO>],
  { errorMap: () => ({ message: 'Modalità di pagamento non valida' }) }
)

/**
 * Payment description validation schema
 * Optional text field for additional payment details
 */
export const DescrizionePagamentoSchema = z.string()
  .trim()
  .max(1000, 'Descrizione pagamento non può superare 1000 caratteri')
  .optional()
  .or(z.literal('').transform(() => undefined))

/**
 * Base Step 9 validation schema
 * Before conditional validation rules
 */
export const Step9BaseSchema = z.object({
  // Payment method selection
  mod_pag: ModalitaPagamentoSchema,
  
  // Optional description
  desc: DescrizionePagamentoSchema,
})

/**
 * Step 9 validation schema with conditional logic
 * Applies business rules based on payment method selection
 */
export const Step9Schema = Step9BaseSchema.refine(
  data => {
    // If "Altro" payment method, description is required
    if (data.mod_pag === 'ALTRO') {
      if (!data.desc || data.desc.trim().length === 0) {
        return false
      }
    }
    return true
  },
  {
    message: 'Descrizione è richiesta quando si seleziona "Altro" come modalità di pagamento',
    path: ['desc']
  }
).refine(
  data => {
    // Validate description is meaningful when provided
    if (data.desc && data.desc.trim().length < 10) {
      return false
    }
    return true
  },
  {
    message: 'Descrizione deve essere di almeno 10 caratteri se fornita',
    path: ['desc']
  }
)

/**
 * TypeScript type inference for Step 9 data
 */
export type Step9Data = z.infer<typeof Step9Schema>

/**
 * Default values for Step 9 form
 * Used by NuQS for URL state initialization
 */
export const Step9Defaults: Partial<Step9Data> = {
  mod_pag: undefined,
  desc: undefined,
}

/**
 * Step 9 field labels in Italian
 * For form components and validation messages
 */
export const Step9Labels = {
  mod_pag: 'Modalità di Pagamento',
  desc: 'Descrizione Aggiuntiva',
} as const

/**
 * Step 9 field descriptions
 * Additional help text for form fields
 */
export const Step9Descriptions = {
  mod_pag: 'Seleziona la modalità di pagamento disponibile per l\'offerta',
  desc: 'Descrizione aggiuntiva per la modalità di pagamento (richiesta per "Altro")',
} as const

/**
 * Step 9 validation helper
 * Safe parse function with Italian error messages
 */
export function validateStep9(data: unknown): {
  success: true
  data: Step9Data
} | {
  success: false
  errors: Record<string, string>
} {
  const result = Step9Schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  // Transform Zod errors to field-specific error messages
  const errors: Record<string, string> = {}
  
  for (const error of result.error.errors) {
    const fieldName = error.path[0]
    if (fieldName && typeof fieldName === 'string') {
      errors[fieldName] = error.message
    }
  }
  
  return { success: false, errors }
}

/**
 * Check if Step 9 is valid and complete
 * Used for step navigation validation
 */
export function isStep9Complete(data: Partial<Step9Data>): boolean {
  const result = Step9Schema.safeParse(data)
  return result.success
}

/**
 * Get validation errors for specific field
 * Used for real-time field validation with context
 */
export function getStep9FieldError(
  fieldName: keyof Step9Data,
  value: any,
  contextData?: Partial<Step9Data>
): string | null {
  // For conditional fields, we need context
  const testData = { ...Step9Defaults, ...contextData, [fieldName]: value }
  const result = Step9Schema.safeParse(testData)
  
  if (result.success) {
    return null
  }
  
  // Find error for this specific field
  const fieldError = result.error.errors.find(err => err.path[0] === fieldName)
  return fieldError?.message || null
}

/**
 * Format Step 9 data for XML generation
 * Converts form data to XML field names
 */
export function formatStep9ForXML(data: Step9Data) {
  return {
    MODALITA_PAGAMENTO: data.mod_pag,
    DESCRIZIONE: data.desc,
  }
}

/**
 * Get payment method label in Italian
 * Helper for displaying payment method names
 */
export function getPaymentMethodLabel(method: ModalitaPagamento): string {
  return MODALITA_PAGAMENTO_LABELS[method] || method
}

/**
 * Check if payment method requires description
 * Helper for conditional field display
 */
export function requiresDescription(paymentMethod?: ModalitaPagamento): boolean {
  return paymentMethod === 'ALTRO'
}

/**
 * Get all available payment methods
 * Helper for form option rendering
 */
export function getAvailablePaymentMethods(): Array<{
  value: ModalitaPagamento
  label: string
  description: string
}> {
  return Object.entries(MODALITA_PAGAMENTO).map(([key, value]) => ({
    value: value as ModalitaPagamento,
    label: MODALITA_PAGAMENTO_LABELS[value as ModalitaPagamento],
    description: getPaymentMethodDescription(value as ModalitaPagamento)
  }))
}

/**
 * Get payment method description
 * Helper for providing additional context
 */
export function getPaymentMethodDescription(method: ModalitaPagamento): string {
  switch (method) {
    case 'ADDEBITO_BANCARIO':
      return 'Addebito automatico sul conto corrente bancario'
    case 'ADDEBITO_POSTALE':
      return 'Addebito automatico sul conto corrente postale'
    case 'ADDEBITO_CARTA_CREDITO':
      return 'Addebito automatico su carta di credito'
    case 'BOLLETTINO_PRECOMPILATO':
      return 'Pagamento tramite bollettino precompilato'
    case 'ALTRO':
      return 'Altra modalità di pagamento (specificare nella descrizione)'
    default:
      return 'Modalità di pagamento'
  }
}

/**
 * Get payment method category
 * Helper for grouping payment methods
 */
export function getPaymentMethodCategory(method: ModalitaPagamento): 'automatic' | 'manual' | 'other' {
  switch (method) {
    case 'ADDEBITO_BANCARIO':
    case 'ADDEBITO_POSTALE':
    case 'ADDEBITO_CARTA_CREDITO':
      return 'automatic'
    case 'BOLLETTINO_PRECOMPILATO':
      return 'manual'
    case 'ALTRO':
      return 'other'
    default:
      return 'other'
  }
}

/**
 * Get payment method convenience rating
 * Helper for UX recommendations
 */
export function getPaymentMethodConvenience(method: ModalitaPagamento): {
  rating: number
  description: string
} {
  switch (method) {
    case 'ADDEBITO_BANCARIO':
      return { rating: 5, description: 'Massima convenienza - addebito automatico' }
    case 'ADDEBITO_CARTA_CREDITO':
      return { rating: 4, description: 'Alta convenienza - addebito automatico' }
    case 'ADDEBITO_POSTALE':
      return { rating: 4, description: 'Alta convenienza - addebito automatico' }
    case 'BOLLETTINO_PRECOMPILATO':
      return { rating: 2, description: 'Convenienza media - pagamento manuale' }
    case 'ALTRO':
      return { rating: 1, description: 'Convenienza variabile - da specificare' }
    default:
      return { rating: 1, description: 'Convenienza non valutata' }
  }
}

/**
 * Validate payment method business rules
 * Business logic validation for payment appropriateness
 */
export function validatePaymentMethodBusinessRules(data: Step9Data): {
  isValid: boolean
  warnings: string[]
  suggestions: string[]
} {
  const warnings: string[] = []
  const suggestions: string[] = []
  
  const category = getPaymentMethodCategory(data.mod_pag)
  const convenience = getPaymentMethodConvenience(data.mod_pag)
  
  // Business logic validations
  if (category === 'manual') {
    suggestions.push('Considera di offrire anche modalità di pagamento automatiche per maggiore convenienza')
  }
  
  if (convenience.rating <= 2) {
    suggestions.push('Modalità di pagamento con convenienza limitata - valuta alternative')
  }
  
  if (data.mod_pag === 'ALTRO' && data.desc) {
    if (data.desc.length < 20) {
      warnings.push('Descrizione per "Altro" molto breve - fornire dettagli sufficienti')
    }
    
    // Check for common payment methods that should use specific enums
    const lowercaseDesc = data.desc.toLowerCase()
    if (lowercaseDesc.includes('bancario') || lowercaseDesc.includes('banca')) {
      warnings.push('Per addebiti bancari usa la modalità specifica "Addebito diretto bancario"')
    }
    if (lowercaseDesc.includes('postale') || lowercaseDesc.includes('poste')) {
      warnings.push('Per addebiti postali usa la modalità specifica "Addebito diretto postale"')
    }
    if (lowercaseDesc.includes('carta') || lowercaseDesc.includes('credito')) {
      warnings.push('Per carte di credito usa la modalità specifica "Addebito diretto carta di credito"')
    }
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  }
}

/**
 * Get payment method statistics
 * Helper for analytics and insights
 */
export function getPaymentMethodStats(method: ModalitaPagamento): {
  category: string
  convenience: number
  isAutomatic: boolean
  requiresDescription: boolean
  label: string
} {
  return {
    category: getPaymentMethodCategory(method),
    convenience: getPaymentMethodConvenience(method).rating,
    isAutomatic: getPaymentMethodCategory(method) === 'automatic',
    requiresDescription: requiresDescription(method),
    label: getPaymentMethodLabel(method)
  }
}

/**
 * Create Step 9 summary
 * Helper for displaying payment method information
 */
export function createStep9Summary(data: Step9Data): {
  paymentMethod: string
  hasDescription: boolean
  category: string
  convenience: number
  isComplete: boolean
} {
  return {
    paymentMethod: getPaymentMethodLabel(data.mod_pag),
    hasDescription: !!data.desc,
    category: getPaymentMethodCategory(data.mod_pag),
    convenience: getPaymentMethodConvenience(data.mod_pag).rating,
    isComplete: isStep9Complete(data)
  }
}

/**
 * Step 9 form validation state type
 * Used by form components for validation display
 */
export type Step9ValidationState = {
  [K in keyof Step9Data]: {
    value: Step9Data[K]
    error: string | null
    isValid: boolean
    isRequired: boolean
  }
}

/**
 * Create initial validation state
 * Used by form components initialization
 */
export function createStep9ValidationState(
  initialData: Partial<Step9Data> = {}
): Step9ValidationState {
  const data = { ...Step9Defaults, ...initialData }
  const needsDescription = requiresDescription(data.mod_pag)
  
  return {
    mod_pag: {
      value: data.mod_pag,
      error: null,
      isValid: !!data.mod_pag,
      isRequired: true,
    },
    desc: {
      value: data.desc,
      error: null,
      isValid: !needsDescription || !!data.desc,
      isRequired: needsDescription,
    },
  }
} 