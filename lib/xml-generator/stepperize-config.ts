import { defineStepper } from '@stepperize/react'
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

export const xmlFormStepper = defineStepper(
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'VAT Number and Offer Code',
    schema: basicInfoSchema,
  },
  {
    id: 'offer-details',
    title: 'Offer Details',
    description: 'Market type, client type, and offer configuration',
    schema: offerDetailsSchema,
  },
  {
    id: 'activation-contacts',
    title: 'Activation & Contacts',
    description: 'Activation methods and contact information',
    schema: activationContactsSchema,
  },
  {
    id: 'pricing-config',
    title: 'Pricing Configuration',
    description: 'Energy prices, time bands, and dispatching',
    schema: pricingConfigSchema,
  },
  {
    id: 'company-components',
    title: 'Company Components',
    description: 'Component definitions with price intervals',
    schema: companyComponentsSchema,
  },
  {
    id: 'payment-conditions',
    title: 'Payment & Conditions',
    description: 'Payment methods and contractual conditions',
    schema: paymentConditionsSchema,
  },
  {
    id: 'additional-features',
    title: 'Additional Features',
    description: 'Discounts, zones, and additional services',
    schema: additionalFeaturesSchema,
  },
  {
    id: 'validity-review',
    title: 'Validity & Review',
    description: 'Offer validity dates and final review',
    schema: validityReviewSchema,
  }
)

export type XmlFormStep = typeof xmlFormStepper

// Usage example with useStepperWithUrl hook:
// import { useStepperWithUrl } from '@/hooks/use-stepper-with-url'
// 
// function MyComponent() {
//   const stepper = useStepperWithUrl(xmlFormStepper, {
//     queryKey: 'step',
//     onStepChange: (stepId) => console.log('Step changed to:', stepId)
//   })
//   
//   return (
//     <div>
//       <h2>{stepper.currentStep.title}</h2>
//       <button onClick={() => stepper.prev()} disabled={stepper.isFirst}>
//         Previous
//       </button>
//       <button onClick={() => stepper.next()} disabled={stepper.isLast}>
//         Next
//       </button>
//     </div>
//   )
// } 