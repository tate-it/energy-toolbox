/**
 * Validation helper functions for SII XML Generator
 * Leverages enhanced TypeScript configuration for optimal type safety
 */

import { z } from 'zod'

/**
 * Enhanced validation result type
 * Uses exactOptionalPropertyTypes for strict optional handling
 */
export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: string[] | undefined
  fieldErrors?: Record<string, string[]> | undefined
}

/**
 * Validates data against a Zod schema with enhanced error reporting
 * Uses noImplicitReturns for comprehensive error handling
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    }
  } else {
    const fieldErrors: Record<string, string[]> = {}
    const generalErrors: string[] = []
    
    result.error.errors.forEach(error => {
      if (error.path.length > 0) {
        const fieldPath = error.path.join('.')
        if (!fieldErrors[fieldPath]) {
          fieldErrors[fieldPath] = []
        }
        fieldErrors[fieldPath]!.push(error.message)
      } else {
        generalErrors.push(error.message)
      }
    })
    
    return {
      success: false,
      errors: generalErrors.length > 0 ? generalErrors : undefined,
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined
    }
  }
}

/**
 * Validates partial data (useful for step-by-step validation)
 * Uses noUncheckedIndexedAccess for safe object property access
 */
export function validatePartial<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: Partial<unknown>
): ValidationResult<Partial<z.infer<z.ZodObject<T>>>> {
  // Create a partial schema for validation
  const partialSchema = schema.partial()
  return validateWithSchema(partialSchema, data)
}

/**
 * Combines multiple validation results
 * Enhanced with noFallthroughCasesInSwitch for exhaustive checking
 */
export function combineValidationResults<T extends Record<string, unknown>>(
  results: Record<keyof T, ValidationResult<unknown>>
): ValidationResult<T> {
  const combinedData: Partial<T> = {}
  const combinedErrors: string[] = []
  const combinedFieldErrors: Record<string, string[]> = {}
  let hasErrors = false
  
  for (const [key, result] of Object.entries(results)) {
    if (result.success && result.data !== undefined) {
      (combinedData as Record<string, unknown>)[key] = result.data
    } else {
      hasErrors = true
      
      if (result.errors) {
        combinedErrors.push(...result.errors)
      }
      
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, errors]) => {
          const prefixedField = `${key}.${field}`
          if (!combinedFieldErrors[prefixedField]) {
            combinedFieldErrors[prefixedField] = []
          }
          combinedFieldErrors[prefixedField]!.push(...errors)
        })
      }
    }
  }
  
  if (hasErrors) {
    return {
      success: false,
      errors: combinedErrors.length > 0 ? combinedErrors : undefined,
      fieldErrors: Object.keys(combinedFieldErrors).length > 0 ? combinedFieldErrors : undefined
    }
  } else {
    return {
      success: true,
      data: combinedData as T
    }
  }
}

/**
 * Creates a type-safe validator function for a specific schema
 * Uses strict TypeScript settings for optimal type inference
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return {
    validate: (data: unknown): ValidationResult<T> => 
      validateWithSchema(schema, data),
    
    validatePartial: (data: Partial<unknown>): ValidationResult<Partial<T>> => {
      // Use the schema.partial() method if available, otherwise validate normally
      const partialSchema = 'partial' in schema ? (schema as { partial(): z.ZodSchema<Partial<T>> }).partial() : schema
      return validateWithSchema(partialSchema, data)
    },
    
    parse: (data: unknown): T => {
      const result = schema.parse(data)
      return result
    },
    
    safeParse: (data: unknown): z.SafeParseReturnType<unknown, T> => 
      schema.safeParse(data),
    
    isValid: (data: unknown): data is T => 
      schema.safeParse(data).success
  }
}

/**
 * Form validation state helper
 * Enhanced with exactOptionalPropertyTypes for React forms
 */
export interface FormValidationState<T> {
  isValid: boolean
  isValidating: boolean
  errors: Record<string, string[]>
  touchedFields: Set<string>
  data?: T | undefined
}

/**
 * Creates initial form validation state
 * Uses noImplicitReturns for comprehensive state initialization
 */
export function createInitialFormState<T>(): FormValidationState<T> {
  return {
    isValid: false,
    isValidating: false,
    errors: {},
    touchedFields: new Set(),
    data: undefined
  }
}

/**
 * Updates form validation state with new validation result
 * Enhanced with strict type checking
 */
export function updateFormValidationState<T>(
  currentState: FormValidationState<T>,
  validationResult: ValidationResult<T>,
  touchedField?: string
): FormValidationState<T> {
  const newTouchedFields = new Set(currentState.touchedFields)
  if (touchedField) {
    newTouchedFields.add(touchedField)
  }
  
  return {
    isValid: validationResult.success,
    isValidating: false,
    errors: validationResult.fieldErrors || {},
    touchedFields: newTouchedFields,
    data: validationResult.data
  }
}

/**
 * Checks if a specific field has been touched and has errors
 * Uses noUncheckedIndexedAccess for safe field access
 */
export function hasFieldError<T>(
  formState: FormValidationState<T>,
  fieldName: string
): boolean {
  return formState.touchedFields.has(fieldName) && 
         fieldName in formState.errors && 
         formState.errors[fieldName]!.length > 0
}

/**
 * Gets error message for a specific field
 * Enhanced with strict null checking
 */
export function getFieldError<T>(
  formState: FormValidationState<T>,
  fieldName: string
): string | undefined {
  if (!hasFieldError(formState, fieldName)) {
    return undefined
  }
  
  const errors = formState.errors[fieldName]
  return errors && errors.length > 0 ? errors[0] : undefined
}

/**
 * Async validation helper for complex validations
 * Uses strict async/await patterns
 */
export async function validateAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  asyncValidators?: Array<(data: T) => Promise<string | null>>
): Promise<ValidationResult<T>> {
  // First run synchronous validation
  const syncResult = validateWithSchema(schema, data)
  
  if (!syncResult.success) {
    return syncResult
  }
  
  // Run async validators if provided
  if (asyncValidators && asyncValidators.length > 0) {
    const asyncErrors: string[] = []
    
    for (const validator of asyncValidators) {
      try {
        const error = await validator(syncResult.data!)
        if (error) {
          asyncErrors.push(error)
        }
      } catch (e) {
        asyncErrors.push(`Validation error: ${e instanceof Error ? e.message : 'Unknown error'}`)
      }
    }
    
    if (asyncErrors.length > 0) {
      return {
        success: false,
        errors: asyncErrors
      }
    }
  }
  
  return syncResult
} 