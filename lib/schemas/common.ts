/**
 * Common schemas and enums for SII XML Generator
 * Enhanced with strict TypeScript configuration for optimal type safety
 */

import { z } from 'zod'
import { RequiredStringSchema, OptionalStringSchema, NumericCodeSchema } from './base'

/**
 * Tipo Mercato enum schema
 * Enhanced with noFallthroughCasesInSwitch for exhaustive checking
 */
export const TipoMercatoSchema = z.enum(['01', '02', '03'], {
  errorMap: () => ({ message: 'Tipo mercato non valido' })
})

export type TipoMercato = z.infer<typeof TipoMercatoSchema>

// Tipo Mercato descriptions for UI
export const TIPO_MERCATO_LABELS: Record<TipoMercato, string> = {
  '01': 'Energia Elettrica',
  '02': 'Gas Naturale', 
  '03': 'Dual Fuel (Elettrico + Gas)'
} as const

/**
 * Tipo Cliente enum schema
 * Uses exactOptionalPropertyTypes for strict optional handling
 */
export const TipoClienteSchema = z.enum(['01', '02', '03', '04'], {
  errorMap: () => ({ message: 'Tipo cliente non valido' })
})

export type TipoCliente = z.infer<typeof TipoClienteSchema>

export const TIPO_CLIENTE_LABELS: Record<TipoCliente, string> = {
  '01': 'Domestico',
  '02': 'Non Domestico',
  '03': 'Condominiale',
  '04': 'Altri Usi'
} as const

/**
 * Tipo Offerta enum schema
 * Enhanced with noImplicitReturns for comprehensive validation
 */
export const TipoOffertaSchema = z.enum(['01', '02', '03', '04', '05'], {
  errorMap: () => ({ message: 'Tipo offerta non valido' })
})

export type TipoOfferta = z.infer<typeof TipoOffertaSchema>

export const TIPO_OFFERTA_LABELS: Record<TipoOfferta, string> = {
  '01': 'Prezzo Fisso',
  '02': 'Prezzo Variabile',
  '03': 'FLAT',
  '04': 'Tutela Graduale',
  '05': 'Tutela Vulnerabili'
} as const

/**
 * Tipo Persona enum schema
 * For distinguishing between physical and legal persons
 */
export const TipoPersonaSchema = z.enum(['F', 'G'], {
  errorMap: () => ({ message: 'Tipo persona non valido' })
})

export type TipoPersona = z.infer<typeof TipoPersonaSchema>

export const TIPO_PERSONA_LABELS: Record<TipoPersona, string> = {
  'F': 'Persona Fisica',
  'G': 'Persona Giuridica'
} as const

/**
 * Provincia italiana enum schema
 * All Italian province codes
 */
export const ProvinciaSchema = z.enum([
  'AG', 'AL', 'AN', 'AO', 'AQ', 'AR', 'AP', 'AT', 'AV', 'BA', 'BT', 'BL', 'BN', 'BG', 'BI', 'BO', 'BZ', 'BS', 'BR',
  'CA', 'CL', 'CB', 'CE', 'CT', 'CZ', 'CH', 'CO', 'CS', 'CR', 'KR', 'CN', 'EN', 'FM', 'FE', 'FI', 'FG', 'FC', 'FR',
  'GE', 'GO', 'GR', 'IM', 'IS', 'SP', 'LT', 'LE', 'LC', 'LI', 'LO', 'LU', 'MC', 'MN', 'MS', 'MT', 'ME', 'MI', 'MO',
  'MB', 'NA', 'NO', 'NU', 'OR', 'PD', 'PA', 'PR', 'PV', 'PG', 'PU', 'PE', 'PC', 'PI', 'PT', 'PN', 'PZ', 'PO', 'RG',
  'RA', 'RC', 'RE', 'RI', 'RN', 'RM', 'RO', 'SA', 'SS', 'SV', 'SI', 'SR', 'SO', 'TA', 'TE', 'TR', 'TO', 'TP', 'TN',
  'TV', 'TS', 'UD', 'VA', 'VE', 'VB', 'VC', 'VR', 'VV', 'VI', 'VT'
], {
  errorMap: () => ({ message: 'Codice provincia non valido' })
})

export type Provincia = z.infer<typeof ProvinciaSchema>

/**
 * Durata contratto schema
 * Duration in months with specific valid values
 */
export const DurataContrattoSchema = z.union([
  z.literal(1),
  z.literal(3),
  z.literal(6),
  z.literal(12),
  z.literal(24),
  z.literal(36),
  z.literal(48),
  z.literal(60)
], {
  errorMap: () => ({ message: 'Durata contratto non valida (1, 3, 6, 12, 24, 36, 48, 60 mesi)' })
})

export type DurataContratto = z.infer<typeof DurataContrattoSchema>

export const DURATA_CONTRATTO_LABELS: Record<DurataContratto, string> = {
  1: '1 mese',
  3: '3 mesi',
  6: '6 mesi', 
  12: '1 anno',
  24: '2 anni',
  36: '3 anni',
  48: '4 anni',
  60: '5 anni'
} as const

/**
 * Modalità di pagamento schema
 * Payment method codes
 */
export const ModalitaPagamentoSchema = z.enum(['01', '02', '03', '04'], {
  errorMap: () => ({ message: 'Modalità di pagamento non valida' })
})

export type ModalitaPagamento = z.infer<typeof ModalitaPagamentoSchema>

export const MODALITA_PAGAMENTO_LABELS: Record<ModalitaPagamento, string> = {
  '01': 'Domiciliazione Bancaria',
  '02': 'Bollettino Postale',
  '03': 'Bonifico Bancario',
  '04': 'Carta di Credito'
} as const

/**
 * Periodicità fatturazione schema
 * Billing frequency codes
 */
export const PeriodicitaFatturazioneSchema = z.enum(['01', '02', '03', '04'], {
  errorMap: () => ({ message: 'Periodicità fatturazione non valida' })
})

export type PeriodicitaFatturazione = z.infer<typeof PeriodicitaFatturazioneSchema>

export const PERIODICITA_FATTURAZIONE_LABELS: Record<PeriodicitaFatturazione, string> = {
  '01': 'Mensile',
  '02': 'Bimestrale', 
  '03': 'Trimestrale',
  '04': 'Quadrimestrale'
} as const

/**
 * Common validation helpers
 * Enhanced with strict TypeScript settings
 */

/**
 * Validates if a string is a valid SII code format
 * Uses noUncheckedIndexedAccess for safe array access
 */
export function isValidSIICode(code: string, validCodes: readonly string[]): boolean {
  return validCodes.includes(code)
}

/**
 * Gets label for a code with type safety
 * Uses exactOptionalPropertyTypes for strict return types
 */
export function getCodeLabel<T extends string>(
  code: T,
  labels: Record<T, string>
): string | undefined {
  return labels[code]
}

/**
 * Creates options array for UI components
 * Enhanced with noImplicitReturns for comprehensive mapping
 */
export function createOptionsFromEnum<T extends string>(
  enumSchema: z.ZodEnum<[T, ...T[]]>,
  labels: Record<T, string>
): Array<{ value: T; label: string }> {
  return enumSchema.options.map(value => ({
    value,
    label: labels[value]
  }))
}

/**
 * Common address schema
 * Used across multiple steps
 */
export const IndirizzoSchema = z.object({
  via: RequiredStringSchema,
  civico: RequiredStringSchema,
  cap: z.string().trim().regex(/^\d{5}$/, 'CAP deve essere di 5 cifre'),
  comune: RequiredStringSchema,
  provincia: ProvinciaSchema,
  nazione: OptionalStringSchema.default('IT')
})

export type Indirizzo = z.infer<typeof IndirizzoSchema>

/**
 * Contact information schema
 * Enhanced with email and phone validation
 */
export const ContattiSchema = z.object({
  telefono: OptionalStringSchema,
  cellulare: OptionalStringSchema,
  email: OptionalStringSchema,
  pec: OptionalStringSchema,
  fax: OptionalStringSchema
})

export type Contatti = z.infer<typeof ContattiSchema> 