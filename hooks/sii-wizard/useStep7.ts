'use client'

/**
 * Step 7: Offer Characteristics Hook (useStep7)
 * Demonstrates advanced related field batch updates with min/max validation
 * 
 * Features:
 * - Smart batch updates for min/max value pairs
 * - Field dependency validation (min < max)
 * - Related field groups with different update strategies
 * - Cross-validation for business rules
 */

import { 
  Step7Schema, 
  Step7Data, 
  Step7Defaults,
  validateStep7,
  isStep7Complete,
  formatStep7ForXML
} from '../../lib/sii/schemas/step7'
import { 
  createStepHook,
  createFieldErrorFunction,
  createValidationFunction
} from './useStepFactory'

/**
 * Step 7 hook with advanced related field batch updates
 */
const useStep7Hook = createStepHook<Step7Data>({
  stepId: 'step7',
  stepNumber: 7,
  defaultValues: Step7Defaults,
  validationFn: createValidationFunction<Step7Data>(Step7Schema),
  fieldErrorFn: createFieldErrorFunction<Step7Data>(Step7Schema),
  completenessCheckFn: isStep7Complete,
  xmlFormatter: formatStep7ForXML,
  
  // Related field groups for smart batch updates
  relatedFieldGroups: [
    {
      name: 'consumptionRange',
      fields: ['consumoMin', 'consumoMax'],
      updateStrategy: 'fast',
      description: 'Range di consumo energetico - aggiornato rapidamente per feedback immediato'
    },
    {
      name: 'powerRange',
      fields: ['potenzaMin', 'potenzaMax'],
      updateStrategy: 'fast',
      description: 'Range di potenza - aggiornato rapidamente per feedback immediato'
    },
    {
      name: 'allLimits',
      fields: ['consumoMin', 'consumoMax', 'potenzaMin', 'potenzaMax'],
      updateStrategy: 'immediate',
      description: 'Tutti i limiti tecnici - aggiornamento immediato per validazione completa'
    }
  ],
  
  // Field relationships with sophisticated validation
  fieldRelationships: {
    // Min/max dependencies with validation
    dependencies: [
      {
        primary: 'consumoMin',
        dependent: 'consumoMax',
        validator: (minValue: number, maxValue: number) => {
          if (minValue && maxValue) {
            return minValue <= maxValue
          }
          return true
        }
      },
      {
        primary: 'potenzaMin',
        dependent: 'potenzaMax',
        validator: (minValue: number, maxValue: number) => {
          if (minValue && maxValue) {
            return minValue <= maxValue
          }
          return true
        }
      }
    ],
    
    // Clear max values when min values exceed them
    clearOnChange: [
      {
        trigger: 'consumoMin',
        targets: ['consumoMax'] // Will be cleared if min > max via validator
      },
      {
        trigger: 'potenzaMin', 
        targets: ['potenzaMax'] // Will be cleared if min > max via validator
      }
    ],
    
    // Cross-validation for business rules
    crossValidation: [
      {
        fields: ['consumoMin', 'consumoMax'],
        validator: (values) => {
          const { consumoMin, consumoMax } = values
          if (consumoMin && consumoMax) {
            const min = Number(consumoMin)
            const max = Number(consumoMax)
            if (min > max) {
              return 'Il consumo minimo non può essere maggiore del consumo massimo'
            }
            if (min === max) {
              return 'I valori di consumo minimo e massimo dovrebbero essere diversi per definire un range'
            }
          }
          return null
        }
      },
      {
        fields: ['potenzaMin', 'potenzaMax'],
        validator: (values) => {
          const { potenzaMin, potenzaMax } = values
          if (potenzaMin && potenzaMax) {
            const min = Number(potenzaMin)
            const max = Number(potenzaMax)
            if (min > max) {
              return 'La potenza minima non può essere maggiore della potenza massima'
            }
            if (min === max) {
              return 'I valori di potenza minima e massima dovrebbero essere diversi per definire un range'
            }
          }
          return null
        }
      },
      {
        fields: ['consumoMin', 'consumoMax', 'potenzaMin', 'potenzaMax'],
        validator: (values) => {
          const { consumoMin, consumoMax, potenzaMin, potenzaMax } = values
          
          // Business rule: High consumption should correlate with high power
          if (consumoMax && potenzaMax) {
            const consumption = Number(consumoMax)
            const power = Number(potenzaMax)
            
            // Example rule: consumption over 5000 kWh should have power > 3 kW
            if (consumption > 5000 && power <= 3) {
              return 'Un consumo elevato (>5000 kWh) richiede solitamente una potenza maggiore di 3 kW'
            }
          }
          
          return null
        }
      }
    ]
  }
})

/**
 * Step 7 hook with advanced batch update functions for related fields
 * 
 * This hook provides specialized batch update functions:
 * - updateConsumptionRange(min, max) - Update both consumption values with validation
 * - updatePowerRange(min, max) - Update both power values with validation  
 * - updateAllLimits(values) - Update all technical limits together
 * - smartBatchUpdate() - Automatically groups updates by relationship
 * - validateRelatedFields() - Cross-validates all field relationships
 */
export function useStep7() {
  const hook = useStep7Hook()
  
  // Convenience methods for Step 7 specific batch updates
  const updateConsumptionRange = (min?: number, max?: number) => {
    const updates: Partial<Step7Data> = {}
    if (min !== undefined) updates.consumoMin = min
    if (max !== undefined) updates.consumoMax = max
    hook.updateRelatedFieldGroup('consumptionRange', updates)
  }
  
  const updatePowerRange = (min?: number, max?: number) => {
    const updates: Partial<Step7Data> = {}
    if (min !== undefined) updates.potenzaMin = min  
    if (max !== undefined) updates.potenzaMax = max
    hook.updateRelatedFieldGroup('powerRange', updates)
  }
  
  const updateAllLimits = (values: {
    consumoMin?: number
    consumoMax?: number
    potenzaMin?: number
    potenzaMax?: number
  }) => {
    hook.updateRelatedFieldGroup('allLimits', values)
  }
  
  return {
    ...hook,
    
    // Step 7 specific batch update methods
    updateConsumptionRange,
    updatePowerRange,
    updateAllLimits
  }
}

/**
 * Type export for hook return value
 */
export type UseStep7Return = ReturnType<typeof useStep7>

/**
 * Default export for convenient importing
 */
export default useStep7 