import { z } from 'zod'

// Basic Information Schema - matching SII specification
export const basicInfoSchema = z.object({
  pivaUtente: z.string()
    .min(11, 'La PIVA deve contenere almeno 11 caratteri')
    .max(16, 'La PIVA non può superare i 16 caratteri')
    .regex(/^[A-Z0-9]+$/, 'La PIVA deve contenere solo lettere maiuscole e numeri'),
  codOfferta: z.string()
    .min(1, 'Il codice offerta è obbligatorio')
    .max(32, 'Il codice offerta non può superare i 32 caratteri')
    .regex(/^[A-Z0-9]+$/, 'Il codice offerta deve contenere solo lettere maiuscole e numeri'),
})

// Offer Details Schema
export const offerDetailsSchema = z.object({
  marketType: z.enum(['01', '02', '03'], {
    required_error: 'Please select a market type',
  }),
  clientType: z.enum(['domestic', 'business'], {
    required_error: 'Please select a client type',
  }),
})

// Activation & Contacts Schema (placeholder for now)
export const activationContactsSchema = z.object({
  // TODO: Add fields when implementing this step
})

// Pricing Configuration Schema (placeholder for now)
export const pricingConfigSchema = z.object({
  // TODO: Add fields when implementing this step
})

// Company Components Schema (placeholder for now)
export const companyComponentsSchema = z.object({
  // TODO: Add fields when implementing this step
})

// Payment & Conditions Schema (placeholder for now)
export const paymentConditionsSchema = z.object({
  // TODO: Add fields when implementing this step
})

// Additional Features Schema (placeholder for now)
export const additionalFeaturesSchema = z.object({
  // TODO: Add fields when implementing this step
})

// Validity & Review Schema (placeholder for now)
export const validityReviewSchema = z.object({
  // TODO: Add fields when implementing this step
})

// Type exports for use in components
export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>
export type OfferDetailsFormValues = z.infer<typeof offerDetailsSchema>
export type ActivationContactsFormValues = z.infer<typeof activationContactsSchema>
export type PricingConfigFormValues = z.infer<typeof pricingConfigSchema>
export type CompanyComponentsFormValues = z.infer<typeof companyComponentsSchema>
export type PaymentConditionsFormValues = z.infer<typeof paymentConditionsSchema>
export type AdditionalFeaturesFormValues = z.infer<typeof additionalFeaturesSchema>
export type ValidityReviewFormValues = z.infer<typeof validityReviewSchema> 