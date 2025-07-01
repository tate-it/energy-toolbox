/**
 * Step 3: Activation Methods (ModalitaAttivazione)
 * Zod validation schema for SII XML Generator Step 3
 * 
 * Fields:
 * - MODALITA: Array of activation method codes (at least one required)
 * - DESCRIZIONE: Description (mandatory when MODALITA includes "99" - Other)
 * 
 * Validation Rules:
 * - At least one activation method must be selected
 * - Description is required only when "Other" (99) is selected
 * - Description max length 2000 characters when required
 * - No duplicate activation methods allowed
 */

import { z } from 'zod'
import {
  MODALITA_ATTIVAZIONE,
  MODALITA_ATTIVAZIONE_LABELS
} from '../constants'

/**
 * Single activation method validation schema
 * Uses SII constants with Italian error messages
 */
export const ModalitaAttivazioneSchema = z.enum([
  MODALITA_ATTIVAZIONE.WEB,
  MODALITA_ATTIVAZIONE.QUALSIASI_CANALE,
  MODALITA_ATTIVAZIONE.PUNTO_VENDITA,
  MODALITA_ATTIVAZIONE.TELEVENDITA,
  MODALITA_ATTIVAZIONE.AGENZIA,
  MODALITA_ATTIVAZIONE.ALTRO
], {
  errorMap: () => ({ message: 'Modalità di attivazione non valida' })
})

/**
 * Array of activation methods validation schema
 * At least one method required, no duplicates allowed
 */
export const ModalitaArraySchema = z.array(ModalitaAttivazioneSchema)
  .min(1, 'Almeno una modalità di attivazione è obbligatoria')
  .max(6, 'Massimo 6 modalità di attivazione consentite')
  .refine(
    (methods) => {
      // Check for duplicates
      const uniqueMethods = new Set(methods)
      return uniqueMethods.size === methods.length
    },
    'Non sono consentite modalità di attivazione duplicate'
  )

/**
 * Description validation schema
 * Required when "Other" method is selected, max 2000 characters
 */
export const DescrizioneAttivazioneSchema = z.string()
  .trim()
  .max(2000, 'Descrizione non può superare 2000 caratteri')
  .optional()

/**
 * Base Step 3 object schema (without conditional logic)
 * Used for field-level validation
 */
const Step3BaseSchema = z.object({
  // Array of activation methods - at least one required
  mod: ModalitaArraySchema,
  
  // Description - conditional on "Other" being selected
  desc: DescrizioneAttivazioneSchema,
})

/**
 * Step 3 validation schema with conditional logic
 * Complete validation for activation methods step
 */
export const Step3Schema = Step3BaseSchema.refine(
  (data) => {
    // DESCRIZIONE is mandatory when MODALITA includes "99" (Other)
    if (data.mod.includes(MODALITA_ATTIVAZIONE.ALTRO)) {
      return data.desc !== undefined && data.desc.trim().length > 0
    }
    return true
  },
  {
    message: 'Descrizione è obbligatoria quando è selezionata "Altro"',
    path: ['desc']
  }
)

/**
 * TypeScript type inference for Step 3 data
 */
export type Step3Data = z.infer<typeof Step3Schema>

/**
 * Default values for Step 3 form
 * Used by NuQS for URL state initialization
 */
export const Step3Defaults: Partial<Step3Data> = {
  mod: [],
  desc: '',
}

/**
 * Step 3 field labels in Italian
 * For form components and validation messages
 */
export const Step3Labels = {
  mod: 'Modalità di Attivazione',
  desc: 'Descrizione',
} as const

/**
 * Step 3 field descriptions
 * Additional help text for form fields
 */
export const Step3Descriptions = {
  mod: 'Seleziona tutte le modalità attraverso cui i clienti possono attivare questa offerta',
  desc: 'Descrizione dettagliata richiesta quando è selezionata "Altro" (max 2000 caratteri)',
} as const

/**
 * Get activation method labels for UI display
 * Returns Italian labels for all activation methods
 */
export function getActivationMethodLabels(): Array<{ value: string; label: string }> {
  return Object.entries(MODALITA_ATTIVAZIONE).map(([key, value]) => ({
    value,
    label: MODALITA_ATTIVAZIONE_LABELS[value as keyof typeof MODALITA_ATTIVAZIONE_LABELS] || value
  }))
}

/**
 * Step 3 validation helper
 * Safe parse function with Italian error messages
 */
export function validateStep3(data: unknown): {
  success: true
  data: Step3Data
} | {
  success: false
  errors: Record<string, string>
} {
  const result = Step3Schema.safeParse(data)
  
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
 * Check if Step 3 is valid and complete
 * Used for step navigation validation
 */
export function isStep3Complete(data: Partial<Step3Data>): boolean {
  const result = Step3Schema.safeParse(data)
  return result.success
}

/**
 * Get validation errors for specific field
 * Used for real-time field validation with conditional logic
 */
export function getStep3FieldError(
  fieldName: keyof Step3Data,
  value: any,
  allData?: Partial<Step3Data>
): string | null {
  // For fields that depend on other fields, validate the whole object
  if (fieldName === 'desc' && allData) {
    const testData = { ...allData, [fieldName]: value }
    const result = Step3Schema.safeParse(testData)
    if (!result.success) {
      const error = result.error.errors.find(err => err.path[0] === fieldName)
      return error?.message || null
    }
    return null
  }
  
  // For independent fields, validate just the field
  const fieldSchema = Step3BaseSchema.shape[fieldName]
  if (!fieldSchema) return null
  
  const result = fieldSchema.safeParse(value)
  
  if (result.success) {
    return null
  }
  
  return result.error.errors[0]?.message || 'Valore non valido'
}

/**
 * Format Step 3 data for XML generation
 * Converts form data to XML field names and structure
 */
export function formatStep3ForXML(data: Step3Data) {
  return {
    MODALITA: data.mod,
    DESCRIZIONE: data.desc || undefined, // Only include if provided
  }
}

/**
 * Check if description field should be visible
 * Helper for conditional form rendering
 */
export function shouldShowDescription(modalita?: string[]): boolean {
  return modalita !== undefined && modalita.includes(MODALITA_ATTIVAZIONE.ALTRO)
}

/**
 * Get display text for selected activation methods
 * Helper for displaying selected methods as readable text
 */
export function getSelectedMethodsDisplayText(modalita: string[]): string[] {
  return modalita.map(method => 
    MODALITA_ATTIVAZIONE_LABELS[method as keyof typeof MODALITA_ATTIVAZIONE_LABELS] || method
  )
}

/**
 * Validate activation methods array for duplicates
 * Helper for real-time duplicate detection
 */
export function hasActivationMethodDuplicates(modalita: string[]): boolean {
  const uniqueMethods = new Set(modalita)
  return uniqueMethods.size !== modalita.length
}

/**
 * Step 3 form validation state type
 * Used by form components for validation display
 */
export type Step3ValidationState = {
  [K in keyof Step3Data]: {
    value: any
    error: string | null
    isValid: boolean
  }
}

/**
 * Create initial validation state
 * Used by form components initialization
 */
export function createStep3ValidationState(
  initialData: Partial<Step3Data> = {}
): Step3ValidationState {
  return {
    mod: {
      value: initialData.mod || [],
      error: null,
      isValid: false,
    },
    desc: {
      value: initialData.desc || '',
      error: null,
      isValid: true, // Optional field by default
    },
  }
}

/**
 * Get activation method statistics
 * Helper for analytics and validation insights
 */
export function getActivationMethodStats(modalita: string[]) {
  return {
    totalMethods: modalita.length,
    hasWebOnly: modalita.includes(MODALITA_ATTIVAZIONE.WEB),
    hasAnyChannel: modalita.includes(MODALITA_ATTIVAZIONE.QUALSIASI_CANALE),
    hasPhysical: modalita.includes(MODALITA_ATTIVAZIONE.PUNTO_VENDITA) ||
                 modalita.includes(MODALITA_ATTIVAZIONE.TELEVENDITA) ||
                 modalita.includes(MODALITA_ATTIVAZIONE.AGENZIA),
    hasOther: modalita.includes(MODALITA_ATTIVAZIONE.ALTRO),
    isComprehensive: modalita.length >= 3, // Multiple channel strategy
  }
}

/**
 * Validate step 3 business logic
 * Additional business validation beyond schema
 */
export function validateStep3BusinessLogic(data: Step3Data): {
  isValid: boolean
  warnings: string[]
} {
  const warnings: string[] = []
  const stats = getActivationMethodStats(data.mod)
  
  // Business logic warnings
  if (stats.hasWebOnly && stats.totalMethods === 1) {
    warnings.push('Considerare l\'aggiunta di canali alternativi per maggiore accessibilità')
  }
  
  if (stats.hasAnyChannel && stats.totalMethods > 1) {
    warnings.push('La modalità "Qualsiasi canale" potrebbe rendere ridondanti altre selezioni')
  }
  
  if (stats.hasOther && (!data.desc || data.desc.trim().length < 10)) {
    warnings.push('Fornire una descrizione dettagliata per la modalità "Altro"')
  }
  
  return {
    isValid: true, // All warnings, no blocking errors
    warnings
  }
} 