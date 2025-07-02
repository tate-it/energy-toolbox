'use client'

/**
 * Step 1: Identification Information Hook (useStep1)
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
  Step1Schema, 
  Step1Data, 
  Step1Defaults,
  validateStep1,
  getStep1FieldError,
  isStep1Complete,
  formatStep1ForXML
} from '../../lib/sii/schemas/step1'
import { 
  createStepHook,
  createFieldErrorFunction,
  createValidationFunction,
  createSafeParseValidationFunction,
  createCompletenessCheckFunction
} from './useStepFactory'

/**
 * Step 1 hook using the standardized factory with debounced text input updates
 */
const useStep1Hook = createStepHook<Step1Data>({
  stepId: 'step1',
  stepNumber: 1,
  defaultValues: Step1Defaults,
  validationFn: createValidationFunction<Step1Data>(Step1Schema),
  fieldErrorFn: createFieldErrorFunction<Step1Data>(Step1Schema),
  completenessCheckFn: isStep1Complete,
  xmlFormatter: formatStep1ForXML,
  
  // Related field groups for smart batch updates
  relatedFieldGroups: [
    {
      name: 'identification',
      fields: ['piva', 'cod'],
      updateStrategy: 'debounced',
      description: 'Identificativi azienda e offerta - aggiornati insieme per coerenza'
    }
  ],
  
  // Field relationships for Step 1
  fieldRelationships: {
    // Cross-validation to ensure PIVA and offer code are consistent
    crossValidation: [
      {
        fields: ['piva', 'cod'],
        validator: (values) => {
          const { piva, cod } = values
          if (piva && cod) {
            // Example business rule: offer code should not contain spaces if PIVA is provided
            if (typeof cod === 'string' && cod.includes(' ')) {
              return 'Il codice offerta non dovrebbe contenere spazi quando è specificata la PIVA'
            }
          }
          return null
        }
      }
    ]
  }
})

/**
 * Step 1 hook with standardized debounced text input updates
 * 
 * This hook provides:
 * - updateField() - Standard debounced updates (300ms) for text inputs like PIVA and Codice Offerta
 * - fastUpdateField() - Fast debounced updates (150ms) for paste operations
 * - immediateUpdateField() - No debounce for dropdowns/checkboxes
 * - batchUpdate() - Immediate batch updates for related fields
 * - debouncedBatchUpdate() - Debounced batch updates for text field groups
 * - cancelUpdates() - Cancel pending debounced updates
 * - flushUpdates() - Flush pending updates immediately
 */
export function useStep1() {
  return useStep1Hook()
}

/**
 * Type export for hook return value
 */
export type UseStep1Return = ReturnType<typeof useStep1>

/**
 * Default export for convenient importing
 */
export default useStep1 