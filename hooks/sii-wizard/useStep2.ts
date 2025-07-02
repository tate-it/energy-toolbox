'use client'

/**
 * Step 2: Offer Details Hook (useStep2)
 * Using the standardized step hook factory with debounced text input updates
 * 
 * Features:
 * - Standardized debounced text input pattern (300ms standard, 150ms fast)
 * - Base64 JSON URL encoding for clean URLs
 * - Real-time Zod validation with Italian error messages
 * - Batch update functions for related fields
 * - Abbreviated field mappings for URL optimization
 */

import { 
  Step2Schema, 
  Step2Data, 
  Step2Defaults,
  validateStep2,
  isStep2Complete,
  formatStep2ForXML
} from '../../lib/sii/schemas/step2'
import { 
  createStepHook,
  createFieldErrorFunction,
  createValidationFunction
} from './useStepFactory'

/**
 * Step 2 hook using the standardized factory with debounced text input updates
 */
const useStep2Hook = createStepHook<Step2Data>({
  stepId: 'step2',
  stepNumber: 2,
  defaultValues: Step2Defaults,
  validationFn: createValidationFunction<Step2Data>(Step2Schema),
  fieldErrorFn: createFieldErrorFunction<Step2Data>(Step2Schema),
  completenessCheckFn: isStep2Complete,
  xmlFormatter: formatStep2ForXML,
  
  // Related field groups for smart batch updates
  relatedFieldGroups: [
    {
      name: 'marketConfig',
      fields: ['tipoMercato', 'tipoCliente', 'domesticoResidente'],
      updateStrategy: 'immediate',
      description: 'Configurazione mercato - aggiornamento immediato per cascata di validazioni'
    },
    {
      name: 'offerContent',
      fields: ['nomeOfferta', 'descrizione'],
      updateStrategy: 'debounced',
      description: 'Contenuto offerta - aggiornamento posticipato per testi lunghi'
    },
    {
      name: 'offerStructure',
      fields: ['tipoOfferta', 'tipologiaAttContr', 'durata'],
      updateStrategy: 'fast',
      description: 'Struttura offerta - aggiornamento rapido per feedback UX'
    }
  ],
  
  // Field relationships for Step 2
  fieldRelationships: {
    // Clear domestic flag when client type changes to business
    clearOnChange: [
      {
        trigger: 'tipoCliente',
        targets: ['domesticoResidente'] // Clear domestic flag for business clients
      }
    ],
    
    // Cross-validation for market configuration consistency
    crossValidation: [
      {
        fields: ['tipoCliente', 'domesticoResidente'],
        validator: (values) => {
          const { tipoCliente, domesticoResidente } = values
          if (tipoCliente === 'BUSINESS' && domesticoResidente === true) {
            return 'I clienti business non possono essere marcati come domestici residenti'
          }
          return null
        }
      },
      {
        fields: ['nomeOfferta', 'descrizione'],
        validator: (values) => {
          const { nomeOfferta, descrizione } = values
          if (nomeOfferta && descrizione) {
            // Business rule: description should not just repeat the name
            if (String(descrizione).toLowerCase().includes(String(nomeOfferta).toLowerCase())) {
              return 'La descrizione dovrebbe fornire dettagli aggiuntivi oltre al nome dell\'offerta'
            }
          }
          return null
        }
      }
    ]
  }
})

/**
 * Step 2 hook with standardized debounced text input updates and smart batch updates
 * 
 * This hook provides enhanced batch update capabilities for related field groups:
 * - updateField() - Standard debounced updates (300ms) for text inputs like Nome Offerta, Descrizione
 * - fastUpdateField() - Fast debounced updates (150ms) for paste operations
 * - immediateUpdateField() - No debounce for dropdowns like Tipo Mercato, Tipo Cliente
 * - smartBatchUpdate() - Automatically groups related fields (marketConfig, offerContent, offerStructure)
 * - updateRelatedFieldGroup() - Update specific field groups with appropriate strategies
 * - clearRelatedFieldGroup() - Clear entire field groups
 * - validateRelatedFields() - Cross-validate field relationships and business rules
 */
export function useStep2() {
  return useStep2Hook()
}

/**
 * Type export for hook return value
 */
export type UseStep2Return = ReturnType<typeof useStep2>

/**
 * Default export for convenient importing
 */
export default useStep2 