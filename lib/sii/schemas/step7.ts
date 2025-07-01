/**
 * Step 7: Offer Characteristics (Caratteristiche Offerta)
 * Zod validation schema for SII XML Generator Step 7
 * 
 * Fields:
 * - TIPO_OFFERTA: Offer type (mandatory, FISSA/VARIABILE/FLAT)
 * - DESCRIZIONE_OFFERTA: Offer description (mandatory, max 3000 characters)
 * - FLAT_CARATTERISTICHE: FLAT-specific characteristics (conditional, required for FLAT offers)
 * - FLAT_DURATA_MESI: FLAT duration in months (conditional, required for FLAT offers)
 * - FLAT_PREZZO_FISSO: FLAT fixed price component (conditional, for FLAT offers)
 * - FLAT_COMPONENTE_VARIABILE: FLAT variable component (conditional, for FLAT offers)
 * - VANTAGGI_OFFERTA: Offer advantages (optional, max 2000 characters)
 * - CONDIZIONI_PARTICOLARI: Special conditions (optional, max 2000 characters)
 * 
 * Validation Rules:
 * - Offer type determines which additional fields are required
 * - FLAT offers require specific FLAT characteristics and duration
 * - FLAT duration must be between 1-120 months
 * - All text fields have specific character limits per SII specification
 * - Description is mandatory for all offer types
 * - FLAT offers have additional business rule validations
 */

import { z } from 'zod'
import {
  TIPO_OFFERTA,
  type TipoOfferta
} from '../constants'

/**
 * Offer type validation schema
 * Determines which conditional fields are required
 */
export const TipoOffertaSchema = z.enum(
  Object.keys(TIPO_OFFERTA) as [keyof typeof TIPO_OFFERTA, ...Array<keyof typeof TIPO_OFFERTA>],
  { errorMap: () => ({ message: 'Tipo di offerta non valido' }) }
)

/**
 * Offer description validation schema
 * Mandatory field with character limit
 */
export const DescrizioneOffertaSchema = z.string()
  .trim()
  .min(1, 'Descrizione offerta è obbligatoria')
  .max(3000, 'Descrizione offerta non può superare 3000 caratteri')

/**
 * FLAT characteristics validation schema
 * Required for FLAT offers, describes the FLAT offer structure
 */
export const FlatCaratteristicheSchema = z.string()
  .trim()
  .min(1, 'Caratteristiche FLAT sono obbligatorie per offerte FLAT')
  .max(1000, 'Caratteristiche FLAT non possono superare 1000 caratteri')
  .optional()

/**
 * FLAT duration validation schema
 * Required for FLAT offers, duration in months
 */
export const FlatDurataMesiSchema = z.number()
  .int('Durata FLAT deve essere un numero intero di mesi')
  .min(1, 'Durata FLAT deve essere almeno 1 mese')
  .max(120, 'Durata FLAT non può superare 120 mesi (10 anni)')
  .optional()

/**
 * FLAT fixed price component validation schema
 * Optional for FLAT offers, monetary value
 */
export const FlatPrezzoFissoSchema = z.number()
  .min(0, 'Componente prezzo fisso FLAT deve essere positiva')
  .max(9999.999999, 'Componente prezzo fisso FLAT non può superare 9999.999999')
  .refine(
    val => {
      const decimals = val.toString().split('.')[1]
      return !decimals || decimals.length <= 6
    },
    'Componente prezzo fisso FLAT può avere massimo 6 decimali'
  )
  .optional()

/**
 * FLAT variable component validation schema
 * Optional for FLAT offers, percentage or formula description
 */
export const FlatComponenteVariabileSchema = z.string()
  .trim()
  .max(500, 'Componente variabile FLAT non può superare 500 caratteri')
  .optional()
  .or(z.literal('').transform(() => undefined))

/**
 * Offer advantages validation schema
 * Optional text field describing offer benefits
 */
export const VantaggiOffertaSchema = z.string()
  .trim()
  .max(2000, 'Vantaggi offerta non possono superare 2000 caratteri')
  .optional()
  .or(z.literal('').transform(() => undefined))

/**
 * Special conditions validation schema
 * Optional text field for special terms and conditions
 */
export const CondizioniParticolariSchema = z.string()
  .trim()
  .max(2000, 'Condizioni particolari non possono superare 2000 caratteri')
  .optional()
  .or(z.literal('').transform(() => undefined))

/**
 * Base Step 7 validation schema
 * Before conditional validation rules
 */
export const Step7BaseSchema = z.object({
  // Offer type - mandatory
  tipo_offerta: TipoOffertaSchema,
  
  // Offer description - mandatory
  descrizione: DescrizioneOffertaSchema,
  
  // FLAT-specific fields - conditional
  flat_caratteristiche: FlatCaratteristicheSchema,
  flat_durata_mesi: FlatDurataMesiSchema,
  flat_prezzo_fisso: FlatPrezzoFissoSchema,
  flat_comp_variabile: FlatComponenteVariabileSchema,
  
  // Optional fields for all offer types
  vantaggi: VantaggiOffertaSchema,
  condizioni_particolari: CondizioniParticolariSchema,
})

/**
 * Step 7 validation schema with FLAT-specific conditional logic
 * Applies business rules based on offer type
 */
export const Step7Schema = Step7BaseSchema.refine(
  data => {
    // FLAT offers require FLAT characteristics
    if (data.tipo_offerta === TIPO_OFFERTA.FLAT && !data.flat_caratteristiche) {
      return false
    }
    return true
  },
  {
    message: 'Caratteristiche FLAT sono obbligatorie per offerte FLAT',
    path: ['flat_caratteristiche']
  }
).refine(
  data => {
    // FLAT offers require duration in months
    if (data.tipo_offerta === TIPO_OFFERTA.FLAT && (data.flat_durata_mesi === undefined || data.flat_durata_mesi === null)) {
      return false
    }
    return true
  },
  {
    message: 'Durata in mesi è obbligatoria per offerte FLAT',
    path: ['flat_durata_mesi']
  }
).refine(
  data => {
    // Non-FLAT offers should not have FLAT-specific fields
    if (data.tipo_offerta !== TIPO_OFFERTA.FLAT) {
      if (data.flat_caratteristiche || data.flat_durata_mesi !== undefined || 
          data.flat_prezzo_fisso !== undefined || data.flat_comp_variabile) {
        return false
      }
    }
    return true
  },
  {
    message: 'Campi FLAT non sono applicabili per offerte non-FLAT',
    path: ['tipo_offerta']
  }
).refine(
  data => {
    // FLAT offers should have at least one price component (fixed or variable)
    if (data.tipo_offerta === TIPO_OFFERTA.FLAT) {
      if (data.flat_prezzo_fisso === undefined && !data.flat_comp_variabile) {
        return false
      }
    }
    return true
  },
  {
    message: 'Offerte FLAT devono avere almeno una componente di prezzo (fissa o variabile)',
    path: ['flat_prezzo_fisso']
  }
)

/**
 * TypeScript type inference for Step 7 data
 */
export type Step7Data = z.infer<typeof Step7Schema>

/**
 * Default values for Step 7 form
 * Used by NuQS for URL state initialization
 */
export const Step7Defaults: Partial<Step7Data> = {
  tipo_offerta: undefined,
  descrizione: '',
  flat_caratteristiche: undefined,
  flat_durata_mesi: undefined,
  flat_prezzo_fisso: undefined,
  flat_comp_variabile: undefined,
  vantaggi: undefined,
  condizioni_particolari: undefined,
}

/**
 * Step 7 field labels in Italian
 * For form components and validation messages
 */
export const Step7Labels = {
  tipo_offerta: 'Tipo Offerta',
  descrizione: 'Descrizione Offerta',
  flat_caratteristiche: 'Caratteristiche FLAT',
  flat_durata_mesi: 'Durata FLAT (Mesi)',
  flat_prezzo_fisso: 'Componente Prezzo Fisso FLAT (€/kWh)',
  flat_comp_variabile: 'Componente Variabile FLAT',
  vantaggi: 'Vantaggi Offerta',
  condizioni_particolari: 'Condizioni Particolari',
} as const

/**
 * Step 7 field descriptions
 * Additional help text for form fields
 */
export const Step7Descriptions = {
  tipo_offerta: 'Tipologia dell\'offerta commerciale',
  descrizione: 'Descrizione dettagliata dell\'offerta (max 3000 caratteri)',
  flat_caratteristiche: 'Descrizione delle caratteristiche specifiche dell\'offerta FLAT (max 1000 caratteri)',
  flat_durata_mesi: 'Durata del periodo FLAT in mesi (1-120 mesi)',
  flat_prezzo_fisso: 'Componente di prezzo fisso per il periodo FLAT',
  flat_comp_variabile: 'Descrizione della componente variabile FLAT (max 500 caratteri)',
  vantaggi: 'Principali vantaggi e benefici dell\'offerta (max 2000 caratteri)',
  condizioni_particolari: 'Condizioni specifiche e limitazioni (max 2000 caratteri)',
} as const

/**
 * Step 7 validation helper
 * Safe parse function with Italian error messages
 */
export function validateStep7(data: unknown): {
  success: true
  data: Step7Data
} | {
  success: false
  errors: Record<string, string>
} {
  const result = Step7Schema.safeParse(data)
  
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
 * Check if Step 7 is valid and complete
 * Used for step navigation validation
 */
export function isStep7Complete(data: Partial<Step7Data>): boolean {
  const result = Step7Schema.safeParse(data)
  return result.success
}

/**
 * Get validation errors for specific field
 * Used for real-time field validation with context
 */
export function getStep7FieldError(
  fieldName: keyof Step7Data,
  value: any,
  contextData?: Partial<Step7Data>
): string | null {
  // For conditional fields, we need context
  const testData = { ...Step7Defaults, ...contextData, [fieldName]: value }
  const result = Step7Schema.safeParse(testData)
  
  if (result.success) {
    return null
  }
  
  // Find error for this specific field
  const fieldError = result.error.errors.find(err => err.path[0] === fieldName)
  return fieldError?.message || null
}

/**
 * Format Step 7 data for XML generation
 * Converts form data to XML field names
 */
export function formatStep7ForXML(data: Step7Data) {
  return {
    TIPO_OFFERTA: data.tipo_offerta,
    DESCRIZIONE_OFFERTA: data.descrizione,
    FLAT_CARATTERISTICHE: data.flat_caratteristiche,
    FLAT_DURATA_MESI: data.flat_durata_mesi,
    FLAT_PREZZO_FISSO: data.flat_prezzo_fisso,
    FLAT_COMPONENTE_VARIABILE: data.flat_comp_variabile,
    VANTAGGI_OFFERTA: data.vantaggi,
    CONDIZIONI_PARTICOLARI: data.condizioni_particolari,
  }
}

/**
 * Get required fields based on offer type
 * Helper for dynamic form rendering
 */
export function getRequiredFieldsForOfferType(offerType: TipoOfferta): Array<keyof Step7Data> {
  const required: Array<keyof Step7Data> = ['tipo_offerta', 'descrizione']
  
  if (offerType === TIPO_OFFERTA.FLAT) {
    required.push('flat_caratteristiche', 'flat_durata_mesi')
  }
  
  return required
}

/**
 * Check if offer type is FLAT
 * Helper for conditional field display
 */
export function isFlatOffer(offerType?: TipoOfferta): boolean {
  return offerType === TIPO_OFFERTA.FLAT
}

/**
 * Get offer type description in Italian
 * Helper for displaying offer type information
 */
export function getOfferTypeDescription(offerType: TipoOfferta): string {
  switch (offerType) {
    case TIPO_OFFERTA.FISSA:
      return 'Offerta a prezzo fisso per tutta la durata contrattuale'
    case TIPO_OFFERTA.VARIABILE:
      return 'Offerta a prezzo variabile secondo parametri di mercato'
    case TIPO_OFFERTA.FLAT:
      return 'Offerta FLAT con periodo iniziale a condizioni speciali'
    default:
      return 'Tipo di offerta non specificato'
  }
}

/**
 * Calculate offer characteristics summary
 * Helper for displaying offer overview
 */
export function getOfferCharacteristicsSummary(data: Step7Data) {
  const summary = {
    type: data.tipo_offerta,
    hasDescription: !!data.descrizione,
    descriptionLength: data.descrizione?.length || 0,
    isFlat: isFlatOffer(data.tipo_offerta),
    flatDurationMonths: data.flat_durata_mesi,
    hasFixedComponent: data.flat_prezzo_fisso !== undefined,
    hasVariableComponent: !!data.flat_comp_variabile,
    hasAdvantages: !!data.vantaggi,
    hasSpecialConditions: !!data.condizioni_particolari,
    totalCharacters: 0,
  }
  
  // Calculate total character count
  summary.totalCharacters = (data.descrizione?.length || 0) +
    (data.flat_caratteristiche?.length || 0) +
    (data.flat_comp_variabile?.length || 0) +
    (data.vantaggi?.length || 0) +
    (data.condizioni_particolari?.length || 0)
  
  return summary
}

/**
 * Validate offer characteristics completeness
 * Business logic validation for offer quality
 */
export function validateOfferCompleteness(data: Step7Data): {
  isValid: boolean
  warnings: string[]
  suggestions: string[]
} {
  const warnings: string[] = []
  const suggestions: string[] = []
  const summary = getOfferCharacteristicsSummary(data)
  
  // Business logic validations
  if (summary.descriptionLength < 50) {
    warnings.push('Descrizione offerta molto breve (meno di 50 caratteri)')
  }
  
  if (summary.descriptionLength > 2500) {
    suggestions.push('Descrizione offerta molto lunga, considerare di essere più concisi')
  }
  
  if (summary.isFlat) {
    if (!summary.hasFixedComponent && !summary.hasVariableComponent) {
      warnings.push('Offerta FLAT dovrebbe avere almeno una componente di prezzo definita')
    }
    
    if (summary.flatDurationMonths && summary.flatDurationMonths > 24) {
      suggestions.push('Durata FLAT superiore a 24 mesi è inusuale')
    }
    
    if (summary.flatDurationMonths && summary.flatDurationMonths < 3) {
      warnings.push('Durata FLAT inferiore a 3 mesi potrebbe essere troppo breve')
    }
  }
  
  if (!summary.hasAdvantages) {
    suggestions.push('Considerare l\'aggiunta di vantaggi per rendere l\'offerta più attraente')
  }
  
  if (summary.totalCharacters > 8000) {
    warnings.push('Contenuto totale molto esteso, potrebbe essere difficile da leggere')
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  }
}

/**
 * Get FLAT offer duration description
 * Helper for displaying FLAT duration information
 */
export function getFlatDurationDescription(months?: number): string {
  if (!months) return 'Durata non specificata'
  
  if (months < 12) {
    return `${months} ${months === 1 ? 'mese' : 'mesi'}`
  } else {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    let description = `${years} ${years === 1 ? 'anno' : 'anni'}`
    if (remainingMonths > 0) {
      description += ` e ${remainingMonths} ${remainingMonths === 1 ? 'mese' : 'mesi'}`
    }
    
    return description
  }
}

/**
 * Step 7 form validation state type
 * Used by form components for validation display
 */
export type Step7ValidationState = {
  [K in keyof Step7Data]: {
    value: Step7Data[K]
    error: string | null
    isValid: boolean
    isRequired: boolean
  }
}

/**
 * Create initial validation state
 * Used by form components initialization
 */
export function createStep7ValidationState(
  initialData: Partial<Step7Data> = {}
): Step7ValidationState {
  const data = { ...Step7Defaults, ...initialData }
  const isFlat = isFlatOffer(data.tipo_offerta)
  
  return {
    tipo_offerta: {
      value: data.tipo_offerta,
      error: null,
      isValid: false,
      isRequired: true,
    },
    descrizione: {
      value: data.descrizione,
      error: null,
      isValid: false,
      isRequired: true,
    },
    flat_caratteristiche: {
      value: data.flat_caratteristiche,
      error: null,
      isValid: !isFlat,
      isRequired: isFlat,
    },
    flat_durata_mesi: {
      value: data.flat_durata_mesi,
      error: null,
      isValid: !isFlat,
      isRequired: isFlat,
    },
    flat_prezzo_fisso: {
      value: data.flat_prezzo_fisso,
      error: null,
      isValid: true,
      isRequired: false,
    },
    flat_comp_variabile: {
      value: data.flat_comp_variabile,
      error: null,
      isValid: true,
      isRequired: false,
    },
    vantaggi: {
      value: data.vantaggi,
      error: null,
      isValid: true,
      isRequired: false,
    },
    condizioni_particolari: {
      value: data.condizioni_particolari,
      error: null,
      isValid: true,
      isRequired: false,
    },
  }
}

/**
 * Validate FLAT offer business rules
 * Specific validation for FLAT offer requirements
 */
export function validateFlatOfferRules(data: Step7Data): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!isFlatOffer(data.tipo_offerta)) {
    return { isValid: true, errors, warnings }
  }
  
  // FLAT-specific validations
  if (!data.flat_caratteristiche) {
    errors.push('Caratteristiche FLAT sono obbligatorie')
  }
  
  if (!data.flat_durata_mesi) {
    errors.push('Durata FLAT è obbligatoria')
  } else {
    if (data.flat_durata_mesi < 1) {
      errors.push('Durata FLAT deve essere almeno 1 mese')
    }
    if (data.flat_durata_mesi > 120) {
      errors.push('Durata FLAT non può superare 120 mesi')
    }
  }
  
  if (data.flat_prezzo_fisso === undefined && !data.flat_comp_variabile) {
    warnings.push('FLAT dovrebbe avere almeno una componente di prezzo definita')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
} 