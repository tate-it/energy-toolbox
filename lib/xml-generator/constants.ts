/**
 * Constants for SII XML Generator
 * Based on "Trasmissione Offerte" version 4.5 dated December 6, 2023
 *
 * All codes and options required for energy and gas market offers in Italy
 */

// Action types for file naming
export const ACTION_TYPES = {
  INSERIMENTO: 'INSERIMENTO',
  AGGIORNAMENTO: 'AGGIORNAMENTO',
} as const

export type ActionType = (typeof ACTION_TYPES)[keyof typeof ACTION_TYPES]

// Market types (TIPO_MERCATO)
export const MARKET_TYPES = {
  ELECTRICITY: '01',
  GAS: '02',
  DUAL_FUEL: '03',
} as const

export const MARKET_TYPE_LABELS: Record<string, string> = {
  '01': 'Electricity',
  '02': 'Gas',
  '03': 'Dual Fuel',
} as const

export type MarketType = (typeof MARKET_TYPES)[keyof typeof MARKET_TYPES]

// Single offer options (OFFERTA_SINGOLA)
export const SINGLE_OFFER_OPTIONS = {
  YES: 'SI',
  NO: 'NO',
} as const

export const SINGLE_OFFER_LABELS: Record<string, string> = {
  SI: 'Yes - can be subscribed individually',
  NO: 'No - only with another commodity',
} as const

export type SingleOfferOption =
  (typeof SINGLE_OFFER_OPTIONS)[keyof typeof SINGLE_OFFER_OPTIONS]

// Client types (TIPO_CLIENTE)
export const CLIENT_TYPES = {
  DOMESTIC: '01',
  OTHER_USES: '02',
  RESIDENTIAL_CONDOMINIUM: '03',
} as const

export const CLIENT_TYPE_LABELS: Record<string, string> = {
  '01': 'Domestic',
  '02': 'Other Uses',
  '03': 'Residential Condominium (Gas)',
} as const

export type ClientType = (typeof CLIENT_TYPES)[keyof typeof CLIENT_TYPES]

// Residential status (DOMESTICO_RESIDENTE)
export const RESIDENTIAL_STATUS = {
  DOMESTIC_RESIDENT: '01',
  DOMESTIC_NON_RESIDENT: '02',
  ALL_TYPES: '03',
} as const

export const RESIDENTIAL_STATUS_LABELS: Record<string, string> = {
  '01': 'Domestic Resident',
  '02': 'Domestic Non-Resident',
  '03': 'All types',
} as const

export type ResidentialStatus =
  (typeof RESIDENTIAL_STATUS)[keyof typeof RESIDENTIAL_STATUS]

// Offer types (TIPO_OFFERTA)
export const OFFER_TYPES = {
  FIXED: '01',
  VARIABLE: '02',
  FLAT: '03',
} as const

export const OFFER_TYPE_LABELS: Record<string, string> = {
  '01': 'Fixed',
  '02': 'Variable',
  '03': 'FLAT',
} as const

export type OfferType = (typeof OFFER_TYPES)[keyof typeof OFFER_TYPES]

// Contract activation types (TIPOLOGIA_ATT_CONTR)
export const CONTRACT_ACTIVATION_TYPES = {
  SUPPLIER_CHANGE: '01',
  FIRST_ACTIVATION: '02',
  REACTIVATION: '03',
  CONTRACT_TRANSFER: '04',
  ALWAYS: '99',
} as const

export const CONTRACT_ACTIVATION_LABELS: Record<string, string> = {
  '01': 'Supplier Change',
  '02': 'First Activation (Meter not present)',
  '03': 'Reactivation (Meter present but deactivated)',
  '04': 'Contract Transfer',
  '99': 'Always',
} as const

export type ContractActivationType =
  (typeof CONTRACT_ACTIVATION_TYPES)[keyof typeof CONTRACT_ACTIVATION_TYPES]

// Activation methods (MODALITA)
export const ACTIVATION_METHODS = {
  WEB_ONLY: '01',
  ANY_CHANNEL: '02',
  POINT_OF_SALE: '03',
  TELESELLING: '04',
  AGENCY: '05',
  OTHER: '99',
} as const

export const ACTIVATION_METHOD_LABELS: Record<string, string> = {
  '01': 'Web-only activation',
  '02': 'Any channel activation',
  '03': 'Point of sale',
  '04': 'Teleselling',
  '05': 'Agency',
  '99': 'Other',
} as const

export type ActivationMethod =
  (typeof ACTIVATION_METHODS)[keyof typeof ACTIVATION_METHODS]

// Energy price indices (IDX_PREZZO_ENERGIA)
export const ENERGY_PRICE_INDICES = {
  // Quarterly
  PUN_QUARTERLY: '01',
  TTF_QUARTERLY: '02',
  PSV_QUARTERLY: '03',
  PSBIL_QUARTERLY: '04',
  PE_QUARTERLY: '05',
  CMEM_QUARTERLY: '06',
  PFOR_QUARTERLY: '07',
  // Bimonthly
  PUN_BIMONTHLY: '08',
  TTF_BIMONTHLY: '09',
  PSV_BIMONTHLY: '10',
  PSBIL_BIMONTHLY: '11',
  // Monthly
  PUN_MONTHLY: '12',
  TTF_MONTHLY: '13',
  PSV_MONTHLY: '14',
  PSBIL_MONTHLY: '15',
  // Other
  OTHER: '99',
} as const

export const ENERGY_PRICE_INDEX_LABELS: Record<string, string> = {
  // Quarterly
  '01': 'PUN (Quarterly)',
  '02': 'TTF (Quarterly)',
  '03': 'PSV (Quarterly)',
  '04': 'Psbil (Quarterly)',
  '05': 'PE (Quarterly)',
  '06': 'Cmem (Quarterly)',
  '07': 'Pfor (Quarterly)',
  // Bimonthly
  '08': 'PUN (Bimonthly)',
  '09': 'TTF (Bimonthly)',
  '10': 'PSV (Bimonthly)',
  '11': 'Psbil (Bimonthly)',
  // Monthly
  '12': 'PUN (Monthly)',
  '13': 'TTF (Monthly)',
  '14': 'PSV (Monthly)',
  '15': 'Psbil (Monthly)',
  // Other
  '99': 'Other (Not managed by Portal)',
} as const

export type EnergyPriceIndex =
  (typeof ENERGY_PRICE_INDICES)[keyof typeof ENERGY_PRICE_INDICES]

// Payment methods (MODALITA_PAGAMENTO)
export const PAYMENT_METHODS = {
  BANK_DIRECT_DEBIT: '01',
  POSTAL_DIRECT_DEBIT: '02',
  CREDIT_CARD_DIRECT_DEBIT: '03',
  PRE_FILLED_BULLETIN: '04',
  OTHER: '99',
} as const

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  '01': 'Bank direct debit',
  '02': 'Postal direct debit',
  '03': 'Credit card direct debit',
  '04': 'Pre-filled bulletin',
  '99': 'Other',
} as const

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS]

// Regulated components (CODICE)
export const REGULATED_COMPONENTS = {
  // Electricity components
  PCV: '01',
  PPE: '02',
  // Gas components
  CCR: '03',
  CPR: '04',
  GRAD: '05',
  QTINT: '06',
  QTPSV: '07',
  QVD_FISSA: '09',
  QVD_VARIABILE: '10',
} as const

export const REGULATED_COMPONENT_LABELS: Record<string, string> = {
  '01': 'PCV',
  '02': 'PPE',
  '03': 'CCR',
  '04': 'CPR',
  '05': 'GRAD',
  '06': 'QTint',
  '07': 'QTpsv',
  '09': 'QVD_fissa',
  '10': 'QVD_Variabile',
} as const

export type RegulatedComponent =
  (typeof REGULATED_COMPONENTS)[keyof typeof REGULATED_COMPONENTS]

// Time band configurations (TIPOLOGIA_FASCE)
export const TIME_BAND_CONFIGURATIONS = {
  MONORARIO: '01',
  F1_F2: '02',
  F1_F2_F3: '03',
  F1_F2_F3_F4: '04',
  F1_F2_F3_F4_F5: '05',
  F1_F2_F3_F4_F5_F6: '06',
  PEAK_OFFPEAK: '07',
  BIORARIO_F1_F23: '91',
  BIORARIO_F2_F13: '92',
  BIORARIO_F3_F12: '93',
} as const

export const TIME_BAND_CONFIGURATION_LABELS: Record<string, string> = {
  '01': 'Monorario',
  '02': 'F1, F2',
  '03': 'F1, F2, F3 (Standard)',
  '04': 'F1, F2, F3, F4',
  '05': 'F1, F2, F3, F4, F5',
  '06': 'F1, F2, F3, F4, F5, F6',
  '07': 'Peak/OffPeak (Standard)',
  '91': 'Biorario (F1 / F2+F3)',
  '92': 'Biorario (F2 / F1+F3)',
  '93': 'Biorario (F3 / F1+F2)',
} as const

export type TimeBandConfiguration =
  (typeof TIME_BAND_CONFIGURATIONS)[keyof typeof TIME_BAND_CONFIGURATIONS]

// Dispatching types (TIPO_DISPACCIAMENTO)
export const DISPATCHING_TYPES = {
  DISP_DEL_111_06: '01',
  PD: '02',
  MSD: '03',
  MODULAZIONE_EOLICO: '04',
  UNITA_ESSENZIALI: '05',
  FUNZ_TERNA: '06',
  CAPACITA_PRODUTTIVA: '07',
  INTERROMPIBILITA: '08',
  CORR_CAPACITA_MERCATO_STG: '09',
  CORR_CAPACITA_MERCATO_MT: '10',
  REINTEGRAZIONE_ONERI_SALVAGUARDIA: '11',
  REINTEGRAZIONE_ONERI_TUTELE_GRADUALI: '12',
  DISP_BT: '13',
  OTHER: '99',
} as const

export const DISPATCHING_TYPE_LABELS: Record<string, string> = {
  '01': 'Disp. del.111/06',
  '02': 'PD',
  '03': 'MSD',
  '04': 'Modulazione Eolico',
  '05': 'Unità essenziali',
  '06': 'Funz. Terna',
  '07': 'Capacità Produttiva',
  '08': 'Interrompibilità',
  '09': 'Corrispettivo Capacità di Mercato STG',
  '10': 'Corrispettivo capacità di mercato MT',
  '11': 'Reintegrazione oneri salvaguardia',
  '12': 'Reintegrazione oneri tutele graduali',
  '13': 'DispBT',
  '99': 'Altro',
} as const

export type DispatchingType =
  (typeof DISPATCHING_TYPES)[keyof typeof DISPATCHING_TYPES]

// Component types (TIPOLOGIA)
export const COMPONENT_TYPES = {
  STANDARD: '01',
  OPTIONAL: '02',
} as const

export const COMPONENT_TYPE_LABELS: Record<string, string> = {
  '01': 'STANDARD - Price included',
  '02': 'OPTIONAL - Price not included',
} as const

export type ComponentType =
  (typeof COMPONENT_TYPES)[keyof typeof COMPONENT_TYPES]

// Macro areas (MACROAREA)
export const MACRO_AREAS = {
  FIXED_COMMERCIALIZATION_FEE: '01',
  ENERGY_COMMERCIALIZATION_FEE: '02',
  ENERGY_PRICE_COMPONENT: '04',
  ONE_TIME_FEE: '05',
  RENEWABLE_GREEN_ENERGY: '06',
} as const

export const MACRO_AREA_LABELS: Record<string, string> = {
  '01': 'Fixed commercialization fee',
  '02': 'Energy commercialization fee',
  '04': 'Energy price component',
  '05': 'One-time fee',
  '06': 'Renewable energy / Green energy',
} as const

export type MacroArea = (typeof MACRO_AREAS)[keyof typeof MACRO_AREAS]

// Time bands for components (FASCIA_COMPONENTE)
export const COMPONENT_TIME_BANDS = {
  MONORARIO_F1: '01',
  F2: '02',
  F3: '03',
  F4: '04',
  F5: '05',
  F6: '06',
  PEAK: '07',
  OFFPEAK: '08',
  F2_F3: '91',
  F1_F3: '92',
  F1_F2: '93',
} as const

export const COMPONENT_TIME_BAND_LABELS: Record<string, string> = {
  '01': 'Monorario/F1',
  '02': 'F2',
  '03': 'F3',
  '04': 'F4',
  '05': 'F5',
  '06': 'F6',
  '07': 'Peak',
  '08': 'OffPeak',
  '91': 'F2+F3',
  '92': 'F1+F3',
  '93': 'F1+F2',
} as const

export type ComponentTimeBand =
  (typeof COMPONENT_TIME_BANDS)[keyof typeof COMPONENT_TIME_BANDS]

// Units of measure (UNITA_MISURA)
export const UNITS_OF_MEASURE = {
  EURO_YEAR: '01',
  EURO_KW: '02',
  EURO_KWH: '03',
  EURO_SM3: '04',
  EURO: '05',
  PERCENTAGE: '06',
} as const

export const UNIT_OF_MEASURE_LABELS: Record<string, string> = {
  '01': '€/Year',
  '02': '€/kW',
  '03': '€/kWh',
  '04': '€/Sm³',
  '05': '€',
  '06': 'Percentage (%)',
} as const

export type UnitOfMeasure =
  (typeof UNITS_OF_MEASURE)[keyof typeof UNITS_OF_MEASURE]

// Contractual condition types (TIPOLOGIA_CONDIZIONE)
export const CONTRACTUAL_CONDITION_TYPES = {
  ACTIVATION: '01',
  DEACTIVATION: '02',
  WITHDRAWAL: '03',
  MULTI_YEAR_OFFER: '04',
  EARLY_WITHDRAWAL_CHARGES: '05',
  OTHER: '99',
} as const

export const CONTRACTUAL_CONDITION_LABELS: Record<string, string> = {
  '01': 'Activation',
  '02': 'Deactivation',
  '03': 'Withdrawal',
  '04': 'Multi-year Offer',
  '05': 'Early Withdrawal Charges',
  '99': 'Other',
} as const

export type ContractualConditionType =
  (typeof CONTRACTUAL_CONDITION_TYPES)[keyof typeof CONTRACTUAL_CONDITION_TYPES]

// Limiting condition flags (LIMITANTE)
export const LIMITING_CONDITIONS = {
  YES: '01',
  NO: '02',
} as const

export const LIMITING_CONDITION_LABELS: Record<string, string> = {
  '01': 'Yes, it is limiting',
  '02': 'No, it is not limiting',
} as const

export type LimitingCondition =
  (typeof LIMITING_CONDITIONS)[keyof typeof LIMITING_CONDITIONS]

// Discount validity periods (VALIDITA)
export const DISCOUNT_VALIDITY_PERIODS = {
  ENTRY: '01',
  WITHIN_12_MONTHS: '02',
  BEYOND_12_MONTHS: '03',
} as const

export const DISCOUNT_VALIDITY_LABELS: Record<string, string> = {
  '01': 'Entry',
  '02': 'Within 12 months',
  '03': 'Beyond 12 months',
} as const

export type DiscountValidityPeriod =
  (typeof DISCOUNT_VALIDITY_PERIODS)[keyof typeof DISCOUNT_VALIDITY_PERIODS]

// VAT applicability (IVA_SCONTO)
export const VAT_APPLICABILITY = {
  YES: '01',
  NO: '02',
} as const

export const VAT_APPLICABILITY_LABELS: Record<string, string> = {
  '01': 'Yes',
  '02': 'No',
} as const

export type VatApplicability =
  (typeof VAT_APPLICABILITY)[keyof typeof VAT_APPLICABILITY]

// Discount application conditions (CONDIZIONE_APPLICAZIONE)
export const DISCOUNT_CONDITIONS = {
  NOT_CONDITIONED: '00',
  ELECTRONIC_BILLING: '01',
  ONLINE_MANAGEMENT: '02',
  ELECTRONIC_BILLING_BANK_DEBIT: '03',
  OTHER: '99',
} as const

export const DISCOUNT_CONDITION_LABELS: Record<string, string> = {
  '00': 'Not conditioned',
  '01': 'Electronic billing',
  '02': 'Online management',
  '03': 'Electronic billing + bank direct debit',
  '99': 'Other',
} as const

export type DiscountCondition =
  (typeof DISCOUNT_CONDITIONS)[keyof typeof DISCOUNT_CONDITIONS]

// Discount types (TIPOLOGIA for discounts)
export const DISCOUNT_TYPES = {
  FIXED_DISCOUNT: '01',
  POWER_DISCOUNT: '02',
  SALES_DISCOUNT: '03',
  REGULATED_PRICE_DISCOUNT: '04',
} as const

export const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  '01': 'Fixed discount',
  '02': 'Power discount',
  '03': 'Sales discount',
  '04': 'Discount on regulated price',
} as const

export type DiscountType = (typeof DISCOUNT_TYPES)[keyof typeof DISCOUNT_TYPES]

// Additional products/services macro areas
export const ADDITIONAL_PRODUCT_MACRO_AREAS = {
  BOILER: '01',
  MOBILITY: '02',
  SOLAR_THERMAL: '03',
  PHOTOVOLTAIC: '04',
  AIR_CONDITIONING: '05',
  INSURANCE_POLICY: '06',
  OTHER: '99',
} as const

export const ADDITIONAL_PRODUCT_MACRO_AREA_LABELS: Record<string, string> = {
  '01': 'Boiler',
  '02': 'Mobility',
  '03': 'Solar thermal',
  '04': 'Photovoltaic',
  '05': 'Air conditioning',
  '06': 'Insurance policy',
  '99': 'Other',
} as const

export type AdditionalProductMacroArea =
  (typeof ADDITIONAL_PRODUCT_MACRO_AREAS)[keyof typeof ADDITIONAL_PRODUCT_MACRO_AREAS]

// Months (for validity periods)
export const MONTHS = {
  JANUARY: '01',
  FEBRUARY: '02',
  MARCH: '03',
  APRIL: '04',
  MAY: '05',
  JUNE: '06',
  JULY: '07',
  AUGUST: '08',
  SEPTEMBER: '09',
  OCTOBER: '10',
  NOVEMBER: '11',
  DECEMBER: '12',
} as const

export const MONTH_LABELS: Record<string, string> = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
} as const

export type Month = (typeof MONTHS)[keyof typeof MONTHS]

// Special constants
export const INDETERMINATE_DURATION = -1
export const MAX_DURATION_MONTHS = 99
export const OTHER_CODE = '99'
export const NO_GUARANTEES = 'NO'

// Field constraints
export const FIELD_CONSTRAINTS = {
  PIVA_LENGTH: 16,
  COD_OFFERTA_MAX_LENGTH: 32,
  NOME_OFFERTA_MAX_LENGTH: 255,
  DESCRIZIONE_MAX_LENGTH: 3000,
  TELEFONO_MAX_LENGTH: 15,
  URL_MAX_LENGTH: 100,
  DESCRIZIONE_FILENAME_MAX_LENGTH: 25,
} as const

// Date formats
export const DATE_FORMATS = {
  TIMESTAMP: 'GG/MM/AAAA_HH:MM:SS',
  MONTH_YEAR: 'MM/AAAA',
} as const

// Time band constants for weekly configuration
export const TIME_BAND_CONSTANTS = {
  MAX_SEGMENTS_PER_DAY: 10,
  QUARTERS_PER_DAY: 96, // 24 hours * 4 quarters per hour
  MIN_BAND_NUMBER: 1,
  MAX_BAND_NUMBER: 8,
  PEAK_BAND_NUMBER: 7,
  OFFPEAK_BAND_NUMBER: 8,
} as const

// Helpers for conditional fields
export const requiresWeeklyTimeBands = (tipologiaFasce: string): boolean => {
  return ['02', '04', '05', '06'].includes(tipologiaFasce)
}

export const requiresSingleOffer = (tipoMercato: string): boolean => {
  return tipoMercato !== MARKET_TYPES.DUAL_FUEL
}

export const requiresEnergyPriceReference = (tipoOfferta: string): boolean => {
  return tipoOfferta === OFFER_TYPES.VARIABLE
}

export const requiresConsumptionLimits = (tipoOfferta: string): boolean => {
  return tipoOfferta === OFFER_TYPES.FLAT
}

export const requiresDualOfferCodes = (tipoMercato: string): boolean => {
  return tipoMercato === MARKET_TYPES.DUAL_FUEL
}

// Get components by market type
export const getRegulatedComponentsByMarket = (
  marketType: string,
): string[] => {
  if (marketType === MARKET_TYPES.ELECTRICITY) {
    return [REGULATED_COMPONENTS.PCV, REGULATED_COMPONENTS.PPE]
  }
  if (marketType === MARKET_TYPES.GAS) {
    return [
      REGULATED_COMPONENTS.CCR,
      REGULATED_COMPONENTS.CPR,
      REGULATED_COMPONENTS.GRAD,
      REGULATED_COMPONENTS.QTINT,
      REGULATED_COMPONENTS.QTPSV,
      REGULATED_COMPONENTS.QVD_FISSA,
      REGULATED_COMPONENTS.QVD_VARIABILE,
    ]
  }
  return []
}

// Validation helpers
export const isValidPIVA = (piva: string): boolean => {
  return /^[A-Z0-9]{16}$/.test(piva)
}

export const isValidFilenameDescription = (description: string): boolean => {
  return /^[A-Za-z0-9]{1,25}$/.test(description)
}

export const isValidTimeBandFormat = (format: string): boolean => {
  const regex = /^(\d{1,2}-\d,)*\d{1,2}-\d$/
  if (!regex.test(format)) {
    return false
  }

  const segments = format.split(',')
  if (segments.length > TIME_BAND_CONSTANTS.MAX_SEGMENTS_PER_DAY) {
    return false
  }

  let lastQuarter = 0
  for (const segment of segments) {
    const [quarter, band] = segment.split('-').map(Number)
    if (
      quarter <= lastQuarter ||
      quarter > TIME_BAND_CONSTANTS.QUARTERS_PER_DAY
    ) {
      return false
    }
    if (
      band < TIME_BAND_CONSTANTS.MIN_BAND_NUMBER ||
      band > TIME_BAND_CONSTANTS.MAX_BAND_NUMBER
    ) {
      return false
    }
    lastQuarter = quarter
  }

  return true
}
