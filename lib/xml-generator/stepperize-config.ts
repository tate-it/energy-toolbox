import { defineStepper } from '@/components/stepper'
import { ActivationContactsStep } from '@/components/xml-generator/steps/activation-contacts-step'
import { AdditionalFeaturesStep } from '@/components/xml-generator/steps/additional-features-step'
import { BasicInfoStep } from '@/components/xml-generator/steps/basic-info-step'
import { CompanyComponentsStep } from '@/components/xml-generator/steps/company-components-step'
import { OfferDetailsStep } from '@/components/xml-generator/steps/offer-details-step'
import { PaymentConditionsStep } from '@/components/xml-generator/steps/payment-conditions-step'
import { PricingConfigStep } from '@/components/xml-generator/steps/pricing-config-step'
import { ValidityReviewStep } from '@/components/xml-generator/steps/validity-review-step'
import {
  activationContactsSchema,
  additionalFeaturesSchema,
  basicInfoSchema,
  companyComponentsSchema,
  offerDetailsSchema,
  paymentConditionsSchema,
  pricingConfigSchema,
  validityReviewSchema,
} from './schemas'
import { baseConfig } from './stepperize/config'

const schemaMap = {
  basicInfo: basicInfoSchema,
  offerDetails: offerDetailsSchema,
  activationContacts: activationContactsSchema,
  pricingConfig: pricingConfigSchema,
  companyComponents: companyComponentsSchema,
  paymentConditions: paymentConditionsSchema,
  additionalFeatures: additionalFeaturesSchema,
  validityReview: validityReviewSchema,
} as const

const componentMap = {
  basicInfo: BasicInfoStep,
  offerDetails: OfferDetailsStep,
  activationContacts: ActivationContactsStep,
  pricingConfig: PricingConfigStep,
  companyComponents: CompanyComponentsStep,
  paymentConditions: PaymentConditionsStep,
  additionalFeatures: AdditionalFeaturesStep,
  validityReview: ValidityReviewStep,
} as const

export const xmlFormStepper = defineStepper(
  ...baseConfig.map((step) => ({
    ...step,
    schema: schemaMap[step.id],
    Component: componentMap[step.id],
  })),
)

export type XmlFormStep = typeof xmlFormStepper
