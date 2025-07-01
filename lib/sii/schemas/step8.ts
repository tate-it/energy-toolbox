/**
 * Step 8: Dual Offer Schema (Offerta Dual Fuel)
 * Zod validation schema for SII XML Generator Step 8
 * 
 * Fields:
 * - IS_DUAL_OFFER: Flag indicating if this is a dual fuel offer (mandatory for dual fuel)
 * - ELETTRICITA_INCLUSA: Electricity included in dual offer (conditional)
 * - GAS_INCLUSO: Gas included in dual offer (conditional)
 * - SCONTO_DUAL_FUEL: Dual fuel discount percentage (optional)
 * - CONDIZIONI_DUAL_FUEL: Dual fuel specific conditions (optional, max 2000 characters)
 * - VANTAGGI_DUAL_FUEL: Dual fuel advantages (optional, max 2000 characters)
 * - REQUISITI_SOTTOSCRIZIONE: Subscription requirements (optional, max 1000 characters)
 * - MODALITA_ATTIVAZIONE_DUAL: Dual fuel activation methods (optional array)
 * 
 * Validation Rules:
 * - Dual offers must include both electricity and gas
 * - Discount percentage must be between 0-100%
 * - All text fields have specific character limits per SII specification
 * - Activation methods must be valid SII activation types
 * - Business logic validation for realistic dual fuel configurations
 * - Cross-reference validation with main offer type
 */

import { z } from 'zod'
import {
  MODALITA_ATTIVAZIONE,
  type ModalitaAttivazione
} from '../constants'

/**
 * Dual offer flag validation schema
 * Indicates if this is a dual fuel offer
 */
export const IsDualOfferSchema = z.boolean()
  .optional()

/**
 * Electricity inclusion validation schema
 * Required for dual offers
 */
export const ElettriciltaInclusaSchema = z.boolean()
  .optional()

/**
 * Gas inclusion validation schema
 * Required for dual offers
 */
export const GasInclusoSchema = z.boolean()
  .optional()

/**
 * Dual fuel discount validation schema
 * Percentage discount for dual fuel subscriptions
 */
export const ScontoDualFuelSchema = z.number()
  .min(0, 'Sconto dual fuel deve essere positivo')
  .max(100, 'Sconto dual fuel non può superare 100%')
  .refine(
    val => {
      const decimals = val.toString().split('.')[1]
      return !decimals || decimals.length <= 2
    },
    'Sconto dual fuel può avere massimo 2 decimali'
  )
  .optional()

/**
 * Dual fuel conditions validation schema
 * Optional text field for dual fuel specific conditions
 */
export const CondizioniDualFuelSchema = z.string()
  .trim()
  .max(2000, 'Condizioni dual fuel non possono superare 2000 caratteri')
  .optional()
  .or(z.literal('').transform(() => undefined))

/**
 * Dual fuel advantages validation schema
 * Optional text field describing dual fuel benefits
 */
export const VantaggiDualFuelSchema = z.string()
  .trim()
  .max(2000, 'Vantaggi dual fuel non possono superare 2000 caratteri')
  .optional()
  .or(z.literal('').transform(() => undefined))

/**
 * Subscription requirements validation schema
 * Optional text field for subscription prerequisites
 */
export const RequisitiSottoscrizioneSchema = z.string()
  .trim()
  .max(1000, 'Requisiti sottoscrizione non possono superare 1000 caratteri')
  .optional()
  .or(z.literal('').transform(() => undefined))

/**
 * Dual fuel activation methods validation schema
 * Optional array of activation methods
 */
export const ModalitaAttivazioneDualSchema = z.array(
  z.enum(
    Object.keys(MODALITA_ATTIVAZIONE) as [keyof typeof MODALITA_ATTIVAZIONE, ...Array<keyof typeof MODALITA_ATTIVAZIONE>],
    { errorMap: () => ({ message: 'Modalità di attivazione non valida' }) }
  )
)
  .min(1, 'Almeno una modalità di attivazione è richiesta')
  .max(6, 'Massimo 6 modalità di attivazione consentite')
  .refine(
    methods => {
      const uniqueMethods = new Set(methods)
      return uniqueMethods.size === methods.length
    },
    'Modalità di attivazione duplicate non consentite'
  )
  .optional()

/**
 * Base Step 8 validation schema
 * Before conditional validation rules
 */
export const Step8BaseSchema = z.object({
  // Dual offer flag
  is_dual_offer: IsDualOfferSchema,
  
  // Commodity inclusion flags
  elettricita_inclusa: ElettriciltaInclusaSchema,
  gas_incluso: GasInclusoSchema,
  
  // Dual fuel discount
  sconto_dual: ScontoDualFuelSchema,
  
  // Dual fuel specific content
  condizioni_dual: CondizioniDualFuelSchema,
  vantaggi_dual: VantaggiDualFuelSchema,
  requisiti_sottoscrizione: RequisitiSottoscrizioneSchema,
  
  // Activation methods
  modalita_attivazione_dual: ModalitaAttivazioneDualSchema,
})

/**
 * Step 8 validation schema with dual offer conditional logic
 * Applies business rules based on dual offer configuration
 */
export const Step8Schema = Step8BaseSchema.refine(
  data => {
    // If dual offer, both electricity and gas must be included
    if (data.is_dual_offer) {
      if (!data.elettricita_inclusa || !data.gas_incluso) {
        return false
      }
    }
    return true
  },
  {
    message: 'Offerte dual fuel devono includere sia elettricità che gas',
    path: ['is_dual_offer']
  }
).refine(
  data => {
    // If not dual offer, dual-specific fields should not be set
    if (!data.is_dual_offer) {
      if (data.elettricita_inclusa || data.gas_incluso || 
          data.sconto_dual !== undefined ||
          data.condizioni_dual || data.vantaggi_dual ||
          data.requisiti_sottoscrizione || data.modalita_attivazione_dual) {
        return false
      }
    }
    return true
  },
  {
    message: 'Campi dual fuel non sono applicabili per offerte non dual fuel',
    path: ['is_dual_offer']
  }
).refine(
  data => {
    // If dual offer with discount, must have dual fuel advantages or conditions
    if (data.is_dual_offer && data.sconto_dual !== undefined && data.sconto_dual > 0) {
      if (!data.vantaggi_dual && !data.condizioni_dual) {
        return false
      }
    }
    return true
  },
  {
    message: 'Offerte dual fuel con sconto devono specificare vantaggi o condizioni',
    path: ['sconto_dual']
  }
)

/**
 * TypeScript type inference for Step 8 data
 */
export type Step8Data = z.infer<typeof Step8Schema>

/**
 * Default values for Step 8 form
 * Used by NuQS for URL state initialization
 */
export const Step8Defaults: Partial<Step8Data> = {
  is_dual_offer: undefined,
  elettricita_inclusa: undefined,
  gas_incluso: undefined,
  sconto_dual: undefined,
  condizioni_dual: undefined,
  vantaggi_dual: undefined,
  requisiti_sottoscrizione: undefined,
  modalita_attivazione_dual: undefined,
}

/**
 * Step 8 field labels in Italian
 * For form components and validation messages
 */
export const Step8Labels = {
  is_dual_offer: 'Offerta Dual Fuel',
  elettricita_inclusa: 'Elettricità Inclusa',
  gas_incluso: 'Gas Incluso',
  sconto_dual: 'Sconto Dual Fuel (%)',
  condizioni_dual: 'Condizioni Dual Fuel',
  vantaggi_dual: 'Vantaggi Dual Fuel',
  requisiti_sottoscrizione: 'Requisiti Sottoscrizione',
  modalita_attivazione_dual: 'Modalità Attivazione Dual',
} as const

/**
 * Step 8 field descriptions
 * Additional help text for form fields
 */
export const Step8Descriptions = {
  is_dual_offer: 'Indica se l\'offerta include sia elettricità che gas',
  elettricita_inclusa: 'Conferma che l\'elettricità è inclusa nell\'offerta dual fuel',
  gas_incluso: 'Conferma che il gas è incluso nell\'offerta dual fuel',
  sconto_dual: 'Percentuale di sconto applicata per l\'attivazione dual fuel (0-100%)',
  condizioni_dual: 'Condizioni specifiche per l\'offerta dual fuel (max 2000 caratteri)',
  vantaggi_dual: 'Vantaggi specifici dell\'offerta dual fuel (max 2000 caratteri)',
  requisiti_sottoscrizione: 'Requisiti necessari per sottoscrivere l\'offerta dual (max 1000 caratteri)',
  modalita_attivazione_dual: 'Modalità disponibili per attivare l\'offerta dual fuel',
} as const

/**
 * Step 8 validation helper
 * Safe parse function with Italian error messages
 */
export function validateStep8(data: unknown): {
  success: true
  data: Step8Data
} | {
  success: false
  errors: Record<string, string>
} {
  const result = Step8Schema.safeParse(data)
  
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
 * Check if Step 8 is valid and complete
 * Used for step navigation validation
 */
export function isStep8Complete(data: Partial<Step8Data>): boolean {
  const result = Step8Schema.safeParse(data)
  return result.success
}

/**
 * Get validation errors for specific field
 * Used for real-time field validation with context
 */
export function getStep8FieldError(
  fieldName: keyof Step8Data,
  value: unknown,
  contextData?: Partial<Step8Data>
): string | null {
  // For conditional fields, we need context
  const testData = { ...Step8Defaults, ...contextData, [fieldName]: value }
  const result = Step8Schema.safeParse(testData)
  
  if (result.success) {
    return null
  }
  
  // Find error for this specific field
  const fieldError = result.error.errors.find(err => err.path[0] === fieldName)
  return fieldError?.message || null
}

/**
 * Format Step 8 data for XML generation
 * Converts form data to XML field names
 */
export function formatStep8ForXML(data: Step8Data) {
  return {
    IS_DUAL_OFFER: data.is_dual_offer,
    ELETTRICITA_INCLUSA: data.elettricita_inclusa,
    GAS_INCLUSO: data.gas_incluso,
    SCONTO_DUAL_FUEL: data.sconto_dual,
    CONDIZIONI_DUAL_FUEL: data.condizioni_dual,
    VANTAGGI_DUAL_FUEL: data.vantaggi_dual,
    REQUISITI_SOTTOSCRIZIONE: data.requisiti_sottoscrizione,
    MODALITA_ATTIVAZIONE_DUAL: data.modalita_attivazione_dual,
  }
}

/**
 * Check if offer is dual fuel
 * Helper for conditional field display
 */
export function isDualFuelOffer(data: Partial<Step8Data>): boolean {
  return data.is_dual_offer === true
}

/**
 * Get required fields for dual fuel offers
 * Helper for dynamic form rendering
 */
export function getRequiredFieldsForDualOffer(isDual: boolean): Array<keyof Step8Data> {
  if (!isDual) {
    return []
  }
  
  return ['is_dual_offer', 'elettricita_inclusa', 'gas_incluso']
}

/**
 * Calculate dual fuel savings
 * Helper for displaying potential savings
 */
export function calculateDualFuelSavings(discount?: number, basePrice?: number): number | null {
  if (!discount || !basePrice) return null
  
  return (basePrice * discount) / 100
}

/**
 * Get dual fuel offer summary
 * Helper for displaying dual fuel information
 */
export function getDualFuelSummary(data: Step8Data) {
  const summary = {
    isDualFuel: isDualFuelOffer(data),
    hasElectricity: data.elettricita_inclusa || false,
    hasGas: data.gas_incluso || false,
    hasDiscount: (data.sconto_dual !== undefined && data.sconto_dual > 0),
    discountPercentage: data.sconto_dual,
    hasConditions: !!data.condizioni_dual,
    hasAdvantages: !!data.vantaggi_dual,
    hasRequirements: !!data.requisiti_sottoscrizione,
    activationMethodsCount: data.modalita_attivazione_dual?.length || 0,
    totalCharacters: 0,
  }
  
  // Calculate total character count
  summary.totalCharacters = (data.condizioni_dual?.length || 0) +
    (data.vantaggi_dual?.length || 0) +
    (data.requisiti_sottoscrizione?.length || 0)
  
  return summary
}

/**
 * Validate dual fuel offer completeness
 * Business logic validation for dual fuel quality
 */
export function validateDualFuelCompleteness(data: Step8Data): {
  isValid: boolean
  warnings: string[]
  suggestions: string[]
} {
  const warnings: string[] = []
  const suggestions: string[] = []
  const summary = getDualFuelSummary(data)
  
  if (!summary.isDualFuel) {
    return { isValid: true, warnings, suggestions }
  }
  
  // Business logic validations for dual fuel offers
  if (!summary.hasElectricity || !summary.hasGas) {
    warnings.push('Offerta dual fuel deve includere sia elettricità che gas')
  }
  
  if (!summary.hasDiscount) {
    suggestions.push('Considerare l\'aggiunta di uno sconto per rendere l\'offerta dual fuel più attraente')
  }
  
  if (summary.hasDiscount && summary.discountPercentage && summary.discountPercentage > 30) {
    warnings.push('Sconto superiore al 30% potrebbe essere troppo elevato')
  }
  
  if (summary.hasDiscount && !summary.hasAdvantages && !summary.hasConditions) {
    warnings.push('Offerte con sconto dovrebbero specificare vantaggi o condizioni')
  }
  
  if (!summary.hasAdvantages) {
    suggestions.push('Aggiungere vantaggi specifici per l\'offerta dual fuel')
  }
  
  if (summary.activationMethodsCount === 0) {
    suggestions.push('Specificare le modalità di attivazione per l\'offerta dual fuel')
  }
  
  if (summary.activationMethodsCount > 4) {
    suggestions.push('Troppi metodi di attivazione potrebbero confondere i clienti')
  }
  
  if (summary.totalCharacters > 5000) {
    warnings.push('Contenuto totale molto esteso per un\'offerta dual fuel')
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  }
}

/**
 * Get dual fuel discount description
 * Helper for displaying discount information
 */
export function getDualFuelDiscountDescription(discount?: number): string {
  if (!discount || discount === 0) {
    return 'Nessuno sconto applicato'
  }
  
  if (discount < 5) {
    return `Sconto minimo del ${discount}%`
  } else if (discount <= 15) {
    return `Sconto competitivo del ${discount}%`
  } else if (discount <= 25) {
    return `Sconto vantaggioso del ${discount}%`
  } else {
    return `Sconto eccezionale del ${discount}%`
  }
}

/**
 * Get activation methods summary
 * Helper for displaying activation options
 */
export function getActivationMethodsSummary(methods?: ModalitaAttivazione[]): {
  count: number
  hasWeb: boolean
  hasPhone: boolean
  hasPhysical: boolean
  description: string
} {
  if (!methods || methods.length === 0) {
    return {
      count: 0,
      hasWeb: false,
      hasPhone: false,
      hasPhysical: false,
      description: 'Nessuna modalità specificata'
    }
  }
  
  const hasWeb = methods.includes('WEB')
  const hasPhone = methods.includes('TELEVENDITA')
  const hasPhysical = methods.includes('PUNTO_VENDITA') || methods.includes('AGENZIA')
  
  let description = ''
  if (methods.length === 1) {
    description = 'Attivazione singola modalità'
  } else if (methods.length <= 3) {
    description = 'Attivazione multi-canale'
  } else {
    description = 'Attivazione omnicanale'
  }
  
  return {
    count: methods.length,
    hasWeb,
    hasPhone,
    hasPhysical,
    description
  }
}

/**
 * Step 8 form validation state type
 * Used by form components for validation display
 */
export type Step8ValidationState = {
  [K in keyof Step8Data]: {
    value: Step8Data[K]
    error: string | null
    isValid: boolean
    isRequired: boolean
  }
}

/**
 * Create initial validation state
 * Used by form components initialization
 */
export function createStep8ValidationState(
  initialData: Partial<Step8Data> = {}
): Step8ValidationState {
  const data = { ...Step8Defaults, ...initialData }
  const isDual = isDualFuelOffer(data)
  
  return {
    is_dual_offer: {
      value: data.is_dual_offer,
      error: null,
      isValid: true,
      isRequired: false,
    },
    elettricita_inclusa: {
      value: data.elettricita_inclusa,
      error: null,
      isValid: !isDual,
      isRequired: isDual,
    },
    gas_incluso: {
      value: data.gas_incluso,
      error: null,
      isValid: !isDual,
      isRequired: isDual,
    },
    sconto_dual: {
      value: data.sconto_dual,
      error: null,
      isValid: true,
      isRequired: false,
    },
    condizioni_dual: {
      value: data.condizioni_dual,
      error: null,
      isValid: true,
      isRequired: false,
    },
    vantaggi_dual: {
      value: data.vantaggi_dual,
      error: null,
      isValid: true,
      isRequired: false,
    },
    requisiti_sottoscrizione: {
      value: data.requisiti_sottoscrizione,
      error: null,
      isValid: true,
      isRequired: false,
    },
    modalita_attivazione_dual: {
      value: data.modalita_attivazione_dual,
      error: null,
      isValid: true,
      isRequired: false,
    },
  }
}

/**
 * Validate dual fuel business rules
 * Specific validation for dual fuel requirements
 */
export function validateDualFuelBusinessRules(data: Step8Data): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!isDualFuelOffer(data)) {
    return { isValid: true, errors, warnings }
  }
  
  // Dual fuel specific validations
  if (!data.elettricita_inclusa) {
    errors.push('Elettricità deve essere inclusa nell\'offerta dual fuel')
  }
  
  if (!data.gas_incluso) {
    errors.push('Gas deve essere incluso nell\'offerta dual fuel')
  }
  
  if (data.sconto_dual !== undefined) {
    if (data.sconto_dual < 0) {
      errors.push('Sconto dual fuel non può essere negativo')
    }
    if (data.sconto_dual > 100) {
      errors.push('Sconto dual fuel non può superare 100%')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
} 