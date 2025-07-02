'use client'

/**
 * Step 6: Offer Validity Hook (useStep6)
 * Demonstrates sophisticated date/time parsing and formatting capabilities
 * 
 * Features:
 * - ISO date format parsing and validation (YYYY-MM-DD)
 * - Real-time date validation with future date requirements
 * - Cross-field validation for multiple validity specification methods
 * - Date calculations (end date from months, duration calculations)
 * - Italian date formatting for display
 * - Smart field clearing based on validity type selection
 * - Date range validation and business rules
 */

import { 
  Step6Schema, 
  Step6Data, 
  Step6Defaults,
  validateStep6,
  isStep6Complete,
  formatStep6ForXML,
  getTodayISO,
  calculateEndDate,
  calculateValidityDays,
  isValidISODate,
  formatDateForDisplay,
  getValiditySummary,
  validateValidityBusinessRules,
  getValidityTypeDescription
} from '../../lib/sii/schemas/step6'
import { 
  createStepHook,
  createFieldErrorFunction,
  createValidationFunction
} from './useStepFactory'

/**
 * Step 6 hook using the standardized factory with date/time handling
 */
const useStep6Hook = createStepHook<Step6Data>({
  stepId: 'step6',
  stepNumber: 6,
  defaultValues: Step6Defaults,
  validationFn: createValidationFunction<Step6Data>(Step6Schema),
  fieldErrorFn: createFieldErrorFunction<Step6Data>(Step6Schema),
  completenessCheckFn: isStep6Complete,
  xmlFormatter: formatStep6ForXML,
  
  // Related field groups for validity management
  relatedFieldGroups: [
    {
      name: 'dateRange',
      fields: ['data_inizio', 'data_fine'],
      updateStrategy: 'fast',
      description: 'Range di date - aggiornamento rapido per validazione immediata'
    },
    {
      name: 'monthsValidity',
      fields: ['data_inizio', 'validita_mesi'],
      updateStrategy: 'fast',
      description: 'Validità in mesi - aggiornamento rapido per calcolo date'
    },
    {
      name: 'indefiniteValidity',
      fields: ['data_inizio', 'validita_indet'],
      updateStrategy: 'immediate',
      description: 'Validità indeterminata - aggiornamento immediato per UX'
    },
    {
      name: 'validityNotes',
      fields: ['note_validita'],
      updateStrategy: 'debounced',
      description: 'Note validità - aggiornamento posticipato per testi lunghi'
    },
    {
      name: 'allValidity',
      fields: ['data_inizio', 'data_fine', 'validita_indet', 'validita_mesi', 'note_validita'],
      updateStrategy: 'fast',
      description: 'Tutta la configurazione validità - aggiornamento rapido per validazione completa'
    }
  ],
  
  // Field relationships with date/time validation logic
  fieldRelationships: {
    // Clear conflicting validity specifications
    clearOnChange: [
      {
        trigger: 'data_fine',
        targets: ['validita_indet', 'validita_mesi']
      },
      {
        trigger: 'validita_indet',
        targets: ['data_fine', 'validita_mesi']
      },
      {
        trigger: 'validita_mesi',
        targets: ['data_fine', 'validita_indet']
      }
    ],
    
    // Date validation dependencies
    dependencies: [
      {
        primary: 'data_inizio',
        dependent: 'data_fine',
        validator: (startDate: string, endDate: string) => {
          if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            return end > start
          }
          return true
        }
      }
    ],
    
    // Cross-validation for date/time business rules
    crossValidation: [
      {
        fields: ['data_inizio', 'data_fine'],
        validator: (values) => {
          const { data_inizio, data_fine } = values
          
          if (data_inizio && data_fine) {
            const startDate = new Date(data_inizio)
            const endDate = new Date(data_fine)
            
            if (endDate <= startDate) {
              return 'Data fine validità deve essere successiva alla data inizio'
            }
            
            // Check for reasonable date range
            const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
            if (diffDays < 1) {
              return 'La validità deve durare almeno 1 giorno'
            }
            
            if (diffDays > 3653) { // 10 years
              return 'Validità superiore a 10 anni non è consentita'
            }
          }
          
          return null
        }
      },
      {
        fields: ['data_inizio'],
        validator: (values) => {
          const { data_inizio } = values
          
          if (data_inizio) {
            // Validate ISO date format
            if (!isValidISODate(data_inizio)) {
              return 'Formato data non valido (usa YYYY-MM-DD)'
            }
            
            // Check if date is today or future
            const startDate = new Date(data_inizio)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            if (startDate < today) {
              return 'Data inizio validità deve essere oggi o nel futuro'
            }
            
            // Check if date is too far in future
            const maxDate = new Date()
            maxDate.setFullYear(maxDate.getFullYear() + 10)
            
            if (startDate > maxDate) {
              return 'Data inizio validità troppo lontana nel futuro'
            }
          }
          
          return null
        }
      },
      {
        fields: ['data_fine'],
        validator: (values) => {
          const { data_fine } = values
          
          if (data_fine) {
            // Validate ISO date format
            if (!isValidISODate(data_fine)) {
              return 'Formato data non valido (usa YYYY-MM-DD)'
            }
          }
          
          return null
        }
      },
      {
        fields: ['validita_mesi', 'data_inizio'],
        validator: (values) => {
          const { validita_mesi, data_inizio } = values
          
          if (validita_mesi && data_inizio) {
            // Calculate end date and validate reasonableness
            const endDate = calculateEndDate(data_inizio, validita_mesi)
            const endDateObj = new Date(endDate)
            const maxDate = new Date('2034-12-31')
            
            if (endDateObj > maxDate) {
              return 'Validità in mesi produce una data fine troppo lontana nel futuro'
            }
          }
          
          return null
        }
      },
      {
        fields: ['data_fine', 'validita_indet', 'validita_mesi'],
        validator: (values) => {
          const { data_fine, validita_indet, validita_mesi } = values
          
          // Ensure only one validity specification method is used
          const specMethods = [data_fine, validita_indet, validita_mesi].filter(v => v !== undefined && v !== null && v !== false)
          
          if (specMethods.length > 1) {
            return 'Specificare solo un metodo di validità (data fine, mesi, o indeterminata)'
          }
          
          return null
        }
      }
    ]
  }
})

/**
 * Step 6 hook with sophisticated date/time parsing and formatting
 * 
 * This hook provides advanced date/time management capabilities:
 * - setDateRange(start, end) - Set validity with specific start and end dates
 * - setMonthsValidity(start, months) - Set validity with duration in months
 * - setIndefiniteValidity(start) - Set indefinite validity from start date
 * - setStartDate(date) - Update start date with validation
 * - addMonthsToStart(months) - Calculate and set end date from start + months
 * - formatDateForUI(isoDate) - Format dates for Italian display
 * - calculateDuration() - Get validity duration in days
 * - getValidityType() - Get current validity specification type
 * - validateDateRange() - Comprehensive date validation
 */
export function useStep6() {
  const hook = useStep6Hook()
  
  // DATE/TIME PARSING AND FORMATTING
  
  // Set date range validity (start + end dates)
  const setDateRange = (startDate: string, endDate: string) => {
    hook.updateRelatedFieldGroup('dateRange', {
      data_inizio: startDate,
      data_fine: endDate
    })
  }
  
  // Set validity with duration in months
  const setMonthsValidity = (startDate: string, months: number) => {
    hook.updateRelatedFieldGroup('monthsValidity', {
      data_inizio: startDate,
      validita_mesi: months
    })
  }
  
  // Set indefinite validity
  const setIndefiniteValidity = (startDate: string) => {
    hook.updateRelatedFieldGroup('indefiniteValidity', {
      data_inizio: startDate,
      validita_indet: true
    })
  }
  
  // Update start date with validation
  const setStartDate = (date: string) => {
    hook.updateField('data_inizio', date)
  }
  
  // Set start date to today
  const setStartDateToday = () => {
    const today = getTodayISO()
    hook.updateField('data_inizio', today)
  }
  
  // Add months to start date and set as end date
  const addMonthsToStart = (months: number) => {
    if (hook.data.data_inizio) {
      const endDate = calculateEndDate(hook.data.data_inizio, months)
      hook.updateRelatedFieldGroup('dateRange', {
        data_inizio: hook.data.data_inizio,
        data_fine: endDate
      })
    }
  }
  
  // Set validity duration and clear conflicting fields
  const setValidityDuration = (months: number) => {
    const updates: Partial<Step6Data> = {
      validita_mesi: months,
      data_fine: undefined,
      validita_indet: undefined
    }
    
    hook.batchUpdate(updates)
  }
  
  // Clear all validity specifications except start date
  const clearValiditySpecifications = () => {
    hook.batchUpdate({
      data_fine: undefined,
      validita_indet: undefined,
      validita_mesi: undefined
    })
  }
  
  // DATE FORMATTING AND DISPLAY
  
  // Format ISO date for Italian display
  const formatDateForUI = (isoDate?: string): string => {
    if (!isoDate) return ''
    return formatDateForDisplay(isoDate)
  }
  
  // Get formatted start date
  const getFormattedStartDate = (): string => {
    return hook.data.data_inizio ? formatDateForUI(hook.data.data_inizio) : ''
  }
  
  // Get formatted end date (calculated if needed)
  const getFormattedEndDate = (): string => {
    if (hook.data.data_fine) {
      return formatDateForUI(hook.data.data_fine)
    }
    
    if (hook.data.validita_mesi && hook.data.data_inizio) {
      const calculatedEnd = calculateEndDate(hook.data.data_inizio, hook.data.validita_mesi)
      return formatDateForUI(calculatedEnd)
    }
    
    return ''
  }
  
  // Get validity type description
  const getValidityDescription = (): string => {
    return getValidityTypeDescription(hook.data as Step6Data)
  }
  
  // DATE CALCULATIONS
  
  // Calculate validity duration in days
  const calculateDuration = (): number | null => {
    if (!hook.data.data_inizio) return null
    
    return calculateValidityDays(
      hook.data.data_inizio,
      hook.data.data_fine,
      hook.data.validita_mesi
    )
  }
  
  // Get calculated end date (from months or direct)
  const getCalculatedEndDate = (): string | null => {
    if (hook.data.data_fine) {
      return hook.data.data_fine
    }
    
    if (hook.data.validita_mesi && hook.data.data_inizio) {
      return calculateEndDate(hook.data.data_inizio, hook.data.validita_mesi)
    }
    
    return null
  }
  
  // Check if validity is indefinite
  const isIndefiniteValidity = (): boolean => {
    return !!hook.data.validita_indet
  }
  
  // DATE VALIDATION HELPERS
  
  // Validate ISO date format
  const validateDateFormat = (date: string): boolean => {
    return isValidISODate(date)
  }
  
  // Check if date is in future (today or later)
  const isDateInFuture = (date: string): boolean => {
    const dateObj = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dateObj >= today
  }
  
  // Check if date range is valid
  const isValidDateRange = (startDate: string, endDate: string): boolean => {
    if (!validateDateFormat(startDate) || !validateDateFormat(endDate)) {
      return false
    }
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    return end > start
  }
  
  // VALIDITY ANALYSIS
  
  // Get validity summary with calculations
  const getValiditySummary = () => {
    return getValiditySummary(hook.data as Step6Data)
  }
  
  // Validate business rules for validity
  const validateBusinessRules = () => {
    return validateValidityBusinessRules(hook.data as Step6Data)
  }
  
  // Get validity type (fixed_date, months, indefinite)
  const getValidityType = (): 'fixed_date' | 'months' | 'indefinite' | 'none' => {
    if (hook.data.validita_indet) return 'indefinite'
    if (hook.data.data_fine) return 'fixed_date'
    if (hook.data.validita_mesi) return 'months'
    return 'none'
  }
  
  // Check if validity configuration is complete
  const isValidityComplete = (): boolean => {
    if (!hook.data.data_inizio) return false
    
    const validityType = getValidityType()
    return validityType !== 'none'
  }
  
  // Get validity score (0-100)
  const getValidityScore = (): number => {
    let score = 0
    
    // Start date (required - 40 points)
    if (hook.data.data_inizio && isDateInFuture(hook.data.data_inizio)) {
      score += 40
    }
    
    // Validity specification (required - 40 points)
    const validityType = getValidityType()
    if (validityType !== 'none') {
      score += 40
    }
    
    // Valid configuration (10 points)
    if (isValidityComplete() && hook.isComplete) {
      score += 10
    }
    
    // Business rules compliance (10 points)
    const businessValidation = validateBusinessRules()
    if (businessValidation.isValid) {
      score += 10
    }
    
    return score
  }
  
  // PRESET DATE CONFIGURATIONS
  
  // Set common validity periods
  const setCommonPeriod = (period: '1month' | '3months' | '6months' | '1year' | '2years' | 'indefinite') => {
    const startDate = hook.data.data_inizio || getTodayISO()
    
    switch (period) {
      case '1month':
        setMonthsValidity(startDate, 1)
        break
      case '3months':
        setMonthsValidity(startDate, 3)
        break
      case '6months':
        setMonthsValidity(startDate, 6)
        break
      case '1year':
        setMonthsValidity(startDate, 12)
        break
      case '2years':
        setMonthsValidity(startDate, 24)
        break
      case 'indefinite':
        setIndefiniteValidity(startDate)
        break
    }
  }
  
  // Set custom end date from current start + days
  const setEndDateFromDays = (days: number) => {
    if (hook.data.data_inizio) {
      const startDate = new Date(hook.data.data_inizio)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + days)
      
      setDateRange(hook.data.data_inizio, endDate.toISOString().split('T')[0])
    }
  }
  
  return {
    ...hook,
    
    // DATE/TIME MANAGEMENT
    setDateRange,
    setMonthsValidity,
    setIndefiniteValidity,
    setStartDate,
    setStartDateToday,
    addMonthsToStart,
    setValidityDuration,
    clearValiditySpecifications,
    
    // DATE FORMATTING
    formatDateForUI,
    getFormattedStartDate,
    getFormattedEndDate,
    getValidityDescription,
    
    // DATE CALCULATIONS
    calculateDuration,
    getCalculatedEndDate,
    isIndefiniteValidity,
    
    // DATE VALIDATION
    validateDateFormat,
    isDateInFuture,
    isValidDateRange,
    
    // VALIDITY ANALYSIS
    getValiditySummary,
    validateBusinessRules,
    getValidityType,
    isValidityComplete,
    getValidityScore,
    
    // PRESETS
    setCommonPeriod,
    setEndDateFromDays
  }
}

/**
 * Type export for hook return value
 */
export type UseStep6Return = ReturnType<typeof useStep6>

/**
 * Default export for convenient importing
 */
export default useStep6 