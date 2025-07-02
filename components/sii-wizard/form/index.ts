/**
 * Componenti form riutilizzabili per il wizard SII
 * 
 * Raccolta di componenti form pre-configurati con:
 * - Validazione visiva
 * - Etichette italiane
 * - Layout consistente
 * - Accessibilità
 * - Responsive design
 */

// Componenti form base
export { FormField, type FormFieldProps } from './FormField'
export { FormSelect, type FormSelectProps, type SelectOption } from './FormSelect'
export { FormSection, type FormSectionProps } from './FormSection'
export { FormActions, type FormActionsProps } from './FormActions'

// Componenti di feedback
export { StatusBadge, type StatusBadgeProps, type StatusType } from './StatusBadge'
export { InfoAlert, type InfoAlertProps, type AlertType } from './InfoAlert'

// Componenti per array e campi ripetibili
export { RepeatableField, type RepeatableFieldProps, type RepeatableFieldItem } from './RepeatableField'
export { 
  RepeatableObjectField, 
  type RepeatableObjectFieldProps, 
  type RepeatableObjectItem,
  type ObjectFieldDefinition 
} from './RepeatableObjectField'
export {
  RepeatableFieldGroup,
  type RepeatableFieldGroupProps,
  type RepeatableFieldGroupSection
} from './RepeatableFieldGroup'

// Componenti specializzati per tipi di dati specifici
export {
  ActivationMethods,
  Contacts,
  Discounts,
  AdditionalServices,
  type ActivationMethodsProps,
  type ContactsProps,
  type DiscountsProps,
  type AdditionalServicesProps
} from './SpecializedRepeatableFields'

// Conditional rendering components
export {
  default as ConditionalRenderer,
  ConditionalField,
  ConditionalFieldGroup,
  Step5Conditional,
  Step7Conditional,
  Step8Conditional,
  Step12Conditional,
  Step13Conditional,
  MultiConditional,
  ValidationConditional,
  type ConditionalRendererProps,
  type ConditionalFieldProps,
  type ConditionalFieldGroupProps,
  type Step5ConditionalProps,
  type Step7ConditionalProps,
  type Step8ConditionalProps,
  type Step12ConditionalProps,
  type Step13ConditionalProps,
  type MultiConditionalProps,
  type ValidationConditionalProps
} from './ConditionalRenderer'

// Complex input helpers
export { default as TimeBandSchedulePicker } from './TimeBandSchedulePicker'
export { default as TimeRangePicker } from './TimeRangePicker' 