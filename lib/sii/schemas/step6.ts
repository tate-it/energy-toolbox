/**
 * Step 6: Offer Validity (Validità Offerta)
 * Zod validation schema for SII XML Generator Step 6
 * 
 * Fields:
 * - DATA_INIZIO_VALIDITA: Offer validity start date (mandatory, ISO format YYYY-MM-DD)
 * - DATA_FINE_VALIDITA: Offer validity end date (optional, ISO format YYYY-MM-DD)
 * - VALIDITA_INDETERMINATA: Indefinite validity flag (optional, boolean)
 * - VALIDITA_MESI: Validity period in months (optional, 1-120 months)
 * - NOTE_VALIDITA: Validity notes (optional, max 500 characters)
 * 
 * Validation Rules:
 * - Start date is mandatory and must be today or future
 * - If end date provided, must be after start date
 * - Cannot have both end date and indefinite validity
 * - Validity in months is alternative to end date
 * - Maximum validity period is 10 years (120 months)
 * - Notes are optional but limited to 500 characters
 * - All dates must be in ISO format (YYYY-MM-DD)
 */

import { z } from 'zod'

/**
 * ISO date validation schema
 * Validates date strings in YYYY-MM-DD format
 */
export const ISODateSchema = z.string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Data deve essere nel formato YYYY-MM-DD (es: 2024-01-15)'
  )
  .refine(
    dateStr => {
      const date = new Date(dateStr)
      return !isNaN(date.getTime()) && dateStr === date.toISOString().split('T')[0]
    },
    'Data non valida'
  )

/**
 * Start date validation schema
 * Must be today or in the future
 */
export const DataInizioValiditaSchema = ISODateSchema
  .refine(
    dateStr => {
      const date = new Date(dateStr)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day
      return date >= today
    },
    'Data inizio validità deve essere oggi o nel futuro'
  )

/**
 * End date validation schema
 * Optional field, if provided must be valid ISO date
 */
export const DataFineValiditaSchema = ISODateSchema.optional()

/**
 * Indefinite validity flag schema
 * Optional boolean field
 */
export const ValiditaIndeterminataSchema = z.boolean()
  .optional()

/**
 * Validity period in months schema
 * Optional field, 1-120 months (max 10 years)
 */
export const ValiditaMesiSchema = z.number()
  .int('Validità in mesi deve essere un numero intero')
  .min(1, 'Validità deve essere almeno 1 mese')
  .max(120, 'Validità non può superare 120 mesi (10 anni)')
  .optional()

/**
 * Validity notes validation schema
 * Optional text field with character limit
 */
export const NoteValiditaSchema = z.string()
  .trim()
  .max(500, 'Note validità non possono superare 500 caratteri')
  .optional()
  .or(z.literal('').transform(() => undefined))

/**
 * Base Step 6 validation schema
 * Before cross-field validation rules
 */
export const Step6BaseSchema = z.object({
  // Start date - mandatory
  data_inizio: DataInizioValiditaSchema,
  
  // End date - optional
  data_fine: DataFineValiditaSchema,
  
  // Indefinite validity - optional
  validita_indet: ValiditaIndeterminataSchema,
  
  // Validity in months - optional
  validita_mesi: ValiditaMesiSchema,
  
  // Validity notes - optional
  note_validita: NoteValiditaSchema,
})

/**
 * Step 6 validation schema with cross-field validation
 * Applies business rules for validity configuration
 */
export const Step6Schema = Step6BaseSchema.refine(
  data => {
    // End date must be after start date
    if (data.data_fine && data.data_inizio) {
      const startDate = new Date(data.data_inizio)
      const endDate = new Date(data.data_fine)
      return endDate > startDate
    }
    return true
  },
  {
    message: 'Data fine validità deve essere successiva alla data inizio',
    path: ['data_fine']
  }
).refine(
  data => {
    // Cannot have both end date and indefinite validity
    if (data.data_fine && data.validita_indet) {
      return false
    }
    return true
  },
  {
    message: 'Non è possibile specificare sia data fine che validità indeterminata',
    path: ['validita_indet']
  }
).refine(
  data => {
    // Cannot have both end date and validity in months
    if (data.data_fine && data.validita_mesi) {
      return false
    }
    return true
  },
  {
    message: 'Non è possibile specificare sia data fine che validità in mesi',
    path: ['data_fine']
  }
).refine(
  data => {
    // Cannot have both indefinite validity and validity in months
    if (data.validita_indet && data.validita_mesi) {
      return false
    }
    return true
  },
  {
    message: 'Non è possibile specificare sia validità indeterminata che validità in mesi',
    path: ['validita_mesi']
  }
).refine(
  data => {
    // If validity in months is specified, check reasonable duration with start date
    if (data.validita_mesi && data.data_inizio) {
      const startDate = new Date(data.data_inizio)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + data.validita_mesi)
      
      // Check if calculated end date is too far in future (beyond 2034)
      const maxDate = new Date('2034-12-31')
      return endDate <= maxDate
    }
    return true
  },
  {
    message: 'Validità in mesi produce una data fine troppo lontana nel futuro',
    path: ['validita_mesi']
  }
)

/**
 * TypeScript type inference for Step 6 data
 */
export type Step6Data = z.infer<typeof Step6Schema>

/**
 * Default values for Step 6 form
 * Used by NuQS for URL state initialization
 */
export const Step6Defaults: Partial<Step6Data> = {
  data_inizio: undefined,
  data_fine: undefined,
  validita_indet: undefined,
  validita_mesi: undefined,
  note_validita: undefined,
}

/**
 * Step 6 field labels in Italian
 * For form components and validation messages
 */
export const Step6Labels = {
  data_inizio: 'Data Inizio Validità',
  data_fine: 'Data Fine Validità',
  validita_indet: 'Validità Indeterminata',
  validita_mesi: 'Validità (Mesi)',
  note_validita: 'Note Validità',
} as const

/**
 * Step 6 field descriptions
 * Additional help text for form fields
 */
export const Step6Descriptions = {
  data_inizio: 'Data di inizio validità dell\'offerta (formato YYYY-MM-DD)',
  data_fine: 'Data di fine validità dell\'offerta (opzionale, formato YYYY-MM-DD)',
  validita_indet: 'Spunta se l\'offerta ha validità indeterminata',
  validita_mesi: 'Durata validità in mesi (alternativa a data fine, max 120 mesi)',
  note_validita: 'Note aggiuntive sulla validità dell\'offerta (max 500 caratteri)',
} as const

/**
 * Step 6 validation helper
 * Safe parse function with Italian error messages
 */
export function validateStep6(data: unknown): {
  success: true
  data: Step6Data
} | {
  success: false
  errors: Record<string, string>
} {
  const result = Step6Schema.safeParse(data)
  
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
 * Check if Step 6 is valid and complete
 * Used for step navigation validation
 */
export function isStep6Complete(data: Partial<Step6Data>): boolean {
  const result = Step6Schema.safeParse(data)
  return result.success
}

/**
 * Get validation errors for specific field
 * Used for real-time field validation with context
 */
export function getStep6FieldError(
  fieldName: keyof Step6Data,
  value: unknown,
  contextData?: Partial<Step6Data>
): string | null {
  // For cross-field validation, we need context
  const testData = { ...Step6Defaults, ...contextData, [fieldName]: value }
  const result = Step6Schema.safeParse(testData)
  
  if (result.success) {
    return null
  }
  
  // Find error for this specific field
  const fieldError = result.error.errors.find(err => err.path[0] === fieldName)
  return fieldError?.message || null
}

/**
 * Format Step 6 data for XML generation
 * Converts form data to XML field names
 */
export function formatStep6ForXML(data: Step6Data) {
  return {
    DATA_INIZIO_VALIDITA: data.data_inizio,
    DATA_FINE_VALIDITA: data.data_fine,
    VALIDITA_INDETERMINATA: data.validita_indet,
    VALIDITA_MESI: data.validita_mesi,
    NOTE_VALIDITA: data.note_validita,
  }
}

/**
 * Get today's date in ISO format
 * Helper for setting default start date
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Calculate end date from start date and months
 * Helper for displaying calculated end date
 */
export function calculateEndDate(startDate: string, months: number): string {
  const date = new Date(startDate)
  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]
}

/**
 * Calculate validity duration in days
 * Helper for displaying validity period
 */
export function calculateValidityDays(startDate: string, endDate?: string, months?: number): number | null {
  const start = new Date(startDate)
  let end: Date
  
  if (endDate) {
    end = new Date(endDate)
  } else if (months) {
    end = new Date(startDate)
    end.setMonth(end.getMonth() + months)
  } else {
    return null // Indefinite validity
  }
  
  const diffTime = end.getTime() - start.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Validate date string format
 * Helper for real-time date input validation
 */
export function isValidISODate(dateStr: string): boolean {
  const result = ISODateSchema.safeParse(dateStr)
  return result.success
}

/**
 * Format date for display
 * Helper for displaying dates in Italian format
 */
export function formatDateForDisplay(isoDate: string): string {
  try {
    const date = new Date(isoDate)
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return isoDate
  }
}

/**
 * Get validity period summary
 * Helper for displaying validity information
 */
export function getValiditySummary(data: Step6Data) {
  const summary = {
    type: 'unknown' as 'fixed_date' | 'months' | 'indefinite',
    startDate: data.data_inizio,
    endDate: data.data_fine,
    durationDays: null as number | null,
    durationMonths: data.validita_mesi,
    isIndefinite: data.validita_indet || false,
    hasNotes: !!data.note_validita,
  }
  
  if (data.validita_indet) {
    summary.type = 'indefinite'
  } else if (data.data_fine) {
    summary.type = 'fixed_date'
    summary.durationDays = calculateValidityDays(data.data_inizio, data.data_fine)
  } else if (data.validita_mesi) {
    summary.type = 'months'
    summary.endDate = calculateEndDate(data.data_inizio, data.validita_mesi)
    summary.durationDays = calculateValidityDays(data.data_inizio, undefined, data.validita_mesi)
  }
  
  return summary
}

/**
 * Validate offer validity business rules
 * Business logic validation for validity configuration
 */
export function validateValidityBusinessRules(data: Step6Data): {
  isValid: boolean
  warnings: string[]
  suggestions: string[]
} {
  const warnings: string[] = []
  const suggestions: string[] = []
  
  const summary = getValiditySummary(data)
  
  // Business rule validations
  if (summary.durationDays !== null) {
    if (summary.durationDays < 30) {
      warnings.push('Validità inferiore a 30 giorni potrebbe essere troppo breve')
    }
    
    if (summary.durationDays > 1095) { // 3 years
      warnings.push('Validità superiore a 3 anni è inusuale per offerte energetiche')
    }
    
    if (summary.durationDays > 365 && !data.note_validita) {
      suggestions.push('Considerare l\'aggiunta di note per validità superiori a 1 anno')
    }
  }
  
  // Check if start date is too far in future
  const startDate = new Date(data.data_inizio)
  const today = new Date()
  const daysDiff = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff > 90) {
    warnings.push('Data inizio validità molto lontana nel futuro (oltre 90 giorni)')
  }
  
  // Suggest indefinite validity for very long periods
  if (summary.durationDays !== null && summary.durationDays > 1825 && !data.validita_indet) { // 5 years
    suggestions.push('Per validità superiori a 5 anni, considerare validità indeterminata')
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  }
}

/**
 * Step 6 form validation state type
 * Used by form components for validation display
 */
export type Step6ValidationState = {
  [K in keyof Step6Data]: {
    value: Step6Data[K]
    error: string | null
    isValid: boolean
    isRequired: boolean
  }
}

/**
 * Create initial validation state
 * Used by form components initialization
 */
export function createStep6ValidationState(
  initialData: Partial<Step6Data> = {}
): Step6ValidationState {
  const data = { ...Step6Defaults, ...initialData }
  
  return {
    data_inizio: {
      value: data.data_inizio,
      error: null,
      isValid: false,
      isRequired: true,
    },
    data_fine: {
      value: data.data_fine,
      error: null,
      isValid: true,
      isRequired: false,
    },
    validita_indet: {
      value: data.validita_indet,
      error: null,
      isValid: true,
      isRequired: false,
    },
    validita_mesi: {
      value: data.validita_mesi,
      error: null,
      isValid: true,
      isRequired: false,
    },
    note_validita: {
      value: data.note_validita,
      error: null,
      isValid: true,
      isRequired: false,
    },
  }
}

/**
 * Get validity type description in Italian
 * Helper for displaying validity type to users
 */
export function getValidityTypeDescription(data: Step6Data): string {
  if (data.validita_indet) {
    return 'Validità indeterminata'
  }
  
  if (data.data_fine) {
    return `Validità fino al ${formatDateForDisplay(data.data_fine)}`
  }
  
  if (data.validita_mesi) {
    const endDate = calculateEndDate(data.data_inizio, data.validita_mesi)
    return `Validità per ${data.validita_mesi} mesi (fino al ${formatDateForDisplay(endDate)})`
  }
  
  return 'Tipo validità non specificato'
} 