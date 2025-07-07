import { defineStepper } from '@/components/stepper'
import {
  basicInfoSchema,
  offerDetailsSchema,
  activationContactsSchema,
  pricingConfigSchema,
  companyComponentsSchema,
  paymentConditionsSchema,
  additionalFeaturesSchema,
  validityReviewSchema,
} from './schemas'
import { BasicInfoStep } from '@/components/xml-generator/steps/BasicInfoStep'

import { PlaceholderComponent } from '@/components/xml-generator'
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
  offerDetails: PlaceholderComponent,
  activationContacts: PlaceholderComponent,
  pricingConfig: PlaceholderComponent,
  companyComponents: PlaceholderComponent,
  paymentConditions: PlaceholderComponent,
  additionalFeatures: PlaceholderComponent,
  validityReview: PlaceholderComponent,
} as const

export const xmlFormStepper = defineStepper(
  ...baseConfig.map(step => ({
    ...step,
    schema: schemaMap[step.id],
    Component: componentMap[step.id],
  }))
)

export type XmlFormStep = typeof xmlFormStepper