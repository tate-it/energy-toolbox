/**
 * SII Types - Central TypeScript Types File
 * 
 * This file imports and re-exports all TypeScript types inferred from the
 * 18 Zod validation schemas for the SII XML Generator wizard.
 * 
 * Provides a single import location for all SII-related types.
 */

// Import all step data types
export type { Step1Data } from './schemas/step1'
export type { Step2Data } from './schemas/step2'
export type { Step3Data } from './schemas/step3'
export type { Step4Data } from './schemas/step4'
export type { Step5Data } from './schemas/step5'
export type { Step6Data } from './schemas/step6'
export type { Step7Data } from './schemas/step7'
export type { Step8Data } from './schemas/step8'
export type { Step9Data } from './schemas/step9'
export type { Step10Data } from './schemas/step10'
export type { Step11Data } from './schemas/step11'
export type { Step12Data } from './schemas/step12'
export type { Step13Data } from './schemas/step13'
export type { Step14Data } from './schemas/step14'
export type { Step15Data } from './schemas/step15'
export type { Step16Data } from './schemas/step16'
export type { Step17Data } from './schemas/step17'
export type { Step18Data } from './schemas/step18'

// Import all step validation state types
export type { Step1ValidationState } from './schemas/step1'

// Import all step schemas for runtime validation
export { Step1Schema } from './schemas/step1'
export { Step2Schema } from './schemas/step2'
export { Step3Schema } from './schemas/step3'
export { Step4Schema } from './schemas/step4'
export { Step5Schema } from './schemas/step5'
export { Step6Schema } from './schemas/step6'
export { Step7Schema } from './schemas/step7'
export { Step8Schema } from './schemas/step8'
export { Step9Schema } from './schemas/step9'
export { Step10Schema } from './schemas/step10'
export { Step11Schema } from './schemas/step11'
export { Step12Schema } from './schemas/step12'
export { Step13Schema } from './schemas/step13'
export { Step14Schema } from './schemas/step14'
export { Step15Schema } from './schemas/step15'
export { Step16Schema } from './schemas/step16'
export { Step17Schema } from './schemas/step17'
export { Step18Schema } from './schemas/step18'

// Export composite types for the complete wizard state
export interface SIIWizardData {
  step1: Step1Data
  step2: Step2Data
  step3: Step3Data
  step4: Step4Data
  step5: Step5Data
  step6: Step6Data
  step7: Step7Data
  step8: Step8Data
  step9: Step9Data
  step10: Step10Data
  step11: Step11Data
  step12: Step12Data
  step13: Step13Data
  step14: Step14Data
  step15: Step15Data
  step16: Step16Data
  step17: Step17Data
  step18: Step18Data
}

// Export partial state for incomplete wizard sessions
export type PartialSIIWizardData = {
  [K in keyof SIIWizardData]?: Partial<SIIWizardData[K]>
}

// Export step validation results
export interface StepValidationResult<T = any> {
  success: boolean
  data?: T
  errors?: Record<string, string>
}

// Export wizard step metadata
export interface StepMetadata {
  step: number
  title: string
  description: string
  isOptional?: boolean
  isConditional?: boolean
  dependsOn?: number[]
  estimatedTimeMinutes: number
}

// Export the complete wizard metadata
export const WIZARD_STEPS_METADATA: Record<number, StepMetadata> = {
  1: {
    step: 1,
    title: 'Identificativi Offerta',
    description: 'Informazioni di identificazione del venditore e offerta',
    estimatedTimeMinutes: 2
  },
  2: {
    step: 2,
    title: 'Dettagli Offerta',
    description: 'Caratteristiche principali dell\'offerta energetica',
    estimatedTimeMinutes: 3
  },
  3: {
    step: 3,
    title: 'Modalità Attivazione',
    description: 'Canali e metodi per attivare il contratto',
    estimatedTimeMinutes: 2
  },
  4: {
    step: 4,
    title: 'Informazioni Contatto',
    description: 'Recapiti e modalità di comunicazione con il cliente',
    estimatedTimeMinutes: 3
  },
  5: {
    step: 5,
    title: 'Riferimenti Prezzo Energia',
    description: 'Indexazione e parametri di riferimento del prezzo',
    isConditional: true,
    dependsOn: [2],
    estimatedTimeMinutes: 4
  },
  6: {
    step: 6,
    title: 'Validità Offerta',
    description: 'Date e condizioni di validità dell\'offerta',
    estimatedTimeMinutes: 2
  },
  7: {
    step: 7,
    title: 'Caratteristiche Offerta',
    description: 'Specifiche tecniche e contrattuali',
    isConditional: true,
    dependsOn: [2],
    estimatedTimeMinutes: 3
  },
  8: {
    step: 8,
    title: 'Offerta Dual',
    description: 'Configurazione per offerte combinate luce e gas',
    isOptional: true,
    isConditional: true,
    dependsOn: [2],
    estimatedTimeMinutes: 3
  },
  9: {
    step: 9,
    title: 'Modalità Pagamento',
    description: 'Metodi di pagamento accettati',
    estimatedTimeMinutes: 2
  },
  10: {
    step: 10,
    title: 'Componenti Regolate',
    description: 'Tariffe e costi definiti dall\'Autorità',
    estimatedTimeMinutes: 3
  },
  11: {
    step: 11,
    title: 'Tipo Prezzo/Fasce Orarie',
    description: 'Struttura temporale dei prezzi energetici',
    isConditional: true,
    dependsOn: [2, 5],
    estimatedTimeMinutes: 4
  },
  12: {
    step: 12,
    title: 'Fasce Orarie Settimanali',
    description: 'Configurazione dettagliata delle fasce orarie',
    isConditional: true,
    dependsOn: [11],
    estimatedTimeMinutes: 5
  },
  13: {
    step: 13,
    title: 'Dispacciamento',
    description: 'Costi e modalità del servizio di dispacciamento',
    estimatedTimeMinutes: 4
  },
  14: {
    step: 14,
    title: 'Componente Azienda',
    description: 'Margini e costi specifici dell\'azienda',
    estimatedTimeMinutes: 4
  },
  15: {
    step: 15,
    title: 'Condizioni Contrattuali',
    description: 'Clausole, penali e garanzie contrattuali',
    estimatedTimeMinutes: 5
  },
  16: {
    step: 16,
    title: 'Zone Offerta',
    description: 'Ambito geografico di validità dell\'offerta',
    estimatedTimeMinutes: 3
  },
  17: {
    step: 17,
    title: 'Sconti',
    description: 'Sconti e agevolazioni applicate',
    isOptional: true,
    estimatedTimeMinutes: 4
  },
  18: {
    step: 18,
    title: 'Servizi Aggiuntivi',
    description: 'Servizi opzionali e prodotti complementari',
    isOptional: true,
    estimatedTimeMinutes: 5
  }
} as const

// Export utility type for step numbers
export type StepNumber = keyof typeof WIZARD_STEPS_METADATA

// Export form validation state types
export interface FormValidationState<T = Record<string, any>> {
  data: T
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
}

// Export wizard navigation state
export interface WizardNavigationState {
  currentStep: StepNumber
  completedSteps: Set<StepNumber>
  availableSteps: Set<StepNumber>
  totalSteps: number
  progressPercentage: number
}

// Export XML generation types
export interface XMLGenerationOptions {
  includeOptionalFields: boolean
  validateAgainstXSD: boolean
  formatOutput: boolean
  encoding: 'UTF-8' | 'UTF-16'
}

export interface XMLGenerationResult {
  success: boolean
  xmlContent?: string
  errors?: string[]
  warnings?: string[]
  validationDetails?: {
    isValid: boolean
    schemaViolations: string[]
  }
}

// Export constants for enum values
export * from './constants'

// Export common validation and utility functions
export {
  validateStep1,
  isStep1Complete,
  getStep1FieldError,
  formatStep1ForXML,
  createStep1ValidationState
} from './schemas/step1'

// Export URL state management types
export interface URLStateOptions {
  compress: boolean
  debounceMs: number
  batchUpdates: boolean
  maxURLLength: number
}

export interface StepURLState {
  stepNumber: StepNumber
  data: Record<string, any>
  isComplete: boolean
  lastModified: string
}

// Export error handling types
export interface SIIValidationError {
  step: StepNumber
  field: string
  message: string
  code: string
  severity: 'error' | 'warning' | 'info'
}

export interface SIIBusinessRuleViolation {
  rule: string
  description: string
  affectedFields: string[]
  recommendation: string
  impact: 'alto' | 'medio' | 'basso'
}

// Export performance monitoring types
export interface WizardPerformanceMetrics {
  totalTimeSpent: number // milliseconds
  stepTimes: Record<StepNumber, number>
  validationAttempts: Record<StepNumber, number>
  backNavigations: number
  formFieldInteractions: number
  completionRate: number // 0-1
}

// Export accessibility types
export interface AccessibilityState {
  screenReaderAnnouncements: string[]
  keyboardNavigationEnabled: boolean
  focusTrappingActive: boolean
  contrastMode: 'normal' | 'high'
  fontSizeMultiplier: number
}

// Export localization types
export interface LocalizationContext {
  language: 'it-IT'
  dateFormat: 'DD/MM/YYYY'
  numberFormat: 'european'
  currencySymbol: '€'
  decimalSeparator: ','
  thousandsSeparator: '.'
} 