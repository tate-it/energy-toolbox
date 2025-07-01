/**
 * Step 11: Price Type Schema (Tipologia Fasce)
 * Zod validation schema for SII XML Generator Step 11
 * 
 * Fields:
 * - TIPOLOGIA_FASCE: Time band type selection (mandatory, enum-based)
 * 
 * Validation Rules:
 * - Time band type must be from valid SII enumeration
 * - Business logic validation for band complexity and market appropriateness
 * - Italian error messages and labels
 */

import { z } from 'zod'
import {
  TIPOLOGIA_FASCE,
  TIPOLOGIA_FASCE_LABELS,
  isElettricita,
  isGas,
  isDualFuel,
  type TipoMercato
} from '../constants'

/**
 * Type for time band types
 */
export type TipologiaFasce = typeof TIPOLOGIA_FASCE[keyof typeof TIPOLOGIA_FASCE]

/**
 * Time band type validation schema
 * Must be one of the valid SII time band configurations
 */
export const TipologiaFasceSchema = z.enum(
  Object.values(TIPOLOGIA_FASCE) as [TipologiaFasce, ...TipologiaFasce[]],
  { errorMap: () => ({ message: 'Tipologia di fasce non valida' }) }
)

/**
 * Base Step 11 validation schema
 * Before conditional validation rules
 */
export const Step11BaseSchema = z.object({
  // Time band type
  tip_fasce: TipologiaFasceSchema,
})

/**
 * Step 11 validation schema with business logic
 * Applies business rules for time band appropriateness
 */
export const Step11Schema = Step11BaseSchema

/**
 * TypeScript type inference for Step 11 data
 */
export type Step11Data = z.infer<typeof Step11Schema>

/**
 * Default values for Step 11 form
 * Used by NuQS for URL state initialization
 */
export const Step11Defaults: Partial<Step11Data> = {
  tip_fasce: undefined,
}

/**
 * Step 11 field labels in Italian
 * For form components and validation messages
 */
export const Step11Labels = {
  tip_fasce: 'Tipologia Fasce Orarie',
} as const

/**
 * Step 11 field descriptions
 * Additional help text for form fields
 */
export const Step11Descriptions = {
  tip_fasce: 'Seleziona la tipologia di fasce orarie per la struttura dei prezzi dell\'offerta',
} as const

/**
 * Step 11 validation helper
 * Safe parse function with Italian error messages
 */
export function validateStep11(data: unknown): {
  success: true
  data: Step11Data
} | {
  success: false
  errors: Record<string, string>
} {
  const result = Step11Schema.safeParse(data)
  
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
 * Check if Step 11 is valid and complete
 * Used for step navigation validation
 */
export function isStep11Complete(data: Partial<Step11Data>): boolean {
  const result = Step11Schema.safeParse(data)
  return result.success
}

/**
 * Get validation errors for specific field
 * Used for real-time field validation with context
 */
export function getStep11FieldError(
  fieldName: keyof Step11Data,
  value: unknown,
  contextData?: Partial<Step11Data>
): string | null {
  const testData = { ...Step11Defaults, ...contextData, [fieldName]: value }
  const result = Step11Schema.safeParse(testData)
  
  if (result.success) {
    return null
  }
  
  // Find error for this specific field
  const fieldError = result.error.errors.find(err => err.path[0] === fieldName)
  return fieldError?.message || null
}

/**
 * Format Step 11 data for XML generation
 * Converts form data to XML field names
 */
export function formatStep11ForXML(data: Step11Data) {
  return {
    TIPOLOGIA_FASCE: data.tip_fasce,
  }
}

/**
 * Get time band type label in Italian
 * Helper for displaying time band names
 */
export function getTimeBandLabel(type: TipologiaFasce): string {
  return TIPOLOGIA_FASCE_LABELS[type] || type
}

/**
 * Get time band complexity level
 * Helper for understanding band structure complexity
 */
export function getTimeBandComplexity(type: TipologiaFasce): {
  level: 'simple' | 'intermediate' | 'complex'
  bandCount: number
  description: string
} {
  switch (type) {
    case '01': // MONORARIO
      return {
        level: 'simple',
        bandCount: 1,
        description: 'Tariffa unica per tutte le ore'
      }
    case '02': // F1_F2
      return {
        level: 'simple',
        bandCount: 2,
        description: 'Due fasce orarie standard'
      }
    case '03': // F1_F2_F3
      return {
        level: 'intermediate',
        bandCount: 3,
        description: 'Tre fasce orarie standard (più comune)'
      }
    case '04': // F1_F2_F3_F4
      return {
        level: 'intermediate',
        bandCount: 4,
        description: 'Quattro fasce orarie avanzate'
      }
    case '05': // F1_F2_F3_F4_F5
      return {
        level: 'complex',
        bandCount: 5,
        description: 'Cinque fasce orarie complesse'
      }
    case '06': // F1_F2_F3_F4_F5_F6
      return {
        level: 'complex',
        bandCount: 6,
        description: 'Sei fasce orarie molto complesse'
      }
    case '07': // PEAK_OFFPEAK
      return {
        level: 'simple',
        bandCount: 2,
        description: 'Fasce Peak/OffPeak semplificate'
      }
    case '91': // BIORARIO_F1_F2F3
      return {
        level: 'intermediate',
        bandCount: 2,
        description: 'Biorario F1 / F2+F3'
      }
    case '92': // BIORARIO_F2_F1F3
      return {
        level: 'intermediate',
        bandCount: 2,
        description: 'Biorario F2 / F1+F3'
      }
    case '93': // BIORARIO_F3_F1F2
      return {
        level: 'intermediate',
        bandCount: 2,
        description: 'Biorario F3 / F1+F2'
      }
    default:
      return {
        level: 'simple',
        bandCount: 1,
        description: 'Tipologia non riconosciuta'
      }
  }
}

/**
 * Get time band category
 * Helper for categorizing band types
 */
export function getTimeBandCategory(type: TipologiaFasce): {
  category: 'standard' | 'peak_offpeak' | 'bi_hourly'
  isRecommended: boolean
  usage: string
} {
  switch (type) {
    case '01': // MONORARIO
    case '02': // F1_F2
    case '03': // F1_F2_F3
    case '04': // F1_F2_F3_F4
    case '05': // F1_F2_F3_F4_F5
    case '06': // F1_F2_F3_F4_F5_F6
      return {
        category: 'standard',
        isRecommended: type === '03', // F1_F2_F3 is most common
        usage: 'Fasce orarie tradizionali italiane'
      }
    case '07': // PEAK_OFFPEAK
      return {
        category: 'peak_offpeak',
        isRecommended: false,
        usage: 'Sistema peak/off-peak internazionale'
      }
    case '91': // BIORARIO_F1_F2F3
    case '92': // BIORARIO_F2_F1F3
    case '93': // BIORARIO_F3_F1F2
      return {
        category: 'bi_hourly',
        isRecommended: type === '91', // F1 / F2+F3 most common
        usage: 'Fasce orarie biorarie combinate'
      }
    default:
      return {
        category: 'standard',
        isRecommended: false,
        usage: 'Categoria non riconosciuta'
      }
  }
}

/**
 * Get all available time band types grouped by category
 * Helper for organized form rendering
 */
export function getTimeBandTypesGrouped(): {
  standard: Array<{ value: TipologiaFasce; label: string; description: string; bandCount: number }>
  peakOffPeak: Array<{ value: TipologiaFasce; label: string; description: string; bandCount: number }>
  biHourly: Array<{ value: TipologiaFasce; label: string; description: string; bandCount: number }>
} {
  const standard: Array<{ value: TipologiaFasce; label: string; description: string; bandCount: number }> = []
  const peakOffPeak: Array<{ value: TipologiaFasce; label: string; description: string; bandCount: number }> = []
  const biHourly: Array<{ value: TipologiaFasce; label: string; description: string; bandCount: number }> = []
  
  Object.entries(TIPOLOGIA_FASCE).forEach(([, value]) => {
    const type = value as TipologiaFasce
    const category = getTimeBandCategory(type)
    const complexity = getTimeBandComplexity(type)
    
    const item = {
      value: type,
      label: getTimeBandLabel(type),
      description: complexity.description,
      bandCount: complexity.bandCount
    }
    
    switch (category.category) {
      case 'standard':
        standard.push(item)
        break
      case 'peak_offpeak':
        peakOffPeak.push(item)
        break
      case 'bi_hourly':
        biHourly.push(item)
        break
    }
  })
  
  // Sort by band count within each category
  standard.sort((a, b) => a.bandCount - b.bandCount)
  biHourly.sort((a, b) => a.value.localeCompare(b.value))
  
  return { standard, peakOffPeak, biHourly }
}

/**
 * Get recommended time band types
 * Helper for smart suggestions based on context
 */
export function getRecommendedTimeBandTypes(marketType?: TipoMercato): {
  primary: TipologiaFasce[]
  alternative: TipologiaFasce[]
  reasoning: string[]
} {
  const primary: TipologiaFasce[] = []
  const alternative: TipologiaFasce[] = []
  const reasoning: string[] = []
  
  // Most common recommendations
  primary.push('03') // F1_F2_F3 (standard 3 bands)
  primary.push('01') // MONORARIO (simple)
  primary.push('91') // BIORARIO_F1_F2F3 (common bi-hourly)
  
  alternative.push('02') // F1_F2 (2 bands)
  alternative.push('07') // PEAK_OFFPEAK
  alternative.push('04') // F1_F2_F3_F4 (4 bands)
  
  reasoning.push('F1_F2_F3 è la configurazione più comune in Italia')
  reasoning.push('Monorario è la più semplice per clienti domestici')
  reasoning.push('Biorario F1/F2+F3 offre buon compromesso semplicità/ottimizzazione')
  
  if (marketType) {
    if (isElettricita(marketType)) {
      reasoning.push('Per elettricità, le fasce F1-F3 sono standard ARERA')
    } else if (isGas(marketType)) {
      reasoning.push('Per gas, spesso si usa monorario o biorario semplificato')
      // Adjust recommendations for gas
      primary.unshift('01') // Prioritize monorario for gas
    } else if (isDualFuel(marketType)) {
      reasoning.push('Per dual fuel, raccomandato allineamento fasce elettricità e gas')
    }
  }
  
  return { primary, alternative, reasoning }
}

/**
 * Validate time band business rules
 * Business logic validation for time band appropriateness
 */
export function validateTimeBandBusinessRules(
  timeBandType: TipologiaFasce,
  marketType?: TipoMercato
): {
  isValid: boolean
  warnings: string[]
  suggestions: string[]
} {
  const warnings: string[] = []
  const suggestions: string[] = []
  
  const complexity = getTimeBandComplexity(timeBandType)
  const category = getTimeBandCategory(timeBandType)
  
  // Business logic validations
  if (complexity.level === 'complex') {
    warnings.push('Configurazione molto complessa - può confondere i clienti domestici')
    suggestions.push('Valuta se una configurazione più semplice soddisfa le esigenze')
  }
  
  if (complexity.bandCount > 4) {
    suggestions.push('Configurazioni con più di 4 fasce richiedono spiegazioni dettagliate')
  }
  
  if (timeBandType === '07') { // PEAK_OFFPEAK
    suggestions.push('Peak/OffPeak meno comune in Italia - verifica appropriatezza per il mercato')
  }
  
  if (marketType) {
    if (isGas(marketType) && complexity.bandCount > 3) {
      warnings.push('Per gas, configurazioni molto articolate sono meno comuni')
      suggestions.push('Per mercato gas, considera monorario o biorario')
    }
    
    if (isElettricita(marketType) && timeBandType === '01') {
      suggestions.push('Per elettricità, le fasce orarie possono offrire maggiore ottimizzazione')
    }
  }
  
  if (category.category === 'bi_hourly' && timeBandType !== '91') {
    suggestions.push('Biorario F1/F2+F3 è la configurazione bioraria più comune')
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  }
}

/**
 * Get time band statistics
 * Helper for analytics and insights
 */
export function getTimeBandStats(type: TipologiaFasce): {
  complexity: ReturnType<typeof getTimeBandComplexity>
  category: ReturnType<typeof getTimeBandCategory>
  label: string
  isRecommended: boolean
} {
  const complexity = getTimeBandComplexity(type)
  const category = getTimeBandCategory(type)
  
  return {
    complexity,
    category,
    label: getTimeBandLabel(type),
    isRecommended: category.isRecommended
  }
}

/**
 * Create Step 11 summary
 * Helper for displaying time band information
 */
export function createStep11Summary(data: Step11Data): {
  timeBandType: string
  timeBandLabel: string
  bandCount: number
  complexity: string
  category: string
  isComplete: boolean
} {
  const complexity = getTimeBandComplexity(data.tip_fasce)
  const category = getTimeBandCategory(data.tip_fasce)
  
  return {
    timeBandType: data.tip_fasce,
    timeBandLabel: getTimeBandLabel(data.tip_fasce),
    bandCount: complexity.bandCount,
    complexity: complexity.level,
    category: category.category,
    isComplete: isStep11Complete(data)
  }
}

/**
 * Get time band explanation
 * Helper for educational content
 */
export function getTimeBandExplanation(type: TipologiaFasce): {
  title: string
  description: string
  example: string
  benefits: string[]
  considerations: string[]
} {
  switch (type) {
    case '01': // MONORARIO
      return {
        title: 'Monorario',
        description: 'Tariffa unica valida per tutte le ore del giorno',
        example: 'Stesso prezzo 24 ore su 24, 7 giorni su 7',
        benefits: ['Massima semplicità', 'Fatturazione trasparente', 'Adatto per consumi costanti'],
        considerations: ['Nessuna ottimizzazione oraria', 'Potenziali sprechi per profili variabili']
      }
    case '03': // F1_F2_F3
      return {
        title: 'Tre Fasce Standard (F1, F2, F3)',
        description: 'Sistema a tre fasce orarie secondo standard ARERA',
        example: 'F1: lun-ven 8-19, F2: lun-ven 7-8 e 19-23 + sab 7-23, F3: notte e festivi',
        benefits: ['Standard italiano', 'Buon compromesso semplicità/ottimizzazione', 'Ampiamente riconosciuto'],
        considerations: ['Richiede comprensione fasce orarie', 'Ottimizzazione limitata ai 3 livelli']
      }
    case '91': // BIORARIO_F1_F2F3
      return {
        title: 'Biorario F1 / F2+F3',
        description: 'Due fasce che combinano F1 separata e F2+F3 unite',
        example: 'F1: ore di punta separate, F2+F3: tutte le altre ore al prezzo unificato',
        benefits: ['Semplicità del biorario', 'Ottimizzazione ore di punta', 'Facile comprensione'],
        considerations: ['F2 e F3 non differenziate', 'Meno granularità di controllo']
      }
    case '07': // PEAK_OFFPEAK
      return {
        title: 'Peak/OffPeak',
        description: 'Sistema internazionale con ore di punta e fuori punta',
        example: 'Peak: ore di maggior consumo, OffPeak: ore di minor consumo',
        benefits: ['Standard internazionale', 'Semplicità binaria', 'Ottimizzazione base'],
        considerations: ['Meno comune in Italia', 'Definizioni orarie diverse da standard ARERA']
      }
    default:
      const complexity = getTimeBandComplexity(type)
      return {
        title: getTimeBandLabel(type),
        description: complexity.description,
        example: `Configurazione a ${complexity.bandCount} fasce orarie`,
        benefits: ['Configurazione specializzata', 'Adatta per esigenze specifiche'],
        considerations: ['Maggiore complessità', 'Richiede spiegazione dettagliata ai clienti']
      }
  }
}

/**
 * Step 11 form validation state type
 * Used by form components for validation display
 */
export type Step11ValidationState = {
  [K in keyof Step11Data]: {
    value: Step11Data[K]
    error: string | null
    isValid: boolean
    isRequired: boolean
  }
}

/**
 * Create initial validation state
 * Used by form components initialization
 */
export function createStep11ValidationState(
  initialData: Partial<Step11Data> = {}
): Step11ValidationState {
  const data = { ...Step11Defaults, ...initialData }
  
  return {
    tip_fasce: {
      value: data.tip_fasce,
      error: null,
      isValid: !!data.tip_fasce,
      isRequired: true,
    },
  }
} 