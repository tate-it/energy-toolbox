import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldValues, Resolver } from 'react-hook-form'
import type { ZodTypeAny, z } from 'zod'
import type { CompleteFormValues } from './schemas'

export interface FormContextData {
  formStates: Partial<CompleteFormValues>
}

/**
 * Custom resolver that injects the complete form state into schema validation context
 * This allows individual step schemas to access data from other steps for cross-step validation
 */
export function createContextualResolver<TFieldValues extends FieldValues>(
  schema: ZodTypeAny,
  formStates: Partial<CompleteFormValues>,
): Resolver<TFieldValues> {
  return (values, context, options) => {
    const currentStep = getCurrentStepFromValues(values)
    const completeFormData: Partial<CompleteFormValues> = {
      ...formStates,
      // Override with current step values
      [currentStep]: values,
    }

    // Create a new context object that includes form states
    const enhancedContext = {
      ...context,
      formStates: completeFormData,
    }

    // Use the standard zodResolver with enhanced context
    const resolver = zodResolver(schema)
    return resolver(values, enhancedContext, options)
  }
}

/**
 * Helper function to access form context within Zod schemas
 * Use this in your schema's superRefine to access cross-step data
 */
export function getFormContext<T = CompleteFormValues>(
  ctx: z.RefinementCtx,
): Partial<T> {
  // Access the context through the Zod refinement context
  // The context object comes from React Hook Form's resolver context
  const contextData = ctx as unknown as { context?: FormContextData }
  return (contextData.context?.formStates || {}) as Partial<T>
}

/**
 * Determine which step the current values belong to
 * This is a simple heuristic based on the shape of the data
 */
function getCurrentStepFromValues(
  values: Record<string, unknown>,
): keyof CompleteFormValues {
  // Check for unique fields in each step to identify the current step
  if ('pivaUtente' in values && 'codOfferta' in values) {
    return 'basicInfo'
  }
  if ('marketType' in values && 'offerType' in values) {
    return 'offerDetails'
  }
  if ('activationMethods' in values && 'phone' in values) {
    return 'activationContacts'
  }
  if ('energyPriceIndex' in values || 'timeBandConfiguration' in values) {
    return 'pricingConfig'
  }
  if ('regulatedComponents' in values || 'companyComponents' in values) {
    return 'companyComponents'
  }
  if ('paymentMethods' in values || 'contractualConditions' in values) {
    return 'paymentConditions'
  }
  if ('offerCharacteristics' in values || 'additionalProducts' in values) {
    return 'additionalFeatures'
  }
  if ('validityPeriod' in values) {
    return 'validityReview'
  }

  // Default fallback
  return 'basicInfo'
}
