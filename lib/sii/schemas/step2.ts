/**
 * Step 2: Offer Details (DettaglioOfferta)
 * Zod validation schema for SII XML Generator Step 2
 * 
 * Fields:
 * - TIPO_MERCATO: Market type (Electricity, Gas, Dual Fuel)
 * - OFFERTA_SINGOLA: Individual offer flag (conditional on market type)
 * - TIPO_CLIENTE: Client type (Domestic, Other Uses, Residential Condominium)
 * - DOMESTICO_RESIDENTE: Residential status (optional)
 * - TIPO_OFFERTA: Offer type (Fixed, Variable, FLAT)
 * - TIPOLOGIA_ATT_CONTR: Contract activation types (array, multiple allowed)
 * - NOME_OFFERTA: Offer name (max 255 chars)
 * - DESCRIZIONE: Description (max 3000 chars)
 * - DURATA: Duration in months (-1 for indeterminate, 1-99 for specific)
 * - GARANZIE: Guarantees description (max 3000 chars, "NO" if none)
 */

import { z } from 'zod'
import {
  TIPO_MERCATO,
  TIPO_CLIENTE,
  TIPO_OFFERTA,
  OFFERTA_SINGOLA,
  DOMESTICO_RESIDENTE,
  TIPOLOGIA_ATT_CONTR,
  DURATA_INDETERMINATA,
  isDualFuel
} from '../constants'

/**
 * Market type validation schema
 * Uses SII constants with Italian error messages
 */
export const TipoMercatoSchema = z.enum([
  TIPO_MERCATO.ELETTRICITA,
  TIPO_MERCATO.GAS,
  TIPO_MERCATO.DUAL_FUEL
], {
  errorMap: () => ({ message: 'Tipo mercato non valido' })
})

/**
 * Individual offer validation schema
 * Conditional validation based on market type
 */
export const OffertaSingolaSchema = z.enum([
  OFFERTA_SINGOLA.SI,
  OFFERTA_SINGOLA.NO
], {
  errorMap: () => ({ message: 'Offerta singola non valida' })
})

/**
 * Client type validation schema
 */
export const TipoClienteSchema = z.enum([
  TIPO_CLIENTE.DOMESTICO,
  TIPO_CLIENTE.ALTRI_USI,
  TIPO_CLIENTE.CONDOMINIO_RESIDENZIALE
], {
  errorMap: () => ({ message: 'Tipo cliente non valido' })
})

/**
 * Residential status validation schema (optional)
 */
export const DomesticoResidenteSchema = z.enum([
  DOMESTICO_RESIDENTE.RESIDENTE,
  DOMESTICO_RESIDENTE.NON_RESIDENTE,
  DOMESTICO_RESIDENTE.TUTTI
], {
  errorMap: () => ({ message: 'Status domestico residente non valido' })
}).optional()

/**
 * Offer type validation schema
 */
export const TipoOffertaSchema = z.enum([
  TIPO_OFFERTA.FISSA,
  TIPO_OFFERTA.VARIABILE,
  TIPO_OFFERTA.FLAT
], {
  errorMap: () => ({ message: 'Tipo offerta non valido' })
})

/**
 * Contract activation types validation schema
 * Array of activation types, at least one required
 */
export const TipologiaAttContrSchema = z.array(
  z.enum([
    TIPOLOGIA_ATT_CONTR.CAMBIO_FORNITORE,
    TIPOLOGIA_ATT_CONTR.PRIMA_ATTIVAZIONE,
    TIPOLOGIA_ATT_CONTR.RIATTIVAZIONE,
    TIPOLOGIA_ATT_CONTR.VOLTURA,
    TIPOLOGIA_ATT_CONTR.SEMPRE
  ], {
    errorMap: () => ({ message: 'Tipologia attivazione contratto non valida' })
  })
).min(1, 'Almeno una tipologia di attivazione è obbligatoria')
.max(5, 'Massimo 5 tipologie di attivazione consentite')

/**
 * Offer name validation schema
 */
export const NomeOffertaSchema = z.string()
  .trim()
  .min(1, 'Nome offerta è obbligatorio')
  .max(255, 'Nome offerta non può superare 255 caratteri')

/**
 * Description validation schema
 */
export const DescrizioneSchema = z.string()
  .trim()
  .min(1, 'Descrizione è obbligatoria')
  .max(3000, 'Descrizione non può superare 3000 caratteri')

/**
 * Duration validation schema
 * -1 for indeterminate, 1-99 for specific duration in months
 */
export const DurataSchema = z.number()
  .int('Durata deve essere un numero intero')
  .refine(
    (val) => val === DURATA_INDETERMINATA || (val >= 1 && val <= 99),
    'Durata deve essere -1 (indeterminata) o tra 1 e 99 mesi'
  )

/**
 * Guarantees validation schema
 */
export const GaranzieSchema = z.string()
  .trim()
  .min(1, 'Garanzie è obbligatorio')
  .max(3000, 'Garanzie non può superare 3000 caratteri')

/**
 * Base Step 2 object schema (without refinements)
 * Used for field-level validation
 */
const Step2BaseSchema = z.object({
  // Market type - always mandatory
  tm: TipoMercatoSchema,
  
  // Individual offer - conditional on market type
  os: OffertaSingolaSchema.optional(),
  
  // Client type - always mandatory  
  tc: TipoClienteSchema,
  
  // Residential status - optional
  dr: DomesticoResidenteSchema,
  
  // Offer type - always mandatory
  to: TipoOffertaSchema,
  
  // Contract activation types - array, at least one required
  tac: TipologiaAttContrSchema,
  
  // Offer name - mandatory
  nome: NomeOffertaSchema,
  
  // Description - mandatory
  desc: DescrizioneSchema,
  
  // Duration - mandatory
  dur: DurataSchema,
  
  // Guarantees - mandatory
  gar: GaranzieSchema,
})

/**
 * Step 2 validation schema with conditional logic
 * Complete validation for offer details step
 */
export const Step2Schema = Step2BaseSchema.refine(
  (data) => {
    // OFFERTA_SINGOLA is mandatory if TIPO_MERCATO ≠ 03 (Dual Fuel)
    if (!isDualFuel(data.tm)) {
      return data.os !== undefined
    }
    return true
  },
  {
    message: 'Offerta singola è obbligatoria per mercato elettricità o gas',
    path: ['os']
  }
)

/**
 * TypeScript type inference for Step 2 data
 */
export type Step2Data = z.infer<typeof Step2Schema>

/**
 * Default values for Step 2 form
 * Used by NuQS for URL state initialization
 */
export const Step2Defaults: Partial<Step2Data> = {
  tm: undefined,
  os: undefined,
  tc: undefined,
  dr: undefined,
  to: undefined,
  tac: [],
  nome: '',
  desc: '',
  dur: undefined,
  gar: '',
}

/**
 * Step 2 field labels in Italian
 * For form components and validation messages
 */
export const Step2Labels = {
  tm: 'Tipo Mercato',
  os: 'Offerta Singola',
  tc: 'Tipo Cliente',
  dr: 'Domestico Residente',
  to: 'Tipo Offerta',
  tac: 'Tipologie Attivazione Contratto',
  nome: 'Nome Offerta',
  desc: 'Descrizione',
  dur: 'Durata (mesi)',
  gar: 'Garanzie',
} as const

/**
 * Step 2 field descriptions
 * Additional help text for form fields
 */
export const Step2Descriptions = {
  tm: 'Seleziona il tipo di mercato per questa offerta',
  os: 'Indica se l\'offerta può essere sottoscritta singolarmente',
  tc: 'Tipologia del cliente target per questa offerta',
  dr: 'Status di residenza per clienti domestici (opzionale)',
  to: 'Struttura di prezzo dell\'offerta',
  tac: 'Seleziona tutte le modalità di attivazione supportate',
  nome: 'Nome commerciale dell\'offerta (max 255 caratteri)',
  desc: 'Descrizione dettagliata dell\'offerta (max 3000 caratteri)',
  dur: 'Durata in mesi (-1 per durata indeterminata, 1-99 per durata specifica)',
  gar: 'Descrizione delle garanzie offerte ("NO" se nessuna garanzia)',
} as const

/**
 * Step 2 validation helper
 * Safe parse function with Italian error messages
 */
export function validateStep2(data: unknown): {
  success: true
  data: Step2Data
} | {
  success: false
  errors: Record<string, string>
} {
  const result = Step2Schema.safeParse(data)
  
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
 * Check if Step 2 is valid and complete
 * Used for step navigation validation
 */
export function isStep2Complete(data: Partial<Step2Data>): boolean {
  const result = Step2Schema.safeParse(data)
  return result.success
}

/**
 * Get validation errors for specific field
 * Used for real-time field validation
 */
export function getStep2FieldError(
  fieldName: keyof Step2Data,
  value: unknown,
  allData?: Partial<Step2Data>
): string | null {
  // For fields that depend on other fields, validate the whole object
  if ((fieldName === 'os') && allData) {
    const testData = { ...allData, [fieldName]: value }
    const result = Step2Schema.safeParse(testData)
    if (!result.success) {
      const error = result.error.errors.find(err => err.path[0] === fieldName)
      return error?.message || null
    }
    return null
  }
  
  // For independent fields, validate just the field
  const fieldSchema = Step2BaseSchema.shape[fieldName]
  if (!fieldSchema) return null
  
  const result = fieldSchema.safeParse(value)
  
  if (result.success) {
    return null
  }
  
  return result.error.errors[0]?.message || 'Valore non valido'
}

/**
 * Format Step 2 data for XML generation
 * Converts form data to XML field names
 */
export function formatStep2ForXML(data: Step2Data) {
  return {
    TIPO_MERCATO: data.tm,
    OFFERTA_SINGOLA: data.os,
    TIPO_CLIENTE: data.tc,
    DOMESTICO_RESIDENTE: data.dr,
    TIPO_OFFERTA: data.to,
    TIPOLOGIA_ATT_CONTR: data.tac,
    NOME_OFFERTA: data.nome,
    DESCRIZIONE: data.desc,
    DURATA: data.dur,
    GARANZIE: data.gar,
  }
}

/**
 * Check if individual offer field should be visible
 * Helper for conditional form rendering
 */
export function shouldShowOffertaSingola(tipoMercato?: string): boolean {
  return tipoMercato !== undefined && !isDualFuel(tipoMercato)
}

/**
 * Get duration display text
 * Helper for displaying duration values
 */
export function getDurationDisplayText(duration: number): string {
  if (duration === DURATA_INDETERMINATA) {
    return 'Durata indeterminata'
  }
  return `${duration} ${duration === 1 ? 'mese' : 'mesi'}`
}

/**
 * Step 2 form validation state type
 * Used by form components for validation display
 */
export type Step2ValidationState = {
  [K in keyof Step2Data]: {
    value: unknown
    error: string | null
    isValid: boolean
  }
}

/**
 * Create initial validation state
 * Used by form components initialization
 */
export function createStep2ValidationState(
  initialData: Partial<Step2Data> = {}
): Step2ValidationState {
  return {
    tm: {
      value: initialData.tm || '',
      error: null,
      isValid: false,
    },
    os: {
      value: initialData.os || '',
      error: null,
      isValid: false,
    },
    tc: {
      value: initialData.tc || '',
      error: null,
      isValid: false,
    },
    dr: {
      value: initialData.dr || '',
      error: null,
      isValid: true, // Optional field
    },
    to: {
      value: initialData.to || '',
      error: null,
      isValid: false,
    },
    tac: {
      value: initialData.tac || [],
      error: null,
      isValid: false,
    },
    nome: {
      value: initialData.nome || '',
      error: null,
      isValid: false,
    },
    desc: {
      value: initialData.desc || '',
      error: null,
      isValid: false,
    },
    dur: {
      value: initialData.dur || '',
      error: null,
      isValid: false,
    },
    gar: {
      value: initialData.gar || '',
      error: null,
      isValid: false,
    },
  }
} 