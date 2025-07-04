import { z } from 'zod'

// Basic Information Schema
export const basicInfoSchema = z.object({
  vatNumber: z.string().min(11, 'VAT number must be at least 11 characters'),
  offerCode: z.string().min(1, 'Offer code is required'),
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