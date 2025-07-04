import { defineStepper } from '@stepperize/react'

export const xmlFormStepper = defineStepper(
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'VAT Number and Offer Code',
  },
  {
    id: 'offer-details',
    title: 'Offer Details',
    description: 'Market type, client type, and offer configuration',
  },
  {
    id: 'activation-contacts',
    title: 'Activation & Contacts',
    description: 'Activation methods and contact information',
  },
  {
    id: 'pricing-config',
    title: 'Pricing Configuration',
    description: 'Energy prices, time bands, and dispatching',
  },
  {
    id: 'company-components',
    title: 'Company Components',
    description: 'Component definitions with price intervals',
  },
  {
    id: 'payment-conditions',
    title: 'Payment & Conditions',
    description: 'Payment methods and contractual conditions',
  },
  {
    id: 'additional-features',
    title: 'Additional Features',
    description: 'Discounts, zones, and additional services',
  },
  {
    id: 'validity-review',
    title: 'Validity & Review',
    description: 'Offer validity dates and final review',
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