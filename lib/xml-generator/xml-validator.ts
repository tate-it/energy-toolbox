import { XMLParser } from 'fast-xml-parser'

/**
 * XML Validator for SII "Trasmissione Offerte" specification
 * Validates generated XML against the SII schema requirements
 */

// Top-level regex patterns
const PIVA_REGEX = /^[A-Z0-9]+$/
const DATE_PATTERN_REGEX = /^\d{2}\/\d{2}\/\d{4}_\d{2}:\d{2}:\d{2}$/
const DATE_SPLIT_REGEX = /[/\s_:]/

// XML document structure type
type XMLOffertaDoc = {
  Offerta?: Record<string, unknown>
}

// Configure XML parser for validation
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  allowBooleanAttributes: true,
  parseTagValue: true,
  parseAttributeValue: true,
  trimValues: true,
})

// Validation result type
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  path: string
  message: string
  severity: 'error' | 'warning'
}

/**
 * Validate XML string against SII specification requirements
 * @param xmlString - XML string to validate
 * @returns Validation result with errors if any
 */
export function validateXML(xmlString: string): ValidationResult {
  const errors: ValidationError[] = []

  try {
    // Parse XML
    const xmlDoc = xmlParser.parse(xmlString) as XMLOffertaDoc

    // Check root element
    if (!xmlDoc.Offerta) {
      errors.push({
        path: '/',
        message: 'Elemento radice "Offerta" mancante',
        severity: 'error',
      })
      return { isValid: false, errors }
    }

    const offerta = xmlDoc.Offerta

    // Validate mandatory sections
    validateMandatorySections(offerta, errors)

    // Validate field formats and constraints
    validateFieldFormats(offerta, errors)

    // Validate conditional requirements
    validateConditionalRequirements(offerta, errors)

    // Validate element order
    validateElementOrder(offerta, errors)
  } catch (error) {
    errors.push({
      path: '/',
      message: `Errore nel parsing XML: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
      severity: 'error',
    })
  }

  return {
    isValid: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
  }
}

/**
 * Validate mandatory sections are present
 */
function validateMandatorySections(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  // Check main mandatory sections
  checkMandatorySectionsPresence(offerta, errors)

  // Validate IdentificativiOfferta fields
  validateIdentificativiOfferta(offerta, errors)

  // Validate DettaglioOfferta fields
  validateDettaglioOfferta(offerta, errors)
}

function checkMandatorySectionsPresence(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  const mandatorySections = [
    { path: 'IdentificativiOfferta', name: 'IdentificativiOfferta' },
    { path: 'DettaglioOfferta', name: 'DettaglioOfferta' },
    {
      path: 'DettaglioOfferta.ModalitaAttivazione',
      name: 'Modalità Attivazione',
    },
    { path: 'DettaglioOfferta.Contatti', name: 'Contatti' },
    { path: 'ValiditaOfferta', name: 'Validità Offerta' },
    { path: 'MetodoPagamento', name: 'Metodo Pagamento' },
  ]

  for (const section of mandatorySections) {
    if (!offerta[section.path]) {
      errors.push({
        path: `/Offerta/${section.path}`,
        message: `Sezione obbligatoria "${section.name}" mancante`,
        severity: 'error',
      })
    }
  }
}

function validateIdentificativiOfferta(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  const identificativi = offerta.IdentificativiOfferta as
    | Record<string, unknown>
    | undefined

  if (identificativi) {
    if (!identificativi.PIVA_UTENTE) {
      errors.push({
        path: '/Offerta/IdentificativiOfferta/PIVA_UTENTE',
        message: 'Campo obbligatorio "PIVA_UTENTE" mancante',
        severity: 'error',
      })
    }
    if (!identificativi.COD_OFFERTA) {
      errors.push({
        path: '/Offerta/IdentificativiOfferta/COD_OFFERTA',
        message: 'Campo obbligatorio "COD_OFFERTA" mancante',
        severity: 'error',
      })
    }
  }
}

function validateDettaglioOfferta(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  const dettaglio = offerta.DettaglioOfferta as
    | Record<string, unknown>
    | undefined

  if (dettaglio) {
    const mandatoryFields = [
      'TIPO_MERCATO',
      'TIPO_CLIENTE',
      'TIPO_OFFERTA',
      'NOME_OFFERTA',
      'DESCRIZIONE',
      'DURATA',
      'GARANZIE',
    ]

    for (const field of mandatoryFields) {
      if (!dettaglio[field]) {
        errors.push({
          path: `/Offerta/DettaglioOfferta/${field}`,
          message: `Campo obbligatorio "${field}" mancante`,
          severity: 'error',
        })
      }
    }

    // TIPOLOGIA_ATT_CONTR must have at least one value
    const tipologia = dettaglio.TIPOLOGIA_ATT_CONTR
    if (!tipologia || (Array.isArray(tipologia) && tipologia.length === 0)) {
      errors.push({
        path: '/Offerta/DettaglioOfferta/TIPOLOGIA_ATT_CONTR',
        message: 'È richiesto almeno un tipo di attivazione contratto',
        severity: 'error',
      })
    }
  }
}

/**
 * Validate field formats and constraints
 */
function validateFieldFormats(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  // Validate PIVA format
  validatePIVAFormat(offerta, errors)

  // Validate date formats
  validateDateFormats(offerta, errors)

  // Validate enum values
  validateEnumValues(offerta, errors)

  // Validate numeric constraints
  validateNumericConstraints(offerta, errors)
}

function validatePIVAFormat(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  const identificativi = offerta.IdentificativiOfferta as
    | Record<string, unknown>
    | undefined

  if (identificativi?.PIVA_UTENTE) {
    const piva = String(identificativi.PIVA_UTENTE)
    if (piva.length > 16) {
      errors.push({
        path: '/Offerta/IdentificativiOfferta/PIVA_UTENTE',
        message: 'PIVA_UTENTE non può superare i 16 caratteri',
        severity: 'error',
      })
    }
    if (!PIVA_REGEX.test(piva)) {
      errors.push({
        path: '/Offerta/IdentificativiOfferta/PIVA_UTENTE',
        message: 'PIVA_UTENTE deve contenere solo lettere maiuscole e numeri',
        severity: 'error',
      })
    }
  }
}

function validateDateFormats(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  const validita = offerta.ValiditaOfferta as
    | Record<string, unknown>
    | undefined

  if (validita) {
    if (
      validita.DATA_INIZIO &&
      !DATE_PATTERN_REGEX.test(String(validita.DATA_INIZIO))
    ) {
      errors.push({
        path: '/Offerta/ValiditaOfferta/DATA_INIZIO',
        message: 'DATA_INIZIO deve essere nel formato GG/MM/AAAA_HH:MM:SS',
        severity: 'error',
      })
    }

    if (
      validita.DATA_FINE &&
      !DATE_PATTERN_REGEX.test(String(validita.DATA_FINE))
    ) {
      errors.push({
        path: '/Offerta/ValiditaOfferta/DATA_FINE',
        message: 'DATA_FINE deve essere nel formato GG/MM/AAAA_HH:MM:SS',
        severity: 'error',
      })
    }
  }
}

function validateEnumValues(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  const dettaglio = offerta.DettaglioOfferta as
    | Record<string, unknown>
    | undefined

  if (
    dettaglio?.TIPO_MERCATO &&
    !['01', '02', '03'].includes(String(dettaglio.TIPO_MERCATO))
  ) {
    errors.push({
      path: '/Offerta/DettaglioOfferta/TIPO_MERCATO',
      message:
        'TIPO_MERCATO deve essere 01 (Elettrico), 02 (Gas) o 03 (Dual Fuel)',
      severity: 'error',
    })
  }
}

function validateNumericConstraints(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  const dettaglio = offerta.DettaglioOfferta as
    | Record<string, unknown>
    | undefined

  if (dettaglio?.DURATA !== undefined) {
    const durata = Number(dettaglio.DURATA)
    if (durata !== -1 && (durata < 1 || durata > 99)) {
      errors.push({
        path: '/Offerta/DettaglioOfferta/DURATA',
        message: 'DURATA deve essere -1 (indeterminata) o un valore tra 1 e 99',
        severity: 'error',
      })
    }
  }
}

/**
 * Validate conditional requirements based on other field values
 */
function validateConditionalRequirements(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  // Validate market-specific requirements
  validateMarketSpecificRequirements(offerta, errors)

  // Validate offer type requirements
  validateOfferTypeRequirements(offerta, errors)

  // Validate modality requirements
  validateModalityRequirements(offerta, errors)

  // Validate dual fuel requirements
  validateDualFuelRequirements(offerta, errors)
}

function validateMarketSpecificRequirements(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  const dettaglio = offerta.DettaglioOfferta as
    | Record<string, unknown>
    | undefined

  if (!dettaglio) {
    return
  }

  // Validate OFFERTA_SINGOLA requirement
  validateOffertaSingolaRequirement(dettaglio, errors)

  // Validate DOMESTICO_RESIDENTE requirement
  validateDomesticoResidenteRequirement(dettaglio, errors)

  // Validate electricity market requirements
  validateElectricityMarketRequirements(dettaglio, offerta, errors)
}

function validateOffertaSingolaRequirement(
  dettaglio: Record<string, unknown>,
  errors: ValidationError[],
) {
  if (
    dettaglio.TIPO_MERCATO &&
    dettaglio.TIPO_MERCATO !== '03' &&
    !dettaglio.OFFERTA_SINGOLA
  ) {
    errors.push({
      path: '/Offerta/DettaglioOfferta/OFFERTA_SINGOLA',
      message: 'OFFERTA_SINGOLA è obbligatorio per mercati Elettrico e Gas',
      severity: 'error',
    })
  }
}

function validateDomesticoResidenteRequirement(
  dettaglio: Record<string, unknown>,
  errors: ValidationError[],
) {
  if (
    dettaglio.TIPO_CLIENTE === '01' &&
    dettaglio.TIPO_MERCATO === '01' &&
    !dettaglio.DOMESTICO_RESIDENTE
  ) {
    errors.push({
      path: '/Offerta/DettaglioOfferta/DOMESTICO_RESIDENTE',
      message:
        'DOMESTICO_RESIDENTE è obbligatorio per clienti domestici nel mercato elettrico',
      severity: 'warning',
    })
  }
}

function validateElectricityMarketRequirements(
  dettaglio: Record<string, unknown>,
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  if (dettaglio.TIPO_MERCATO === '01') {
    if (!offerta.TipoPrezzo && dettaglio.TIPO_OFFERTA !== '03') {
      errors.push({
        path: '/Offerta/TipoPrezzo',
        message: 'TipoPrezzo è obbligatorio per offerte elettriche non FLAT',
        severity: 'warning',
      })
    }

    if (!offerta.Dispacciamento) {
      errors.push({
        path: '/Offerta/Dispacciamento',
        message: 'Dispacciamento è obbligatorio per offerte elettriche',
        severity: 'warning',
      })
    }
  }
}

function validateOfferTypeRequirements(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  const dettaglio = offerta.DettaglioOfferta as
    | Record<string, unknown>
    | undefined

  if (!dettaglio) {
    return
  }

  // Validate FLAT offer requirements
  validateFlatOfferRequirements(dettaglio, offerta, errors)

  // Validate Variable offer requirements
  validateVariableOfferRequirements(dettaglio, offerta, errors)
}

function validateFlatOfferRequirements(
  dettaglio: Record<string, unknown>,
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  if (dettaglio.TIPO_OFFERTA === '03') {
    const caratteristiche = offerta.CaratteristicheOfferta as
      | Record<string, unknown>
      | undefined

    if (!caratteristiche?.CONSUMO_MIN) {
      errors.push({
        path: '/Offerta/CaratteristicheOfferta/CONSUMO_MIN',
        message: 'CONSUMO_MIN è obbligatorio per offerte FLAT',
        severity: 'error',
      })
    }
    if (!caratteristiche?.CONSUMO_MAX) {
      errors.push({
        path: '/Offerta/CaratteristicheOfferta/CONSUMO_MAX',
        message: 'CONSUMO_MAX è obbligatorio per offerte FLAT',
        severity: 'error',
      })
    }
  }
}

function validateVariableOfferRequirements(
  dettaglio: Record<string, unknown>,
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  if (dettaglio.TIPO_OFFERTA === '02' && !offerta.RiferimentiPrezzoEnergia) {
    errors.push({
      path: '/Offerta/RiferimentiPrezzoEnergia',
      message: 'RiferimentiPrezzoEnergia è obbligatorio per offerte variabili',
      severity: 'warning',
    })
  }
}

function validateModalityRequirements(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  const modalita = offerta['DettaglioOfferta.ModalitaAttivazione'] as
    | Record<string, unknown>
    | undefined

  if (modalita?.MODALITA) {
    const modalitaArray = Array.isArray(modalita.MODALITA)
      ? modalita.MODALITA
      : [modalita.MODALITA]

    if (modalitaArray.includes('99') && !modalita.DESCRIZIONE) {
      errors.push({
        path: '/Offerta/DettaglioOfferta.ModalitaAttivazione/DESCRIZIONE',
        message:
          'DESCRIZIONE è obbligatoria quando MODALITA include "Altro" (99)',
        severity: 'error',
      })
    }
  }
}

function validateDualFuelRequirements(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  const dettaglio = offerta.DettaglioOfferta as
    | Record<string, unknown>
    | undefined

  // For Dual Fuel offers, joint offers are mandatory
  if (dettaglio?.TIPO_MERCATO === '03') {
    const dual = offerta.OffertaDUAL as Record<string, unknown> | undefined

    if (!dual?.OFFERTE_CONGIUNTE_EE) {
      errors.push({
        path: '/Offerta/OffertaDUAL/OFFERTE_CONGIUNTE_EE',
        message: 'OFFERTE_CONGIUNTE_EE è obbligatorio per offerte Dual Fuel',
        severity: 'error',
      })
    }
    if (!dual?.OFFERTE_CONGIUNTE_GAS) {
      errors.push({
        path: '/Offerta/OffertaDUAL/OFFERTE_CONGIUNTE_GAS',
        message: 'OFFERTE_CONGIUNTE_GAS è obbligatorio per offerte Dual Fuel',
        severity: 'error',
      })
    }
  }
}

/**
 * Validate element order matches XSD sequence
 */
function validateElementOrder(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  const expectedOrder = [
    'IdentificativiOfferta',
    'DettaglioOfferta',
    'DettaglioOfferta.ModalitaAttivazione',
    'DettaglioOfferta.Contatti',
    'ValiditaOfferta',
    'MetodoPagamento',
    'RiferimentiPrezzoEnergia',
    'CaratteristicheOfferta',
    'OffertaDUAL',
    'ComponentiRegolate',
    'TipoPrezzo',
    'FasceOrarieSettimanale',
    'Dispacciamento',
    'ComponenteImpresa',
    'CondizioniContrattuali',
    'ZoneOfferta',
    'Sconto',
    'ProdottiServiziAggiuntivi',
  ]

  const actualKeys = Object.keys(offerta)
  let lastIndex = -1

  for (const key of actualKeys) {
    const expectedIndex = expectedOrder.indexOf(key)
    if (expectedIndex !== -1) {
      if (expectedIndex < lastIndex) {
        errors.push({
          path: `/Offerta/${key}`,
          message: `Elemento "${key}" non è nell'ordine corretto secondo lo schema XSD`,
          severity: 'warning',
        })
      }
      lastIndex = expectedIndex
    }
  }
}

/**
 * Validate XML against specific business rules
 * @param xmlString - XML string to validate
 * @returns Validation result
 */
export function validateBusinessRules(xmlString: string): ValidationResult {
  const baseValidation = validateXML(xmlString)
  const additionalErrors: ValidationError[] = []

  try {
    const xmlDoc = xmlParser.parse(xmlString) as XMLOffertaDoc
    const offerta = xmlDoc.Offerta

    if (offerta) {
      // Validate date logic
      validateDateLogic(offerta, additionalErrors)

      // Validate price intervals
      validatePriceIntervals(offerta, additionalErrors)
    }
  } catch {
    // Ignore parsing errors as they're already handled in base validation
  }

  return {
    isValid:
      baseValidation.isValid &&
      additionalErrors.filter((e) => e.severity === 'error').length === 0,
    errors: [...baseValidation.errors, ...additionalErrors],
  }
}

function validateDateLogic(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  const validita = offerta.ValiditaOfferta as
    | Record<string, unknown>
    | undefined

  if (validita?.DATA_INIZIO && validita?.DATA_FINE) {
    const startDate = parseDate(String(validita.DATA_INIZIO))
    const endDate = parseDate(String(validita.DATA_FINE))

    if (startDate && endDate && startDate >= endDate) {
      errors.push({
        path: '/Offerta/ValiditaOfferta',
        message: 'DATA_FINE deve essere successiva a DATA_INIZIO',
        severity: 'error',
      })
    }
  }
}

function validatePriceIntervals(
  offerta: Record<string, unknown>,
  errors: ValidationError[],
) {
  const componenteImpresa = offerta.ComponenteImpresa

  if (!componenteImpresa) {
    return
  }

  const components: unknown[] = Array.isArray(componenteImpresa)
    ? componenteImpresa
    : [componenteImpresa]

  components.forEach((component, compIndex) => {
    validateComponentIntervals(component, compIndex, errors)
  })
}

function validateComponentIntervals(
  component: unknown,
  compIndex: number,
  errors: ValidationError[],
) {
  const comp = component as Record<string, unknown>

  if (!comp.IntervalloPrezzi) {
    return
  }

  const intervals: unknown[] = Array.isArray(comp.IntervalloPrezzi)
    ? comp.IntervalloPrezzi
    : [comp.IntervalloPrezzi]

  intervals.forEach((interval, intIndex) => {
    validateSingleInterval(interval, compIndex, intIndex, errors)
  })
}

function validateSingleInterval(
  interval: unknown,
  compIndex: number,
  intIndex: number,
  errors: ValidationError[],
) {
  const int = interval as Record<string, unknown>

  if (
    int.CONSUMO_DA !== undefined &&
    int.CONSUMO_A !== undefined &&
    Number(int.CONSUMO_DA) >= Number(int.CONSUMO_A)
  ) {
    errors.push({
      path: `/Offerta/ComponenteImpresa[${compIndex}]/IntervalloPrezzi[${intIndex}]`,
      message: 'CONSUMO_DA deve essere minore di CONSUMO_A',
      severity: 'error',
    })
  }
}

/**
 * Parse SII date format to Date object
 */
function parseDate(dateStr: string): Date | null {
  const match = dateStr.match(DATE_PATTERN_REGEX)
  if (!match) {
    return null
  }

  const parts = match[0].split(DATE_SPLIT_REGEX)
  if (parts.length !== 6) {
    return null
  }

  const [day, month, year, hour, minute, second] = parts
  return new Date(
    Number.parseInt(year, 10),
    Number.parseInt(month, 10) - 1,
    Number.parseInt(day, 10),
    Number.parseInt(hour, 10),
    Number.parseInt(minute, 10),
    Number.parseInt(second, 10),
  )
}

/**
 * Get validation error summary
 * @param errors - Array of validation errors
 * @returns Summary string
 */
export function getValidationSummary(errors: ValidationError[]): string {
  const errorCount = errors.filter((e) => e.severity === 'error').length
  const warningCount = errors.filter((e) => e.severity === 'warning').length

  if (errorCount === 0 && warningCount === 0) {
    return 'XML valido secondo le specifiche SII'
  }

  const parts: string[] = []
  if (errorCount > 0) {
    parts.push(`${errorCount} ${errorCount === 1 ? 'errore' : 'errori'}`)
  }
  if (warningCount > 0) {
    parts.push(`${warningCount} ${warningCount === 1 ? 'avviso' : 'avvisi'}`)
  }

  return `Trovati ${parts.join(' e ')}`
}
