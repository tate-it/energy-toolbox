/**
 * Step 5: Energy Price References (Riferimenti Prezzi Energia)
 * Zod validation schema for SII XML Generator Step 5
 * 
 * Fields:
 * - PREZZO_RIFERIMENTO: Price reference type (mandatory, from SII constants)
 * - PREZZO_FISSO: Fixed price (conditional, required for fixed pricing)
 * - PREZZO_VARIABILE_FORMULA: Variable price formula (conditional, required for variable pricing)
 * - FASCE_ORARIE: Time bands configuration (conditional, for multi-band pricing)
 * - PREZZO_F1, PREZZO_F2, PREZZO_F3: Band-specific prices (conditional on time bands)
 * - INDICIZZAZIONE: Indexation type (optional, for variable pricing)
 * - SPREAD: Spread value (optional, for indexed pricing)
 * 
 * Validation Rules:
 * - Price reference type determines which fields are required
 * - Fixed pricing requires PREZZO_FISSO
 * - Variable pricing may require formula or indexation
 * - Time band pricing requires band-specific prices
 * - All price values must be positive numbers with max 6 decimal places
 * - Formulas must be valid text descriptions in Italian
 */

import { z } from 'zod'
import {
  PREZZO_RIFERIMENTO,
  FASCE_ORARIE,
  IDX_PREZZO_ENERGIA,
  type PrezzoRiferimentoType,
  type FasceOrarieType
} from '../constants'

/**
 * Price value validation schema
 * Validates monetary amounts with proper precision
 */
export const PriceValueSchema = z.number()
  .min(0, 'Il prezzo deve essere positivo')
  .max(9999.999999, 'Il prezzo non può superare 9999.999999')
  .refine(
    val => {
      const decimals = val.toString().split('.')[1]
      return !decimals || decimals.length <= 6
    },
    'Il prezzo può avere massimo 6 decimali'
  )

/**
 * Price reference type validation
 * Determines which conditional fields are required
 */
export const PrezzoRiferimentoSchema = z.enum(
  Object.keys(PREZZO_RIFERIMENTO) as [keyof typeof PREZZO_RIFERIMENTO, ...Array<keyof typeof PREZZO_RIFERIMENTO>],
  { errorMap: () => ({ message: 'Tipo di prezzo di riferimento non valido' }) }
)

/**
 * Fixed price validation schema
 * Required when price reference is fixed
 */
export const PrezzoFissoSchema = PriceValueSchema.optional()

/**
 * Variable price formula validation schema
 * Required for variable pricing types
 */
export const PrezzoVariabileFormulaSchema = z.string()
  .trim()
  .min(1, 'Formula prezzo variabile è obbligatoria per prezzi variabili')
  .max(500, 'Formula prezzo variabile non può superare 500 caratteri')
  .optional()

/**
 * Time bands configuration validation
 * Optional field for multi-band pricing
 */
export const FasceOrarieSchema = z.enum(
  Object.keys(FASCE_ORARIE) as [keyof typeof FASCE_ORARIE, ...Array<keyof typeof FASCE_ORARIE>],
  { errorMap: () => ({ message: 'Configurazione fasce orarie non valida' }) }
).optional()

/**
 * Band-specific price schemas
 * Required when time bands are configured
 */
export const PrezzoF1Schema = PriceValueSchema.optional()
export const PrezzoF2Schema = PriceValueSchema.optional()
export const PrezzoF3Schema = PriceValueSchema.optional()

/**
 * Indexation type validation
 * Optional for variable pricing
 */
export const IndicizzazioneSchema = z.enum(
  Object.keys(IDX_PREZZO_ENERGIA) as [keyof typeof IDX_PREZZO_ENERGIA, ...Array<keyof typeof IDX_PREZZO_ENERGIA>],
  { errorMap: () => ({ message: 'Tipo di indicizzazione non valido' }) }
).optional()

/**
 * Spread value validation
 * Optional spread for indexed pricing
 */
export const SpreadSchema = z.number()
  .min(-999.999999, 'Lo spread non può essere inferiore a -999.999999')
  .max(999.999999, 'Lo spread non può superare 999.999999')
  .refine(
    val => {
      const decimals = val.toString().split('.')[1]
      return !decimals || decimals.length <= 6
    },
    'Lo spread può avere massimo 6 decimali'
  )
  .optional()

/**
 * Base Step 5 validation schema
 * Before conditional validation rules
 */
export const Step5BaseSchema = z.object({
  // Price reference type - mandatory
  prezzo_rif: PrezzoRiferimentoSchema,
  
  // Price values - conditional based on reference type
  prezzo_fisso: PrezzoFissoSchema,
  prezzo_var_formula: PrezzoVariabileFormulaSchema,
  
  // Time bands configuration - optional
  fasce_orarie: FasceOrarieSchema,
  
  // Band-specific prices - conditional on time bands
  prezzo_f1: PrezzoF1Schema,
  prezzo_f2: PrezzoF2Schema,
  prezzo_f3: PrezzoF3Schema,
  
  // Indexation - optional for variable pricing
  indicizzazione: IndicizzazioneSchema,
  spread: SpreadSchema,
})

/**
 * Step 5 validation schema with conditional logic
 * Applies business rules based on price reference type
 */
export const Step5Schema = Step5BaseSchema.refine(
  data => {
    // Fixed pricing requires fixed price value
    if (data.prezzo_rif === PREZZO_RIFERIMENTO.FISSO && (data.prezzo_fisso === undefined || data.prezzo_fisso === null)) {
      return false
    }
    
    // Variable pricing should have formula or indexation
    if (data.prezzo_rif === PREZZO_RIFERIMENTO.VARIABILE && !data.prezzo_var_formula && !data.indicizzazione) {
      return false
    }
    
    return true
  },
  {
    message: 'Configurazione prezzo non valida per il tipo selezionato',
    path: ['prezzo_rif']
  }
).refine(
  data => {
    // Time bands require band-specific prices
    if (data.fasce_orarie) {
      switch (data.fasce_orarie) {
        case FASCE_ORARIE.MONORARIA:
          return data.prezzo_f1 !== undefined
        case FASCE_ORARIE.BIORARIA:
          return data.prezzo_f1 !== undefined && data.prezzo_f2 !== undefined
        case FASCE_ORARIE.MULTIORARIA:
          return data.prezzo_f1 !== undefined && data.prezzo_f2 !== undefined && data.prezzo_f3 !== undefined
        default:
          return true
      }
    }
    return true
  },
  {
    message: 'Prezzi per fasce orarie mancanti',
    path: ['fasce_orarie']
  }
).refine(
  data => {
    // Band prices should only be set when time bands are configured
    const hasBandPrices = data.prezzo_f1 !== undefined || data.prezzo_f2 !== undefined || data.prezzo_f3 !== undefined
    
    if (hasBandPrices && !data.fasce_orarie) {
      return false
    }
    
    return true
  },
  {
    message: 'Fasce orarie richieste quando sono specificati prezzi per fascia',
    path: ['fasce_orarie']
  }
)

/**
 * TypeScript type inference for Step 5 data
 */
export type Step5Data = z.infer<typeof Step5Schema>

/**
 * Default values for Step 5 form
 * Used by NuQS for URL state initialization
 */
export const Step5Defaults: Partial<Step5Data> = {
  prezzo_rif: undefined,
  prezzo_fisso: undefined,
  prezzo_var_formula: undefined,
  fasce_orarie: undefined,
  prezzo_f1: undefined,
  prezzo_f2: undefined,
  prezzo_f3: undefined,
  indicizzazione: undefined,
  spread: undefined,
}

/**
 * Step 5 field labels in Italian
 * For form components and validation messages
 */
export const Step5Labels = {
  prezzo_rif: 'Prezzo di Riferimento',
  prezzo_fisso: 'Prezzo Fisso (€/kWh)',
  prezzo_var_formula: 'Formula Prezzo Variabile',
  fasce_orarie: 'Fasce Orarie',
  prezzo_f1: 'Prezzo F1 (€/kWh)',
  prezzo_f2: 'Prezzo F2 (€/kWh)', 
  prezzo_f3: 'Prezzo F3 (€/kWh)',
  indicizzazione: 'Tipo Indicizzazione',
  spread: 'Spread (€/kWh)',
} as const

/**
 * Step 5 field descriptions
 * Additional help text for form fields
 */
export const Step5Descriptions = {
  prezzo_rif: 'Tipo di riferimento per il prezzo dell\'energia',
  prezzo_fisso: 'Prezzo fisso applicato per tutta la durata del contratto',
  prezzo_var_formula: 'Formula per il calcolo del prezzo variabile (max 500 caratteri)',
  fasce_orarie: 'Configurazione delle fasce orarie per prezzi differenziati',
  prezzo_f1: 'Prezzo per fascia F1 (ore di punta)',
  prezzo_f2: 'Prezzo per fascia F2 (ore intermedie)',
  prezzo_f3: 'Prezzo per fascia F3 (ore fuori punta)',
  indicizzazione: 'Tipo di indicizzazione per prezzi variabili',
  spread: 'Spread applicato al prezzo indicizzato',
} as const

/**
 * Step 5 validation helper
 * Safe parse function with Italian error messages
 */
export function validateStep5(data: unknown): {
  success: true
  data: Step5Data
} | {
  success: false
  errors: Record<string, string>
} {
  const result = Step5Schema.safeParse(data)
  
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
 * Check if Step 5 is valid and complete
 * Used for step navigation validation
 */
export function isStep5Complete(data: Partial<Step5Data>): boolean {
  const result = Step5Schema.safeParse(data)
  return result.success
}

/**
 * Get validation errors for specific field
 * Used for real-time field validation
 */
export function getStep5FieldError(
  fieldName: keyof Step5Data,
  value: unknown,
  contextData?: Partial<Step5Data>
): string | null {
  // For conditional fields, we need context
  const testData = { ...Step5Defaults, ...contextData, [fieldName]: value }
  const result = Step5Schema.safeParse(testData)
  
  if (result.success) {
    return null
  }
  
  // Find error for this specific field
  const fieldError = result.error.errors.find(err => err.path[0] === fieldName)
  return fieldError?.message || null
}

/**
 * Format Step 5 data for XML generation
 * Converts form data to XML field names
 */
export function formatStep5ForXML(data: Step5Data) {
  return {
    PREZZO_RIFERIMENTO: data.prezzo_rif,
    PREZZO_FISSO: data.prezzo_fisso,
    PREZZO_VARIABILE_FORMULA: data.prezzo_var_formula,
    FASCE_ORARIE: data.fasce_orarie,
    PREZZO_F1: data.prezzo_f1,
    PREZZO_F2: data.prezzo_f2,
    PREZZO_F3: data.prezzo_f3,
    INDICIZZAZIONE: data.indicizzazione,
    SPREAD: data.spread,
  }
}

/**
 * Get required fields based on price reference type
 * Helper for dynamic form rendering
 */
export function getRequiredFieldsForPriceType(priceType: PrezzoRiferimentoType): Array<keyof Step5Data> {
  const required: Array<keyof Step5Data> = ['prezzo_rif']
  
  switch (priceType) {
    case PREZZO_RIFERIMENTO.FISSO:
      required.push('prezzo_fisso')
      break
    case PREZZO_RIFERIMENTO.VARIABILE:
      // Variable pricing needs either formula or indexation
      break
    case PREZZO_RIFERIMENTO.INDICIZZATO:
      required.push('indicizzazione')
      break
  }
  
  return required
}

/**
 * Get required band prices based on time bands configuration
 * Helper for dynamic form rendering
 */
export function getRequiredBandPrices(fasceOrarie: FasceOrarieType): Array<keyof Step5Data> {
  switch (fasceOrarie) {
    case FASCE_ORARIE.MONORARIA:
      return ['prezzo_f1']
    case FASCE_ORARIE.BIORARIA:
      return ['prezzo_f1', 'prezzo_f2']
    case FASCE_ORARIE.MULTIORARIA:
      return ['prezzo_f1', 'prezzo_f2', 'prezzo_f3']
    default:
      return []
  }
}

/**
 * Calculate total pricing information
 * Helper for pricing summary display
 */
export function calculatePricingSummary(data: Step5Data) {
  const summary = {
    type: data.prezzo_rif,
    hasFixedPrice: data.prezzo_fisso !== undefined,
    hasVariableFormula: !!data.prezzo_var_formula,
    hasIndexation: !!data.indicizzazione,
    hasTimeBands: !!data.fasce_orarie,
    bandCount: 0,
    avgPrice: 0,
    priceRange: { min: 0, max: 0 },
  }
  
  // Calculate band-related metrics
  if (data.fasce_orarie) {
    const prices = [data.prezzo_f1, data.prezzo_f2, data.prezzo_f3].filter(p => p !== undefined) as number[]
    summary.bandCount = prices.length
    
    if (prices.length > 0) {
      summary.avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
      summary.priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices)
      }
    }
  } else if (data.prezzo_fisso !== undefined) {
    summary.avgPrice = data.prezzo_fisso
    summary.priceRange = { min: data.prezzo_fisso, max: data.prezzo_fisso }
  }
  
  return summary
}

/**
 * Validate pricing configuration completeness
 * Business logic validation for pricing quality
 */
export function validatePricingCompleteness(data: Step5Data): {
  isValid: boolean
  warnings: string[]
  suggestions: string[]
} {
  const warnings: string[] = []
  const suggestions: string[] = []
  
  // Check for incomplete configurations
  if (data.prezzo_rif === PREZZO_RIFERIMENTO.VARIABILE && !data.prezzo_var_formula && !data.indicizzazione) {
    warnings.push('Prezzo variabile richiede formula o indicizzazione')
  }
  
  if (data.indicizzazione && data.spread === undefined) {
    suggestions.push('Considerare l\'aggiunta di uno spread per prezzi indicizzati')
  }
  
  if (data.fasce_orarie && data.prezzo_fisso !== undefined) {
    warnings.push('Prezzo fisso non compatibile con fasce orarie')
  }
  
  // Price reasonableness checks
  const prices = [data.prezzo_fisso, data.prezzo_f1, data.prezzo_f2, data.prezzo_f3].filter(p => p !== undefined) as number[]
  
  if (prices.some(price => price > 1)) {
    warnings.push('Prezzi superiori a 1 €/kWh sono inusuali')
  }
  
  if (prices.some(price => price < 0.01)) {
    warnings.push('Prezzi inferiori a 0.01 €/kWh sono inusuali')
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  }
}

/**
 * Step 5 form validation state type
 * Used by form components for validation display
 */
export type Step5ValidationState = {
  [K in keyof Step5Data]: {
    value: Step5Data[K]
    error: string | null
    isValid: boolean
    isRequired: boolean
  }
}

/**
 * Create initial validation state
 * Used by form components initialization
 */
export function createStep5ValidationState(
  initialData: Partial<Step5Data> = {}
): Step5ValidationState {
  const data = { ...Step5Defaults, ...initialData }
  
  return {
    prezzo_rif: {
      value: data.prezzo_rif,
      error: null,
      isValid: false,
      isRequired: true,
    },
    prezzo_fisso: {
      value: data.prezzo_fisso,
      error: null,
      isValid: true,
      isRequired: data.prezzo_rif === PREZZO_RIFERIMENTO.FISSO,
    },
    prezzo_var_formula: {
      value: data.prezzo_var_formula,
      error: null,
      isValid: true,
      isRequired: data.prezzo_rif === PREZZO_RIFERIMENTO.VARIABILE,
    },
    fasce_orarie: {
      value: data.fasce_orarie,
      error: null,
      isValid: true,
      isRequired: false,
    },
    prezzo_f1: {
      value: data.prezzo_f1,
      error: null,
      isValid: true,
      isRequired: !!data.fasce_orarie,
    },
    prezzo_f2: {
      value: data.prezzo_f2,
      error: null,
      isValid: true,
      isRequired: data.fasce_orarie === FASCE_ORARIE.BIORARIA || data.fasce_orarie === FASCE_ORARIE.MULTIORARIA,
    },
    prezzo_f3: {
      value: data.prezzo_f3,
      error: null,
      isValid: true,
      isRequired: data.fasce_orarie === FASCE_ORARIE.MULTIORARIA,
    },
    indicizzazione: {
      value: data.indicizzazione,
      error: null,
      isValid: true,
      isRequired: data.prezzo_rif === PREZZO_RIFERIMENTO.INDICIZZATO,
    },
    spread: {
      value: data.spread,
      error: null,
      isValid: true,
      isRequired: false,
    },
  }
} 