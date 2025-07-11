import { XMLBuilder } from 'fast-xml-parser'

/**
 * XML Builder for SII "Trasmissione Offerte" specification
 * Converts form data from the multi-step form into SII-compliant XML
 */

// Top-level regex patterns for performance
const BOM_REGEX = /^\uFEFF/
const CRLF_REGEX = /\r\n/g
const SPECIAL_CHARS_REGEX = /[^\w\s-]/g
const MULTIPLE_UNDERSCORES_REGEX = /_+/g

/**
 * Remove invalid XML characters from a string
 * XML 1.0 valid characters: #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD]
 * @param str - String to clean
 * @returns String with invalid characters removed
 */
function removeInvalidXMLChars(str: string): string {
  let result = ''
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    // Keep tab (9), newline (10), carriage return (13), and valid ranges
    if (
      code === 0x09 ||
      code === 0x0a ||
      code === 0x0d ||
      (code >= 0x20 && code <= 0xd7_ff) ||
      (code >= 0xe0_00 && code <= 0xff_fd)
    ) {
      result += str.charAt(i)
    }
  }
  return result
}

// Type definition for the form data structure
interface FormData {
  basicInfo: {
    pivaUtente: string
    codOfferta: string
  }
  offerDetails: {
    tipoMercato: string
    offertaSingola?: string
    tipoCliente: string
    domesticoResidente?: string
    tipoOfferta: string
    tipologiaAttContr: string[]
    nomeOfferta: string
    descrizione: string
    durata: number
    garanzie: string
  }
  activationContacts: {
    modalita: string[]
    descrizioneModalita?: string
    telefono: string
    urlSitoVenditore?: string
    urlOfferta?: string
  }
  pricingConfig: {
    riferimentiPrezzoEnergia?: {
      idxPrezzoEnergia: string
      altro?: string
    }
    tipoPrezzo?: {
      tipologiaFasce: string
    }
    fasceOrarieSettimanale?: {
      fLunedi?: string
      fMartedi?: string
      fMercoledi?: string
      fGiovedi?: string
      fVenerdi?: string
      fSabato?: string
      fDomenica?: string
      fFestivita?: string
    }
    dispacciamento?: Array<{
      tipoDispacciamento: string
      valoreDisp?: number
      nome: string
      descrizione?: string
    }>
  }
  companyComponents: {
    componentiRegolate?: {
      codice: string[]
    }
    componenteImpresa?: Array<{
      nome: string
      descrizione: string
      tipologia: string
      macroArea: string
      intervalloPrezzi: Array<{
        fasciaComponente?: string
        consumoDa?: number
        consumoA?: number
        prezzo: number
        unitaMisura: string
        periodoValidita?: {
          durata?: number
          validoFino?: string
          meseValidita?: string[]
        }
      }>
    }>
  }
  paymentConditions: {
    metodoPagamento: Array<{
      modalitaPagamento: string
      descrizione?: string
    }>
    condizioniContrattuali?: Array<{
      tipologiaCondizione: string
      altro?: string
      descrizione: string
      limitante: string
    }>
  }
  additionalFeatures: {
    caratteristicheOfferta?: {
      consumoMin?: number
      consumoMax?: number
      potenzaMin?: number
      potenzaMax?: number
    }
    offertaDUAL?: {
      offerteCongiungeEE: string[]
      offerteCongiungeGas: string[]
    }
    zoneOfferta?: {
      regione?: string[]
      provincia?: string[]
      comune?: string[]
    }
    sconto?: Array<{
      nome: string
      descrizione: string
      codiceComponenteFascia?: string[]
      validita?: string
      ivaSconto: string
      periodoValidita?: {
        durata?: number
        validoFino?: string
        meseValidita?: string[]
      }
      scontoCondizione: {
        condizioneApplicazione: string
        descrizioneCondizione?: string
      }
      prezziSconto: Array<{
        tipologia: string
        validoDa?: number
        validoFino?: number
        unitaMisura: string
        prezzo: number
      }>
    }>
    prodottiServiziAggiuntivi?: Array<{
      nome: string
      dettaglio: string
      macroArea?: string
      dettagliMacroArea?: string
    }>
  }
  validityReview: {
    validitaOfferta: {
      dataInizio: string
      dataFine: string
    }
  }
}

// Configure the XML builder with SII specification requirements
const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  format: true,
  indentBy: '    ', // 4 spaces indentation
  suppressEmptyNode: false,
  unpairedTags: [], // No self-closing tags in SII spec
  cdataPropName: '__cdata',
  commentPropName: '__comment',
  preserveOrder: false,
  processEntities: true,
})

/**
 * Build XML string from form data
 * @param formData - Complete form data from all steps
 * @returns XML string with proper declaration and UTF-8 encoding
 */
export function buildXML(formData: FormData): string {
  // Transform form data to XML structure
  const xmlStructure = transformToXMLStructure(formData)

  // Build XML string
  const xmlString = xmlBuilder.build(xmlStructure)

  // Add XML declaration with UTF-8 encoding
  const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>'

  // Ensure no BOM is present and normalize line endings
  const cleanXmlString = xmlString
    .replace(BOM_REGEX, '') // Remove BOM if present
    .replace(CRLF_REGEX, '\n') // Normalize line endings to LF

  return `${xmlDeclaration}\n${cleanXmlString}`
}

/**
 * Transform form data to XML structure matching SII specification
 * Maps camelCase form fields to UPPER_CASE XML elements
 */
function transformToXMLStructure(formData: FormData): object {
  const xmlData = {
    Offerta: {} as Record<string, unknown>,
  }

  // Mandatory sections
  xmlData.Offerta.IdentificativiOfferta =
    transformIdentificativiOfferta(formData)
  xmlData.Offerta.DettaglioOfferta = transformDettaglioOfferta(formData)
  xmlData.Offerta['DettaglioOfferta.ModalitaAttivazione'] =
    transformModalitaAttivazione(formData)
  xmlData.Offerta['DettaglioOfferta.Contatti'] = transformContatti(formData)
  xmlData.Offerta.ValiditaOfferta = transformValiditaOfferta(formData)
  xmlData.Offerta.MetodoPagamento = transformMetodoPagamento(formData)

  // Optional sections
  addOptionalSections(xmlData, formData)

  return xmlData
}

// Transform functions for mandatory sections
function transformIdentificativiOfferta(formData: FormData) {
  return {
    PIVA_UTENTE: formData.basicInfo.pivaUtente.toUpperCase(),
    COD_OFFERTA: formData.basicInfo.codOfferta.toUpperCase(),
  }
}

function transformDettaglioOfferta(formData: FormData) {
  const dettaglioOfferta: Record<string, unknown> = {
    TIPO_MERCATO: formData.offerDetails.tipoMercato,
    TIPO_CLIENTE: formData.offerDetails.tipoCliente,
    TIPO_OFFERTA: formData.offerDetails.tipoOfferta,
    TIPOLOGIA_ATT_CONTR: formData.offerDetails.tipologiaAttContr,
    NOME_OFFERTA: formData.offerDetails.nomeOfferta,
    DESCRIZIONE: formData.offerDetails.descrizione,
    DURATA: formData.offerDetails.durata,
    GARANZIE: formData.offerDetails.garanzie,
  }

  if (formData.offerDetails.offertaSingola !== undefined) {
    dettaglioOfferta.OFFERTA_SINGOLA = formData.offerDetails.offertaSingola
  }

  if (formData.offerDetails.domesticoResidente !== undefined) {
    dettaglioOfferta.DOMESTICO_RESIDENTE =
      formData.offerDetails.domesticoResidente
  }

  return dettaglioOfferta
}

function transformModalitaAttivazione(formData: FormData) {
  const modalitaAttivazione: Record<string, unknown> = {
    MODALITA: formData.activationContacts.modalita,
  }

  if (formData.activationContacts.descrizioneModalita) {
    modalitaAttivazione.DESCRIZIONE =
      formData.activationContacts.descrizioneModalita
  }

  return modalitaAttivazione
}

function transformContatti(formData: FormData) {
  const contatti: Record<string, unknown> = {
    TELEFONO: formData.activationContacts.telefono,
  }

  if (formData.activationContacts.urlSitoVenditore) {
    contatti.URL_SITO_VENDITORE = formData.activationContacts.urlSitoVenditore
  }

  if (formData.activationContacts.urlOfferta) {
    contatti.URL_OFFERTA = formData.activationContacts.urlOfferta
  }

  return contatti
}

function transformValiditaOfferta(formData: FormData) {
  return {
    DATA_INIZIO: formData.validityReview.validitaOfferta.dataInizio,
    DATA_FINE: formData.validityReview.validitaOfferta.dataFine,
  }
}

function transformMetodoPagamento(formData: FormData) {
  return formData.paymentConditions.metodoPagamento.map((payment) => ({
    MODALITA_PAGAMENTO: payment.modalitaPagamento,
    ...(payment.descrizione && { DESCRIZIONE: payment.descrizione }),
  }))
}

// Add all optional sections
function addOptionalSections(
  xmlData: { Offerta: Record<string, unknown> },
  formData: FormData,
) {
  // Pricing configuration sections
  addPricingConfigSections(xmlData, formData)

  // Additional features sections
  addAdditionalFeaturesSections(xmlData, formData)

  // Company components sections
  addCompanyComponentsSections(xmlData, formData)

  // Payment conditions sections
  addPaymentConditionsSections(xmlData, formData)
}

// Pricing configuration related sections
function addPricingConfigSections(
  xmlData: { Offerta: Record<string, unknown> },
  formData: FormData,
) {
  if (formData.pricingConfig.riferimentiPrezzoEnergia) {
    xmlData.Offerta.RiferimentiPrezzoEnergia = {
      IDX_PREZZO_ENERGIA:
        formData.pricingConfig.riferimentiPrezzoEnergia.idxPrezzoEnergia,
      ...(formData.pricingConfig.riferimentiPrezzoEnergia.altro && {
        ALTRO: formData.pricingConfig.riferimentiPrezzoEnergia.altro,
      }),
    }
  }

  if (formData.pricingConfig.tipoPrezzo) {
    xmlData.Offerta.TipoPrezzo = {
      TIPOLOGIA_FASCE: formData.pricingConfig.tipoPrezzo.tipologiaFasce,
    }
  }

  const fasceOrarie = transformFasceOrarieSettimanale(formData)
  if (fasceOrarie) {
    xmlData.Offerta.FasceOrarieSettimanale = fasceOrarie
  }

  if (formData.pricingConfig.dispacciamento?.length) {
    xmlData.Offerta.Dispacciamento = formData.pricingConfig.dispacciamento.map(
      (disp) => ({
        TIPO_DISPACCIAMENTO: disp.tipoDispacciamento,
        ...(disp.valoreDisp !== undefined && { VALORE_DISP: disp.valoreDisp }),
        NOME: disp.nome,
        ...(disp.descrizione && { DESCRIZIONE: disp.descrizione }),
      }),
    )
  }
}

function transformFasceOrarieSettimanale(formData: FormData) {
  if (!formData.pricingConfig.fasceOrarieSettimanale) {
    return null
  }

  const fasce = formData.pricingConfig.fasceOrarieSettimanale
  const fasceData: Record<string, string> = {}

  if (fasce.fLunedi) {
    fasceData.F_LUNEDI = fasce.fLunedi
  }
  if (fasce.fMartedi) {
    fasceData.F_MARTEDI = fasce.fMartedi
  }
  if (fasce.fMercoledi) {
    fasceData.F_MERCOLEDI = fasce.fMercoledi
  }
  if (fasce.fGiovedi) {
    fasceData.F_GIOVEDI = fasce.fGiovedi
  }
  if (fasce.fVenerdi) {
    fasceData.F_VENERDI = fasce.fVenerdi
  }
  if (fasce.fSabato) {
    fasceData.F_SABATO = fasce.fSabato
  }
  if (fasce.fDomenica) {
    fasceData.F_DOMENICA = fasce.fDomenica
  }
  if (fasce.fFestivita) {
    fasceData.F_FESTIVITA = fasce.fFestivita
  }

  return Object.keys(fasceData).length > 0 ? fasceData : null
}

// Additional features related sections
function addAdditionalFeaturesSections(
  xmlData: { Offerta: Record<string, unknown> },
  formData: FormData,
) {
  const caratteristiche = transformCaratteristicheOfferta(formData)
  if (caratteristiche) {
    xmlData.Offerta.CaratteristicheOfferta = caratteristiche
  }

  if (formData.additionalFeatures.offertaDUAL) {
    xmlData.Offerta.OffertaDUAL = {
      OFFERTE_CONGIUNTE_EE:
        formData.additionalFeatures.offertaDUAL.offerteCongiungeEE,
      OFFERTE_CONGIUNTE_GAS:
        formData.additionalFeatures.offertaDUAL.offerteCongiungeGas,
    }
  }

  const zoneOfferta = transformZoneOfferta(formData)
  if (zoneOfferta) {
    xmlData.Offerta.ZoneOfferta = zoneOfferta
  }

  if (formData.additionalFeatures.sconto?.length) {
    xmlData.Offerta.Sconto =
      formData.additionalFeatures.sconto.map(transformSconto)
  }

  if (formData.additionalFeatures.prodottiServiziAggiuntivi?.length) {
    xmlData.Offerta.ProdottiServiziAggiuntivi =
      formData.additionalFeatures.prodottiServiziAggiuntivi.map((prod) => ({
        NOME: prod.nome,
        DETTAGLIO: prod.dettaglio,
        ...(prod.macroArea && { MACROAREA: prod.macroArea }),
        ...(prod.dettagliMacroArea && {
          DETTAGLI_MACROAREA: prod.dettagliMacroArea,
        }),
      }))
  }
}

function transformCaratteristicheOfferta(formData: FormData) {
  if (!formData.additionalFeatures.caratteristicheOfferta) {
    return null
  }

  const caratteristiche: Record<string, unknown> = {}
  const offerta = formData.additionalFeatures.caratteristicheOfferta

  if (offerta.consumoMin !== undefined) {
    caratteristiche.CONSUMO_MIN = offerta.consumoMin
  }
  if (offerta.consumoMax !== undefined) {
    caratteristiche.CONSUMO_MAX = offerta.consumoMax
  }
  if (offerta.potenzaMin !== undefined) {
    caratteristiche.POTENZA_MIN = offerta.potenzaMin
  }
  if (offerta.potenzaMax !== undefined) {
    caratteristiche.POTENZA_MAX = offerta.potenzaMax
  }

  return Object.keys(caratteristiche).length > 0 ? caratteristiche : null
}

function transformZoneOfferta(formData: FormData) {
  if (!formData.additionalFeatures.zoneOfferta) {
    return null
  }

  const zone = formData.additionalFeatures.zoneOfferta
  const zoneData: Record<string, string[]> = {}

  if (zone.regione?.length) {
    zoneData.REGIONE = zone.regione
  }
  if (zone.provincia?.length) {
    zoneData.PROVINCIA = zone.provincia
  }
  if (zone.comune?.length) {
    zoneData.COMUNE = zone.comune
  }

  return Object.keys(zoneData).length > 0 ? zoneData : null
}

function transformSconto(sconto: {
  nome: string
  descrizione: string
  codiceComponenteFascia?: string[]
  validita?: string
  ivaSconto: string
  periodoValidita?: {
    durata?: number
    validoFino?: string
    meseValidita?: string[]
  }
  scontoCondizione: {
    condizioneApplicazione: string
    descrizioneCondizione?: string
  }
  prezziSconto: Array<{
    tipologia: string
    validoDa?: number
    validoFino?: number
    unitaMisura: string
    prezzo: number
  }>
}) {
  const scontoData: Record<string, unknown> = {
    NOME: sconto.nome,
    DESCRIZIONE: sconto.descrizione,
    IVA_SCONTO: sconto.ivaSconto,
    Condizione: {
      CONDIZIONE_APPLICAZIONE: sconto.scontoCondizione.condizioneApplicazione,
      ...(sconto.scontoCondizione.descrizioneCondizione && {
        DESCRIZIONE_CONDIZIONE: sconto.scontoCondizione.descrizioneCondizione,
      }),
    },
    PREZZISconto: sconto.prezziSconto.map((prezzo) => ({
      TIPOLOGIA: prezzo.tipologia,
      ...(prezzo.validoDa !== undefined && { VALIDO_DA: prezzo.validoDa }),
      ...(prezzo.validoFino !== undefined && {
        VALIDO_FINO: prezzo.validoFino,
      }),
      UNITA_MISURA: prezzo.unitaMisura,
      PREZZO: prezzo.prezzo,
    })),
  }

  if (sconto.codiceComponenteFascia?.length) {
    scontoData.CODICE_COMPONENTE_FASCIA = sconto.codiceComponenteFascia
  }

  if (sconto.validita) {
    scontoData.VALIDITA = sconto.validita
  }

  if (sconto.periodoValidita) {
    const periodo: Record<string, unknown> = {}

    if (sconto.periodoValidita.durata !== undefined) {
      periodo.DURATA = sconto.periodoValidita.durata
    }
    if (sconto.periodoValidita.validoFino) {
      periodo.VALIDO_FINO = sconto.periodoValidita.validoFino
    }
    if (sconto.periodoValidita.meseValidita?.length) {
      periodo.MESE_VALIDITA = sconto.periodoValidita.meseValidita
    }

    if (Object.keys(periodo).length > 0) {
      scontoData.PeriodoValidita = periodo
    }
  }

  return scontoData
}

// Company components related sections
function addCompanyComponentsSections(
  xmlData: { Offerta: Record<string, unknown> },
  formData: FormData,
) {
  if (formData.companyComponents.componentiRegolate?.codice.length) {
    xmlData.Offerta.ComponentiRegolate = {
      CODICE: formData.companyComponents.componentiRegolate.codice,
    }
  }

  if (formData.companyComponents.componenteImpresa?.length) {
    xmlData.Offerta.ComponenteImpresa =
      formData.companyComponents.componenteImpresa.map(
        transformComponenteImpresa,
      )
  }
}

function transformComponenteImpresa(comp: {
  nome: string
  descrizione: string
  tipologia: string
  macroArea: string
  intervalloPrezzi: Array<{
    fasciaComponente?: string
    consumoDa?: number
    consumoA?: number
    prezzo: number
    unitaMisura: string
    periodoValidita?: {
      durata?: number
      validoFino?: string
      meseValidita?: string[]
    }
  }>
}) {
  return {
    NOME: comp.nome,
    DESCRIZIONE: comp.descrizione,
    TIPOLOGIA: comp.tipologia,
    MACROAREA: comp.macroArea,
    IntervalloPrezzi: comp.intervalloPrezzi.map(transformIntervalloPrezzi),
  }
}

function transformIntervalloPrezzi(interval: {
  fasciaComponente?: string
  consumoDa?: number
  consumoA?: number
  prezzo: number
  unitaMisura: string
  periodoValidita?: {
    durata?: number
    validoFino?: string
    meseValidita?: string[]
  }
}) {
  const intervalData: Record<string, unknown> = {
    PREZZO: interval.prezzo,
    UNITA_MISURA: interval.unitaMisura,
  }

  if (interval.fasciaComponente) {
    intervalData.FASCIA_COMPONENTE = interval.fasciaComponente
  }
  if (interval.consumoDa !== undefined) {
    intervalData.CONSUMO_DA = interval.consumoDa
  }
  if (interval.consumoA !== undefined) {
    intervalData.CONSUMO_A = interval.consumoA
  }

  if (interval.periodoValidita) {
    const periodo: Record<string, unknown> = {}

    if (interval.periodoValidita.durata !== undefined) {
      periodo.DURATA = interval.periodoValidita.durata
    }
    if (interval.periodoValidita.validoFino) {
      periodo.VALIDO_FINO = interval.periodoValidita.validoFino
    }
    if (interval.periodoValidita.meseValidita?.length) {
      periodo.MESE_VALIDITA = interval.periodoValidita.meseValidita
    }

    if (Object.keys(periodo).length > 0) {
      intervalData.PeriodoValidita = periodo
    }
  }

  return intervalData
}

// Payment conditions related sections
function addPaymentConditionsSections(
  xmlData: { Offerta: Record<string, unknown> },
  formData: FormData,
) {
  if (formData.paymentConditions.condizioniContrattuali?.length) {
    xmlData.Offerta.CondizioniContrattuali =
      formData.paymentConditions.condizioniContrattuali.map((cond) => ({
        TIPOLOGIA_CONDIZIONE: cond.tipologiaCondizione,
        ...(cond.altro && { ALTRO: cond.altro }),
        DESCRIZIONE: cond.descrizione,
        LIMITANTE: cond.limitante,
      }))
  }
}

/**
 * Generate XML filename following SII convention with safe characters
 * @param pivaUtente - PIVA of the user
 * @param description - Optional description for the filename
 * @returns Filename in format <PIVA>_INSERIMENTO_<DESCRIPTION>.XML
 */
export function generateXMLFilename(
  pivaUtente: string,
  description?: string,
): string {
  const piva = pivaUtente.toUpperCase()

  // Sanitize description to ensure only safe filename characters
  if (!description || description.trim().length === 0) {
    return `${piva}_INSERIMENTO.XML`
  }

  const sanitized = description
    .trim() // Trim whitespace first
    .toUpperCase()
    .replace(SPECIAL_CHARS_REGEX, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(MULTIPLE_UNDERSCORES_REGEX, '_') // Remove duplicate underscores
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores

  // If sanitization results in empty string, return without description
  if (sanitized.length === 0) {
    return `${piva}_INSERIMENTO.XML`
  }

  return `${piva}_INSERIMENTO_${sanitized}.XML`
}

/**
 * Convert XML string to Blob for download with proper UTF-8 encoding
 * @param xmlString - XML string to convert
 * @returns Blob with proper MIME type and UTF-8 encoding
 */
export function createXMLBlob(xmlString: string): Blob {
  // Ensure the string is properly encoded as UTF-8
  const encoder = new TextEncoder()
  const utf8Array = encoder.encode(xmlString)

  // Create blob from UTF-8 encoded array
  return new Blob([utf8Array], {
    type: 'application/xml;charset=utf-8',
  })
}

/**
 * Trigger XML download
 * @param xmlString - XML string to download
 * @param filename - Filename for the download
 * @returns Object with success status and optional error message
 */
export function downloadXML(
  xmlString: string,
  filename: string,
): { success: boolean; error?: string } {
  try {
    // Validate inputs
    if (!xmlString || xmlString.trim().length === 0) {
      return { success: false, error: 'Il contenuto XML è vuoto' }
    }

    if (!filename || filename.trim().length === 0) {
      return { success: false, error: 'Il nome del file non è valido' }
    }

    // Check browser compatibility
    if (!window.Blob) {
      return {
        success: false,
        error: 'Il browser non supporta il download di file',
      }
    }

    const blob = createXMLBlob(xmlString)
    const url = URL.createObjectURL(blob)

    // Create download link
    const link = document.createElement('a')
    link.href = url

    // Check if download attribute is supported
    try {
      if ('download' in link) {
        // Modern browsers
        link.download = filename
        link.click()
      } else {
        // Fallback for older browsers - open in new window
        window.open(url, '_blank')
      }
    } catch {
      // If anything goes wrong, try the fallback
      window.open(url, '_blank')
    }

    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100) // Small delay to ensure download starts

    return { success: true }
  } catch {
    return {
      success: false,
      error: 'Si è verificato un errore durante il download del file',
    }
  }
}

/**
 * Sanitize string for XML to ensure UTF-8 compliance
 * Removes or replaces invalid XML characters
 * @param str - String to sanitize
 * @returns Sanitized string safe for XML
 */
export function sanitizeForXML(str: string): string {
  if (!str) {
    return ''
  }

  // First remove invalid XML characters
  const cleaned = removeInvalidXMLChars(str)

  // Then escape XML special characters
  return cleaned
    .replace(/&/g, '&amp;') // Escape ampersand
    .replace(/</g, '&lt;') // Escape less than
    .replace(/>/g, '&gt;') // Escape greater than
    .replace(/"/g, '&quot;') // Escape double quote
    .replace(/'/g, '&apos;') // Escape single quote
}

/**
 * Validate XML string for UTF-8 compliance
 * @param xmlString - XML string to validate
 * @returns true if valid UTF-8, false otherwise
 */
export function isValidUTF8(xmlString: string): boolean {
  try {
    // Attempt to encode and decode the string
    const encoder = new TextEncoder()
    const decoder = new TextDecoder('utf-8', { fatal: true })
    const encoded = encoder.encode(xmlString)
    decoder.decode(encoded)
    return true
  } catch {
    return false
  }
}
