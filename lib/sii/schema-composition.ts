/**
 * Schema Composition Utilities
 * 
 * Handles conditional field requirements between different steps
 * in the SII wizard, enabling cross-step validation and data dependency logic.
 */

import { z } from 'zod'
import type {
  PartialSIIWizardData
} from './types'

// =====================================================
// DEPENDENCY RULES CONFIGURATION
// =====================================================

/**
 * Step dependency configuration
 * Defines which steps depend on values from other steps
 */
export const STEP_DEPENDENCIES = {
  // Step 5 depends on Step 2 for pricing structure
  5: {
    dependsOn: [2],
    condition: (data: PartialSIIWizardData) => {
      const step2 = data.step2
      return step2?.tipo_mercato === 'LIBERO' && step2?.prezzo_variabile === true
    },
    requiredFields: ['PREZZO_VARIABILE_FORMULA', 'INDICIZZAZIONE']
  },

  // Step 7 depends on Step 2 for FLAT offers
  7: {
    dependsOn: [2],
    condition: (data: PartialSIIWizardData) => {
      const step2 = data.step2
      return step2?.caratteristiche_offerta?.includes('FLAT')
    },
    requiredFields: ['FLAT_CARATTERISTICHE', 'FLAT_DURATA_MESI']
  },

  // Step 8 depends on Step 2 for dual fuel offers
  8: {
    dependsOn: [2],
    condition: (data: PartialSIIWizardData) => {
      const step2 = data.step2
      return step2?.tipo_mercato === 'DUAL_FUEL'
    },
    requiredFields: ['ELETTRICITA_INCLUSA', 'GAS_INCLUSO', 'SCONTO_DUAL']
  },

  // Step 11 depends on Step 2 and Step 5 for time band configuration
  11: {
    dependsOn: [2, 5],
    condition: (data: PartialSIIWizardData) => {
      const step2 = data.step2
      const step5 = data.step5
      return step2?.prezzo_variabile === true && step5?.FASCE_ORARIE === true
    },
    requiredFields: ['TIPO_FASCIA']
  },

  // Step 12 depends on Step 11 for weekly time band details
  12: {
    dependsOn: [11],
    condition: (data: PartialSIIWizardData) => {
      const step11 = data.step11
      return step11?.TIPO_FASCIA && step11.TIPO_FASCIA !== 'MONORARIO'
    },
    requiredFields: ['CONFIGURAZIONE_FASCE']
  },

  // Step 10 depends on Step 2 for regulated components
  10: {
    dependsOn: [2],
    condition: (data: PartialSIIWizardData) => {
      const step2 = data.step2
      return step2?.tipo_mercato !== undefined
    },
    conditionalFields: (data: PartialSIIWizardData) => {
      const step2 = data.step2
      if (step2?.tipo_mercato === 'ELETTRICITA') {
        return ['PCV', 'PPE'] // Electricity-only components
      } else if (step2?.tipo_mercato === 'GAS') {
        return ['CCR', 'CPR', 'GRAD', 'QTint', 'QTpsv', 'QVD_fissa', 'QVD_Variabile'] // Gas components
      } else if (step2?.tipo_mercato === 'DUAL_FUEL') {
        return ['PCV', 'PPE', 'CCR', 'CPR', 'GRAD'] // Combined components
      }
      return []
    }
  }
} as const

// =====================================================
// CONDITIONAL VALIDATION SCHEMAS
// =====================================================

/**
 * Enhanced Step 5 schema with Step 2 dependency validation
 */
export function createEnhancedStep5Schema(wizardData: PartialSIIWizardData) {
  const step2 = wizardData.step2
  const requiresVariableFormula = step2?.prezzo_variabile === true
  const requiresTimeBands = step2?.prezzo_variabile === true && step2?.fasce_orarie === true

  return z.object({
    // Base fields always required
    RIFERIMENTO_PREZZO: z.enum(['ARERA', 'PUN', 'PERSONALIZZATO']),
    
    // Conditional fields based on Step 2
    PREZZO_FISSO: requiresVariableFormula ? 
      z.number().optional() : 
      z.number().min(0, 'Prezzo fisso deve essere maggiore di 0'),
    
    PREZZO_VARIABILE_FORMULA: requiresVariableFormula ?
      z.string().min(5, 'Formula richiesta per prezzi variabili') :
      z.string().optional(),
    
    INDICIZZAZIONE: requiresVariableFormula ?
      z.enum(['MENSILE', 'TRIMESTRALE', 'SEMESTRALE', 'ANNUALE']) :
      z.enum(['MENSILE', 'TRIMESTRALE', 'SEMESTRALE', 'ANNUALE']).optional(),
    
    FASCE_ORARIE: z.boolean().default(false),
    
    // Time band specific prices - conditional on time bands being enabled
    PREZZO_F1: requiresTimeBands ?
      z.number().min(0, 'Prezzo F1 richiesto per fasce orarie') :
      z.number().optional(),
    
    PREZZO_F2: requiresTimeBands ?
      z.number().min(0, 'Prezzo F2 richiesto per fasce orarie') :
      z.number().optional(),
    
    PREZZO_F3: requiresTimeBands ?
      z.number().min(0, 'Prezzo F3 richiesto per fasce orarie') :
      z.number().optional(),
  })
}

/**
 * Enhanced Step 7 schema with FLAT offer dependency validation
 */
export function createEnhancedStep7Schema(wizardData: PartialSIIWizardData) {
  const step2 = wizardData.step2
  const isFlatOffer = step2?.caratteristiche_offerta?.includes('FLAT')

  return z.object({
    // Base fields
    CATEGORIA_OFFERTA: z.enum(['STANDARD', 'GREEN', 'BUSINESS', 'FLAT']),
    DESCRIZIONE_CARATTERISTICHE: z.string()
      .min(10, 'Descrizione deve avere almeno 10 caratteri')
      .max(2000, 'Descrizione non può superare 2000 caratteri'),
    
    // FLAT-specific fields - conditional on FLAT offer type
    FLAT_CARATTERISTICHE: isFlatOffer ?
      z.string().min(20, 'Descrizione caratteristiche FLAT richiesta') :
      z.string().optional(),
    
    FLAT_DURATA_MESI: isFlatOffer ?
      z.number().int().min(3).max(60, 'Durata FLAT deve essere tra 3 e 60 mesi') :
      z.number().optional(),
    
    FLAT_PREZZO_FISSO: isFlatOffer ?
      z.number().min(0, 'Prezzo fisso FLAT richiesto') :
      z.number().optional(),
    
    FLAT_COMPONENTE_VARIABILE: isFlatOffer ?
      z.number().min(0, 'Componente variabile FLAT richiesta') :
      z.number().optional(),
  })
}

/**
 * Enhanced Step 8 schema with dual fuel dependency validation
 */
export function createEnhancedStep8Schema(wizardData: PartialSIIWizardData) {
  const step2 = wizardData.step2
  const isDualFuel = step2?.tipo_mercato === 'DUAL_FUEL'

  return z.object({
    // Required for dual fuel offers
    OFFERTA_DUAL: z.boolean().default(isDualFuel || false),
    
    ELETTRICITA_INCLUSA: isDualFuel ?
      z.boolean() :
      z.boolean().optional(),
    
    GAS_INCLUSO: isDualFuel ?
      z.boolean() :
      z.boolean().optional(),
    
    // Enhanced validation for dual fuel
    SCONTO_DUAL: isDualFuel ?
      z.number().min(0).max(100, 'Sconto dual non può superare 100%') :
      z.number().optional(),
    
    CONDIZIONI_DUAL: isDualFuel ?
      z.string().min(10, 'Condizioni dual fuel richieste') :
      z.string().optional(),
    
    VANTAGGI_DUAL: isDualFuel ?
      z.string().min(10, 'Vantaggi dual fuel richiesti') :
      z.string().optional(),
  }).superRefine((data, ctx) => {
    if (isDualFuel && data.OFFERTA_DUAL) {
      // Both electricity and gas must be included for dual fuel
      if (!data.ELETTRICITA_INCLUSA && !data.GAS_INCLUSO) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ELETTRICITA_INCLUSA'],
          message: 'Offerte dual fuel devono includere almeno elettricità o gas'
        })
      }
    }
  })
}

/**
 * Enhanced Step 10 schema with market type dependency validation
 */
export function createEnhancedStep10Schema(wizardData: PartialSIIWizardData) {
  const step2 = wizardData.step2
  const marketType = step2?.tipo_mercato

  // Determine available components based on market type
  const availableComponents = (() => {
    switch (marketType) {
      case 'ELETTRICITA':
        return ['PCV', 'PPE'] as const
      case 'GAS':
        return ['CCR', 'CPR', 'GRAD', 'QTint', 'QTpsv', 'QVD_fissa', 'QVD_Variabile'] as const
      case 'DUAL_FUEL':
        return ['PCV', 'PPE', 'CCR', 'CPR', 'GRAD', 'QTint', 'QTpsv', 'QVD_fissa', 'QVD_Variabile'] as const
      default:
        return ['PCV', 'PPE', 'CCR', 'CPR', 'GRAD', 'QTint', 'QTpsv', 'QVD_fissa', 'QVD_Variabile'] as const
    }
  })()

  return z.object({
    CODICE_COMPONENTE: z.enum(availableComponents, {
      errorMap: () => ({ message: `Componente non valida per mercato ${marketType}` })
    }),
    
    // Additional validation metadata
    VALIDITA_COMPONENTE: z.boolean().default(true),
    NOTE_COMPONENTE: z.string().optional(),
  })
}

// =====================================================
// COMPOSITE VALIDATION UTILITIES
// =====================================================

/**
 * Validate multiple steps with cross-step dependencies
 */
export async function validateWizardSteps(
  data: PartialSIIWizardData,
  stepsToValidate: number[]
): Promise<{
  success: boolean
  stepResults: Record<number, { success: boolean; errors?: Record<string, string> }>
  crossStepErrors: string[]
}> {
  const stepResults: Record<number, { success: boolean; errors?: Record<string, string> }> = {}
  const crossStepErrors: string[] = []

  // Validate each step individually first
  for (const stepNumber of stepsToValidate) {
    const stepData = data[`step${stepNumber}` as keyof PartialSIIWizardData]
    
    try {
      // Use enhanced schemas for steps with dependencies
      let schema: z.ZodSchema
      switch (stepNumber) {
        case 5:
          schema = createEnhancedStep5Schema(data)
          break
        case 7:
          schema = createEnhancedStep7Schema(data)
          break
        case 8:
          schema = createEnhancedStep8Schema(data)
          break
        case 10:
          schema = createEnhancedStep10Schema(data)
          break
        default:
          // Use regular schema import for other steps
          const schemaModule = await import(`./schemas/step${stepNumber}`)
          schema = schemaModule[`Step${stepNumber}Schema`]
      }

      const result = schema.safeParse(stepData)
      
      if (result.success) {
        stepResults[stepNumber] = { success: true }
      } else {
        const errors: Record<string, string> = {}
        for (const error of result.error.errors) {
          const fieldName = error.path[0]
          if (fieldName && typeof fieldName === 'string') {
            errors[fieldName] = error.message
          }
        }
        stepResults[stepNumber] = { success: false, errors }
      }
    } catch {
      stepResults[stepNumber] = { 
        success: false, 
        errors: { general: 'Errore di validazione schema' }
      }
    }
  }

  // Check cross-step dependencies
  for (const stepNumber of stepsToValidate) {
    const dependency = STEP_DEPENDENCIES[stepNumber as keyof typeof STEP_DEPENDENCIES]
    if (dependency) {
      const { dependsOn, condition } = dependency
      
      // Check if all dependency steps are available
      const missingDependencies = dependsOn.filter(depStep => 
        !stepsToValidate.includes(depStep) || !data[`step${depStep}` as keyof PartialSIIWizardData]
      )
      
      if (missingDependencies.length > 0) {
        crossStepErrors.push(
          `Step ${stepNumber} dipende da step ${missingDependencies.join(', ')} che non sono completi`
        )
      }
      
      // Check if condition is met
      if (missingDependencies.length === 0 && !condition(data)) {
        crossStepErrors.push(
          `Step ${stepNumber}: condizioni di dipendenza non soddisfatte`
        )
      }
    }
  }

  const allStepsValid = Object.values(stepResults).every(result => result.success)
  const noCrossStepErrors = crossStepErrors.length === 0

  return {
    success: allStepsValid && noCrossStepErrors,
    stepResults,
    crossStepErrors
  }
}

/**
 * Check if a step can be displayed based on dependencies
 */
export function isStepAvailable(
  stepNumber: number,
  wizardData: PartialSIIWizardData
): boolean {
  const dependency = STEP_DEPENDENCIES[stepNumber as keyof typeof STEP_DEPENDENCIES]
  
  if (!dependency) {
    return true // No dependencies, always available
  }
  
  const { dependsOn, condition } = dependency
  
  // Check if all dependency steps have data
  const hasDependencyData = dependsOn.every(depStep => {
    const stepData = wizardData[`step${depStep}` as keyof PartialSIIWizardData]
    return stepData && Object.keys(stepData).length > 0
  })
  
  if (!hasDependencyData) {
    return false
  }
  
  // Check if condition is satisfied
  return condition(wizardData)
}

/**
 * Get required fields for a step based on current wizard data
 */
export function getRequiredFieldsForStep(
  stepNumber: number,
  wizardData: PartialSIIWizardData
): string[] {
  const dependency = STEP_DEPENDENCIES[stepNumber as keyof typeof STEP_DEPENDENCIES]
  
  if (!dependency) {
    return [] // No conditional requirements
  }
  
  if (!isStepAvailable(stepNumber, wizardData)) {
    return [] // Step not available, no fields required
  }
  
  // Return base required fields
  const baseFields = dependency.requiredFields || []
  
  // Add conditional fields if function exists
  if ('conditionalFields' in dependency && typeof dependency.conditionalFields === 'function') {
    const conditionalFields = dependency.conditionalFields(wizardData)
    return [...baseFields, ...conditionalFields]
  }
  
  return baseFields
}

/**
 * Generate wizard navigation hints
 */
export function generateNavigationHints(
  currentStep: number,
  wizardData: PartialSIIWizardData
): {
  canProceed: boolean
  blockedBy: number[]
  suggestions: string[]
  nextSteps: number[]
} {
  const suggestions: string[] = []
  const blockedBy: number[] = []
  const nextSteps: number[] = []
  
  // Check if current step can proceed
  const currentStepValid = validateWizardSteps(wizardData, [currentStep])
  const canProceed = currentStepValid.success
  
  if (!canProceed) {
    suggestions.push('Completare tutti i campi obbligatori del step corrente')
  }
  
  // Find next available steps
  for (let step = currentStep + 1; step <= 18; step++) {
    if (isStepAvailable(step, wizardData)) {
      nextSteps.push(step)
    } else {
      const dependency = STEP_DEPENDENCIES[step as keyof typeof STEP_DEPENDENCIES]
      if (dependency) {
        blockedBy.push(...dependency.dependsOn)
        suggestions.push(`Step ${step} richiede completamento di step ${dependency.dependsOn.join(', ')}`)
      }
    }
  }
  
  return {
    canProceed,
    blockedBy: [...new Set(blockedBy)],
    suggestions,
    nextSteps: nextSteps.slice(0, 3) // Next 3 available steps
  }
}

/**
 * Export enhanced schemas for external use
 */
export const EnhancedSchemas = {
  createStep5Schema: createEnhancedStep5Schema,
  createStep7Schema: createEnhancedStep7Schema,
  createStep8Schema: createEnhancedStep8Schema,
  createStep10Schema: createEnhancedStep10Schema,
} as const 