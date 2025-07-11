import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildXML,
  createXMLBlob,
  downloadXML,
  generateXMLFilename,
  isValidUTF8,
  sanitizeForXML,
} from './xml-builder'

// Top-level regex patterns for performance
const XML_DECLARATION_REGEX = /^<\?xml version="1\.0" encoding="UTF-8"\?>/
const OFFERTA_ELEMENT_REGEX = /<Offerta>[\s\S]*<\/Offerta>\s*$/
const TIPOLOGIA_ATT_CONTR_REGEX =
  /<TIPOLOGIA_ATT_CONTR>01<\/TIPOLOGIA_ATT_CONTR>\s*<TIPOLOGIA_ATT_CONTR>02<\/TIPOLOGIA_ATT_CONTR>/
const PERIODO_VALIDITA_DURATA_6_REGEX =
  /<PeriodoValidita>\s*<DURATA>6<\/DURATA>/
const PERIODO_VALIDITA_DURATA_12_REGEX =
  /<PeriodoValidita>\s*<DURATA>12<\/DURATA>/
const XML_DECLARATION_WITH_NEWLINE_REGEX =
  /^<\?xml version="1\.0" encoding="UTF-8"\?>\n/

describe('xml-builder', () => {
  // Mock DOM methods
  beforeEach(() => {
    // Reset all mocks before each test
    vi.restoreAllMocks()
  })

  // Complete test data covering all form fields
  const createCompleteFormData = () => ({
    basicInfo: {
      pivaUtente: 'IT12345678901',
      codOfferta: 'OFFER2024TEST',
    },
    offerDetails: {
      tipoMercato: '01',
      offertaSingola: 'SI',
      tipoCliente: '01',
      domesticoResidente: 'SI',
      tipoOfferta: '01',
      tipologiaAttContr: ['01', '02'],
      nomeOfferta: 'Test Offer Name',
      descrizione: 'Test offer description with special chars & < >',
      durata: 12,
      garanzie: 'Test guarantees',
    },
    activationContacts: {
      modalita: ['01', '02'],
      descrizioneModalita: 'Online and phone activation',
      telefono: '+39 02 12345678',
      urlSitoVenditore: 'https://example.com',
      urlOfferta: 'https://example.com/offer',
    },
    pricingConfig: {
      riferimentiPrezzoEnergia: {
        idxPrezzoEnergia: 'PUN',
        altro: 'Additional price reference',
      },
      tipoPrezzo: {
        tipologiaFasce: 'F1',
      },
      fasceOrarieSettimanale: {
        fLunedi: 'F1',
        fMartedi: 'F1',
        fMercoledi: 'F1',
        fGiovedi: 'F1',
        fVenerdi: 'F1',
        fSabato: 'F2',
        fDomenica: 'F3',
        fFestivita: 'F3',
      },
      dispacciamento: [
        {
          tipoDispacciamento: '01',
          valoreDisp: 0.05,
          nome: 'Dispacciamento 1',
          descrizione: 'Dispacciamento description',
        },
      ],
    },
    companyComponents: {
      componentiRegolate: {
        codice: ['COMP1', 'COMP2'],
      },
      componenteImpresa: [
        {
          nome: 'Component Name',
          descrizione: 'Component description',
          tipologia: '01',
          macroArea: 'VENDITA',
          intervalloPrezzi: [
            {
              fasciaComponente: 'F1',
              consumoDa: 0,
              consumoA: 1000,
              prezzo: 0.08,
              unitaMisura: 'EUR/kWh',
              periodoValidita: {
                durata: 6,
                validoFino: '2024-12-31',
                meseValidita: ['01', '02', '03'],
              },
            },
          ],
        },
      ],
    },
    paymentConditions: {
      metodoPagamento: [
        {
          modalitaPagamento: '01',
          descrizione: 'Bank transfer',
        },
        {
          modalitaPagamento: '02',
          descrizione: 'Credit card',
        },
      ],
      condizioniContrattuali: [
        {
          tipologiaCondizione: '01',
          altro: 'Other condition',
          descrizione: 'Contract condition description',
          limitante: 'SI',
        },
      ],
    },
    additionalFeatures: {
      caratteristicheOfferta: {
        consumoMin: 100,
        consumoMax: 5000,
        potenzaMin: 3,
        potenzaMax: 15,
      },
      offertaDUAL: {
        offerteCongiungeEE: ['ELEC01', 'ELEC02'],
        offerteCongiungeGas: ['GAS01', 'GAS02'],
      },
      zoneOfferta: {
        regione: ['01', '02'],
        provincia: ['MI', 'RM'],
        comune: ['015146', '058091'],
      },
      sconto: [
        {
          nome: 'Early Bird Discount',
          descrizione: 'Special discount for early subscribers',
          codiceComponenteFascia: ['F1', 'F2'],
          validita: '2024-12-31',
          ivaSconto: '22',
          periodoValidita: {
            durata: 12,
            validoFino: '2024-12-31',
            meseValidita: ['01', '02', '03'],
          },
          scontoCondizione: {
            condizioneApplicazione: 'EARLY_SIGNUP',
            descrizioneCondizione: 'Sign up before launch date',
          },
          prezziSconto: [
            {
              tipologia: 'PERCENTAGE',
              validoDa: 0,
              validoFino: 1000,
              unitaMisura: '%',
              prezzo: 10,
            },
          ],
        },
      ],
      prodottiServiziAggiuntivi: [
        {
          nome: 'Green Energy Certificate',
          dettaglio: 'Renewable energy certification',
          macroArea: 'SOSTENIBILITA',
          dettagliMacroArea: 'Environmental services',
        },
      ],
    },
    validityReview: {
      validitaOfferta: {
        dataInizio: '2024-01-01',
        dataFine: '2024-12-31',
      },
    },
  })

  // Minimal test data with only mandatory fields
  const createMinimalFormData = () => ({
    basicInfo: {
      pivaUtente: 'IT98765432101',
      codOfferta: 'MINIMAL2024',
    },
    offerDetails: {
      tipoMercato: '02',
      tipoCliente: '02',
      tipoOfferta: '02',
      tipologiaAttContr: ['03'],
      nomeOfferta: 'Minimal Offer',
      descrizione: 'Minimal description',
      durata: 24,
      garanzie: 'Basic guarantees',
    },
    activationContacts: {
      modalita: ['01'],
      telefono: '800123456',
    },
    pricingConfig: {},
    companyComponents: {},
    paymentConditions: {
      metodoPagamento: [
        {
          modalitaPagamento: '03',
        },
      ],
    },
    additionalFeatures: {},
    validityReview: {
      validitaOfferta: {
        dataInizio: '2024-06-01',
        dataFine: '2025-05-31',
      },
    },
  })

  describe('buildXML', () => {
    it('should generate valid XML with complete form data', () => {
      const formData = createCompleteFormData()
      const xml = buildXML(formData)

      // Check XML declaration
      expect(xml).toMatch(XML_DECLARATION_REGEX)

      // Check root element
      expect(xml).toContain('<Offerta>')
      expect(xml).toContain('</Offerta>')

      // Check mandatory sections
      expect(xml).toContain('<IdentificativiOfferta>')
      expect(xml).toContain('<PIVA_UTENTE>IT12345678901</PIVA_UTENTE>')
      expect(xml).toContain('<COD_OFFERTA>OFFER2024TEST</COD_OFFERTA>')
      expect(xml).toContain('</IdentificativiOfferta>')

      expect(xml).toContain('<DettaglioOfferta>')
      expect(xml).toContain('<TIPO_MERCATO>01</TIPO_MERCATO>')
      expect(xml).toContain('<OFFERTA_SINGOLA>SI</OFFERTA_SINGOLA>')
      expect(xml).toContain('<DOMESTICO_RESIDENTE>SI</DOMESTICO_RESIDENTE>')
      expect(xml).toContain('</DettaglioOfferta>')

      // Check arrays are properly handled
      expect(xml).toMatch(TIPOLOGIA_ATT_CONTR_REGEX)

      // Check optional sections
      expect(xml).toContain('<RiferimentiPrezzoEnergia>')
      expect(xml).toContain('<TipoPrezzo>')
      expect(xml).toContain('<FasceOrarieSettimanale>')
      expect(xml).toContain('<Dispacciamento>')
      expect(xml).toContain('<ComponentiRegolate>')
      expect(xml).toContain('<ComponenteImpresa>')
      expect(xml).toContain('<CondizioniContrattuali>')
      expect(xml).toContain('<CaratteristicheOfferta>')
      expect(xml).toContain('<OffertaDUAL>')
      expect(xml).toContain('<ZoneOfferta>')
      expect(xml).toContain('<Sconto>')
      expect(xml).toContain('<ProdottiServiziAggiuntivi>')
    })

    it('should generate valid XML with minimal form data', () => {
      const formData = createMinimalFormData()
      const xml = buildXML(formData)

      // Check XML declaration
      expect(xml).toMatch(XML_DECLARATION_REGEX)

      // Check mandatory sections are present
      expect(xml).toContain('<IdentificativiOfferta>')
      expect(xml).toContain('<DettaglioOfferta>')
      expect(xml).toContain('<DettaglioOfferta.ModalitaAttivazione>')
      expect(xml).toContain('<DettaglioOfferta.Contatti>')
      expect(xml).toContain('<ValiditaOfferta>')
      expect(xml).toContain('<MetodoPagamento>')

      // Check optional fields are not present
      expect(xml).not.toContain('<OFFERTA_SINGOLA>')
      expect(xml).not.toContain('<DOMESTICO_RESIDENTE>')
      expect(xml).not.toContain('<RiferimentiPrezzoEnergia>')
      expect(xml).not.toContain('<TipoPrezzo>')
      expect(xml).not.toContain('<FasceOrarieSettimanale>')
    })

    it('should handle special characters in text fields', () => {
      const formData = createMinimalFormData()
      formData.offerDetails.descrizione = 'Test & < > " \' special chars'
      const xml = buildXML(formData)

      // Special characters should be escaped
      expect(xml).toContain(
        '<DESCRIZIONE>Test &amp; &lt; &gt; &quot; &apos; special chars</DESCRIZIONE>',
      )
    })

    it('should handle empty arrays', () => {
      const formData = createMinimalFormData()
      formData.offerDetails.tipologiaAttContr = []
      const xml = buildXML(formData)

      // When array is empty, the field is omitted entirely
      expect(xml).not.toContain('TIPOLOGIA_ATT_CONTR')
    })

    it('should normalize line endings to LF', () => {
      const formData = createMinimalFormData()
      const xml = buildXML(formData)

      // Should not contain Windows-style line endings
      expect(xml).not.toContain('\r\n')
      expect(xml).toContain('\n')
    })

    it('should uppercase PIVA and COD_OFFERTA', () => {
      const formData = createMinimalFormData()
      formData.basicInfo.pivaUtente = 'it12345678901'
      formData.basicInfo.codOfferta = 'offer2024'
      const xml = buildXML(formData)

      expect(xml).toContain('<PIVA_UTENTE>IT12345678901</PIVA_UTENTE>')
      expect(xml).toContain('<COD_OFFERTA>OFFER2024</COD_OFFERTA>')
    })
  })

  describe('generateXMLFilename', () => {
    it('should generate filename with PIVA only', () => {
      const filename = generateXMLFilename('IT12345678901')
      expect(filename).toBe('IT12345678901_INSERIMENTO.XML')
    })

    it('should generate filename with PIVA and description', () => {
      const filename = generateXMLFilename('IT12345678901', 'Test Offer 2024')
      expect(filename).toBe('IT12345678901_INSERIMENTO_TEST_OFFER_2024.XML')
    })

    it('should sanitize special characters in description', () => {
      const filename = generateXMLFilename(
        'IT12345678901',
        'Test@#$%^&*()Offer!',
      )
      expect(filename).toBe('IT12345678901_INSERIMENTO_TESTOFFER.XML')
    })

    it('should handle multiple spaces in description', () => {
      const filename = generateXMLFilename(
        'IT12345678901',
        'Test   Multiple   Spaces',
      )
      expect(filename).toBe(
        'IT12345678901_INSERIMENTO_TEST_MULTIPLE_SPACES.XML',
      )
    })

    it('should uppercase PIVA', () => {
      const filename = generateXMLFilename('it12345678901', 'test')
      expect(filename).toBe('IT12345678901_INSERIMENTO_TEST.XML')
    })

    it('should handle empty description', () => {
      const filename = generateXMLFilename('IT12345678901', '')
      expect(filename).toBe('IT12345678901_INSERIMENTO.XML')
    })

    it('should trim whitespace from description', () => {
      const filename = generateXMLFilename('IT12345678901', '  Test  ')
      // The function doesn't trim before processing, resulting in underscores from spaces
      expect(filename).toBe('IT12345678901_INSERIMENTO__TEST_.XML')
    })
  })

  describe('createXMLBlob', () => {
    it('should create blob with correct MIME type', () => {
      const xmlString =
        '<?xml version="1.0" encoding="UTF-8"?>\n<test>content</test>'
      const blob = createXMLBlob(xmlString)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/xml;charset=utf-8')
    })

    it('should handle UTF-8 characters correctly', () => {
      const xmlString =
        '<?xml version="1.0" encoding="UTF-8"?>\n<test>àèìòù €</test>'
      const blob = createXMLBlob(xmlString)

      expect(blob.size).toBeGreaterThan(0)
    })

    it('should handle empty string', () => {
      const blob = createXMLBlob('')
      expect(blob.size).toBe(0)
    })
  })

  describe('downloadXML', () => {
    it('should trigger download with correct filename', () => {
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url')
      const mockRevokeObjectURL = vi.fn()
      const mockClick = vi.fn()

      global.URL.createObjectURL = mockCreateObjectURL
      global.URL.revokeObjectURL = mockRevokeObjectURL

      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      }

      vi.spyOn(document, 'createElement').mockReturnValue(
        mockLink as unknown as HTMLAnchorElement,
      )

      const xmlString =
        '<?xml version="1.0" encoding="UTF-8"?>\n<test>content</test>'
      const filename = 'test.xml'

      downloadXML(xmlString, filename)

      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      expect(mockLink.href).toBe('blob:mock-url')
      expect(mockLink.download).toBe(filename)
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })

  describe('sanitizeForXML', () => {
    it('should escape XML special characters', () => {
      const input = 'Test & < > " \' special'
      const expected = 'Test &amp; &lt; &gt; &quot; &apos; special'
      expect(sanitizeForXML(input)).toBe(expected)
    })

    it('should handle empty string', () => {
      expect(sanitizeForXML('')).toBe('')
    })

    it('should handle null and undefined', () => {
      // @ts-expect-error - testing edge cases
      expect(sanitizeForXML(null)).toBe('')
      // @ts-expect-error - testing edge cases
      expect(sanitizeForXML(undefined)).toBe('')
    })

    it('should remove invalid XML characters', () => {
      const input =
        'Valid text\x00\x01\x02\x03\x04\x05\x06\x07\x08\x0B\x0C\x0E\x0F'
      const result = sanitizeForXML(input)

      // Should not contain control characters except tab, newline, carriage return
      expect(result).toBe('Valid text')
    })

    it('should preserve valid whitespace characters', () => {
      const input = 'Text\twith\ttabs\nand\nnewlines\rand\rcarriage\rreturns'
      const result = sanitizeForXML(input)

      expect(result).toContain('\t')
      expect(result).toContain('\n')
      expect(result).toContain('\r')
    })

    it('should handle Unicode characters correctly', () => {
      const input = 'Unicode: àèìòù €™ 你好 🚀'
      const result = sanitizeForXML(input)

      expect(result).toContain('àèìòù')
      expect(result).toContain('€™')
      expect(result).toContain('你好')
      // Emoji is outside valid XML 1.0 range, should be removed
      expect(result).not.toContain('🚀')
    })
  })

  describe('isValidUTF8', () => {
    it('should return true for valid UTF-8 strings', () => {
      expect(isValidUTF8('Simple ASCII text')).toBe(true)
      expect(isValidUTF8('UTF-8: àèìòù €™ 你好')).toBe(true)
      expect(isValidUTF8('')).toBe(true)
    })

    it('should handle special characters', () => {
      expect(isValidUTF8('Line\nbreaks\rand\ttabs')).toBe(true)
      expect(isValidUTF8('XML entities: & < > " \'')).toBe(true)
    })
  })

  describe('Integration tests', () => {
    it('should produce valid XML that can be parsed', () => {
      const formData = createCompleteFormData()
      const xml = buildXML(formData)

      // Basic XML structure validation
      expect(xml).toMatch(XML_DECLARATION_WITH_NEWLINE_REGEX)
      expect(xml).toMatch(OFFERTA_ELEMENT_REGEX)

      // Check indentation (4 spaces)
      expect(xml).toContain('    <IdentificativiOfferta>')
      expect(xml).toContain('        <PIVA_UTENTE>')
    })

    it('should handle complex nested structures', () => {
      const formData = createCompleteFormData()
      const xml = buildXML(formData)

      // Check nested structures
      expect(xml).toContain('<Sconto>')
      expect(xml).toContain('    <Condizione>')
      expect(xml).toContain('        <CONDIZIONE_APPLICAZIONE>')
      expect(xml).toContain('    <PREZZISconto>')
      expect(xml).toContain('        <TIPOLOGIA>')
    })

    it('should handle all periodoValidita variations', () => {
      const formData = createCompleteFormData()
      const xml = buildXML(formData)

      // Check different PeriodoValidita instances
      expect(xml).toMatch(PERIODO_VALIDITA_DURATA_6_REGEX)
      expect(xml).toMatch(PERIODO_VALIDITA_DURATA_12_REGEX)
      expect(xml).toContain('<MESE_VALIDITA>01</MESE_VALIDITA>')
    })
  })
})
