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

export const xmlFormStepper = defineStepper(
  {
    id: 'basicInfo',
    title: 'Informazioni di Base',
    description: 'Partita IVA e Codice Offerta',
    schema: basicInfoSchema,
    Component: BasicInfoStep,
  },
  {
    id: 'offerDetails',
    title: 'Dettagli Offerta',
    description: 'Tipo mercato, tipo cliente e configurazione offerta',
    schema: offerDetailsSchema,
    Component: PlaceholderComponent,
  },
  {
    id: 'activationContacts',
    title: 'Attivazione e Contatti',
    description: 'Modalità di attivazione e informazioni di contatto',
    schema: activationContactsSchema,
    Component: PlaceholderComponent,
  },
  {
    id: 'pricingConfig',
    title: 'Configurazione Prezzi',
    description: 'Prezzi energia, fasce orarie e dispacciamento',
    schema: pricingConfigSchema,
    Component: PlaceholderComponent,
  },
  {
    id: 'companyComponents',
    title: 'Componenti Impresa',
    description: 'Definizione componenti con intervalli di prezzo',
    schema: companyComponentsSchema,
    Component: PlaceholderComponent,
  },
  {
    id: 'paymentConditions',
    title: 'Pagamenti e Condizioni',
    description: 'Metodi di pagamento e condizioni contrattuali',
    schema: paymentConditionsSchema,
    Component: PlaceholderComponent,
  },
  {
    id: 'additionalFeatures',
    title: 'Funzionalità Aggiuntive',
    description: 'Sconti, zone e servizi aggiuntivi',
    schema: additionalFeaturesSchema,
    Component: PlaceholderComponent,
  },
  {
    id: 'validityReview',
    title: 'Validità e Revisione',
    description: 'Date di validità offerta e revisione finale',
    schema: validityReviewSchema,
    Component: PlaceholderComponent,
  }
)

export type XmlFormStep = typeof xmlFormStepper