'use client'

/**
 * Step 5: Energy Price References Hook (useStep5)
 * Demonstrates sophisticated conditional field handling with dynamic requirements
 * 
 * Features:
 * - Conditional field visibility based on price reference type
 * - Dynamic field requirements based on time bands configuration
 * - Smart field clearing when dependencies change
 * - Cross-field validation with business rules
 * - Related field groups with conditional update strategies
 */

import { 
  Step5Schema, 
  Step5Data, 
  Step5Defaults,
  validateStep5,
  isStep5Complete,
  formatStep5ForXML,
  getRequiredFieldsForPriceType,
  getRequiredBandPrices,
  calculatePricingSummary,
  validatePricingCompleteness
} from '../../lib/sii/schemas/step5'
import { 
  PREZZO_RIFERIMENTO,
  FASCE_ORARIE,
  IDX_PREZZO_ENERGIA
} from '../../lib/sii/constants'
import { 
  createStepHook,
  createFieldErrorFunction,
  createValidationFunction
} from './useStepFactory'

/**
 * Step 5 hook using the standardized factory with conditional field handling
 */
const useStep5Hook = createStepHook<Step5Data>({
  stepId: 'step5',
  stepNumber: 5,
  defaultValues: Step5Defaults,
  validationFn: createValidationFunction<Step5Data>(Step5Schema),
  fieldErrorFn: createFieldErrorFunction<Step5Data>(Step5Schema),
  completenessCheckFn: isStep5Complete,
  xmlFormatter: formatStep5ForXML,
  
  // Related field groups for conditional updates
  relatedFieldGroups: [
    {
      name: 'priceConfig',
      fields: ['prezzo_rif', 'prezzo_fisso', 'prezzo_var_formula', 'indicizzazione', 'spread'],
      updateStrategy: 'fast',
      description: 'Configurazione prezzo - aggiornamento rapido per cascata condizionale'
    },
    {
      name: 'fixedPricing',
      fields: ['prezzo_rif', 'prezzo_fisso'],
      updateStrategy: 'immediate',
      description: 'Prezzo fisso - aggiornamento immediato per validazione'
    },
    {
      name: 'variablePricing',
      fields: ['prezzo_rif', 'prezzo_var_formula', 'indicizzazione', 'spread'],
      updateStrategy: 'debounced',
      description: 'Prezzo variabile - aggiornamento posticipato per formule complesse'
    },
    {
      name: 'timeBands',
      fields: ['fasce_orarie', 'prezzo_f1', 'prezzo_f2', 'prezzo_f3'],
      updateStrategy: 'fast',
      description: 'Fasce orarie - aggiornamento rapido per gestione condizionale prezzi'
    },
    {
      name: 'bandPrices',
      fields: ['prezzo_f1', 'prezzo_f2', 'prezzo_f3'],
      updateStrategy: 'debounced',
      description: 'Prezzi per fascia - aggiornamento posticipato per calcoli'
    }
  ],
  
  // Field relationships with sophisticated conditional logic
  fieldRelationships: {
    // Clear dependent fields when price reference type changes
    clearOnChange: [
      {
        trigger: 'prezzo_rif',
        targets: ['prezzo_fisso', 'prezzo_var_formula', 'indicizzazione', 'spread']
      },
      {
        trigger: 'fasce_orarie',
        targets: ['prezzo_f1', 'prezzo_f2', 'prezzo_f3']
      }
    ],
    
    // Price configuration dependencies
    dependencies: [
      {
        primary: 'prezzo_rif',
        dependent: 'prezzo_fisso',
        validator: (priceType: string, fixedPrice: number) => {
          // Fixed price required only for fixed pricing
          if (priceType === PREZZO_RIFERIMENTO.FISSO) {
            return fixedPrice !== undefined && fixedPrice > 0
          }
          return true
        }
      },
      {
        primary: 'prezzo_rif',
        dependent: 'indicizzazione',
        validator: (priceType: string, indexation: string) => {
          // Indexation required for indexed pricing
          if (priceType === PREZZO_RIFERIMENTO.INDICIZZATO) {
            return indexation !== undefined
          }
          return true
        }
      },
      {
        primary: 'fasce_orarie',
        dependent: 'prezzo_f1',
        validator: (timeBands: string, priceF1: number) => {
          // F1 price required when time bands are configured
          if (timeBands) {
            return priceF1 !== undefined && priceF1 > 0
          }
          return true
        }
      },
      {
        primary: 'fasce_orarie',
        dependent: 'prezzo_f2',
        validator: (timeBands: string, priceF2: number) => {
          // F2 price required for bi-hourly and multi-hourly
          if (timeBands === FASCE_ORARIE.BIORARIA || timeBands === FASCE_ORARIE.MULTIORARIA) {
            return priceF2 !== undefined && priceF2 > 0
          }
          return true
        }
      },
      {
        primary: 'fasce_orarie',
        dependent: 'prezzo_f3',
        validator: (timeBands: string, priceF3: number) => {
          // F3 price required only for multi-hourly
          if (timeBands === FASCE_ORARIE.MULTIORARIA) {
            return priceF3 !== undefined && priceF3 > 0
          }
          return true
        }
      }
    ],
    
    // Cross-validation for complex business rules
    crossValidation: [
      {
        fields: ['prezzo_rif', 'prezzo_fisso', 'prezzo_var_formula', 'indicizzazione'],
        validator: (values) => {
          const { prezzo_rif, prezzo_fisso, prezzo_var_formula, indicizzazione } = values
          
          // Fixed pricing validation
          if (prezzo_rif === PREZZO_RIFERIMENTO.FISSO) {
            if (!prezzo_fisso) {
              return 'Prezzo fisso è obbligatorio per prezzi fissi'
            }
          }
          
          // Variable pricing validation
          if (prezzo_rif === PREZZO_RIFERIMENTO.VARIABILE) {
            if (!prezzo_var_formula && !indicizzazione) {
              return 'Prezzo variabile richiede formula o indicizzazione'
            }
          }
          
          // Indexed pricing validation
          if (prezzo_rif === PREZZO_RIFERIMENTO.INDICIZZATO) {
            if (!indicizzazione) {
              return 'Tipo di indicizzazione è obbligatorio per prezzi indicizzati'
            }
          }
          
          return null
        }
      },
      {
        fields: ['fasce_orarie', 'prezzo_f1', 'prezzo_f2', 'prezzo_f3'],
        validator: (values) => {
          const { fasce_orarie, prezzo_f1, prezzo_f2, prezzo_f3 } = values
          
          if (fasce_orarie) {
            switch (fasce_orarie) {
              case FASCE_ORARIE.MONORARIA:
                if (!prezzo_f1) return 'Prezzo F1 è obbligatorio per tariffa monoraria'
                break
              case FASCE_ORARIE.BIORARIA:
                if (!prezzo_f1) return 'Prezzo F1 è obbligatorio per tariffa bioraria'
                if (!prezzo_f2) return 'Prezzo F2 è obbligatorio per tariffa bioraria'
                break
              case FASCE_ORARIE.MULTIORARIA:
                if (!prezzo_f1) return 'Prezzo F1 è obbligatorio per tariffa multioraria'
                if (!prezzo_f2) return 'Prezzo F2 è obbligatorio per tariffa multioraria'
                if (!prezzo_f3) return 'Prezzo F3 è obbligatorio per tariffa multioraria'
                break
            }
          }
          
          // Check for band prices without time bands configuration
          const hasBandPrices = prezzo_f1 || prezzo_f2 || prezzo_f3
          if (hasBandPrices && !fasce_orarie) {
            return 'Configurazione fasce orarie richiesta quando sono specificati prezzi per fascia'
          }
          
          return null
        }
      },
      {
        fields: ['prezzo_fisso', 'fasce_orarie'],
        validator: (values) => {
          const { prezzo_fisso, fasce_orarie } = values
          
          // Fixed price incompatible with time bands
          if (prezzo_fisso && fasce_orarie) {
            return 'Prezzo fisso non è compatibile con fasce orarie'
          }
          
          return null
        }
      }
    ]
  }
})

/**
 * Step 5 hook with sophisticated conditional field handling
 * 
 * This hook provides advanced conditional field management:
 * - setPriceType(type) - Set price reference type and clear dependent fields
 * - setFixedPrice(price) - Configure fixed pricing with validation
 * - setVariablePrice(formula, indexation?, spread?) - Configure variable pricing
 * - setTimeBands(bands) - Configure time bands and clear band prices
 * - setBandPrices(f1, f2?, f3?) - Set band-specific prices based on configuration
 * - getFieldVisibility() - Get which fields should be visible
 * - getFieldRequirements() - Get which fields are required
 * - validatePriceConfiguration() - Comprehensive pricing validation
 */
export function useStep5() {
  const hook = useStep5Hook()
  
  // CONDITIONAL FIELD MANAGEMENT
  
  // Set price reference type and manage dependent fields
  const setPriceType = (priceType: string) => {
    // Clear all price-related fields when changing type
    const updates: Partial<Step5Data> = {
      prezzo_rif: priceType,
      prezzo_fisso: undefined,
      prezzo_var_formula: undefined,
      indicizzazione: undefined,
      spread: undefined
    }
    
    hook.updateRelatedFieldGroup('priceConfig', updates)
  }
  
  // Configure fixed pricing
  const setFixedPrice = (price: number) => {
    hook.updateRelatedFieldGroup('fixedPricing', {
      prezzo_rif: PREZZO_RIFERIMENTO.FISSO,
      prezzo_fisso: price
    })
  }
  
  // Configure variable pricing with optional indexation
  const setVariablePrice = (
    formula?: string,
    indexation?: string,
    spread?: number
  ) => {
    const updates: Partial<Step5Data> = {
      prezzo_rif: PREZZO_RIFERIMENTO.VARIABILE
    }
    
    if (formula !== undefined) updates.prezzo_var_formula = formula
    if (indexation !== undefined) updates.indicizzazione = indexation
    if (spread !== undefined) updates.spread = spread
    
    hook.updateRelatedFieldGroup('variablePricing', updates)
  }
  
  // Configure indexed pricing
  const setIndexedPrice = (indexation: string, spread?: number) => {
    const updates: Partial<Step5Data> = {
      prezzo_rif: PREZZO_RIFERIMENTO.INDICIZZATO,
      indicizzazione: indexation
    }
    
    if (spread !== undefined) updates.spread = spread
    
    hook.updateRelatedFieldGroup('variablePricing', updates)
  }
  
  // Set time bands configuration and clear dependent prices
  const setTimeBands = (timeBands?: string) => {
    const updates: Partial<Step5Data> = {
      fasce_orarie: timeBands,
      prezzo_f1: undefined,
      prezzo_f2: undefined,
      prezzo_f3: undefined
    }
    
    hook.updateRelatedFieldGroup('timeBands', updates)
  }
  
  // Set band-specific prices based on time bands configuration
  const setBandPrices = (f1?: number, f2?: number, f3?: number) => {
    const updates: Partial<Step5Data> = {}
    
    // Only set prices that are valid for current time bands config
    const timeBands = hook.data.fasce_orarie
    if (timeBands) {
      if (f1 !== undefined) updates.prezzo_f1 = f1
      
      if ((timeBands === FASCE_ORARIE.BIORARIA || timeBands === FASCE_ORARIE.MULTIORARIA) && f2 !== undefined) {
        updates.prezzo_f2 = f2
      }
      
      if (timeBands === FASCE_ORARIE.MULTIORARIA && f3 !== undefined) {
        updates.prezzo_f3 = f3
      }
    }
    
    hook.updateRelatedFieldGroup('bandPrices', updates)
  }
  
  // CONDITIONAL FIELD LOGIC HELPERS
  
  // Get field visibility based on current configuration
  const getFieldVisibility = () => {
    const { prezzo_rif, fasce_orarie } = hook.data
    
    return {
      // Price type fields visibility
      showFixedPrice: prezzo_rif === PREZZO_RIFERIMENTO.FISSO,
      showVariableFormula: prezzo_rif === PREZZO_RIFERIMENTO.VARIABILE,
      showIndexation: prezzo_rif === PREZZO_RIFERIMENTO.VARIABILE || prezzo_rif === PREZZO_RIFERIMENTO.INDICIZZATO,
      showSpread: (prezzo_rif === PREZZO_RIFERIMENTO.VARIABILE || prezzo_rif === PREZZO_RIFERIMENTO.INDICIZZATO) && hook.data.indicizzazione,
      
      // Time bands visibility
      showTimeBands: true, // Always optional
      showBandPrices: !!fasce_orarie,
      showF1Price: !!fasce_orarie,
      showF2Price: fasce_orarie === FASCE_ORARIE.BIORARIA || fasce_orarie === FASCE_ORARIE.MULTIORARIA,
      showF3Price: fasce_orarie === FASCE_ORARIE.MULTIORARIA,
    }
  }
  
  // Get field requirements based on current configuration
  const getFieldRequirements = () => {
    const { prezzo_rif, fasce_orarie } = hook.data
    
    return {
      // Always required
      priceReferenceRequired: true,
      
      // Price type requirements
      fixedPriceRequired: prezzo_rif === PREZZO_RIFERIMENTO.FISSO,
      variableFormulaRequired: prezzo_rif === PREZZO_RIFERIMENTO.VARIABILE && !hook.data.indicizzazione,
      indexationRequired: prezzo_rif === PREZZO_RIFERIMENTO.INDICIZZATO || (prezzo_rif === PREZZO_RIFERIMENTO.VARIABILE && !hook.data.prezzo_var_formula),
      
      // Time bands requirements
      f1PriceRequired: !!fasce_orarie,
      f2PriceRequired: fasce_orarie === FASCE_ORARIE.BIORARIA || fasce_orarie === FASCE_ORARIE.MULTIORARIA,
      f3PriceRequired: fasce_orarie === FASCE_ORARIE.MULTIORARIA,
    }
  }
  
  // Clear all pricing configuration
  const clearPriceConfiguration = () => {
    hook.updateRelatedFieldGroup('priceConfig', {
      prezzo_rif: undefined,
      prezzo_fisso: undefined,
      prezzo_var_formula: undefined,
      indicizzazione: undefined,
      spread: undefined
    })
  }
  
  // Clear time bands configuration
  const clearTimeBandsConfiguration = () => {
    hook.updateRelatedFieldGroup('timeBands', {
      fasce_orarie: undefined,
      prezzo_f1: undefined,
      prezzo_f2: undefined,
      prezzo_f3: undefined
    })
  }
  
  // VALIDATION AND ANALYSIS HELPERS
  
  // Get pricing summary and statistics
  const getPricingSummary = () => {
    return calculatePricingSummary(hook.data as Step5Data)
  }
  
  // Validate pricing configuration completeness
  const validatePriceConfiguration = () => {
    return validatePricingCompleteness(hook.data as Step5Data)
  }
  
  // Check if current configuration has conflicts
  const hasConfigurationConflicts = () => {
    const validation = validatePriceConfiguration()
    return validation.warnings.length > 0
  }
  
  // Get configuration completeness score (0-100)
  const getConfigurationScore = () => {
    let score = 0
    const requirements = getFieldRequirements()
    
    // Base price configuration (50 points)
    if (hook.data.prezzo_rif) score += 20
    if (requirements.fixedPriceRequired && hook.data.prezzo_fisso) score += 30
    if (requirements.variableFormulaRequired && hook.data.prezzo_var_formula) score += 30
    if (requirements.indexationRequired && hook.data.indicizzazione) score += 30
    
    // Time bands configuration (30 points)
    if (hook.data.fasce_orarie) {
      score += 10
      if (requirements.f1PriceRequired && hook.data.prezzo_f1) score += 7
      if (requirements.f2PriceRequired && hook.data.prezzo_f2) score += 7
      if (requirements.f3PriceRequired && hook.data.prezzo_f3) score += 6
    }
    
    // Optional enhancements (20 points)
    if (hook.data.spread !== undefined) score += 10
    if (!hasConfigurationConflicts()) score += 10
    
    return Math.min(score, 100)
  }
  
  // Get recommended next steps
  const getRecommendations = () => {
    const recommendations: string[] = []
    const requirements = getFieldRequirements()
    const visibility = getFieldVisibility()
    
    if (!hook.data.prezzo_rif) {
      recommendations.push('Seleziona il tipo di prezzo di riferimento')
    } else if (requirements.fixedPriceRequired && !hook.data.prezzo_fisso) {
      recommendations.push('Inserisci il prezzo fisso')
    } else if (requirements.variableFormulaRequired && !hook.data.prezzo_var_formula) {
      recommendations.push('Inserisci la formula per il prezzo variabile')
    } else if (requirements.indexationRequired && !hook.data.indicizzazione) {
      recommendations.push('Seleziona il tipo di indicizzazione')
    }
    
    if (!hook.data.fasce_orarie && !hook.data.prezzo_fisso) {
      recommendations.push('Considera l\'aggiunta di fasce orarie per prezzi differenziati')
    }
    
    if (visibility.showSpread && hook.data.spread === undefined) {
      recommendations.push('Aggiungi uno spread per prezzi indicizzati')
    }
    
    return recommendations
  }
  
  return {
    ...hook,
    
    // CONDITIONAL FIELD MANAGEMENT
    setPriceType,
    setFixedPrice,
    setVariablePrice,
    setIndexedPrice,
    setTimeBands,
    setBandPrices,
    clearPriceConfiguration,
    clearTimeBandsConfiguration,
    
    // CONDITIONAL FIELD LOGIC
    getFieldVisibility,
    getFieldRequirements,
    
    // VALIDATION AND ANALYSIS
    getPricingSummary,
    validatePriceConfiguration,
    hasConfigurationConflicts,
    getConfigurationScore,
    getRecommendations
  }
}

/**
 * Type export for hook return value
 */
export type UseStep5Return = ReturnType<typeof useStep5>

/**
 * Default export for convenient importing
 */
export default useStep5 