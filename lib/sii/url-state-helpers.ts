'use client'

/**
 * URL state persistence helper functions for SII wizard
 * Following NuQS v2 best practices slavishly for optimal performance and UX
 * 
 * Note: This file uses 'any' types due to complex integration with external libraries
 * (NuQS, React Router) that require flexible typing for URL state management.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQueryStates } from 'nuqs'
import { useCallback, useMemo } from 'react'
import { debounce, DEFAULT_DEBOUNCE_DELAY, FAST_DEBOUNCE_DELAY } from '../utils/debounce'
import { 
  abbreviateFieldsObject, 
  expandFieldsObject, 
  type StepId
} from './field-mappings'

/**
 * Base64 JSON parser for cleaner URLs
 * Encodes JSON data as base64 in URLs and decodes it back for application use
 */
function createBase64JsonParser<T = Record<string, unknown>>(
  defaultValue: T,
  validationFn?: (value: unknown) => T
): {
  parse: (value: string) => T
  serialize: (value: T) => string
  defaultValue: T
  withDefault: (newDefault: T) => ReturnType<typeof createBase64JsonParser<T>>
} {
  const parser = {
    parse: (encoded: string): T => {
      if (!encoded) return defaultValue
      
      try {
        // Decode base64 and parse JSON
        const decoded = atob(encoded)
        const parsed = JSON.parse(decoded)
        
        // Apply validation if provided
        if (validationFn) {
          return validationFn(parsed)
        }
        
        return parsed as T
      } catch (error) {
        console.warn('[nuqs] Failed to decode base64 JSON state:', error)
        return defaultValue
      }
    },
    serialize: (value: T): string => {
      try {
        // Don't encode empty/default values to keep URLs clean
        if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
          return ''
        }
        
        // Encode JSON as base64
        const json = JSON.stringify(value)
        return btoa(json)
      } catch (error) {
        console.warn('[nuqs] Failed to encode JSON state to base64:', error)
        return ''
      }
    },
    defaultValue,
    withDefault: (newDefault: T) => createBase64JsonParser(newDefault, validationFn)
  }
  
  return parser
}

// Base configuration following NuQS v2 best practices
const BASE_QUERY_OPTIONS = {
  // clearOnDefault is true by default in v2, explicitly setting for clarity
  clearOnDefault: true,
  // Using shallow routing by default for performance
  shallow: true,
  // Using replace instead of push for wizard steps to avoid history pollution
  history: 'replace' as const
}

// Advanced configuration for critical updates (step navigation)
const NAVIGATION_QUERY_OPTIONS = {
  ...BASE_QUERY_OPTIONS,
  // Use push for navigation to allow back/forward
  history: 'push' as const,
  // Deep routing for step changes to update server state
  shallow: false
}

/**
 * Generic step state hook factory following NuQS v2 patterns
 * Creates type-safe, debounced, batched state management for any wizard step
 */
export function createStepStateHook<T extends StepId>(
  stepId: T,
  defaultValues: Record<string, unknown> = {},
  validationFn?: (value: unknown) => Record<string, unknown>
) {
  const paramKey = stepId.replace('step', 's') // s1, s2, etc. for URL brevity
  
  return function useStepState() {
    // Use base64 JSON parser for cleaner URLs
    const jsonParser = createBase64JsonParser(
      defaultValues,
      validationFn || ((value: unknown) => {
        if (typeof value === 'object' && value !== null) {
          return value as Record<string, unknown>
        }
        return defaultValues
      })
    )

    const [state, setState] = useQueryStates(
      { [paramKey]: jsonParser },
      BASE_QUERY_OPTIONS
    )

    const stepState = state[paramKey] || defaultValues

    // Expand abbreviated field names for internal use
    const expandedState = useMemo(() => {
      return expandFieldsObject(stepId, stepState)
    }, [stepState])

    // Debounced setter for input changes (follows NuQS performance best practices)
    const debouncedSetState = useMemo(() => {
      const updateState = (updates: Record<string, any>) => {
        // Abbreviate field names for URL storage
        const abbreviatedUpdates = abbreviateFieldsObject(stepId, updates)
        setState({ [paramKey]: { ...stepState, ...abbreviatedUpdates } })
      }
      
      return debounce(updateState as any, DEFAULT_DEBOUNCE_DELAY)
    }, [setState, stepState])

    // Fast setter for immediate updates (dropdowns, checkboxes)
    const fastSetState = useMemo(() => {
      const updateState = (updates: Record<string, any>) => {
        const abbreviatedUpdates = abbreviateFieldsObject(stepId, updates)
        setState({ [paramKey]: { ...stepState, ...abbreviatedUpdates } })
      }
      
      return debounce(updateState as any, FAST_DEBOUNCE_DELAY)
    }, [setState, stepState])

    // Immediate setter for navigation/critical updates
    const immediateSetState = useCallback((updates: Record<string, any>) => {
      const abbreviatedUpdates = abbreviateFieldsObject(stepId, updates)
      setState({ [paramKey]: { ...stepState, ...abbreviatedUpdates } })
    }, [setState, stepState])

    // Batch update function for multiple field changes
    const batchUpdate = useCallback((updates: Record<string, any>) => {
      const abbreviatedUpdates = abbreviateFieldsObject(stepId, updates)
      setState({ [paramKey]: { ...stepState, ...abbreviatedUpdates } })
    }, [setState, stepState])

    // Clear step state
    const clearStep = useCallback(() => {
      setState({ [paramKey]: defaultValues })
    }, [setState])

    // Reset to defaults
    const resetToDefaults = useCallback(() => {
      setState({ [paramKey]: defaultValues })
    }, [setState])

    return {
      // Current state with expanded field names
      state: expandedState,
      // Raw abbreviated state (for debugging)
      rawState: stepState,
      // Debounced update for text inputs
      updateState: debouncedSetState,
      // Fast update for dropdowns/checkboxes
      fastUpdate: fastSetState,
      // Immediate update for critical changes
      immediateUpdate: immediateSetState,
      // Batch multiple updates
      batchUpdate,
      // Clear all data
      clearStep,
      // Reset to defaults
      resetToDefaults,
      // Cancel pending debounced updates
      cancelUpdates: () => {
        debouncedSetState.cancel()
        fastSetState.cancel()
      },
      // Flush pending debounced updates immediately
      flushUpdates: () => {
        debouncedSetState.flush()
        fastSetState.flush()
      }
    }
  }
}

/**
 * Master wizard state hook for managing all steps
 * Provides global state operations and step navigation persistence
 */
export function useWizardStateManager() {
  // Create parsers for all 18 steps
  const stepParsers = useMemo(() => {
    const parsers: Record<string, any> = {}
    
    for (let i = 1; i <= 18; i++) {
      const stepKey = `s${i}`
      const jsonParser = createBase64JsonParser(
        {},
        (value: unknown) => {
          if (typeof value === 'object' && value !== null) {
            return value as Record<string, any>
          }
          return {}
        }
      )
      
      parsers[stepKey] = jsonParser
    }
    
    return parsers
  }, [])

  const [allStepsState, setAllStepsState] = useQueryStates(
    stepParsers,
    BASE_QUERY_OPTIONS
  )

  // Get expanded state for all steps
  const expandedAllStepsState = useMemo(() => {
    const expanded: Record<string, Record<string, any>> = {}
    
    for (let i = 1; i <= 18; i++) {
      const stepKey = `s${i}`
      const stepId = `step${i}` as StepId
      const stepState = allStepsState[stepKey] || {}
      expanded[stepId] = expandFieldsObject(stepId, stepState)
    }
    
    return expanded
  }, [allStepsState])

  // Navigation-specific state updates (uses different options)
  const [, setNavigationState] = useQueryStates(
    stepParsers,
    NAVIGATION_QUERY_OPTIONS
  )

  // Save state before navigation (critical operation)
  const saveStateBeforeNavigation = useCallback((
    stepId: StepId,
    state: Record<string, any>
  ) => {
    const stepKey = stepId.replace('step', 's')
    const abbreviatedState = abbreviateFieldsObject(stepId, state)
    
    // Use navigation options for this critical update
    setNavigationState({ [stepKey]: abbreviatedState })
  }, [setNavigationState])

  // Batch update multiple steps
  const batchUpdateSteps = useCallback((
    updates: Record<StepId, Record<string, any>>
  ) => {
    const batchUpdates: Record<string, any> = {}
    
    Object.entries(updates).forEach(([stepId, stepData]) => {
      const stepKey = stepId.replace('step', 's')
      const abbreviatedData = abbreviateFieldsObject(stepId as StepId, stepData)
      batchUpdates[stepKey] = { ...allStepsState[stepKey], ...abbreviatedData }
    })
    
    setAllStepsState(batchUpdates)
  }, [allStepsState, setAllStepsState])

  // Clear all wizard data
  const clearAllWizardData = useCallback(() => {
    const clearUpdates: Record<string, any> = {}
    for (let i = 1; i <= 18; i++) {
      clearUpdates[`s${i}`] = {}
    }
    setAllStepsState(clearUpdates)
  }, [setAllStepsState])

  // Export wizard data as full field names
  const exportWizardData = useCallback(() => {
    return expandedAllStepsState
  }, [expandedAllStepsState])

  // Import wizard data (with full field names)
  const importWizardData = useCallback((
    data: Record<string, Record<string, any>>
  ) => {
    const importUpdates: Record<string, any> = {}
    
    Object.entries(data).forEach(([stepId, stepData]) => {
      if (stepId.startsWith('step')) {
        const stepKey = stepId.replace('step', 's')
        const abbreviatedData = abbreviateFieldsObject(stepId as StepId, stepData)
        importUpdates[stepKey] = abbreviatedData
      }
    })
    
    setAllStepsState(importUpdates)
  }, [setAllStepsState])

  return {
    // All steps state with expanded field names
    allStepsState: expandedAllStepsState,
    // Raw abbreviated state for debugging
    rawState: allStepsState,
    // Save state before navigation (critical)
    saveStateBeforeNavigation,
    // Batch update multiple steps
    batchUpdateSteps,
    // Clear all data
    clearAllWizardData,
    // Export data for XML generation or sharing
    exportWizardData,
    // Import data from URL or file
    importWizardData
  }
}

/**
 * Validation integration helper for future Zod schema integration
 * Follows NuQS v2 requirement for validation functions with parseAsJson
 */
export function createValidatedStepHook<T extends StepId>(
  stepId: T,
  validationSchema?: {
    parse: (value: unknown) => Record<string, any>
    safeParse: (value: unknown) => { success: boolean; data?: Record<string, any>; error?: any }
  },
  defaultValues: Record<string, any> = {}
) {
  const validationFn = validationSchema ? (value: unknown) => {
    const result = validationSchema.safeParse(value)
    return result.success ? result.data! : defaultValues
  } : undefined

  return createStepStateHook(stepId, defaultValues, validationFn)
}

/**
 * Performance monitoring helper for meeting PRD requirement of <5 minute completion
 */
export function useWizardPerformanceMonitor() {
  const startTime = useMemo(() => Date.now(), [])
  
  const getElapsedTime = useCallback(() => {
    return Math.round((Date.now() - startTime) / 1000) // seconds
  }, [startTime])
  
  const isUnderTimeLimit = useCallback(() => {
    return getElapsedTime() < 300 // 5 minutes = 300 seconds
  }, [getElapsedTime])
  
  return {
    getElapsedTime,
    isUnderTimeLimit,
    getTimeRemaining: () => Math.max(0, 300 - getElapsedTime())
  }
}

/**
 * URL sharing helper for shareable wizard state
 * Follows NuQS patterns for URL state management
 */
export function useShareableWizardURL() {
  const getCurrentURL = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.location.href
    }
    return ''
  }, [])
  
  const copyURLToClipboard = useCallback(async () => {
    const url = getCurrentURL()
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      return true
    }
    return false
  }, [getCurrentURL])
  
  return {
    getCurrentURL,
    copyURLToClipboard
  }
} 