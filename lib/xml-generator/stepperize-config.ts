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
    title: 'Informazioni di Base',
    description: 'Partita IVA e Codice Offerta',
    schema: basicInfoSchema,
  },
  {
    id: 'offer-details',
    title: 'Dettagli Offerta',
    description: 'Tipo mercato, tipo cliente e configurazione offerta',
    schema: offerDetailsSchema,
  },
  {
    id: 'activation-contacts',
    title: 'Attivazione e Contatti',
    description: 'Modalità di attivazione e informazioni di contatto',
    schema: activationContactsSchema,
  },
  {
    id: 'pricing-config',
    title: 'Configurazione Prezzi',
    description: 'Prezzi energia, fasce orarie e dispacciamento',
    schema: pricingConfigSchema,
  },
  {
    id: 'company-components',
    title: 'Componenti Impresa',
    description: 'Definizione componenti con intervalli di prezzo',
    schema: companyComponentsSchema,
  },
  {
    id: 'payment-conditions',
    title: 'Pagamenti e Condizioni',
    description: 'Metodi di pagamento e condizioni contrattuali',
    schema: paymentConditionsSchema,
  },
  {
    id: 'additional-features',
    title: 'Funzionalità Aggiuntive',
    description: 'Sconti, zone e servizi aggiuntivi',
    schema: additionalFeaturesSchema,
  },
  {
    id: 'validity-review',
    title: 'Validità e Revisione',
    description: 'Date di validità offerta e revisione finale',
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