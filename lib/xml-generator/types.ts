/**
 * TypeScript types matching the complete SII XML structure
 * Based on "Trasmissione Offerte" version 4.5 specification
 */

// Base types for common patterns
export type AlphaNumeric = string // Alfanumerico - length validation handled by Zod schemas
export type Numeric = string // Numerico - stored as string for validation, length handled by Zod schemas
export type Decimal = number // Numerico with decimals - precision handled by Zod schemas
export type Timestamp = string // GG/MM/AAAA_HH:MM:SS format
export type MonthYear = string // MM/AAAA format

// Enum types for predefined values
export type MarketType = '01' | '02' | '03' // 01: Electricity, 02: Gas, 03: Dual Fuel
export type ClientType = '01' | '02' | '03' // 01: Domestic, 02: Other Uses, 03: Residential Condominium (Gas)
export type ResidentialStatus = '01' | '02' | '03' // 01: Domestic Resident, 02: Domestic Non-Resident, 03: All types
export type OfferType = '01' | '02' | '03' // 01: Fixed, 02: Variable, 03: FLAT
export type ContractActivationType = '01' | '02' | '03' | '04' | '99' // 01: Supplier Change, 02: First Activation, 03: Reactivation, 04: Contract Transfer, 99: Always
export type ActivationMethod = '01' | '02' | '03' | '04' | '05' | '99' // 01: Web-only, 02: Any channel, 03: Point of sale, 04: Teleselling, 05: Agency, 99: Other
export type PaymentMethod = '01' | '02' | '03' | '04' | '99' // 01: Bank direct debit, 02: Postal direct debit, 03: Credit card direct debit, 04: Pre-filled bulletin, 99: Other

// Energy price index types
export type EnergyPriceIndex =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07' // Quarterly: PUN, TTF, PSV, Psbil, PE, Cmem, Pfor
  | '08'
  | '09'
  | '10'
  | '11' // Bimonthly: PUN, TTF, PSV, Psbil
  | '12'
  | '13'
  | '14'
  | '15' // Monthly: PUN, TTF, PSV, Psbil
  | '99' // Other

// Regulated components
export type RegulatedComponentCode =
  | '01'
  | '02' // Electricity: PCV, PPE
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '09'
  | '10' // Gas: CCR, CPR, GRAD, QTint, QTpsv, QVD_fissa, QVD_Variabile

// Time band types
export type TimeBandType =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '91'
  | '92'
  | '93'
// 01: Monorario, 02: F1,F2, 03: F1,F2,F3, 04: F1,F2,F3,F4, 05: F1,F2,F3,F4,F5, 06: F1,F2,F3,F4,F5,F6
// 07: Peak/OffPeak, 91: Biorario (F1/F2+F3), 92: Biorario (F2/F1+F3), 93: Biorario (F3/F1+F2)

export type ComponentTimeBand =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '91'
  | '92'
  | '93'
// 01: Monorario/F1, 02: F2, 03: F3, 04: F4, 05: F5, 06: F6, 07: Peak, 08: OffPeak, 91: F2+F3, 92: F1+F3, 93: F1+F2

// Dispatching types
export type DispatchingType =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12'
  | '13'
  | '99'

// Company component types
export type ComponentType = '01' | '02' // 01: STANDARD, 02: OPTIONAL
export type MacroArea = '01' | '02' | '04' | '05' | '06' // 01: Fixed commercialization fee, 02: Energy commercialization fee, 04: Energy price component, 05: One-time fee, 06: Renewable energy/Green energy

// Unit of measure types
export type UnitOfMeasure = '01' | '02' | '03' | '04' | '05' | '06' // 01: €/Year, 02: €/kW, 03: €/kWh, 04: €/Sm3, 05: €, 06: Percentage

// Contractual condition types
export type ContractualConditionType = '01' | '02' | '03' | '04' | '05' | '99' // 01: Activation, 02: Deactivation, 03: Withdrawal, 04: Multi-year Offer, 05: Early Withdrawal Charges, 99: Other
export type LimitingCondition = '01' | '02' // 01: Yes, it is limiting, 02: No, it is not limiting

// Discount types
export type DiscountValidity = '01' | '02' | '03' // 01: Entry, 02: Within 12 months, 03: Beyond 12 months
export type VatApplicability = '01' | '02' // 01: Yes, 02: No
export type DiscountApplicationCondition = '00' | '01' | '02' | '03' | '99' // 00: Not conditioned, 01: Electronic billing, 02: Online management, 03: Electronic billing + bank direct debit, 99: Other
export type DiscountType = '01' | '02' | '03' | '04' // 01: Fixed discount, 02: Power discount, 03: Sales discount, 04: Discount on regulated price

// Component/band codes for discounts
export type ComponentBandCode =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '09'
  | '10' // Components: PCV to QVD_Variabile
  | '11'
  | '12'
  | '13'
  | '14'
  | '15'
  | '16' // Bands: F1 to F6
  | '17'
  | '18' // Peak, OffPeak
  | '91'
  | '92'
  | '93' // F2+F3, F1+F3, F1+F2

// Additional products macro areas
export type ProductMacroArea = '01' | '02' | '03' | '04' | '05' | '06' | '99' // 01: Boiler, 02: Mobility, 03: Solar thermal, 04: Photovoltaic, 05: Air conditioning, 06: Insurance policy, 99: Other

// Validity months
export type ValidityMonth =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12'

// Main XML structure types

export interface IdentificativiOfferta {
  PIVA_UTENTE: AlphaNumeric
  COD_OFFERTA: AlphaNumeric
}

export interface DettaglioOfferta {
  TIPO_MERCATO: MarketType
  OFFERTA_SINGOLA?: 'SI' | 'NO'
  TIPO_CLIENTE: ClientType
  DOMESTICO_RESIDENTE?: ResidentialStatus
  TIPO_OFFERTA: OfferType
  TIPOLOGIA_ATT_CONTR: ContractActivationType[]
  NOME_OFFERTA: AlphaNumeric
  DESCRIZIONE: AlphaNumeric
  DURATA: number // -1 for indeterminate, 1-99 for months
  GARANZIE: AlphaNumeric
}

export interface ModalitaAttivazione {
  MODALITA: ActivationMethod[]
  DESCRIZIONE?: AlphaNumeric // Mandatory when MODALITA includes "99"
}

export interface Contatti {
  TELEFONO: AlphaNumeric
  URL_SITO_VENDITORE?: AlphaNumeric
  URL_OFFERTA?: AlphaNumeric
}

export interface RiferimentiPrezzoEnergia {
  IDX_PREZZO_ENERGIA: EnergyPriceIndex
  ALTRO?: AlphaNumeric // Mandatory when IDX_PREZZO_ENERGIA = "99"
}

export interface ValiditaOfferta {
  DATA_INIZIO: Timestamp
  DATA_FINE: Timestamp
}

export interface CaratteristicheOfferta {
  CONSUMO_MIN?: number // Mandatory if TIPO_OFFERTA = "03" (FLAT)
  CONSUMO_MAX?: number // Mandatory if TIPO_OFFERTA = "03" (FLAT)
  POTENZA_MIN?: Decimal // Optional, for electricity offers
  POTENZA_MAX?: Decimal // Optional, for electricity offers
}

export interface OffertaDUAL {
  OFFERTE_CONGIUNTE_EE: AlphaNumeric[] // Mandatory if TIPO_MERCATO = "03"
  OFFERTE_CONGIUNTE_GAS: AlphaNumeric[] // Mandatory if TIPO_MERCATO = "03"
}

export interface MetodoPagamento {
  MODALITA_PAGAMENTO: PaymentMethod
  DESCRIZIONE?: AlphaNumeric // Mandatory when MODALITA_PAGAMENTO = "99"
}

export interface ComponentiRegolate {
  CODICE: RegulatedComponentCode[]
}

export interface TipoPrezzo {
  TIPOLOGIA_FASCE: TimeBandType
}

export interface FasceOrarieSettimanale {
  F_LUNEDI: AlphaNumeric
  F_MARTEDI: AlphaNumeric
  F_MERCOLEDI: AlphaNumeric
  F_GIOVEDI: AlphaNumeric
  F_VENERDI: AlphaNumeric
  F_SABATO: AlphaNumeric
  F_DOMENICA: AlphaNumeric
  F_FESTIVITA: AlphaNumeric
}

export interface Dispacciamento {
  TIPO_DISPACCIAMENTO: DispatchingType
  VALORE_DISP?: Decimal // Mandatory if TIPO_DISPACCIAMENTO = "99"
  NOME: AlphaNumeric
  DESCRIZIONE?: AlphaNumeric
}

export interface PeriodoValidita {
  DURATA?: number // Numerico(2)
  VALIDO_FINO?: MonthYear // MM/AAAA format
  MESE_VALIDITA?: ValidityMonth[]
}

export interface IntervalloPrezzi {
  FASCIA_COMPONENTE?: ComponentTimeBand
  CONSUMO_DA?: number // Numerico(9)
  CONSUMO_A?: number // Numerico(9)
  PREZZO: Decimal
  UNITA_MISURA: UnitOfMeasure
  PeriodoValidita?: PeriodoValidita
}

export interface ComponenteImpresa {
  NOME: AlphaNumeric
  DESCRIZIONE: AlphaNumeric
  TIPOLOGIA: ComponentType
  MACROAREA: MacroArea
  IntervalloPrezzi: IntervalloPrezzi[]
}

export interface CondizioniContrattuali {
  TIPOLOGIA_CONDIZIONE: ContractualConditionType
  ALTRO?: AlphaNumeric // Mandatory if TIPOLOGIA_CONDIZIONE = "99"
  DESCRIZIONE: AlphaNumeric
  LIMITANTE: LimitingCondition
}

export interface ZoneOfferta {
  REGIONE?: Numeric[]
  PROVINCIA?: Numeric[]
  COMUNE?: Numeric[]
}

export interface ScontoCondizione {
  CONDIZIONE_APPLICAZIONE: DiscountApplicationCondition
  DESCRIZIONE_CONDIZIONE?: AlphaNumeric // Mandatory if CONDIZIONE_APPLICAZIONE = "99"
}

export interface PREZZISconto {
  TIPOLOGIA: DiscountType
  VALIDO_DA?: number // Numerico(9)
  VALIDO_FINO?: number // Numerico(9)
  UNITA_MISURA: UnitOfMeasure
  PREZZO: Decimal
}

export interface Sconto {
  NOME: AlphaNumeric
  DESCRIZIONE: AlphaNumeric
  CODICE_COMPONENTE_FASCIA?: ComponentBandCode[]
  VALIDITA?: DiscountValidity // Mandatory if PeriodoValidita is not populated
  IVA_SCONTO: VatApplicability
  PeriodoValidita?: PeriodoValidita
  Condizione: ScontoCondizione
  PREZZISconto: PREZZISconto[]
}

export interface ProdottiServiziAggiuntivi {
  NOME: AlphaNumeric
  DETTAGLIO: AlphaNumeric
  MACROAREA?: ProductMacroArea
  DETTAGLI_MACROAREA?: AlphaNumeric // Mandatory if MACROAREA = "99"
}

// Root XML structure
export interface SIIOfferta {
  IdentificativiOfferta: IdentificativiOfferta
  DettaglioOfferta: DettaglioOfferta
  'DettaglioOfferta.ModalitaAttivazione': ModalitaAttivazione
  'DettaglioOfferta.Contatti': Contatti
  ValiditaOfferta: ValiditaOfferta
  MetodoPagamento: MetodoPagamento[]

  // Optional sections
  RiferimentiPrezzoEnergia?: RiferimentiPrezzoEnergia
  CaratteristicheOfferta?: CaratteristicheOfferta
  OffertaDUAL?: OffertaDUAL
  ComponentiRegolate?: ComponentiRegolate
  TipoPrezzo?: TipoPrezzo
  FasceOrarieSettimanale?: FasceOrarieSettimanale
  Dispacciamento?: Dispacciamento[]
  ComponenteImpresa?: ComponenteImpresa[]
  CondizioniContrattuali?: CondizioniContrattuali[]
  ZoneOfferta?: ZoneOfferta
  Sconto?: Sconto[]
  ProdottiServiziAggiuntivi?: ProdottiServiziAggiuntivi[]
}

// Form data structure for the multi-step form
export interface FormData {
  // Basic Information (Step 1)
  basicInfo: {
    pivaUtente: string
    codOfferta: string
  }

  // Offer Details (Step 2)
  offerDetails: {
    tipoMercato: MarketType
    offertaSingola?: 'SI' | 'NO'
    tipoCliente: ClientType
    domesticoResidente?: ResidentialStatus
    tipoOfferta: OfferType
    tipologiaAttContr: ContractActivationType[]
    nomeOfferta: string
    descrizione: string
    durata: number
    garanzie: string
  }

  // Activation & Contacts (Step 3)
  activationContacts: {
    modalita: ActivationMethod[]
    descrizioneModalita?: string
    telefono: string
    urlSitoVenditore?: string
    urlOfferta?: string
  }

  // Pricing Configuration (Step 4)
  pricingConfig: {
    riferimentiPrezzoEnergia?: {
      idxPrezzoEnergia: EnergyPriceIndex
      altro?: string
    }
    tipoPrezzo?: {
      tipologiaFasce: TimeBandType
    }
    fasceOrarieSettimanale?: FasceOrarieSettimanale
    dispacciamento?: Dispacciamento[]
  }

  // Company Components (Step 5)
  companyComponents: {
    componentiRegolate?: {
      codice: RegulatedComponentCode[]
    }
    componenteImpresa?: ComponenteImpresa[]
  }

  // Payment & Conditions (Step 6)
  paymentConditions: {
    metodoPagamento: MetodoPagamento[]
    condizioniContrattuali?: CondizioniContrattuali[]
  }

  // Additional Features (Step 7)
  additionalFeatures: {
    caratteristicheOfferta?: CaratteristicheOfferta
    offertaDUAL?: OffertaDUAL
    zoneOfferta?: ZoneOfferta
    sconto?: Sconto[]
    prodottiServiziAggiuntivi?: ProdottiServiziAggiuntivi[]
  }

  // Validity & Review (Step 8)
  validityReview: {
    validitaOfferta: ValiditaOfferta
  }
}

// Utility types for form validation and processing
export type RequiredFields<T> = {
  [K in keyof T]-?: T[K] extends undefined ? never : T[K]
}

export type OptionalFields<T> = {
  [K in keyof T]: T[K] extends undefined ? T[K] : never
}

// Helper types for conditional validation
export type ConditionallyRequired<T, Condition> = Condition extends true
  ? T
  : T | undefined

// Export all enum values for use in form components
export const MARKET_TYPES = {
  ELECTRICITY: '01' as const,
  GAS: '02' as const,
  DUAL_FUEL: '03' as const,
} as const

export const CLIENT_TYPES = {
  DOMESTIC: '01' as const,
  OTHER_USES: '02' as const,
  RESIDENTIAL_CONDOMINIUM: '03' as const,
} as const

export const OFFER_TYPES = {
  FIXED: '01' as const,
  VARIABLE: '02' as const,
  FLAT: '03' as const,
} as const

export const ACTIVATION_METHODS = {
  WEB_ONLY: '01' as const,
  ANY_CHANNEL: '02' as const,
  POINT_OF_SALE: '03' as const,
  TELESELLING: '04' as const,
  AGENCY: '05' as const,
  OTHER: '99' as const,
} as const

export const PAYMENT_METHODS = {
  BANK_DIRECT_DEBIT: '01' as const,
  POSTAL_DIRECT_DEBIT: '02' as const,
  CREDIT_CARD_DIRECT_DEBIT: '03' as const,
  PRE_FILLED_BULLETIN: '04' as const,
  OTHER: '99' as const,
} as const

// Type guards for runtime type checking
export function isMarketType(value: string): value is MarketType {
  return ['01', '02', '03'].includes(value)
}

export function isClientType(value: string): value is ClientType {
  return ['01', '02', '03'].includes(value)
}

export function isOfferType(value: string): value is OfferType {
  return ['01', '02', '03'].includes(value)
}

export function isActivationMethod(value: string): value is ActivationMethod {
  return ['01', '02', '03', '04', '05', '99'].includes(value)
}

export function isPaymentMethod(value: string): value is PaymentMethod {
  return ['01', '02', '03', '04', '99'].includes(value)
}
