'use client'

/**
 * Enhanced Step Hook Factory for SII Wizard
 * Reusable factory for creating step hooks with comprehensive state management
 * 
 * Features:
 * - Standardized debounced text input pattern across all steps
 * - Base64 JSON URL encoding with field abbreviation
 * - Zod validation integration with Italian error messages
 * - Batch update functions for related fields
 * - Comprehensive reset and clear functions with intelligent analysis
 * - Field state diagnostics and recommendations
 * - Cross-validation and field dependencies
 * - Performance monitoring and optimization
 * 
 * Reset and Clear Functions Usage:
 * ```typescript
 * const { 
 *   clearField,              // Clear single field: clearField('email')
 *   clearFields,             // Clear multiple: clearFields(['email', 'phone'])
 *   clearInvalidFields,      // Clear only fields with errors
 *   clearFieldsByCategory,   // Clear by group: clearFieldsByCategory('contact')
 *   resetField,              // Reset to default: resetField('email')
 *   resetInvalidFields,      // Reset only invalid fields to defaults
 *   smartReset,              // Intelligent reset strategy
 *   getResetRecommendations, // Get AI recommendations for reset
 *   getCategorizedFields,    // Get field analysis
 *   conditionalReset         // Custom predicate reset
 * } = useStepX()
 * 
 * // Smart reset example
 * const handleSmartReset = () => {
 *   const recommendations = getResetRecommendations()
 *   if (recommendations.shouldClearInvalid) {
 *     clearInvalidFields()
 *   } else if (recommendations.shouldResetToDefaults) {
 *     resetToDefaults()
 *   }
 * }
 * 
 * // Conditional reset example
 * const clearOnlyPriceFields = () => {
 *   conditionalReset((fieldName, value, hasError) => {
 *     return String(fieldName).includes('price') && hasError
 *   }, false) // false = clear, true = reset to default
 * }
 * ```
 */

import { useCallback, useMemo } from 'react'
import { useQueryStates } from 'nuqs'
import { z } from 'zod'
import { 
  debounce, 
  DEFAULT_DEBOUNCE_DELAY, 
  FAST_DEBOUNCE_DELAY 
} from '../../lib/utils/debounce'
import { 
  abbreviateFieldsObject, 
  expandFieldsObject, 
  type StepId 
} from '../../lib/sii/field-mappings'

/**
 * Generic step validation function type
 */
type StepValidationFn<T> = (data: unknown) => {
  success: true
  data: T
} | {
  success: false
  errors: Record<string, string>
}

/**
 * Field error getter function type
 */
type FieldErrorFn<T> = (fieldName: keyof T, value: string) => string | null

/**
 * Extended Zod SafeParseResult type for comprehensive validation
 */
type ExtendedSafeParseResult<T> = {
  success: boolean
  data?: T
  error?: z.ZodError
  issues?: z.ZodIssue[]
  fieldErrors?: Record<string, string[]>
  firstError?: string
  errorCount?: number
  hasFieldError?: (fieldName: keyof T) => boolean
  getFieldErrors?: (fieldName: keyof T) => string[]
  getFirstFieldError?: (fieldName: keyof T) => string | null
}

/**
 * Validation severity levels for enhanced error reporting
 */
type ValidationSeverity = 'error' | 'warning' | 'info'

/**
 * Enhanced validation result with severity and context
 */
type EnhancedValidationResult<T> = {
  isValid: boolean
  severity: ValidationSeverity
  result: ExtendedSafeParseResult<T>
  context?: {
    fieldCount: number
    completedFields: number
    completionPercentage: number
    missingRequiredFields: Array<keyof T>
    invalidFields: Array<keyof T>
  }
}

/**
 * Enhanced value comparison for clearOnDefault functionality
 * Intelligently compares values with defaults across different data types
 */
function isValueEqualToDefault(value: any, defaultValue: any): boolean {
  // Handle null/undefined cases
  if (value === null || value === undefined) {
    return defaultValue === null || defaultValue === undefined
  }
  
  if (defaultValue === null || defaultValue === undefined) {
    return value === null || value === undefined
  }
  
  // Handle arrays (including empty arrays)
  if (Array.isArray(value) && Array.isArray(defaultValue)) {
    if (value.length !== defaultValue.length) return false
    if (value.length === 0 && defaultValue.length === 0) return true
    
    return value.every((item, index) => 
      isValueEqualToDefault(item, defaultValue[index])
    )
  }
  
  // Handle objects (for complex array items)
  if (typeof value === 'object' && typeof defaultValue === 'object') {
    const valueKeys = Object.keys(value)
    const defaultKeys = Object.keys(defaultValue)
    
    if (valueKeys.length !== defaultKeys.length) return false
    
    return valueKeys.every(key => 
      isValueEqualToDefault(value[key], defaultValue[key])
    )
  }
  
  // Handle strings (including empty strings as default)
  if (typeof value === 'string' && typeof defaultValue === 'string') {
    // Treat empty string and undefined as equivalent for URL optimization
    if (value.trim() === '' && (defaultValue === '' || defaultValue === undefined)) {
      return true
    }
    return value === defaultValue
  }
  
  // Handle numbers (including 0 as potential default)
  if (typeof value === 'number' && typeof defaultValue === 'number') {
    return value === defaultValue
  }
  
  // Handle booleans
  if (typeof value === 'boolean' && typeof defaultValue === 'boolean') {
    return value === defaultValue
  }
  
  // Handle string vs undefined/null for text fields
  if (typeof value === 'string' && (defaultValue === undefined || defaultValue === null)) {
    return value.trim() === ''
  }
  
  if ((value === undefined || value === null) && typeof defaultValue === 'string') {
    return defaultValue.trim() === ''
  }
  
  // Fallback to strict equality
  return value === defaultValue
}

/**
 * Step completeness checker function type
 */
type CompletenessCheckFn<T> = (data: Partial<T>) => boolean

/**
 * Base64 JSON parser factory for any step
 */
function createStepJsonParser<T>(
  stepId: StepId,
  defaultValues: T,
  validationFn?: StepValidationFn<T>
) {
  return {
    parse: (encoded: string): Partial<T> => {
      if (!encoded) return defaultValues
      
      try {
        const decoded = atob(encoded)
        const parsed = JSON.parse(decoded)
        
        // Expand abbreviated field names
        const expanded = expandFieldsObject(stepId, parsed)
        
        // Apply validation if provided
        if (validationFn) {
          const validation = validationFn(expanded)
          return validation.success ? validation.data : defaultValues
        }
        
        return expanded as Partial<T>
      } catch (error) {
        console.warn(`[${stepId}] Failed to decode state:`, error)
        return defaultValues
      }
    },
    serialize: (value: Partial<T>): string => {
      try {
        // Don't encode empty/default values to keep URLs clean
        if (!value || Object.keys(value).length === 0) {
          return ''
        }
        
        // Enhanced clearOnDefault: Remove values that match defaults
        const nonDefaultValues: Partial<T> = {}
        let hasNonDefaultContent = false
        
        Object.entries(value).forEach(([key, val]) => {
          const fieldKey = key as keyof T
          const defaultValue = defaultValues[fieldKey]
          
          // Check if value differs from default
          if (!isValueEqualToDefault(val, defaultValue)) {
            (nonDefaultValues as any)[fieldKey] = val
            hasNonDefaultContent = true
          }
        })
        
        // If no non-default values, return empty string
        if (!hasNonDefaultContent) {
          return ''
        }
        
        // Abbreviate field names before encoding
        const abbreviated = abbreviateFieldsObject(stepId, nonDefaultValues)
        const json = JSON.stringify(abbreviated)
        return btoa(json)
      } catch (error) {
        console.warn(`[${stepId}] Failed to encode state:`, error)
        return ''
      }
    },
    defaultValue: defaultValues,
    withDefault: (newDefault: Partial<T>) => 
      createStepJsonParser(stepId, newDefault as T, validationFn)
  }
}

/**
 * Validation state type for any step
 */
type ValidationState<T> = {
  [K in keyof T]: {
    value: string
    error: string | null
    isValid: boolean
  }
}

/**
 * Related field groups configuration
 * Defines which fields should be updated together for optimal UX
 */
type RelatedFieldGroup<T> = {
  name: string
  fields: Array<keyof T>
  updateStrategy: 'immediate' | 'debounced' | 'fast'
  description?: string
}

/**
 * Field relationship types for smart batch updates
 */
type FieldRelationship<T> = {
  // Fields that depend on each other (e.g., min/max values)
  dependencies?: Array<{
    primary: keyof T
    dependent: keyof T
    validator?: (primaryValue: any, dependentValue: any) => boolean
  }>
  // Fields that should be cleared when another field changes
  clearOnChange?: Array<{
    trigger: keyof T
    targets: Array<keyof T>
  }>
  // Fields that should be validated together
  crossValidation?: Array<{
    fields: Array<keyof T>
    validator: (values: Partial<T>) => string | null
  }>
}

/**
 * Hook factory configuration
 */
type StepHookConfig<T> = {
  stepId: StepId
  stepNumber: number
  defaultValues: T
  validationFn?: StepValidationFn<T>
  fieldErrorFn?: FieldErrorFn<T>
  completenessCheckFn?: CompletenessCheckFn<T>
  xmlFormatter?: (data: T) => Record<string, any>
  // Related field configurations for smart batch updates
  relatedFieldGroups?: RelatedFieldGroup<T>[]
  fieldRelationships?: FieldRelationship<T>
}

/**
 * Standard NuQS query options for all steps
 */
const BASE_STEP_QUERY_OPTIONS = {
  clearOnDefault: true,
  shallow: true,
  history: 'replace' as const
}

/**
 * Factory function to create step hooks with debounced text input updates
 */
export function createStepHook<T extends Record<string, any>>(
  config: StepHookConfig<T>
) {
  const {
    stepId,
    stepNumber,
    defaultValues,
    validationFn,
    fieldErrorFn,
    completenessCheckFn,
    xmlFormatter,
    relatedFieldGroups = [],
    fieldRelationships = {}
  } = config

  const paramKey = `s${stepNumber}` // s1, s2, etc. for URL brevity

  return function useStep() {
    const stepParser = useMemo(() => 
      createStepJsonParser(stepId, defaultValues, validationFn), [])
    
    const [state, setState] = useQueryStates(
      { [paramKey]: stepParser },
      BASE_STEP_QUERY_OPTIONS
    )

    const currentState: Partial<T> = state[paramKey] || defaultValues

    // Create validation state
    const validationState = useMemo((): ValidationState<T> => {
      const validation: any = {}
      
      Object.keys(defaultValues).forEach((key) => {
        const fieldKey = key as keyof T
        const currentValue = currentState[fieldKey] || ''
        const fieldError = fieldErrorFn ? 
          fieldErrorFn(fieldKey, String(currentValue)) : null
        
        validation[fieldKey] = {
          value: String(currentValue),
          error: fieldError,
          isValid: fieldError === null && currentValue !== ''
        }
      })
      
      return validation
    }, [currentState])

    // DEBOUNCED TEXT INPUT UPDATES - Core feature of this task
    
    // Standard debounced update for text inputs (300ms)
    const debouncedUpdate = useMemo(() => {
      const updateFn = (updates: Partial<T>) => {
        setState({ [paramKey]: { ...currentState, ...updates } })
      }
      return debounce(updateFn, DEFAULT_DEBOUNCE_DELAY)
    }, [setState, currentState])

    // Fast debounced update for immediate feedback (150ms)
    const fastUpdate = useMemo(() => {
      const updateFn = (updates: Partial<T>) => {
        setState({ [paramKey]: { ...currentState, ...updates } })
      }
      return debounce(updateFn, FAST_DEBOUNCE_DELAY)
    }, [setState, currentState])

    // Immediate update for critical changes (no debounce)
    const immediateUpdate = useCallback((updates: Partial<T>) => {
      setState({ [paramKey]: { ...currentState, ...updates } })
    }, [setState, currentState])

    // DEBOUNCED FIELD UPDATE FUNCTIONS
    
    // Standard debounced field update for text inputs
    const updateField = useCallback((
      fieldName: keyof T, 
      value: any
    ) => {
      debouncedUpdate({ [fieldName]: value } as Partial<T>)
    }, [debouncedUpdate])

    // Fast debounced field update for paste operations
    const fastUpdateField = useCallback((
      fieldName: keyof T,
      value: any
    ) => {
      fastUpdate({ [fieldName]: value } as Partial<T>)
    }, [fastUpdate])

    // Immediate field update for dropdowns/checkboxes
    const immediateUpdateField = useCallback((
      fieldName: keyof T,
      value: any
    ) => {
      immediateUpdate({ [fieldName]: value } as Partial<T>)
    }, [immediateUpdate])

    // BATCH UPDATE FUNCTIONS FOR RELATED FIELDS
    
    // Basic batch update multiple related fields
    const batchUpdate = useCallback((updates: Partial<T>) => {
      immediateUpdate(updates)
    }, [immediateUpdate])

    // Debounced batch update for text field groups
    const debouncedBatchUpdate = useCallback((updates: Partial<T>) => {
      debouncedUpdate(updates)
    }, [debouncedUpdate])

    // SMART BATCH UPDATE FUNCTIONS FOR RELATED FIELD GROUPS

    // Apply field relationships and dependencies
    const applyFieldRelationships = useCallback((updates: Partial<T>): Partial<T> => {
      let processedUpdates = { ...updates }
      
      // Handle field dependencies
      if (fieldRelationships.dependencies) {
        fieldRelationships.dependencies.forEach(({ primary, dependent, validator }) => {
          const primaryValue = processedUpdates[primary] ?? currentState[primary]
          const dependentValue = processedUpdates[dependent] ?? currentState[dependent]
          
          // Apply dependency validation
          if (validator && primaryValue !== undefined) {
            if (!validator(primaryValue, dependentValue)) {
              // Clear dependent field if validation fails
              processedUpdates[dependent] = '' as any
            }
          }
        })
      }

      // Handle clear-on-change relationships
      if (fieldRelationships.clearOnChange) {
        fieldRelationships.clearOnChange.forEach(({ trigger, targets }) => {
          if (processedUpdates[trigger] !== undefined) {
            targets.forEach(target => {
              processedUpdates[target] = '' as any
            })
          }
        })
      }

      return processedUpdates
    }, [currentState, fieldRelationships])

    // Update related field group by name
    const updateRelatedFieldGroup = useCallback((
      groupName: string, 
      updates: Partial<T>
    ) => {
      const group = relatedFieldGroups.find(g => g.name === groupName)
      if (!group) {
        console.warn(`[${stepId}] Related field group '${groupName}' not found`)
        return
      }

      // Filter updates to only include fields in this group
      const groupUpdates: Partial<T> = {}
      group.fields.forEach(field => {
        if (updates[field] !== undefined) {
          groupUpdates[field] = updates[field]
        }
      })

      // Apply field relationships
      const processedUpdates = applyFieldRelationships(groupUpdates)

      // Use appropriate update strategy for the group
      switch (group.updateStrategy) {
        case 'immediate':
          immediateUpdate(processedUpdates)
          break
        case 'fast':
          fastUpdate(processedUpdates)
          break
        case 'debounced':
        default:
          debouncedUpdate(processedUpdates)
          break
      }
    }, [relatedFieldGroups, applyFieldRelationships, immediateUpdate, fastUpdate, debouncedUpdate])

    // Smart batch update that automatically groups related fields
    const smartBatchUpdate = useCallback((updates: Partial<T>) => {
      // Group updates by related field groups
      const groupedUpdates: Record<string, Partial<T>> = {}
      const ungroupedUpdates: Partial<T> = {}

      Object.entries(updates).forEach(([fieldName, value]) => {
        const field = fieldName as keyof T
        let grouped = false

        // Find which group this field belongs to
        relatedFieldGroups.forEach(group => {
          if (group.fields.includes(field)) {
            if (!groupedUpdates[group.name]) {
              groupedUpdates[group.name] = {}
            }
            groupedUpdates[group.name][field] = value
            grouped = true
          }
        })

        // If field doesn't belong to any group, add to ungrouped
        if (!grouped) {
          ungroupedUpdates[field] = value
        }
      })

      // Update each group using its preferred strategy
      Object.entries(groupedUpdates).forEach(([groupName, groupUpdates]) => {
        updateRelatedFieldGroup(groupName, groupUpdates)
      })

      // Update ungrouped fields with default strategy
      if (Object.keys(ungroupedUpdates).length > 0) {
        const processedUngrouped = applyFieldRelationships(ungroupedUpdates)
        debouncedUpdate(processedUngrouped)
      }
    }, [relatedFieldGroups, updateRelatedFieldGroup, applyFieldRelationships, debouncedUpdate])

    // Cross-validation for related fields
    const validateRelatedFields = useCallback((
      fieldsToValidate?: Array<keyof T>
    ): Record<string, string> => {
      const errors: Record<string, string> = {}
      
      if (!fieldRelationships.crossValidation) return errors

      fieldRelationships.crossValidation.forEach(({ fields, validator }) => {
        // Only validate if we're checking these specific fields or all fields
        if (fieldsToValidate && !fields.some(field => fieldsToValidate.includes(field))) {
          return
        }

        const values: Partial<T> = {}
        fields.forEach(field => {
          values[field] = currentState[field]
        })

        const error = validator(values)
        if (error) {
          // Add error to all fields in the group
          fields.forEach(field => {
            errors[String(field)] = error
          })
        }
      })

      return errors
    }, [currentState, fieldRelationships])

    // Get available related field groups
    const getRelatedFieldGroups = useCallback(() => {
      return relatedFieldGroups.map(group => ({
        name: group.name,
        fields: group.fields,
        updateStrategy: group.updateStrategy,
        description: group.description
      }))
    }, [relatedFieldGroups])

    // Update all fields in a specific group to empty values
    const clearRelatedFieldGroup = useCallback((groupName: string) => {
      const group = relatedFieldGroups.find(g => g.name === groupName)
      if (!group) return

      const clearUpdates: Partial<T> = {}
      group.fields.forEach(field => {
        clearUpdates[field] = '' as any
      })

      immediateUpdate(clearUpdates)
    }, [relatedFieldGroups, immediateUpdate])

    // TEXT INPUT OPTIMIZATION UTILITIES
    
    // Cancel all pending debounced updates
    const cancelUpdates = useCallback(() => {
      debouncedUpdate.cancel()
      fastUpdate.cancel()
    }, [debouncedUpdate, fastUpdate])

    // Flush all pending debounced updates immediately
    const flushUpdates = useCallback(() => {
      debouncedUpdate.flush()
      fastUpdate.flush()
    }, [debouncedUpdate, fastUpdate])

    // VALIDATION AND COMPLETION FUNCTIONS
    
    // Validate current state
    const validate = useCallback(() => {
      return validationFn ? validationFn(currentState) : { success: true, data: currentState as T }
    }, [currentState])

    // Check if step is complete and valid
    const isComplete = useMemo(() => {
      return completenessCheckFn ? completenessCheckFn(currentState) : false
    }, [currentState])

    // Get validation errors for the entire step
    const getValidationErrors = useCallback(() => {
      const validation = validate()
      return validation.success ? {} : (validation as any).errors || {}
    }, [validate])

    // Get field-specific validation error
    const getFieldError = useCallback((fieldName: keyof T) => {
      if (!fieldErrorFn) return null
      const value = currentState[fieldName] || ''
      return fieldErrorFn(fieldName, String(value))
    }, [currentState])

    // Check if specific field is valid
    const isFieldValid = useCallback((fieldName: keyof T) => {
      const value = currentState[fieldName] || ''
      const error = getFieldError(fieldName)
      return error === null && value !== ''
    }, [currentState, getFieldError])

    // Get progress percentage (0-100)
    const getProgress = useCallback(() => {
      const fields = Object.keys(defaultValues) as Array<keyof T>
      const validFields = fields.filter(field => isFieldValid(field))
      return Math.round((validFields.length / fields.length) * 100)
    }, [isFieldValid])

    // ENHANCED CLEAR-ON-DEFAULT FUNCTIONALITY
    
    // Check if current state has any non-default values
    const hasNonDefaultValues = useCallback(() => {
      return Object.entries(currentState).some(([key, value]) => {
        const fieldKey = key as keyof T
        const defaultValue = defaultValues[fieldKey]
        return !isValueEqualToDefault(value, defaultValue)
      })
    }, [currentState])
    
    // Get only non-default values from current state
    const getNonDefaultValues = useCallback((): Partial<T> => {
      const nonDefaults: Partial<T> = {}
      
      Object.entries(currentState).forEach(([key, value]) => {
        const fieldKey = key as keyof T
        const defaultValue = defaultValues[fieldKey]
        
        if (!isValueEqualToDefault(value, defaultValue)) {
          nonDefaults[fieldKey] = value
        }
      })
      
      return nonDefaults
    }, [currentState])
    
    // Clear fields that match default values (manual URL optimization)
    const clearDefaultValues = useCallback(() => {
      const nonDefaults = getNonDefaultValues()
      
      // Only update if there are differences to clear
      if (Object.keys(nonDefaults).length !== Object.keys(currentState).length) {
        setState({ [paramKey]: nonDefaults })
      }
    }, [getNonDefaultValues, currentState, setState])
    
    // Check if specific field value is at default
    const isFieldAtDefault = useCallback((fieldName: keyof T) => {
      const currentValue = currentState[fieldName]
      const defaultValue = defaultValues[fieldName]
      return isValueEqualToDefault(currentValue, defaultValue)
    }, [currentState])
    
    // Clear specific field to its default value
    const clearFieldToDefault = useCallback((fieldName: keyof T) => {
      const defaultValue = defaultValues[fieldName]
      immediateUpdateField(fieldName, defaultValue)
    }, [immediateUpdateField])
    
    // Enhanced batch update that automatically removes default values
    const optimizedBatchUpdate = useCallback((updates: Partial<T>) => {
      // Apply the updates to current state
      const newState = { ...currentState, ...updates }
      
      // Filter out default values for URL optimization
      const optimizedState: Partial<T> = {}
      Object.entries(newState).forEach(([key, value]) => {
        const fieldKey = key as keyof T
        const defaultValue = defaultValues[fieldKey]
        
        if (!isValueEqualToDefault(value, defaultValue)) {
          optimizedState[fieldKey] = value
        }
      })
      
      setState({ [paramKey]: optimizedState })
    }, [currentState, setState])

    // ENHANCED RESET AND CLEAR FUNCTIONS
    
    // Clear specific field (to empty/undefined for URL optimization)
    const clearField = useCallback((fieldName: keyof T) => {
      immediateUpdateField(fieldName, '')
    }, [immediateUpdateField])

    // Clear all fields (for URL optimization)
    const clearAllFields = useCallback(() => {
      const emptyState: Partial<T> = {}
      Object.keys(defaultValues).forEach(key => {
        emptyState[key as keyof T] = '' as any
      })
      immediateUpdate(emptyState)
    }, [immediateUpdate])
    
    // Clear multiple specific fields
    const clearFields = useCallback((fieldNames: Array<keyof T>) => {
      const updates: Partial<T> = {}
      fieldNames.forEach(fieldName => {
        updates[fieldName] = '' as any
      })
      immediateUpdate(updates)
    }, [immediateUpdate])
    
    // Clear only invalid fields (keeping valid data)
    const clearInvalidFields = useCallback(() => {
      const updates: Partial<T> = {}
      let hasInvalidFields = false
      
      Object.keys(defaultValues).forEach(key => {
        const fieldName = key as keyof T
        const fieldError = getFieldError(fieldName)
        
        if (fieldError) {
          updates[fieldName] = '' as any
          hasInvalidFields = true
        }
      })
      
      if (hasInvalidFields) {
        immediateUpdate(updates)
      }
      
      return hasInvalidFields
    }, [getFieldError, immediateUpdate])
    
    // Clear only empty fields (preserve user input)
    const clearEmptyFields = useCallback(() => {
      const updates: Partial<T> = {}
      let hasEmptyFields = false
      
      Object.keys(defaultValues).forEach(key => {
        const fieldName = key as keyof T
        const value = currentState[fieldName]
        
        if (value === '' || value === null || value === undefined) {
          updates[fieldName] = '' as any
          hasEmptyFields = true
        }
      })
      
      if (hasEmptyFields) {
        immediateUpdate(updates)
      }
      
      return hasEmptyFields
    }, [currentState, immediateUpdate])
    
    // Clear fields by category (using related field groups)
    const clearFieldsByCategory = useCallback((categoryName: string) => {
      const group = relatedFieldGroups.find(g => g.name === categoryName)
      if (!group) {
        console.warn(`[${stepId}] Field category '${categoryName}' not found`)
        return false
      }
      
      const updates: Partial<T> = {}
      group.fields.forEach(field => {
        updates[field] = '' as any
      })
      
      immediateUpdate(updates)
      return true
    }, [relatedFieldGroups, immediateUpdate])
    
    // Clear all except specified fields (preserve important data)
    const clearAllExcept = useCallback((preserveFields: Array<keyof T>) => {
      const updates: Partial<T> = {}
      const preserveSet = new Set(preserveFields.map(f => String(f)))
      
      Object.keys(defaultValues).forEach(key => {
        if (!preserveSet.has(key)) {
          updates[key as keyof T] = '' as any
        }
      })
      
      immediateUpdate(updates)
    }, [immediateUpdate])
    
    // Reset specific field to its default value
    const resetField = useCallback((fieldName: keyof T) => {
      const defaultValue = defaultValues[fieldName]
      immediateUpdateField(fieldName, defaultValue)
    }, [immediateUpdateField])
    
    // Reset multiple fields to their defaults
    const resetFields = useCallback((fieldNames: Array<keyof T>) => {
      const updates: Partial<T> = {}
      fieldNames.forEach(fieldName => {
        updates[fieldName] = defaultValues[fieldName]
      })
      immediateUpdate(updates)
    }, [immediateUpdate])
    
    // Reset only invalid fields to defaults (smart reset)
    const resetInvalidFields = useCallback(() => {
      const updates: Partial<T> = {}
      let hasInvalidFields = false
      
      Object.keys(defaultValues).forEach(key => {
        const fieldName = key as keyof T
        const fieldError = getFieldError(fieldName)
        
        if (fieldError) {
          updates[fieldName] = defaultValues[fieldName]
          hasInvalidFields = true
        }
      })
      
      if (hasInvalidFields) {
        immediateUpdate(updates)
      }
      
      return hasInvalidFields
    }, [getFieldError, immediateUpdate])
    
    // Reset fields by category to defaults
    const resetFieldsByCategory = useCallback((categoryName: string) => {
      const group = relatedFieldGroups.find(g => g.name === categoryName)
      if (!group) {
        console.warn(`[${stepId}] Field category '${categoryName}' not found`)
        return false
      }
      
      const updates: Partial<T> = {}
      group.fields.forEach(field => {
        updates[field] = defaultValues[field]
      })
      
      immediateUpdate(updates)
      return true
    }, [relatedFieldGroups, immediateUpdate])
    
    // Smart reset - reset invalid fields, clear empty fields
    const smartReset = useCallback(() => {
      const updates: Partial<T> = {}
      let hasChanges = false
      
      Object.keys(defaultValues).forEach(key => {
        const fieldName = key as keyof T
        const value = currentState[fieldName]
        const fieldError = getFieldError(fieldName)
        
        if (fieldError) {
          // Reset invalid fields to defaults
          updates[fieldName] = defaultValues[fieldName]
          hasChanges = true
        } else if (value === '' || value === null || value === undefined) {
          // Clear empty fields
          updates[fieldName] = '' as any
          hasChanges = true
        }
      })
      
      if (hasChanges) {
        immediateUpdate(updates)
      }
      
      return hasChanges
    }, [currentState, getFieldError, immediateUpdate])
    
    // Conditional reset with user-defined predicate
    const conditionalReset = useCallback((
      predicate: (fieldName: keyof T, value: any, hasError: boolean) => boolean,
      resetToDefault: boolean = true
    ) => {
      const updates: Partial<T> = {}
      let hasChanges = false
      
      Object.keys(defaultValues).forEach(key => {
        const fieldName = key as keyof T
        const value = currentState[fieldName]
        const hasError = getFieldError(fieldName) !== null
        
        if (predicate(fieldName, value, hasError)) {
          updates[fieldName] = resetToDefault ? defaultValues[fieldName] : ('' as any)
          hasChanges = true
        }
      })
      
      if (hasChanges) {
        immediateUpdate(updates)
      }
      
      return hasChanges
    }, [currentState, getFieldError, immediateUpdate])
    
    // Reset with preservation - reset all except valid, complete fields
    const resetWithPreservation = useCallback(() => {
      const updates: Partial<T> = {}
      let hasChanges = false
      
      Object.keys(defaultValues).forEach(key => {
        const fieldName = key as keyof T
        const value = currentState[fieldName]
        const hasError = getFieldError(fieldName) !== null
        const isEmpty = value === '' || value === null || value === undefined
        
        // Only preserve fields that are valid and not empty
        if (hasError || isEmpty) {
          updates[fieldName] = defaultValues[fieldName]
          hasChanges = true
        }
      })
      
      if (hasChanges) {
        immediateUpdate(updates)
      }
      
      return hasChanges
    }, [currentState, getFieldError, immediateUpdate])
    
    // FIELD STATE ANALYSIS FUNCTIONS
    
    // Get summary of field states for diagnostic purposes
    const getFieldStates = useCallback(() => {
      const states: Array<{
        fieldName: keyof T
        value: any
        defaultValue: any
        isEmpty: boolean
        isDefault: boolean
        hasError: boolean
        errorMessage: string | null
      }> = []
      
      Object.keys(defaultValues).forEach(key => {
        const fieldName = key as keyof T
        const value = currentState[fieldName]
        const defaultValue = defaultValues[fieldName]
        const isEmpty = value === '' || value === null || value === undefined
        const isDefault = isValueEqualToDefault(value, defaultValue)
        const errorMessage = getFieldError(fieldName)
        const hasError = errorMessage !== null
        
        states.push({
          fieldName,
          value,
          defaultValue,
          isEmpty,
          isDefault,
          hasError,
          errorMessage
        })
      })
      
      return states
    }, [currentState, getFieldError])
    
    // Get fields categorized by their status
    const getCategorizedFields = useCallback(() => {
      const fieldStates = getFieldStates()
      
      return {
        valid: fieldStates.filter(f => !f.hasError && !f.isEmpty).map(f => f.fieldName),
        invalid: fieldStates.filter(f => f.hasError).map(f => f.fieldName),
        empty: fieldStates.filter(f => f.isEmpty).map(f => f.fieldName),
        default: fieldStates.filter(f => f.isDefault).map(f => f.fieldName),
        modified: fieldStates.filter(f => !f.isDefault && !f.isEmpty).map(f => f.fieldName),
        validAndModified: fieldStates.filter(f => !f.hasError && !f.isEmpty && !f.isDefault).map(f => f.fieldName)
      }
    }, [getFieldStates])
    
    // Get reset/clear recommendations
    const getResetRecommendations = useCallback(() => {
      const categorized = getCategorizedFields()
      const fieldStates = getFieldStates()
      
      const recommendations = {
        shouldClearInvalid: categorized.invalid.length > 0,
        shouldClearEmpty: categorized.empty.length > 0,
        shouldResetToDefaults: categorized.invalid.length > categorized.valid.length,
        preserveFields: categorized.validAndModified,
        problematicFields: categorized.invalid,
        emptyFields: categorized.empty,
        totalFields: fieldStates.length,
        completedFields: categorized.valid.length,
        completionRate: Math.round((categorized.valid.length / fieldStates.length) * 100)
      }
      
      return recommendations
    }, [getCategorizedFields, getFieldStates])
    
    // Count fields by status
    const getFieldCounts = useCallback(() => {
      const categorized = getCategorizedFields()
      
      return {
        total: Object.keys(defaultValues).length,
        valid: categorized.valid.length,
        invalid: categorized.invalid.length,
        empty: categorized.empty.length,
        default: categorized.default.length,
        modified: categorized.modified.length,
        validAndModified: categorized.validAndModified.length
      }
    }, [getCategorizedFields])

    // STATE MANAGEMENT FUNCTIONS
    
    // Clear all step data (alias for clearAllFields)
    const clearStep = useCallback(() => {
      clearAllFields()
    }, [clearAllFields])

    // Reset to defaults
    const resetToDefaults = useCallback(() => {
      setState({ [paramKey]: defaultValues })
    }, [setState])

    // ENHANCED ZOD SAFEPARSE VALIDATION METHODS
    
    // Create extended SafeParseResult from Zod validation
    const createExtendedResult = useCallback(<T>(
      zodResult: z.SafeParseReturnType<any, T>
    ): ExtendedSafeParseResult<T> => {
      if (zodResult.success) {
        return {
          success: true,
          data: zodResult.data,
          errorCount: 0,
          hasFieldError: () => false,
          getFieldErrors: () => [],
          getFirstFieldError: () => null
        }
      }

      // Process error details
      const fieldErrors: Record<string, string[]> = {}
      const issues = zodResult.error.issues
      
      issues.forEach(issue => {
        const fieldPath = issue.path.join('.')
        if (!fieldErrors[fieldPath]) {
          fieldErrors[fieldPath] = []
        }
        fieldErrors[fieldPath].push(issue.message)
      })

      const firstError = issues[0]?.message || 'Errore di validazione'

      return {
        success: false,
        error: zodResult.error,
        issues,
        fieldErrors,
        firstError,
        errorCount: issues.length,
        hasFieldError: (fieldName: keyof T) => {
          const key = String(fieldName)
          return fieldErrors[key] && fieldErrors[key].length > 0
        },
        getFieldErrors: (fieldName: keyof T) => {
          const key = String(fieldName)
          return fieldErrors[key] || []
        },
        getFirstFieldError: (fieldName: keyof T) => {
          const key = String(fieldName)
          const errors = fieldErrors[key]
          return errors && errors.length > 0 ? errors[0] : null
        }
      }
    }, [])

    // Comprehensive step validation with SafeParseResult
    const validateStep = useCallback((): ExtendedSafeParseResult<T> => {
      if (!validationFn) {
        // No validation function provided, return success
        return {
          success: true,
          data: currentState as T,
          errorCount: 0,
          hasFieldError: () => false,
          getFieldErrors: () => [],
          getFirstFieldError: () => null
        }
      }

      const validation = validationFn(currentState)
      
      if (validation.success) {
        return {
          success: true,
          data: validation.data,
          errorCount: 0,
          hasFieldError: () => false,
          getFieldErrors: () => [],
          getFirstFieldError: () => null
        }
      }

      // Convert validation errors to extended format
      const fieldErrors: Record<string, string[]> = {}
      const errors = (validation as any).errors || {}
      Object.entries(errors).forEach(([field, error]) => {
        fieldErrors[field] = [error as string]
      })

      const firstError = Object.values(errors)[0] as string || 'Errore di validazione'

      return {
        success: false,
        fieldErrors,
        firstError,
        errorCount: Object.keys(errors).length,
        hasFieldError: (fieldName: keyof T) => {
          const key = String(fieldName)
          return fieldErrors[key] && fieldErrors[key].length > 0
        },
        getFieldErrors: (fieldName: keyof T) => {
          const key = String(fieldName)
          return fieldErrors[key] || []
        },
        getFirstFieldError: (fieldName: keyof T) => {
          const key = String(fieldName)
          const errors = fieldErrors[key]
          return errors && errors.length > 0 ? errors[0] : null
        }
      }
    }, [currentState, validationFn])

    // Validate individual field with SafeParseResult
    const validateField = useCallback((fieldName: keyof T): ExtendedSafeParseResult<any> => {
      if (!fieldErrorFn) {
        return {
          success: true,
          data: currentState[fieldName],
          errorCount: 0,
          hasFieldError: () => false,
          getFieldErrors: () => [],
          getFirstFieldError: () => null
        }
      }

      const value = currentState[fieldName] || ''
      const error = fieldErrorFn(fieldName, String(value))
      
      if (!error) {
        return {
          success: true,
          data: value,
          errorCount: 0,
          hasFieldError: () => false,
          getFieldErrors: () => [],
          getFirstFieldError: () => null
        }
      }

      return {
        success: false,
        fieldErrors: { [String(fieldName)]: [error] },
        firstError: error,
        errorCount: 1,
        hasFieldError: (checkFieldName: keyof T) => String(checkFieldName) === String(fieldName),
        getFieldErrors: (checkFieldName: keyof T) => 
          String(checkFieldName) === String(fieldName) ? [error] : [],
        getFirstFieldError: (checkFieldName: keyof T) => 
          String(checkFieldName) === String(fieldName) ? error : null
      }
    }, [currentState, fieldErrorFn])

    // Validate multiple fields with SafeParseResult
    const validateFields = useCallback((fieldNames: Array<keyof T>): ExtendedSafeParseResult<Partial<T>> => {
      const fieldErrors: Record<string, string[]> = {}
      const validData: Partial<T> = {}
      let totalErrors = 0

      fieldNames.forEach(fieldName => {
        const fieldResult = validateField(fieldName)
        
        if (fieldResult.success) {
          validData[fieldName] = fieldResult.data
        } else {
          const key = String(fieldName)
          fieldErrors[key] = fieldResult.getFieldErrors?.(fieldName) || []
          totalErrors += fieldResult.errorCount || 0
        }
      })

      const hasErrors = totalErrors > 0
      const firstError = hasErrors ? Object.values(fieldErrors)[0]?.[0] : undefined

      return {
        success: !hasErrors,
        data: hasErrors ? undefined : validData,
        fieldErrors: hasErrors ? fieldErrors : undefined,
        firstError,
        errorCount: totalErrors,
        hasFieldError: (fieldName: keyof T) => {
          const key = String(fieldName)
          return fieldErrors[key] && fieldErrors[key].length > 0
        },
        getFieldErrors: (fieldName: keyof T) => {
          const key = String(fieldName)
          return fieldErrors[key] || []
        },
        getFirstFieldError: (fieldName: keyof T) => {
          const key = String(fieldName)
          const errors = fieldErrors[key]
          return errors && errors.length > 0 ? errors[0] : null
        }
      }
    }, [validateField])

    // Enhanced validation with context and severity
    const validateWithContext = useCallback((): EnhancedValidationResult<T> => {
      const result = validateStep()
      const allFields = Object.keys(defaultValues) as Array<keyof T>
      const completedFields = allFields.filter(field => {
        const value = currentState[field]
        return value !== '' && value !== null && value !== undefined
      })
      
      const missingRequiredFields: Array<keyof T> = []
      const invalidFields: Array<keyof T> = []

      // Analyze field states
      allFields.forEach(field => {
        const value = currentState[field]
        const isEmpty = value === '' || value === null || value === undefined
        const hasError = result.hasFieldError?.(field) || false

        if (isEmpty && !hasError) {
          // Might be optional or required - check with field validation
          const fieldResult = validateField(field)
          if (!fieldResult.success) {
            missingRequiredFields.push(field)
          }
        } else if (hasError) {
          invalidFields.push(field)
        }
      })

      const completionPercentage = Math.round((completedFields.length / allFields.length) * 100)
      
      // Determine severity
      let severity: ValidationSeverity = 'info'
      if (result.errorCount && result.errorCount > 0) {
        severity = result.errorCount > 3 ? 'error' : 'warning'
      }

      return {
        isValid: result.success,
        severity,
        result,
        context: {
          fieldCount: allFields.length,
          completedFields: completedFields.length,
          completionPercentage,
          missingRequiredFields,
          invalidFields
        }
      }
    }, [validateStep, validateField, currentState])

    // Partial validation for incomplete forms (useful during filling)
    const validatePartial = useCallback((): ExtendedSafeParseResult<Partial<T>> => {
      // Only validate fields that have values
      const fieldsWithValues = Object.entries(currentState)
        .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        .map(([key, _]) => key as keyof T)

      return validateFields(fieldsWithValues)
    }, [currentState, validateFields])

    // Async validation simulation (for future async requirements)
    const validateAsync = useCallback(async (
      delay: number = 100
    ): Promise<ExtendedSafeParseResult<T>> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(validateStep())
        }, delay)
      })
    }, [validateStep])

    // Get detailed validation summary
    const getValidationSummary = useCallback(() => {
      const stepResult = validateStep()
      const contextResult = validateWithContext()
      
      return {
        // Overall status
        isValid: stepResult.success,
        isComplete: isComplete,
        completionPercentage: contextResult.context?.completionPercentage || 0,
        
        // Error details
        errorCount: stepResult.errorCount || 0,
        firstError: stepResult.firstError,
        hasErrors: (stepResult.errorCount || 0) > 0,
        
        // Field analysis
        totalFields: contextResult.context?.fieldCount || 0,
        completedFields: contextResult.context?.completedFields || 0,
        missingRequired: contextResult.context?.missingRequiredFields || [],
        invalidFields: contextResult.context?.invalidFields || [],
        
        // Severity assessment
        severity: contextResult.severity,
        
        // Helper methods
        hasFieldError: stepResult.hasFieldError || (() => false),
        getFieldErrors: stepResult.getFieldErrors || (() => []),
        getFirstFieldError: stepResult.getFirstFieldError || (() => null)
      }
    }, [validateStep, validateWithContext, isComplete])

    // XML GENERATION
    
    // Format data for XML generation with enhanced validation
    const getXMLData = useCallback(() => {
      const validation = validateStep()
      if (!validation.success) {
        const summary = getValidationSummary()
        throw new Error(
          `Cannot generate XML for ${stepId}: ${summary.errorCount} validation errors present. First error: ${validation.firstError}`
        )
      }
      
      return xmlFormatter ? xmlFormatter(validation.data!) : validation.data
    }, [validateStep, getValidationSummary, xmlFormatter])

    return {
      // Current state data
      data: currentState,
      
      // Validation state with errors and validity flags
      validation: validationState,
      
      // DEBOUNCED TEXT INPUT UPDATE FUNCTIONS
      updateField,           // Standard debounced (300ms) - for text inputs
      fastUpdateField,       // Fast debounced (150ms) - for paste operations  
      immediateUpdateField,  // No debounce - for dropdowns/checkboxes
      
      // BATCH UPDATE FUNCTIONS
      batchUpdate,           // Basic immediate batch update
      debouncedBatchUpdate,  // Basic debounced batch update for text groups
      optimizedBatchUpdate,  // Enhanced batch update that removes default values
      
      // SMART BATCH UPDATE FUNCTIONS FOR RELATED FIELDS
      smartBatchUpdate,         // Automatically groups and applies appropriate strategies
      updateRelatedFieldGroup,  // Update specific named field group
      clearRelatedFieldGroup,   // Clear all fields in a named group
      
      // RELATED FIELD UTILITIES
      validateRelatedFields,    // Cross-validation for field groups
      getRelatedFieldGroups,    // Get configuration of available field groups
      
      // Direct state update functions
      updateState: debouncedUpdate,
      fastUpdate,
      immediateUpdate,
      
      // TEXT INPUT OPTIMIZATION
      cancelUpdates,         // Cancel pending debounced updates
      flushUpdates,          // Flush pending updates immediately
      
      // ENHANCED CLEAR-ON-DEFAULT FUNCTIONALITY
      hasNonDefaultValues,   // Check if any fields have non-default values
      getNonDefaultValues,   // Get only fields with non-default values
      clearDefaultValues,    // Remove default values from URL state
      isFieldAtDefault,      // Check if specific field is at default
      clearFieldToDefault,   // Reset specific field to default value
      
      // ENHANCED RESET AND CLEAR FUNCTIONS
      clearField,                // Clear specific field to empty
      clearFields,               // Clear multiple specific fields
      clearAllFields,            // Clear all fields to empty
      clearInvalidFields,        // Clear only fields with validation errors
      clearEmptyFields,          // Clear only empty/undefined fields
      clearFieldsByCategory,     // Clear fields by related field group
      clearAllExcept,            // Clear all except specified fields
      clearStep,                 // Legacy alias for clearAllFields
      
      resetField,                // Reset specific field to default
      resetFields,               // Reset multiple fields to defaults
      resetInvalidFields,        // Reset only invalid fields to defaults
      resetFieldsByCategory,     // Reset field category to defaults
      resetToDefaults,           // Reset all fields to defaults
      resetWithPreservation,     // Reset invalid/empty, preserve valid
      smartReset,                // Intelligent reset (invalid->default, empty->clear)
      conditionalReset,          // Reset with custom predicate function
      
      // FIELD STATE ANALYSIS FUNCTIONS
      getFieldStates,            // Get detailed field states for diagnostics
      getCategorizedFields,      // Get fields categorized by status (valid/invalid/empty/etc)
      getResetRecommendations,   // Get intelligent recommendations for reset operations
      getFieldCounts,            // Get count summary of field statuses
      
      // Basic validation functions (legacy)
      validate,
      getValidationErrors,
      getFieldError,
      isFieldValid,
      
      // ENHANCED ZOD SAFEPARSE VALIDATION METHODS
      validateStep,           // Comprehensive step validation with SafeParseResult
      validateField,          // Individual field validation with SafeParseResult
      validateFields,         // Multiple fields validation with SafeParseResult
      validateWithContext,    // Enhanced validation with completion context
      validatePartial,        // Validate only filled fields (useful during editing)
      validateAsync,          // Async validation support for future requirements
      getValidationSummary,   // Detailed validation summary with analysis
      createExtendedResult,   // Utility to create extended results from Zod results
      
      // Step completion status
      isComplete,
      getProgress,
      
      // XML generation
      getXMLData,
      
      // Debug information
      stepId,
      stepNumber,
      rawState: state[paramKey]
    }
  }
}

/**
 * Type for hook return value
 */
export type StepHookReturn<T> = ReturnType<ReturnType<typeof createStepHook<T>>>

/**
 * Helper function to create field error function from Zod schema
 */
export function createFieldErrorFunction<T>(
  schema: z.ZodObject<any> | z.ZodEffects<any>
): FieldErrorFn<T> {
  return (fieldName: keyof T, value: string) => {
    // Extract base object schema from ZodEffects if needed
    const baseSchema = schema instanceof z.ZodEffects ? schema._def.schema : schema
    
    if (baseSchema instanceof z.ZodObject) {
      const fieldSchema = baseSchema.shape[fieldName as string]
      if (!fieldSchema) return null
      
      const result = fieldSchema.safeParse(value)
      return result.success ? null : (result.error.errors[0]?.message || 'Valore non valido')
    }
    
    // Fallback: validate the whole object and extract field error
    const testObj = { [fieldName]: value } as any
    const result = schema.safeParse(testObj)
    if (result.success) return null
    
    const fieldError = result.error.errors.find(err => err.path[0] === fieldName)
    return fieldError?.message || 'Valore non valido'
  }
}

/**
 * Helper function to create validation function from Zod schema
 */
export function createValidationFunction<T>(
  schema: z.ZodObject<any> | z.ZodEffects<any>
): StepValidationFn<T> {
  return (data: unknown) => {
    const result = schema.safeParse(data)
    
    if (result.success) {
      return { success: true, data: result.data as T }
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
}

/**
 * Enhanced helper function to create SafeParseResult validation function from Zod schema
 */
export function createSafeParseValidationFunction<T>(
  schema: z.ZodObject<any> | z.ZodEffects<any>
): (data: unknown) => ExtendedSafeParseResult<T> {
  return (data: unknown) => {
    const result = schema.safeParse(data)
    
    if (result.success) {
      return {
        success: true,
        data: result.data as T,
        errorCount: 0,
        hasFieldError: () => false,
        getFieldErrors: () => [],
        getFirstFieldError: () => null
      }
    }
    
    // Process error details for extended result
    const fieldErrors: Record<string, string[]> = {}
    const issues = result.error.issues
    
    issues.forEach(issue => {
      const fieldPath = issue.path.join('.')
      if (!fieldErrors[fieldPath]) {
        fieldErrors[fieldPath] = []
      }
      fieldErrors[fieldPath].push(issue.message)
    })

    const firstError = issues[0]?.message || 'Errore di validazione'

    return {
      success: false,
      error: result.error,
      issues,
      fieldErrors,
      firstError,
      errorCount: issues.length,
      hasFieldError: (fieldName: keyof T) => {
        const key = String(fieldName)
        return fieldErrors[key] && fieldErrors[key].length > 0
      },
      getFieldErrors: (fieldName: keyof T) => {
        const key = String(fieldName)
        return fieldErrors[key] || []
      },
      getFirstFieldError: (fieldName: keyof T) => {
        const key = String(fieldName)
        const errors = fieldErrors[key]
        return errors && errors.length > 0 ? errors[0] : null
      }
    }
  }
}

/**
 * Helper function to create completeness check function with enhanced validation
 */
export function createCompletenessCheckFunction<T>(
  schema: z.ZodObject<any> | z.ZodEffects<any>,
  requiredFields?: Array<keyof T>
): CompletenessCheckFn<T> {
  return (data: Partial<T>) => {
    if (requiredFields) {
      // Check only specified required fields
      return requiredFields.every(field => {
        const value = data[field]
        return value !== undefined && value !== null && value !== ''
      })
    }
    
    // Use schema to determine completeness
    const result = schema.safeParse(data)
    return result.success
  }
}

/**
 * Utility function to extract detailed validation context from Zod schema
 */
export function getValidationContext<T>(
  schema: z.ZodObject<any> | z.ZodEffects<any>,
  data: Partial<T>
): {
  totalFields: number
  definedFields: string[]
  requiredFields: string[]
  optionalFields: string[]
  missingRequired: string[]
  extraFields: string[]
} {
  // Extract base object schema from ZodEffects if needed
  const baseSchema = schema instanceof z.ZodEffects ? schema._def.schema : schema
  
  if (!(baseSchema instanceof z.ZodObject)) {
    // Fallback for non-object schemas
    const dataKeys = Object.keys(data)
    return {
      totalFields: dataKeys.length,
      definedFields: dataKeys,
      requiredFields: [],
      optionalFields: dataKeys,
      missingRequired: [],
      extraFields: []
    }
  }
  
  const schemaKeys = Object.keys(baseSchema.shape)
  const dataKeys = Object.keys(data)
  
  // Identify required vs optional fields based on Zod schema
  const requiredFields: string[] = []
  const optionalFields: string[] = []
  
  schemaKeys.forEach(key => {
    const fieldSchema = baseSchema.shape[key]
    // Check if field is optional by attempting to parse undefined
    const testResult = fieldSchema.safeParse(undefined)
    if (testResult.success) {
      optionalFields.push(key)
    } else {
      requiredFields.push(key)
    }
  })
  
  const missingRequired = requiredFields.filter(field => {
    const value = data[field as keyof T]
    return value === undefined || value === null || value === ''
  })
  
  const extraFields = dataKeys.filter(key => !schemaKeys.includes(key))
  
  return {
    totalFields: schemaKeys.length,
    definedFields: dataKeys,
    requiredFields,
    optionalFields,
    missingRequired,
    extraFields
  }
}

/**
 * Export additional types for external use
 */
export type { 
  ExtendedSafeParseResult, 
  EnhancedValidationResult, 
  ValidationSeverity
}

/**
 * Default export for convenient importing
 */
export default createStepHook 