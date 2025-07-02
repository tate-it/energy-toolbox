'use client'

/**
 * Step 3: Activation Methods Hook (useStep3)
 * Demonstrates sophisticated array handling for simple string arrays
 * 
 * Features:
 * - Dynamic activation method array management
 * - Conditional field visibility (description when "Other" selected)
 * - Cross-validation between array items and description field
 * - Smart array manipulation (add, remove, toggle, reorder)
 * - Duplicate detection and prevention
 * - Business logic validation for method combinations
 * - Bulk operations for array management
 */

import { 
  Step3Schema, 
  Step3Data, 
  Step3Defaults,
  validateStep3,
  isStep3Complete,
  formatStep3ForXML,
  shouldShowDescription,
  getSelectedMethodsDisplayText,
  hasActivationMethodDuplicates,
  getActivationMethodLabels,
  getActivationMethodStats,
  validateStep3BusinessLogic
} from '../../lib/sii/schemas/step3'
import { 
  createStepHook,
  createFieldErrorFunction,
  createValidationFunction
} from './useStepFactory'
import { MODALITA_ATTIVAZIONE } from '../../lib/sii/constants'

/**
 * Step 3 hook using the standardized factory with array handling
 */
const useStep3Hook = createStepHook<Step3Data>({
  stepId: 'step3',
  stepNumber: 3,
  defaultValues: Step3Defaults,
  validationFn: createValidationFunction<Step3Data>(Step3Schema),
  fieldErrorFn: createFieldErrorFunction<Step3Data>(Step3Schema),
  completenessCheckFn: isStep3Complete,
  xmlFormatter: formatStep3ForXML,
  
  // Related field groups for activation methods + description
  relatedFieldGroups: [
    {
      name: 'activationMethods',
      fields: ['mod'],
      updateStrategy: 'immediate',
      description: 'Modalità di attivazione - aggiornamento immediato per UX fluida'
    },
    {
      name: 'methodsWithDescription',
      fields: ['mod', 'desc'],
      updateStrategy: 'fast', 
      description: 'Metodi + descrizione - aggiornamento rapido per validazione condizionale'
    }
  ],
  
  // Field relationships for conditional logic
  fieldRelationships: {
    // Clear description when "Other" is deselected
    clearOnChange: [
      {
        trigger: 'mod',
        targets: ['desc'],
        condition: (triggerValue: string[]) => {
          return !triggerValue.includes(MODALITA_ATTIVAZIONE.ALTRO)
        }
      }
    ],
    
    // Cross-validation for activation methods array
    crossValidation: [
      {
        fields: ['mod'],
        validator: (values) => {
          const { mod } = values
          
          if (!mod || !Array.isArray(mod)) {
            return 'Almeno una modalità di attivazione è obbligatoria'
          }
          
          if (mod.length === 0) {
            return 'Almeno una modalità di attivazione è obbligatoria'
          }
          
          if (hasActivationMethodDuplicates(mod)) {
            return 'Non sono consentite modalità di attivazione duplicate'
          }
          
          if (mod.length > 6) {
            return 'Massimo 6 modalità di attivazione consentite'
          }
          
          return null
        }
      },
      {
        fields: ['mod', 'desc'],
        validator: (values) => {
          const { mod, desc } = values
          
          if (mod && mod.includes(MODALITA_ATTIVAZIONE.ALTRO)) {
            if (!desc || desc.trim().length === 0) {
              return 'Descrizione è obbligatoria quando è selezionata "Altro"'
            }
            
            if (desc.trim().length < 10) {
              return 'Descrizione per "Altro" deve avere almeno 10 caratteri'
            }
          }
          
          return null
        }
      }
    ]
  }
})

/**
 * Step 3 hook with sophisticated array handling for activation methods
 * 
 * This hook provides advanced array management capabilities:
 * - addMethod(method) - Add activation method to array
 * - removeMethod(method) - Remove activation method from array
 * - toggleMethod(method) - Toggle activation method in array
 * - hasMethod(method) - Check if method is selected
 * - clearAllMethods() - Clear all activation methods
 * - setMethods(methods) - Set entire methods array
 * - reorderMethods(fromIndex, toIndex) - Reorder methods
 * - getMethodsStats() - Get statistics about selected methods
 * - validateMethodCombination() - Check method combination validity
 * - getRecommendedMethods() - Get method recommendations
 */
export function useStep3() {
  const hook = useStep3Hook()
  
  // ARRAY MANAGEMENT FUNCTIONS
  
  // Add a single activation method
  const addMethod = (method: string) => {
    const currentMethods = hook.data.mod || []
    
    // Prevent duplicates
    if (currentMethods.includes(method)) {
      return
    }
    
    // Add method to array
    const newMethods = [...currentMethods, method]
    hook.updateField('mod', newMethods)
  }
  
  // Remove a single activation method
  const removeMethod = (method: string) => {
    const currentMethods = hook.data.mod || []
    const newMethods = currentMethods.filter(m => m !== method)
    hook.updateField('mod', newMethods)
  }
  
  // Toggle activation method (add if not present, remove if present)
  const toggleMethod = (method: string) => {
    const currentMethods = hook.data.mod || []
    
    if (currentMethods.includes(method)) {
      removeMethod(method)
    } else {
      addMethod(method)
    }
  }
  
  // Check if method is currently selected
  const hasMethod = (method: string): boolean => {
    const currentMethods = hook.data.mod || []
    return currentMethods.includes(method)
  }
  
  // Clear all activation methods
  const clearAllMethods = () => {
    hook.updateRelatedFieldGroup('methodsWithDescription', {
      mod: [],
      desc: undefined
    })
  }
  
  // Set entire methods array (with validation)
  const setMethods = (methods: string[]) => {
    // Remove duplicates and validate
    const uniqueMethods = [...new Set(methods)]
    const validMethods = uniqueMethods.filter(method => 
      Object.values(MODALITA_ATTIVAZIONE).includes(method as any)
    )
    
    hook.updateField('mod', validMethods)
  }
  
  // Reorder methods in the array
  const reorderMethods = (fromIndex: number, toIndex: number) => {
    const currentMethods = [...(hook.data.mod || [])]
    
    if (fromIndex < 0 || fromIndex >= currentMethods.length || 
        toIndex < 0 || toIndex >= currentMethods.length) {
      return
    }
    
    const [removed] = currentMethods.splice(fromIndex, 1)
    currentMethods.splice(toIndex, 0, removed)
    
    hook.updateField('mod', currentMethods)
  }
  
  // BULK OPERATIONS
  
  // Add multiple methods at once
  const addMethods = (methods: string[]) => {
    const currentMethods = hook.data.mod || []
    const newMethods = methods.filter(method => 
      !currentMethods.includes(method) && 
      Object.values(MODALITA_ATTIVAZIONE).includes(method as any)
    )
    
    if (newMethods.length > 0) {
      setMethods([...currentMethods, ...newMethods])
    }
  }
  
  // Remove multiple methods at once
  const removeMethods = (methods: string[]) => {
    const currentMethods = hook.data.mod || []
    const newMethods = currentMethods.filter(method => !methods.includes(method))
    hook.updateField('mod', newMethods)
  }
  
  // Set common method combinations
  const setCommonCombination = (type: 'digital' | 'traditional' | 'hybrid' | 'comprehensive') => {
    switch (type) {
      case 'digital':
        setMethods([MODALITA_ATTIVAZIONE.WEB])
        break
      case 'traditional':
        setMethods([
          MODALITA_ATTIVAZIONE.PUNTO_VENDITA,
          MODALITA_ATTIVAZIONE.TELEVENDITA,
          MODALITA_ATTIVAZIONE.AGENZIA
        ])
        break
      case 'hybrid':
        setMethods([
          MODALITA_ATTIVAZIONE.WEB,
          MODALITA_ATTIVAZIONE.PUNTO_VENDITA,
          MODALITA_ATTIVAZIONE.TELEVENDITA
        ])
        break
      case 'comprehensive':
        setMethods([
          MODALITA_ATTIVAZIONE.WEB,
          MODALITA_ATTIVAZIONE.PUNTO_VENDITA,
          MODALITA_ATTIVAZIONE.TELEVENDITA,
          MODALITA_ATTIVAZIONE.AGENZIA
        ])
        break
    }
  }
  
  // ARRAY ANALYSIS FUNCTIONS
  
  // Get methods statistics
  const getMethodsStats = () => {
    const methods = hook.data.mod || []
    return getActivationMethodStats(methods)
  }
  
  // Get display text for selected methods
  const getMethodsDisplayText = (): string[] => {
    const methods = hook.data.mod || []
    return getSelectedMethodsDisplayText(methods)
  }
  
  // Get array count and limits
  const getArrayInfo = () => {
    const methods = hook.data.mod || []
    return {
      count: methods.length,
      isEmpty: methods.length === 0,
      isFull: methods.length >= 6,
      hasOther: methods.includes(MODALITA_ATTIVAZIONE.ALTRO),
      needsDescription: shouldShowDescription(methods),
      duplicates: hasActivationMethodDuplicates(methods)
    }
  }
  
  // VALIDATION HELPERS
  
  // Validate current method combination
  const validateMethodCombination = () => {
    const methods = hook.data.mod || []
    return validateStep3BusinessLogic(hook.data as Step3Data)
  }
  
  // Check if method can be added
  const canAddMethod = (method: string): boolean => {
    const currentMethods = hook.data.mod || []
    return !currentMethods.includes(method) && currentMethods.length < 6
  }
  
  // Check if method can be removed  
  const canRemoveMethod = (method: string): boolean => {
    const currentMethods = hook.data.mod || []
    return currentMethods.includes(method) && currentMethods.length > 1
  }
  
  // Get available methods (not selected yet)
  const getAvailableMethods = () => {
    const currentMethods = hook.data.mod || []
    const allMethods = getActivationMethodLabels()
    
    return allMethods.filter(method => !currentMethods.includes(method.value))
  }
  
  // BUSINESS LOGIC HELPERS
  
  // Get method recommendations based on current selection
  const getMethodRecommendations = (): {
    recommended: string[]
    reasons: string[]
    warnings: string[]
  } => {
    const methods = hook.data.mod || []
    const stats = getMethodsStats()
    const validation = validateMethodCombination()
    
    const recommended: string[] = []
    const reasons: string[] = []
    const warnings = validation.warnings
    
    // Recommend web if not present
    if (!stats.hasWebOnly && !methods.includes(MODALITA_ATTIVAZIONE.WEB)) {
      recommended.push(MODALITA_ATTIVAZIONE.WEB)
      reasons.push('Canale web aumenta accessibilità')
    }
    
    // Recommend physical presence if only digital
    if (stats.hasWebOnly && stats.totalMethods === 1) {
      recommended.push(MODALITA_ATTIVAZIONE.PUNTO_VENDITA)
      reasons.push('Aggiungere canali fisici per clienti tradizionali')
    }
    
    // Warn about redundancy with "any channel"
    if (stats.hasAnyChannel && stats.totalMethods > 1) {
      reasons.push('Valutare se altri canali sono ridondanti')
    }
    
    return { recommended, reasons, warnings }
  }
  
  // Calculate channel coverage score (0-100)
  const getChannelCoverageScore = (): number => {
    const methods = hook.data.mod || []
    const stats = getMethodsStats()
    
    let score = 0
    
    // Base coverage (20 points per unique channel type)
    if (stats.hasWebOnly) score += 20
    if (stats.hasPhysical) score += 20
    if (methods.includes(MODALITA_ATTIVAZIONE.TELEVENDITA)) score += 15
    if (methods.includes(MODALITA_ATTIVAZIONE.AGENZIA)) score += 15
    
    // Bonus for comprehensive coverage
    if (stats.isComprehensive) score += 20
    
    // Penalty for "any channel" with redundant selections
    if (stats.hasAnyChannel && stats.totalMethods > 1) score -= 10
    
    // Bonus for good description when "other" is selected
    if (stats.hasOther && hook.data.desc && hook.data.desc.length >= 20) score += 10
    
    return Math.min(100, Math.max(0, score))
  }
  
  // CONDITIONAL FIELD MANAGEMENT
  
  // Handle description visibility and requirements
  const shouldShowDescriptionField = (): boolean => {
    return shouldShowDescription(hook.data.mod)
  }
  
  // Auto-clear description when "Other" is deselected
  const handleMethodSelectionChange = (method: string, selected: boolean) => {
    if (method === MODALITA_ATTIVAZIONE.ALTRO && !selected) {
      // Clear description when "Other" is deselected
      hook.updateRelatedFieldGroup('methodsWithDescription', {
        mod: (hook.data.mod || []).filter(m => m !== method),
        desc: undefined
      })
    } else {
      // Normal toggle
      toggleMethod(method)
    }
  }
  
  // ARRAY IMPORT/EXPORT
  
  // Export methods configuration
  const exportMethodsConfig = () => {
    return {
      methods: hook.data.mod || [],
      description: hook.data.desc,
      timestamp: new Date().toISOString(),
      stats: getMethodsStats(),
      score: getChannelCoverageScore()
    }
  }
  
  // Import methods configuration
  const importMethodsConfig = (config: {
    methods: string[]
    description?: string
  }) => {
    hook.updateRelatedFieldGroup('methodsWithDescription', {
      mod: config.methods,
      desc: config.description
    })
  }
  
  return {
    ...hook,
    
    // ARRAY MANAGEMENT
    addMethod,
    removeMethod,
    toggleMethod,
    hasMethod,
    clearAllMethods,
    setMethods,
    reorderMethods,
    
    // BULK OPERATIONS
    addMethods,
    removeMethods,
    setCommonCombination,
    
    // ARRAY ANALYSIS
    getMethodsStats,
    getMethodsDisplayText,
    getArrayInfo,
    
    // VALIDATION
    validateMethodCombination,
    canAddMethod,
    canRemoveMethod,
    getAvailableMethods,
    
    // BUSINESS LOGIC
    getMethodRecommendations,
    getChannelCoverageScore,
    
    // CONDITIONAL FIELDS
    shouldShowDescriptionField,
    handleMethodSelectionChange,
    
    // IMPORT/EXPORT
    exportMethodsConfig,
    importMethodsConfig
  }
}

/**
 * Type export for hook return value
 */
export type UseStep3Return = ReturnType<typeof useStep3>

/**
 * Default export for convenient importing
 */
export default useStep3 