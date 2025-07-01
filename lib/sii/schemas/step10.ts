/**
 * Step 10: Regulated Components Schema (Componenti Regolate)
 * Zod validation schema for SII XML Generator Step 10
 * 
 * Fields:
 * - CODICE: Regulated component code selection (mandatory, enum-based)
 * 
 * Validation Rules:
 * - Component code must be from valid SII enumeration
 * - Code must be appropriate for the market type (electricity vs gas)
 * - Business logic validation for component compatibility
 * - Italian error messages and labels
 */

import { z } from 'zod'
import {
  COMPONENTI_REGOLATE,
  COMPONENTI_REGOLATE_LABELS,
  COMPONENTI_REGOLATE_ELETTRICITA,
  COMPONENTI_REGOLATE_GAS,
  isElettricita,
  isGas,
  isDualFuel,
  type TipoMercato
} from '../constants'

/**
 * Type for regulated components
 */
export type ComponenteRegolato = typeof COMPONENTI_REGOLATE[keyof typeof COMPONENTI_REGOLATE]

/**
 * Regulated component code validation schema
 * Must be one of the valid SII component codes
 */
export const CodiceComponenteSchema = z.enum(
  Object.values(COMPONENTI_REGOLATE) as [ComponenteRegolato, ...ComponenteRegolato[]],
  { errorMap: () => ({ message: 'Codice componente regolata non valido' }) }
)

/**
 * Base Step 10 validation schema
 * Before conditional validation rules
 */
export const Step10BaseSchema = z.object({
  // Regulated component code
  cod: CodiceComponenteSchema,
})

/**
 * Step 10 validation schema with market type conditional logic
 * Applies business rules based on market type compatibility
 */
export const Step10Schema = Step10BaseSchema

/**
 * TypeScript type inference for Step 10 data
 */
export type Step10Data = z.infer<typeof Step10Schema>

/**
 * Default values for Step 10 form
 * Used by NuQS for URL state initialization
 */
export const Step10Defaults: Partial<Step10Data> = {
  cod: undefined,
}

/**
 * Step 10 field labels in Italian
 * For form components and validation messages
 */
export const Step10Labels = {
  cod: 'Codice Componente Regolata',
} as const

/**
 * Step 10 field descriptions
 * Additional help text for form fields
 */
export const Step10Descriptions = {
  cod: 'Seleziona il codice della componente regolata applicabile all\'offerta',
} as const

/**
 * Step 10 validation helper
 * Safe parse function with Italian error messages
 */
export function validateStep10(data: unknown): {
  success: true
  data: Step10Data
} | {
  success: false
  errors: Record<string, string>
} {
  const result = Step10Schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  // Transform Zod errors to field-specific error messages
  const errors: Record<string, string> = {}
  
  for (const error of result.error.errors) {
    const fieldName = error.path[0]
    if (fieldName && typeof fieldName === 'string') {
      errors[fieldName] = error.message
    }
  }
  
  return { success: false, errors }
}

/**
 * Check if Step 10 is valid and complete
 * Used for step navigation validation
 */
export function isStep10Complete(data: Partial<Step10Data>): boolean {
  const result = Step10Schema.safeParse(data)
  return result.success
}

/**
 * Get validation errors for specific field
 * Used for real-time field validation with context
 */
export function getStep10FieldError(
  fieldName: keyof Step10Data,
  value: any,
  contextData?: Partial<Step10Data>
): string | null {
  const testData = { ...Step10Defaults, ...contextData, [fieldName]: value }
  const result = Step10Schema.safeParse(testData)
  
  if (result.success) {
    return null
  }
  
  // Find error for this specific field
  const fieldError = result.error.errors.find(err => err.path[0] === fieldName)
  return fieldError?.message || null
}

/**
 * Format Step 10 data for XML generation
 * Converts form data to XML field names
 */
export function formatStep10ForXML(data: Step10Data) {
  return {
    CODICE: data.cod,
  }
}

/**
 * Get component label in Italian
 * Helper for displaying component names
 */
export function getComponentLabel(code: ComponenteRegolato): string {
  return COMPONENTI_REGOLATE_LABELS[code] || code
}

/**
 * Check if component is for electricity market
 * Helper for market type validation
 */
export function isElectricityComponent(code: ComponenteRegolato): boolean {
  return Object.values(COMPONENTI_REGOLATE_ELETTRICITA).includes(code as any)
}

/**
 * Check if component is for gas market
 * Helper for market type validation
 */
export function isGasComponent(code: ComponenteRegolato): boolean {
  return Object.values(COMPONENTI_REGOLATE_GAS).includes(code as any)
}

/**
 * Get all available components for market type
 * Helper for form option rendering based on market
 */
export function getAvailableComponentsForMarket(marketType?: TipoMercato): Array<{
  value: ComponenteRegolato
  label: string
  description: string
  category: 'electricity' | 'gas'
}> {
  const allComponents = Object.entries(COMPONENTI_REGOLATE).map(([key, value]) => ({
    value: value as ComponenteRegolato,
    label: COMPONENTI_REGOLATE_LABELS[value as ComponenteRegolato],
    description: getComponentDescription(value as ComponenteRegolato),
    category: isElectricityComponent(value as ComponenteRegolato) ? 'electricity' as const : 'gas' as const
  }))
  
  // Filter by market type if specified
  if (!marketType) {
    return allComponents
  }
  
  if (isElettricita(marketType)) {
    return allComponents.filter(comp => comp.category === 'electricity')
  }
  
  if (isGas(marketType)) {
    return allComponents.filter(comp => comp.category === 'gas')
  }
  
  if (isDualFuel(marketType)) {
    return allComponents // Dual fuel can use both
  }
  
  return allComponents
}

/**
 * Get component description
 * Helper for providing additional context
 */
export function getComponentDescription(code: ComponenteRegolato): string {
  switch (code) {
    case '01': // PCV
      return 'Prezzo Commercializzazione Vendita - componente per elettricità'
    case '02': // PPE
      return 'Prezzo Energia Elettrica - componente per elettricità'
    case '03': // CCR
      return 'Corrispettivo Commercializzazione al Dettaglio - componente per gas'
    case '04': // CPR
      return 'Corrispettivo Commercializzazione Unitario - componente per gas'
    case '05': // GRAD
      return 'Gradualità - componente per gas'
    case '06': // QT_INT
      return 'Quote Tariffarie Integrative - componente per gas'
    case '07': // QT_PSV
      return 'Quote Tariffarie PSV - componente per gas'
    case '09': // QVD_FISSA
      return 'Quota Variabile Distribuzione Fissa - componente per gas'
    case '10': // QVD_VARIABILE
      return 'Quota Variabile Distribuzione Variabile - componente per gas'
    default:
      return 'Componente regolata'
  }
}

/**
 * Get component category details
 * Helper for displaying component information
 */
export function getComponentCategory(code: ComponenteRegolato): {
  market: 'electricity' | 'gas'
  type: 'commercialization' | 'energy' | 'distribution' | 'tariff'
  description: string
} {
  if (isElectricityComponent(code)) {
    switch (code) {
      case '01': // PCV
        return {
          market: 'electricity',
          type: 'commercialization',
          description: 'Commercializzazione vendita elettricità'
        }
      case '02': // PPE
        return {
          market: 'electricity',
          type: 'energy',
          description: 'Prezzo energia elettrica'
        }
      default:
        return {
          market: 'electricity',
          type: 'energy',
          description: 'Componente elettricità'
        }
    }
  } else {
    switch (code) {
      case '03': // CCR
      case '04': // CPR
        return {
          market: 'gas',
          type: 'commercialization',
          description: 'Commercializzazione gas'
        }
      case '05': // GRAD
        return {
          market: 'gas',
          type: 'tariff',
          description: 'Gradualità tariffaria'
        }
      case '06': // QT_INT
      case '07': // QT_PSV
        return {
          market: 'gas',
          type: 'tariff',
          description: 'Quote tariffarie'
        }
      case '09': // QVD_FISSA
      case '10': // QVD_VARIABILE
        return {
          market: 'gas',
          type: 'distribution',
          description: 'Distribuzione gas'
        }
      default:
        return {
          market: 'gas',
          type: 'commercialization',
          description: 'Componente gas'
        }
    }
  }
}

/**
 * Validate component market compatibility
 * Business logic validation for market type appropriateness
 */
export function validateComponentMarketCompatibility(
  componentCode: ComponenteRegolato,
  marketType?: TipoMercato
): {
  isValid: boolean
  warnings: string[]
  suggestions: string[]
} {
  const warnings: string[] = []
  const suggestions: string[] = []
  
  if (!marketType) {
    return { isValid: true, warnings, suggestions }
  }
  
  const isElectricity = isElectricityComponent(componentCode)
  const isGasComp = isGasComponent(componentCode)
  
  // Validate market compatibility
  if (isElettricita(marketType) && isGasComp) {
    warnings.push('Componente gas selezionata per mercato elettricità')
    suggestions.push('Seleziona una componente elettricità (PCV o PPE)')
  }
  
  if (isGas(marketType) && isElectricity) {
    warnings.push('Componente elettricità selezionata per mercato gas')
    suggestions.push('Seleziona una componente gas (CCR, CPR, GRAD, QTint, QTpsv, QVD)')
  }
  
  // Dual fuel market can use both
  if (isDualFuel(marketType)) {
    if (!isElectricity && !isGasComp) {
      warnings.push('Componente non riconosciuta per mercato dual fuel')
    }
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  }
}

/**
 * Get component statistics
 * Helper for analytics and insights
 */
export function getComponentStats(code: ComponenteRegolato): {
  category: ReturnType<typeof getComponentCategory>
  isElectricity: boolean
  isGas: boolean
  label: string
  description: string
} {
  return {
    category: getComponentCategory(code),
    isElectricity: isElectricityComponent(code),
    isGas: isGasComponent(code),
    label: getComponentLabel(code),
    description: getComponentDescription(code)
  }
}

/**
 * Create Step 10 summary
 * Helper for displaying component information
 */
export function createStep10Summary(data: Step10Data): {
  componentCode: string
  componentLabel: string
  marketType: 'electricity' | 'gas'
  category: string
  isComplete: boolean
} {
  const category = getComponentCategory(data.cod)
  
  return {
    componentCode: data.cod,
    componentLabel: getComponentLabel(data.cod),
    marketType: category.market,
    category: category.type,
    isComplete: isStep10Complete(data)
  }
}

/**
 * Get components grouped by market
 * Helper for organized form rendering
 */
export function getComponentsGroupedByMarket(): {
  electricity: Array<{ value: ComponenteRegolato; label: string; description: string }>
  gas: Array<{ value: ComponenteRegolato; label: string; description: string }>
} {
  const electricity: Array<{ value: ComponenteRegolato; label: string; description: string }> = []
  const gas: Array<{ value: ComponenteRegolato; label: string; description: string }> = []
  
  Object.entries(COMPONENTI_REGOLATE).forEach(([key, value]) => {
    const code = value as ComponenteRegolato
    const item = {
      value: code,
      label: getComponentLabel(code),
      description: getComponentDescription(code)
    }
    
    if (isElectricityComponent(code)) {
      electricity.push(item)
    } else {
      gas.push(item)
    }
  })
  
  return { electricity, gas }
}

/**
 * Step 10 form validation state type
 * Used by form components for validation display
 */
export type Step10ValidationState = {
  [K in keyof Step10Data]: {
    value: Step10Data[K]
    error: string | null
    isValid: boolean
    isRequired: boolean
  }
}

/**
 * Create initial validation state
 * Used by form components initialization
 */
export function createStep10ValidationState(
  initialData: Partial<Step10Data> = {}
): Step10ValidationState {
  const data = { ...Step10Defaults, ...initialData }
  
  return {
    cod: {
      value: data.cod,
      error: null,
      isValid: !!data.cod,
      isRequired: true,
    },
  }
}

/**
 * Get recommended components for market type
 * Helper for smart suggestions
 */
export function getRecommendedComponents(marketType?: TipoMercato): ComponenteRegolato[] {
  if (!marketType) {
    return []
  }
  
  if (isElettricita(marketType)) {
    return ['01', '02'] // PCV, PPE
  }
  
  if (isGas(marketType)) {
    return ['03', '04', '05'] // CCR, CPR, GRAD (most common)
  }
  
  if (isDualFuel(marketType)) {
    return ['01', '03'] // Most common for dual fuel
  }
  
  return []
} 