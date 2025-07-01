/**
 * Step 4: Contact Information (Contatti)
 * Zod validation schema for SII XML Generator Step 4
 * 
 * Fields:
 * - TELEFONO: Phone number (mandatory, max 15 characters, Italian format)
 * - URL_SITO_VENDITORE: Vendor website URL (optional, max 100 characters)
 * - URL_OFFERTA: Offer-specific URL (optional, max 100 characters)
 * 
 * Validation Rules:
 * - Phone number is mandatory and must follow Italian phone format
 * - URLs are optional but if provided must be valid URLs
 * - All fields have specific character limits per SII specification
 * - At least one contact method should be provided (phone is mandatory)
 */

import { z } from 'zod'

/**
 * Phone number validation schema
 * Italian phone number format with international support
 */
export const TelefonoSchema = z.string()
  .trim()
  .min(1, 'Numero di telefono è obbligatorio')
  .regex(
    /^(\+39\s*)?([0-9]+(?:[\s\-][0-9]+)*)$/,
    'Formato numero di telefono non valido (es: +39 02 12345678, 06 12345678)'
  )
  .transform(val => {
    // Normalize phone number format: remove spaces and dashes, keep +39 prefix
    return val.replace(/[\s\-]/g, '')
  })
  .refine(
    val => val.length <= 15,
    'Numero di telefono non può superare 15 caratteri'
  )

/**
 * URL validation schema for vendor website
 * Optional field with URL format validation
 */
export const URLSitoVenditoreSchema = z.string()
  .trim()
  .transform(val => val === '' ? undefined : val)
  .optional()
  .refine(
    (val) => val === undefined || (val.length <= 100 && /^https?:\/\/.+/.test(val)),
    'URL sito venditore non valido (deve iniziare con http:// o https:// e max 100 caratteri)'
  )

/**
 * URL validation schema for offer-specific page
 * Optional field with URL format validation
 */
export const URLOffertaSchema = z.string()
  .trim()
  .transform(val => val === '' ? undefined : val)
  .optional()
  .refine(
    (val) => val === undefined || (val.length <= 100 && /^https?:\/\/.+/.test(val)),
    'URL offerta non valido (deve iniziare con http:// o https:// e max 100 caratteri)'
  )

/**
 * Step 4 validation schema
 * Complete validation for contact information step
 */
export const Step4Schema = z.object({
  // Phone number - mandatory
  tel: TelefonoSchema,
  
  // Vendor website URL - optional
  url_sito: URLSitoVenditoreSchema,
  
  // Offer URL - optional  
  url_off: URLOffertaSchema,
})

/**
 * TypeScript type inference for Step 4 data
 */
export type Step4Data = z.infer<typeof Step4Schema>

/**
 * Default values for Step 4 form
 * Used by NuQS for URL state initialization
 */
export const Step4Defaults: Partial<Step4Data> = {
  tel: '',
  url_sito: undefined,
  url_off: undefined,
}

/**
 * Step 4 field labels in Italian
 * For form components and validation messages
 */
export const Step4Labels = {
  tel: 'Telefono',
  url_sito: 'URL Sito Venditore',
  url_off: 'URL Offerta',
} as const

/**
 * Step 4 field descriptions
 * Additional help text for form fields
 */
export const Step4Descriptions = {
  tel: 'Numero di telefono per contatti (formato italiano, es: +39 02 12345678)',
  url_sito: 'Sito web aziendale del venditore (opzionale, max 100 caratteri)',
  url_off: 'Pagina web specifica per questa offerta (opzionale, max 100 caratteri)',
} as const

/**
 * Step 4 validation helper
 * Safe parse function with Italian error messages
 */
export function validateStep4(data: unknown): {
  success: true
  data: Step4Data
} | {
  success: false
  errors: Record<string, string>
} {
  const result = Step4Schema.safeParse(data)
  
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
 * Check if Step 4 is valid and complete
 * Used for step navigation validation
 */
export function isStep4Complete(data: Partial<Step4Data>): boolean {
  const result = Step4Schema.safeParse(data)
  return result.success
}

/**
 * Get validation errors for specific field
 * Used for real-time field validation
 */
export function getStep4FieldError(
  fieldName: keyof Step4Data,
  value: string
): string | null {
  const fieldSchema = Step4Schema.shape[fieldName]
  if (!fieldSchema) return null
  
  const result = fieldSchema.safeParse(value)
  
  if (result.success) {
    return null
  }
  
  return result.error.errors[0]?.message || 'Valore non valido'
}

/**
 * Format Step 4 data for XML generation
 * Converts form data to XML field names
 */
export function formatStep4ForXML(data: Step4Data) {
  return {
    TELEFONO: data.tel,
    URL_SITO_VENDITORE: data.url_sito || undefined,
    URL_OFFERTA: data.url_off || undefined,
  }
}

/**
 * Validate phone number format
 * Helper for real-time phone number validation
 */
export function isValidPhoneNumber(phone: string): boolean {
  const trimmed = phone.trim()
  if (!trimmed) return false
  
  const result = TelefonoSchema.safeParse(trimmed)
  return result.success
}

/**
 * Format phone number for display
 * Helper for displaying phone numbers in a readable format
 */
export function formatPhoneNumberDisplay(phone: string): string {
  const cleaned = phone.replace(/[\s\-]/g, '')
  
  // Italian mobile format: +39 xxx xxx xxxx
  if (cleaned.startsWith('+39') && cleaned.length === 13) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
  }
  
  // Italian landline format: +39 xx xxxx xxxx
  if (cleaned.startsWith('+39') && cleaned.length >= 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 9)} ${cleaned.slice(9)}`
  }
  
  // Local format without +39
  if (cleaned.length >= 8 && !cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      // Mobile: xxx xxx xxxx
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    } else {
      // Landline: xx xxxx xxxx
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`
    }
  }
  
  return phone // Return as-is if format not recognized
}

/**
 * Validate URL format
 * Helper for real-time URL validation
 */
export function isValidURL(url: string): boolean {
  if (!url.trim()) return true // Empty is valid (optional)
  
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Get contact method summary
 * Helper for displaying available contact methods
 */
export function getContactMethodSummary(data: Step4Data) {
  const methods: string[] = []
  
  if (data.tel) {
    methods.push('Telefono')
  }
  
  if (data.url_sito) {
    methods.push('Sito web')
  }
  
  if (data.url_off) {
    methods.push('Pagina offerta')
  }
  
  return {
    totalMethods: methods.length,
    methods,
    hasPhone: !!data.tel,
    hasWebsite: !!data.url_sito,
    hasOfferPage: !!data.url_off,
    isComprehensive: methods.length >= 2, // Multiple contact options
  }
}

/**
 * Validate contact information completeness
 * Business logic validation for contact quality
 */
export function validateContactCompleteness(data: Step4Data): {
  isValid: boolean
  warnings: string[]
  suggestions: string[]
} {
  const warnings: string[] = []
  const suggestions: string[] = []
  const summary = getContactMethodSummary(data)
  
  // Business logic warnings
  if (!summary.hasWebsite) {
    suggestions.push('Considerare l\'aggiunta di un sito web aziendale per maggiore credibilità')
  }
  
  if (!summary.hasOfferPage) {
    suggestions.push('Una pagina dedicata all\'offerta può migliorare la conversione')
  }
  
  if (data.tel && !data.tel.startsWith('+39')) {
    suggestions.push('Aggiungere il prefisso internazionale +39 per maggiore chiarezza')
  }
  
  // URL quality checks
  if (data.url_sito && !data.url_sito.startsWith('https://')) {
    warnings.push('Il sito web dovrebbe utilizzare HTTPS per la sicurezza')
  }
  
  if (data.url_off && !data.url_off.startsWith('https://')) {
    warnings.push('La pagina offerta dovrebbe utilizzare HTTPS per la sicurezza')
  }
  
  return {
    isValid: true, // All warnings, no blocking errors
    warnings,
    suggestions
  }
}

/**
 * Step 4 form validation state type
 * Used by form components for validation display
 */
export type Step4ValidationState = {
  [K in keyof Step4Data]: {
    value: string
    error: string | null
    isValid: boolean
  }
}

/**
 * Create initial validation state
 * Used by form components initialization
 */
export function createStep4ValidationState(
  initialData: Partial<Step4Data> = {}
): Step4ValidationState {
  return {
    tel: {
      value: initialData.tel || '',
      error: null,
      isValid: false,
    },
    url_sito: {
      value: initialData.url_sito || '',
      error: null,
      isValid: true, // Optional field
    },
    url_off: {
      value: initialData.url_off || '',
      error: null,
      isValid: true, // Optional field
    },
  }
} 