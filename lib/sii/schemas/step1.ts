/**
 * Step 1: Identification Information (Identificativi Offerta)
 * Zod validation schema for SII XML Generator Step 1
 * 
 * Fields:
 * - PIVA_UTENTE: Italian VAT number with algorithm validation
 * - COD_OFFERTA: Alphanumeric offer code, max 32 characters
 */

import { z } from 'zod'
import { PIVASchema } from '../../schemas/base'

/**
 * Offer code validation schema
 * Alphanumeric code up to 32 characters for unique offer identification
 * Used as CODICE_CONTRATTO during subscription process
 */
export const CodiceOffertaSchema = z.string()
  .trim()
  .min(1, 'Codice offerta è obbligatorio')
  .max(32, 'Codice offerta non può superare 32 caratteri')
  .regex(
    /^[A-Za-z0-9]+$/,
    'Codice offerta deve contenere solo lettere e numeri'
  )
  .transform(val => val.toUpperCase()) // Normalize to uppercase

/**
 * Step 1 validation schema
 * Complete validation for identification information step
 */
export const Step1Schema = z.object({
  // PIVA_UTENTE - Italian VAT number with algorithm validation
  piva: PIVASchema,
  
  // COD_OFFERTA - Unique offer code 
  cod: CodiceOffertaSchema,
})

/**
 * TypeScript type inference for Step 1 data
 */
export type Step1Data = z.infer<typeof Step1Schema>

/**
 * Default values for Step 1 form
 * Used by NuQS for URL state initialization
 */
export const Step1Defaults: Step1Data = {
  piva: '',
  cod: '',
}

/**
 * Step 1 field labels in Italian
 * For form components and validation messages
 */
export const Step1Labels = {
  piva: 'PIVA Utente',
  cod: 'Codice Offerta',
} as const

/**
 * Step 1 field descriptions
 * Additional help text for form fields
 */
export const Step1Descriptions = {
  piva: 'Partita IVA del venditore (11 cifre numeriche)',
  cod: 'Codice univoco dell\'offerta (max 32 caratteri alfanumerici)',
} as const

/**
 * Step 1 validation helper
 * Safe parse function with Italian error messages
 */
export function validateStep1(data: unknown): {
  success: true
  data: Step1Data
} | {
  success: false
  errors: Record<string, string>
} {
  const result = Step1Schema.safeParse(data)
  
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
 * Check if Step 1 is valid and complete
 * Used for step navigation validation
 */
export function isStep1Complete(data: Partial<Step1Data>): boolean {
  const result = Step1Schema.safeParse(data)
  return result.success
}

/**
 * Get validation errors for specific field
 * Used for real-time field validation
 */
export function getStep1FieldError(
  fieldName: keyof Step1Data,
  value: string
): string | null {
  const fieldSchema = Step1Schema.shape[fieldName]
  const result = fieldSchema.safeParse(value)
  
  if (result.success) {
    return null
  }
  
  return result.error.errors[0]?.message || 'Valore non valido'
}

/**
 * Format Step 1 data for XML generation
 * Converts form data to XML field names
 */
export function formatStep1ForXML(data: Step1Data) {
  return {
    PIVA_UTENTE: data.piva,
    COD_OFFERTA: data.cod,
  }
}

/**
 * Step 1 form validation state type
 * Used by form components for validation display
 */
export type Step1ValidationState = {
  [K in keyof Step1Data]: {
    value: string
    error: string | null
    isValid: boolean
  }
}

/**
 * Create initial validation state
 * Used by form components initialization
 */
export function createStep1ValidationState(
  initialData: Partial<Step1Data> = {}
): Step1ValidationState {
  return {
    piva: {
      value: initialData.piva || '',
      error: null,
      isValid: false,
    },
    cod: {
      value: initialData.cod || '',
      error: null,
      isValid: false,
    },
  }
} 