'use client'

/**
 * Wizard State Aggregation Hook (useWizardState)
 * Central state management for the entire 18-step SII XML Generator wizard
 * 
 * Features:
 * - Aggregates state from all 18 wizard steps
 * - Unified validation and error reporting across all steps
 * - Progress tracking and completion analysis
 * - Bulk operations (clear all, reset all, export all)
 * - Type-safe step access with comprehensive TypeScript support
 * - Enhanced validation summary with Italian error messages
 * - URL state management for the entire wizard
 * - Smart navigation helpers and step dependencies
 */

import { useMemo, useCallback } from 'react'
import { 
  ExtendedSafeParseResult, 
  EnhancedValidationResult,
  ValidationSeverity 
} from './useStepFactory'

// Import all step hooks (will be available as they're implemented)
import { useStep1, UseStep1Return } from './useStep1'
import { useStep2, UseStep2Return } from './useStep2'
import { useStep3, UseStep3Return } from './useStep3'
import { useStep4, UseStep4Return } from './useStep4'
import { useStep5, UseStep5Return } from './useStep5'
import { useStep6, UseStep6Return } from './useStep6'
// Additional step hooks will be imported as they're implemented
// import { useStep7, UseStep7Return } from './useStep7'
// import { useStep8, UseStep8Return } from './useStep8'
// ... up to useStep18

/**
 * Wizard step metadata for navigation and display
 */
type WizardStepMetadata = {
  stepNumber: number
  stepId: string
  title: string
  description: string
  isRequired: boolean
  dependencies?: number[] // Steps that must be completed first
  category: 'identification' | 'offer-details' | 'pricing' | 'conditions' | 'technical'
}

/**
 * Complete wizard step metadata (Italian localized)
 */
const WIZARD_STEPS_METADATA: WizardStepMetadata[] = [
  {
    stepNumber: 1,
    stepId: 'step1',
    title: 'Identificazione',
    description: 'PIVA dell\'utente e codice offerta',
    isRequired: true,
    category: 'identification'
  },
  {
    stepNumber: 2,
    stepId: 'step2',
    title: 'Dettagli Offerta',
    description: 'Informazioni di base dell\'offerta commerciale',
    isRequired: true,
    dependencies: [1],
    category: 'offer-details'
  },
  {
    stepNumber: 3,
    stepId: 'step3',
    title: 'Modalità di Attivazione',
    description: 'Canali e metodi per l\'attivazione dell\'offerta',
    isRequired: true,
    dependencies: [1, 2],
    category: 'offer-details'
  },
  {
    stepNumber: 4,
    stepId: 'step4',
    title: 'Informazioni di Contatto',
    description: 'Recapiti e informazioni per il contatto commerciale',
    isRequired: true,
    dependencies: [1, 2],
    category: 'offer-details'
  },
  {
    stepNumber: 5,
    stepId: 'step5',
    title: 'Riferimenti Prezzo Energia',
    description: 'Configurazione dei prezzi e riferimenti energetici',
    isRequired: true,
    dependencies: [1, 2],
    category: 'pricing'
  },
  {
    stepNumber: 6,
    stepId: 'step6',
    title: 'Validità Offerta',
    description: 'Periodo di validità e condizioni temporali',
    isRequired: true,
    dependencies: [1, 2, 5],
    category: 'offer-details'
  },
  {
    stepNumber: 7,
    stepId: 'step7',
    title: 'Caratteristiche Offerta',
    description: 'Tipologia e caratteristiche specifiche dell\'offerta',
    isRequired: false,
    dependencies: [1, 2, 5],
    category: 'offer-details'
  },
  {
    stepNumber: 8,
    stepId: 'step8',
    title: 'Offerta Dual',
    description: 'Configurazione per offerte combinate luce/gas',
    isRequired: false,
    dependencies: [1, 2, 5, 7],
    category: 'offer-details'
  },
  {
    stepNumber: 9,
    stepId: 'step9',
    title: 'Modalità di Pagamento',
    description: 'Metodi e condizioni di pagamento disponibili',
    isRequired: false,
    dependencies: [1, 2],
    category: 'conditions'
  },
  {
    stepNumber: 10,
    stepId: 'step10',
    title: 'Componenti Regolate',
    description: 'Componenti tariffarie regolamentate',
    isRequired: false,
    dependencies: [1, 2, 5],
    category: 'pricing'
  },
  {
    stepNumber: 11,
    stepId: 'step11',
    title: 'Fasce Orarie Prezzo',
    description: 'Configurazione delle fasce orarie per i prezzi',
    isRequired: false,
    dependencies: [1, 2, 5, 10],
    category: 'pricing'
  },
  {
    stepNumber: 12,
    stepId: 'step12',
    title: 'Fasce Orarie Settimanali',
    description: 'Dettaglio delle fasce orarie per giorni della settimana',
    isRequired: false,
    dependencies: [1, 2, 5, 11],
    category: 'pricing'
  },
  {
    stepNumber: 13,
    stepId: 'step13',
    title: 'Dispacciamento',
    description: 'Condizioni e parametri di dispacciamento',
    isRequired: false,
    dependencies: [1, 2, 5],
    category: 'technical'
  },
  {
    stepNumber: 14,
    stepId: 'step14',
    title: 'Componente Azienda',
    description: 'Componenti aziendali e margini commerciali',
    isRequired: false,
    dependencies: [1, 2, 5, 10],
    category: 'pricing'
  },
  {
    stepNumber: 15,
    stepId: 'step15',
    title: 'Condizioni Contrattuali',
    description: 'Clausole, penali e garanzie contrattuali',
    isRequired: false,
    dependencies: [1, 2],
    category: 'conditions'
  },
  {
    stepNumber: 16,
    stepId: 'step16',
    title: 'Zone di Offerta',
    description: 'Copertura geografica e zone di validità',
    isRequired: false,
    dependencies: [1, 2],
    category: 'conditions'
  },
  {
    stepNumber: 17,
    stepId: 'step17',
    title: 'Sconti',
    description: 'Sconti e condizioni promozionali',
    isRequired: false,
    dependencies: [1, 2, 5],
    category: 'pricing'
  },
  {
    stepNumber: 18,
    stepId: 'step18',
    title: 'Servizi Aggiuntivi',
    description: 'Servizi opzionali e pacchetti complementari',
    isRequired: false,
    dependencies: [1, 2],
    category: 'conditions'
  }
]

/**
 * Aggregated wizard validation result
 */
type WizardValidationSummary = {
  // Overall wizard status
  isValid: boolean
  isComplete: boolean
  completionPercentage: number
  
  // Step-by-step analysis
  totalSteps: number
  completedSteps: number
  stepsWithErrors: number
  requiredStepsCompleted: number
  totalRequiredSteps: number
  
  // Error aggregation
  totalErrors: number
  totalWarnings: number
  criticalErrors: string[]
  allErrors: Record<string, string[]>
  
  // Progress tracking
  overallSeverity: ValidationSeverity
  readyForXMLGeneration: boolean
  nextRecommendedStep?: number
  blockedSteps: number[]
  
  // Step-specific details
  stepStatus: Record<number, {
    isComplete: boolean
    isValid: boolean
    hasErrors: boolean
    errorCount: number
    severity: ValidationSeverity
    dependenciesMet: boolean
  }>
}

/**
 * Wizard step hooks union type (for currently implemented steps)
 */
type WizardStepHook = 
  | UseStep1Return 
  | UseStep2Return 
  | UseStep3Return 
  | UseStep4Return 
  | UseStep5Return 
  | UseStep6Return
  // Additional types will be added as steps are implemented

/**
 * Wizard state aggregation hook
 */
export function useWizardState() {
  // Initialize all step hooks (only for implemented steps)
  const step1 = useStep1()
  const step2 = useStep2()
  const step3 = useStep3()
  const step4 = useStep4()
  const step5 = useStep5()
  const step6 = useStep6()
  
  // Array of implemented step hooks
  const implementedSteps = useMemo(() => [
    { stepNumber: 1, hook: step1, metadata: WIZARD_STEPS_METADATA[0] },
    { stepNumber: 2, hook: step2, metadata: WIZARD_STEPS_METADATA[1] },
    { stepNumber: 3, hook: step3, metadata: WIZARD_STEPS_METADATA[2] },
    { stepNumber: 4, hook: step4, metadata: WIZARD_STEPS_METADATA[3] },
    { stepNumber: 5, hook: step5, metadata: WIZARD_STEPS_METADATA[4] },
    { stepNumber: 6, hook: step6, metadata: WIZARD_STEPS_METADATA[5] },
  ], [step1, step2, step3, step4, step5, step6])

  // Get step hook by step number
  const getStepHook = useCallback((stepNumber: number): WizardStepHook | null => {
    const stepData = implementedSteps.find(s => s.stepNumber === stepNumber)
    return stepData?.hook || null
  }, [implementedSteps])

  // Get step metadata by step number
  const getStepMetadata = useCallback((stepNumber: number): WizardStepMetadata | null => {
    return WIZARD_STEPS_METADATA.find(s => s.stepNumber === stepNumber) || null
  }, [])

  // Check if step dependencies are met
  const areStepDependenciesMet = useCallback((stepNumber: number): boolean => {
    const metadata = getStepMetadata(stepNumber)
    if (!metadata?.dependencies) return true

    return metadata.dependencies.every(depStep => {
      const depHook = getStepHook(depStep)
      return depHook?.isComplete || false
    })
  }, [getStepMetadata, getStepHook])

  // Comprehensive wizard validation summary
  const getValidationSummary = useCallback((): WizardValidationSummary => {
    const stepStatus: Record<number, any> = {}
    let totalErrors = 0
    let totalWarnings = 0
    let completedSteps = 0
    let stepsWithErrors = 0
    let requiredStepsCompleted = 0
    const criticalErrors: string[] = []
    const allErrors: Record<string, string[]> = {}
    const blockedSteps: number[] = []

    // Analyze each implemented step
    implementedSteps.forEach(({ stepNumber, hook, metadata }) => {
      const validationSummary = hook.getValidationSummary()
      const dependenciesMet = areStepDependenciesMet(stepNumber)
      
      // Count errors and warnings
      totalErrors += validationSummary.errorCount
      if (validationSummary.severity === 'warning') totalWarnings++
      if (validationSummary.severity === 'error') {
        stepsWithErrors++
        if (validationSummary.firstError) {
          criticalErrors.push(`Step ${stepNumber}: ${validationSummary.firstError}`)
        }
      }
      
      // Track step completion
      if (validationSummary.isComplete) {
        completedSteps++
        if (metadata.isRequired) requiredStepsCompleted++
      }
      
      // Collect all errors for this step
      if (validationSummary.hasErrors) {
        allErrors[`step${stepNumber}`] = [validationSummary.firstError || 'Errore sconosciuto']
      }
      
      // Check if step is blocked by dependencies
      if (!dependenciesMet) {
        blockedSteps.push(stepNumber)
      }
      
      stepStatus[stepNumber] = {
        isComplete: validationSummary.isComplete,
        isValid: validationSummary.isValid,
        hasErrors: validationSummary.hasErrors,
        errorCount: validationSummary.errorCount,
        severity: validationSummary.severity,
        dependenciesMet
      }
    })

    // Calculate overall metrics
    const totalRequiredSteps = WIZARD_STEPS_METADATA.filter(s => s.isRequired).length
    const completionPercentage = Math.round((completedSteps / implementedSteps.length) * 100)
    
    // Determine overall severity
    let overallSeverity: ValidationSeverity = 'info'
    if (totalErrors > 10) overallSeverity = 'error'
    else if (totalErrors > 3) overallSeverity = 'warning'
    
    // Check if ready for XML generation
    const allRequiredCompleted = requiredStepsCompleted >= totalRequiredSteps
    const noCriticalErrors = criticalErrors.length === 0
    const readyForXMLGeneration = allRequiredCompleted && noCriticalErrors
    
    // Find next recommended step
    let nextRecommendedStep: number | undefined
    for (let i = 1; i <= 18; i++) {
      const stepData = implementedSteps.find(s => s.stepNumber === i)
      if (stepData && !stepData.hook.isComplete && areStepDependenciesMet(i)) {
        nextRecommendedStep = i
        break
      }
    }

    return {
      isValid: totalErrors === 0,
      isComplete: completedSteps === implementedSteps.length,
      completionPercentage,
      totalSteps: implementedSteps.length,
      completedSteps,
      stepsWithErrors,
      requiredStepsCompleted,
      totalRequiredSteps,
      totalErrors,
      totalWarnings,
      criticalErrors,
      allErrors,
      overallSeverity,
      readyForXMLGeneration,
      nextRecommendedStep,
      blockedSteps,
      stepStatus
    }
  }, [implementedSteps, areStepDependenciesMet])

  // Get all wizard data for XML generation
  const getAllWizardData = useCallback(() => {
    const wizardData: Record<string, any> = {}
    
    implementedSteps.forEach(({ stepNumber, hook }) => {
      try {
        const stepXMLData = hook.getXMLData()
        wizardData[`step${stepNumber}`] = stepXMLData
      } catch (error) {
        console.warn(`[useWizardState] Cannot get XML data for step ${stepNumber}:`, error)
        wizardData[`step${stepNumber}`] = null
      }
    })
    
    return wizardData
  }, [implementedSteps])

  // Clear all wizard data
  const clearAllSteps = useCallback(() => {
    implementedSteps.forEach(({ hook }) => {
      if (hook.clearStep) {
        hook.clearStep()
      }
    })
  }, [implementedSteps])

  // Reset all steps to defaults
  const resetAllSteps = useCallback(() => {
    implementedSteps.forEach(({ hook }) => {
      if (hook.resetToDefaults) {
        hook.resetToDefaults()
      }
    })
  }, [implementedSteps])

  // Flush all pending updates across all steps
  const flushAllUpdates = useCallback(() => {
    implementedSteps.forEach(({ hook }) => {
      if (hook.flushUpdates) {
        hook.flushUpdates()
      }
    })
  }, [implementedSteps])

  // Cancel all pending updates across all steps
  const cancelAllUpdates = useCallback(() => {
    implementedSteps.forEach(({ hook }) => {
      if (hook.cancelUpdates) {
        hook.cancelUpdates()
      }
    })
  }, [implementedSteps])

  // Get steps by category
  const getStepsByCategory = useCallback((category: WizardStepMetadata['category']) => {
    return WIZARD_STEPS_METADATA
      .filter(metadata => metadata.category === category)
      .map(metadata => ({
        ...metadata,
        hook: getStepHook(metadata.stepNumber),
        isImplemented: implementedSteps.some(s => s.stepNumber === metadata.stepNumber)
      }))
  }, [getStepHook, implementedSteps])

  // Get progress by category
  const getCategoryProgress = useCallback(() => {
    const categories = ['identification', 'offer-details', 'pricing', 'conditions', 'technical'] as const
    const progress: Record<string, { completed: number; total: number; percentage: number }> = {}
    
    categories.forEach(category => {
      const categorySteps = getStepsByCategory(category)
      const implementedCategorySteps = categorySteps.filter(s => s.isImplemented)
      const completedCategorySteps = implementedCategorySteps.filter(s => s.hook?.isComplete)
      
      progress[category] = {
        completed: completedCategorySteps.length,
        total: implementedCategorySteps.length,
        percentage: implementedCategorySteps.length > 0 
          ? Math.round((completedCategorySteps.length / implementedCategorySteps.length) * 100)
          : 0
      }
    })
    
    return progress
  }, [getStepsByCategory])

  // Get detailed step information
  const getStepInfo = useCallback((stepNumber: number) => {
    const hook = getStepHook(stepNumber)
    const metadata = getStepMetadata(stepNumber)
    const dependenciesMet = areStepDependenciesMet(stepNumber)
    const isImplemented = implementedSteps.some(s => s.stepNumber === stepNumber)
    
    if (!metadata) return null
    
    return {
      ...metadata,
      hook,
      isImplemented,
      dependenciesMet,
      validationSummary: hook?.getValidationSummary() || null,
      isBlocked: !dependenciesMet,
      canNavigate: isImplemented && dependenciesMet
    }
  }, [getStepHook, getStepMetadata, areStepDependenciesMet, implementedSteps])

  // Calculate implementation progress
  const implementationProgress = useMemo(() => {
    const implementedCount = implementedSteps.length
    const totalCount = WIZARD_STEPS_METADATA.length
    return {
      implemented: implementedCount,
      total: totalCount,
      percentage: Math.round((implementedCount / totalCount) * 100),
      remaining: totalCount - implementedCount
    }
  }, [implementedSteps])

  return {
    // Step access
    getStepHook,
    getStepMetadata,
    getStepInfo,
    
    // Validation and analysis
    getValidationSummary,
    areStepDependenciesMet,
    
    // Data management
    getAllWizardData,
    clearAllSteps,
    resetAllSteps,
    
    // Update management
    flushAllUpdates,
    cancelAllUpdates,
    
    // Navigation helpers
    getStepsByCategory,
    getCategoryProgress,
    
    // Implementation tracking
    implementationProgress,
    implementedSteps: implementedSteps.map(s => s.stepNumber),
    
    // Metadata
    allStepsMetadata: WIZARD_STEPS_METADATA,
    
    // Individual step hooks (for direct access when needed)
    steps: {
      step1,
      step2,
      step3,
      step4,
      step5,
      step6
      // Additional steps will be added as they're implemented
    }
  }
}

/**
 * Type export for hook return value
 */
export type UseWizardStateReturn = ReturnType<typeof useWizardState>

/**
 * Export step metadata for external use
 */
export { WIZARD_STEPS_METADATA }
export type { WizardStepMetadata, WizardValidationSummary }

/**
 * Default export for convenient importing
 */
export default useWizardState 