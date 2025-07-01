/**
 * Base Zod schemas and utilities for SII XML Generator
 * Leverages enhanced TypeScript configuration for optimal type inference
 */

import { z } from 'zod'

/**
 * Base string schema with common validation patterns
 * Uses strict TypeScript settings for better error handling
 */
export const BaseStringSchema = z.string().trim()

/**
 * Required string schema (non-empty)
 * Enhanced with exactOptionalPropertyTypes for strict optional handling
 */
export const RequiredStringSchema = BaseStringSchema.min(1, 'Campo obbligatorio')

/**
 * Optional string schema
 * Handles empty strings as undefined for better TypeScript integration
 */
export const OptionalStringSchema = BaseStringSchema.optional().or(z.literal('').transform(() => undefined))

/**
 * PIVA (Partita IVA) validation schema
 * Italian VAT number validation with strict type checking
 */
export const PIVASchema = z.string()
  .trim()
  .regex(/^\d{11}$/, 'PIVA deve essere di 11 cifre numeriche')
  .refine((val) => {
    // Algoritmo di controllo PIVA italiana
    if (val.length !== 11) return false
    
    const digits = val.split('').map(Number)
    let sum = 0
    
    for (let i = 0; i < 10; i++) {
      const digit = digits[i]
      if (digit === undefined) return false
      
      let addend = digit
      if ((i + 1) % 2 === 0) {
        addend *= 2
        if (addend > 9) addend -= 9
      }
      sum += addend
    }
    
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit === digits[10]
  }, 'PIVA non valida (controllo algoritmo)')

/**
 * Codice Fiscale validation schema
 * Italian fiscal code validation with enhanced type safety
 */
export const CodiceFiscaleSchema = z.string()
  .trim()
  .regex(/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/, 'Formato codice fiscale non valido')

/**
 * Email validation schema
 * Enhanced with noUncheckedIndexedAccess compatibility
 */
export const EmailSchema = z.string()
  .trim()
  .email('Formato email non valido')
  .toLowerCase()

/**
 * Phone number validation schema
 * Italian phone number formats
 */
export const PhoneSchema = z.string()
  .trim()
  .regex(/^(\+39)?[\s]?([0-9]{2,4}[\s]?[0-9]{4,8})$/, 'Formato numero di telefono non valido')

/**
 * Numeric string schema for codes
 * Used for offer codes, market types, etc.
 */
export const NumericCodeSchema = z.string()
  .trim()
  .regex(/^\d+$/, 'Deve contenere solo numeri')

/**
 * Date string schema in ISO format
 * Enhanced for exactOptionalPropertyTypes compatibility
 */
export const DateStringSchema = z.string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido (YYYY-MM-DD)')
  .refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime()) && val === date.toISOString().split('T')[0]
  }, 'Data non valida')

/**
 * Positive number schema
 * Used for prices, quantities, durations
 */
export const PositiveNumberSchema = z.number()
  .positive('Deve essere un numero positivo')
  .finite('Deve essere un numero finito')

/**
 * Percentage schema (0-100)
 * Used for discounts, taxes, etc.
 */
export const PercentageSchema = z.number()
  .min(0, 'Percentuale non può essere negativa')
  .max(100, 'Percentuale non può superare 100')
  .finite('Deve essere un numero finito')

/**
 * Currency amount schema
 * European format with 2 decimal places
 */
export const CurrencySchema = z.number()
  .min(0, 'Importo non può essere negativo')
  .finite('Deve essere un numero finito')
  .transform((val) => Math.round(val * 100) / 100) // Round to 2 decimal places

/**
 * Enhanced error message helper
 * Uses noImplicitReturns for comprehensive error handling
 */
export function formatZodError(error: z.ZodError): string {
  return error.errors.map(err => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
    return `${path}${err.message}`
  }).join(', ')
}

/**
 * Safe parse helper with enhanced error handling
 * Uses exactOptionalPropertyTypes for strict type checking
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, error: formatZodError(result.error) }
  }
}

/**
 * Type-safe transform helper
 * Leverages noFallthroughCasesInSwitch for exhaustive case handling
 */
export function createTransformSchema<T, U>(
  baseSchema: z.ZodSchema<T>,
  transform: (value: T) => U,
  refinement?: (value: U) => boolean,
  refinementMessage?: string
): z.ZodEffects<z.ZodSchema<T>, U> {
  const transformedSchema = baseSchema.transform(transform)
  
  if (refinement && refinementMessage) {
    return transformedSchema.refine(refinement, refinementMessage) as z.ZodEffects<z.ZodSchema<T>, U>
  }
  
  return transformedSchema
} 