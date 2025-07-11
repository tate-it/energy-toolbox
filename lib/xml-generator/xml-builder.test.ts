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
const COMPONENTE_IMPRESA_NOME_REGEX = /<ComponenteImpresa>\s*<NOME>/
const INTERVALLO_PREZZI_FASCIA_REGEX =
  /<IntervalloPrezzi>[\s\S]*?<FASCIA_COMPONENTE>/
const PERIODO_VALIDITA_DURATA_REGEX = /<PeriodoValidita>\s*<DURATA>/
const SCONTO_NOME_REGEX = /<Sconto>\s*<NOME>/
const CONDIZIONE_APPLICAZIONE_REGEX = /<Condizione>\s*<CONDIZIONE_APPLICAZIONE>/
const PREZZI_SCONTO_TIPOLOGIA_REGEX = /<PREZZISconto>\s*<TIPOLOGIA>/

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
      domesticoResidente: '01',
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
      expect(xml).toContain('<DOMESTICO_RESIDENTE>01</DOMESTICO_RESIDENTE>')
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
      expect(filename).toBe('IT12345678901_INSERIMENTO_TEST.XML')
    })

    it('should handle description with only special characters', () => {
      const filename = generateXMLFilename('IT12345678901', '@#$%^&*()')
      expect(filename).toBe('IT12345678901_INSERIMENTO.XML')
    })

    it('should handle description with leading/trailing underscores after sanitization', () => {
      const filename = generateXMLFilename('IT12345678901', '___Test___')
      expect(filename).toBe('IT12345678901_INSERIMENTO_TEST.XML')
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
    const mockCreateObjectURL = vi.fn()
    const mockRevokeObjectURL = vi.fn()
    const mockClick = vi.fn()
    const mockOpen = vi.fn()

    beforeEach(() => {
      mockCreateObjectURL.mockReturnValue('blob:mock-url')
      global.URL.createObjectURL = mockCreateObjectURL
      global.URL.revokeObjectURL = mockRevokeObjectURL
      global.window.open = mockOpen

      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      }

      vi.spyOn(document, 'createElement').mockReturnValue(
        mockLink as unknown as HTMLAnchorElement,
      )

      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.restoreAllMocks()
      vi.useRealTimers()
    })

    it('should trigger download with correct filename and return success', () => {
      const xmlString =
        '<?xml version="1.0" encoding="UTF-8"?>\n<test>content</test>'
      const filename = 'test.xml'

      const result = downloadXML(xmlString, filename)

      expect(result).toEqual({ success: true })
      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      expect(mockClick).toHaveBeenCalled()

      // Fast-forward timers to check cleanup
      vi.advanceTimersByTime(100)
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })

    it('should return error for empty XML content', () => {
      const result = downloadXML('', 'test.xml')

      expect(result).toEqual({
        success: false,
        error: 'Il contenuto XML è vuoto',
      })
      expect(mockCreateObjectURL).not.toHaveBeenCalled()
    })

    it('should return error for empty filename', () => {
      const result = downloadXML('<test>content</test>', '')

      expect(result).toEqual({
        success: false,
        error: 'Il nome del file non è valido',
      })
      expect(mockCreateObjectURL).not.toHaveBeenCalled()
    })

    it('should handle browser without Blob support', () => {
      const originalBlob = window.Blob
      // @ts-expect-error - testing edge case
      window.Blob = undefined

      const result = downloadXML('<test>content</test>', 'test.xml')

      expect(result).toEqual({
        success: false,
        error: 'Il browser non supporta il download di file',
      })

      window.Blob = originalBlob
    })

    it('should use fallback for browsers without download attribute', () => {
      const mockLink = {
        href: '',
        // Note: 'download' property is intentionally missing
      }

      vi.spyOn(document, 'createElement').mockReturnValue(
        mockLink as unknown as HTMLAnchorElement,
      )

      const result = downloadXML('<test>content</test>', 'test.xml')

      expect(result).toEqual({ success: true })
      expect(mockOpen).toHaveBeenCalledWith('blob:mock-url', '_blank')
      expect(mockClick).not.toHaveBeenCalled()
    })

    it('should handle download errors gracefully', () => {
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Mock error')
      })

      const result = downloadXML('<test>content</test>', 'test.xml')

      expect(result).toEqual({
        success: false,
        error: 'Si è verificato un errore durante il download del file',
      })
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

  describe('Offer Type Specific Tests', () => {
    describe('Electricity Offers (Market Type 01)', () => {
      it('should generate valid XML for fixed electricity offer', () => {
        const formData = {
          basicInfo: {
            pivaUtente: 'IT11111111111',
            codOfferta: 'ELEC_FIXED_01',
          },
          offerDetails: {
            tipoMercato: '01', // Electricity
            offertaSingola: 'SI',
            tipoCliente: '01', // Domestic
            domesticoResidente: '01', // Resident
            tipoOfferta: '01', // Fixed
            tipologiaAttContr: ['01', '04'], // Supplier change, Transfer
            nomeOfferta: 'Energia Casa Fixed',
            descrizione: 'Fixed price electricity offer for domestic users',
            durata: 24,
            garanzie: 'Fixed price for 24 months',
          },
          activationContacts: {
            modalita: ['01', '02'], // Web-only, Any channel
            telefono: '800111222',
            urlSitoVenditore: 'https://energy.example.com',
            urlOfferta: 'https://energy.example.com/fixed-offer',
          },
          pricingConfig: {
            riferimentiPrezzoEnergia: {
              idxPrezzoEnergia: '01', // PUN Quarterly
              altro: '',
            },
            tipoPrezzo: {
              tipologiaFasce: '03', // F1, F2, F3
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
                nome: 'Disp. del.111/06',
                descrizione: 'Standard dispatching fee',
              },
            ],
          },
          companyComponents: {
            componentiRegolate: {
              codice: ['01', '02'], // PCV, PPE
            },
            componenteImpresa: [
              {
                nome: 'Commercializzazione',
                descrizione: 'Fixed commercialization fee',
                tipologia: '01',
                macroArea: '01',
                intervalloPrezzi: [
                  {
                    prezzo: 5.5,
                    unitaMisura: '01', // €/Year
                  },
                ],
              },
            ],
          },
          paymentConditions: {
            metodoPagamento: [
              {
                modalitaPagamento: '01', // Bank direct debit
              },
            ],
            condizioniContrattuali: [
              {
                tipologiaCondizione: '01', // Activation
                descrizione: 'Standard activation fee waived',
                limitante: '02', // Not limiting
              },
            ],
          },
          additionalFeatures: {
            caratteristicheOfferta: {
              potenzaMin: 3,
              potenzaMax: 15,
            },
          },
          validityReview: {
            validitaOfferta: {
              dataInizio: '2024-01-01 00:00:00',
              dataFine: '2024-12-31 23:59:59',
            },
          },
        }

        const xml = buildXML(formData)

        // Check electricity-specific fields
        expect(xml).toContain('<TIPO_MERCATO>01</TIPO_MERCATO>')
        expect(xml).toContain('<DOMESTICO_RESIDENTE>01</DOMESTICO_RESIDENTE>')
        expect(xml).toContain('<TIPO_OFFERTA>01</TIPO_OFFERTA>')

        // Check energy price references
        expect(xml).toContain('<RiferimentiPrezzoEnergia>')
        expect(xml).toContain('<IDX_PREZZO_ENERGIA>01</IDX_PREZZO_ENERGIA>')

        // Check time bands
        expect(xml).toContain('<TipoPrezzo>')
        expect(xml).toContain('<TIPOLOGIA_FASCE>03</TIPOLOGIA_FASCE>')
        expect(xml).toContain('<FasceOrarieSettimanale>')

        // Check regulated components for electricity
        expect(xml).toContain('<ComponentiRegolate>')
        expect(xml).toContain('<CODICE>01</CODICE>')
        expect(xml).toContain('<CODICE>02</CODICE>')

        // Check power characteristics
        expect(xml).toContain('<CaratteristicheOfferta>')
        expect(xml).toContain('<POTENZA_MIN>3</POTENZA_MIN>')
        expect(xml).toContain('<POTENZA_MAX>15</POTENZA_MAX>')
      })

      it('should generate valid XML for variable electricity offer', () => {
        const formData = createMinimalFormData()
        formData.offerDetails.tipoMercato = '01' // Electricity
        formData.offerDetails.tipoOfferta = '02' // Variable
        formData.offerDetails.tipoCliente = '02' // Other uses
        formData.pricingConfig = {
          riferimentiPrezzoEnergia: {
            idxPrezzoEnergia: '12', // PUN Monthly
          },
          tipoPrezzo: {
            tipologiaFasce: '01', // Monorario
          },
        }

        const xml = buildXML(formData)

        expect(xml).toContain('<TIPO_MERCATO>01</TIPO_MERCATO>')
        expect(xml).toContain('<TIPO_OFFERTA>02</TIPO_OFFERTA>')
        expect(xml).toContain('<TIPO_CLIENTE>02</TIPO_CLIENTE>')
        expect(xml).toContain('<IDX_PREZZO_ENERGIA>12</IDX_PREZZO_ENERGIA>')
        expect(xml).toContain('<TIPOLOGIA_FASCE>01</TIPOLOGIA_FASCE>')

        // Should not have time band details for monorario
        expect(xml).not.toContain('<FasceOrarieSettimanale>')
      })

      it('should generate valid XML for FLAT electricity offer', () => {
        const formData = createMinimalFormData()
        formData.offerDetails.tipoMercato = '01' // Electricity
        formData.offerDetails.tipoOfferta = '03' // FLAT
        formData.additionalFeatures = {
          caratteristicheOfferta: {
            consumoMin: 1000,
            consumoMax: 3000,
            potenzaMin: 3,
            potenzaMax: 6,
          },
        }

        const xml = buildXML(formData)

        expect(xml).toContain('<TIPO_OFFERTA>03</TIPO_OFFERTA>')

        // FLAT offers require consumption limits
        expect(xml).toContain('<CaratteristicheOfferta>')
        expect(xml).toContain('<CONSUMO_MIN>1000</CONSUMO_MIN>')
        expect(xml).toContain('<CONSUMO_MAX>3000</CONSUMO_MAX>')
        expect(xml).toContain('<POTENZA_MIN>3</POTENZA_MIN>')
        expect(xml).toContain('<POTENZA_MAX>6</POTENZA_MAX>')
      })
    })

    describe('Gas Offers (Market Type 02)', () => {
      it('should generate valid XML for fixed gas offer', () => {
        const formData = {
          basicInfo: {
            pivaUtente: 'IT22222222222',
            codOfferta: 'GAS_FIXED_01',
          },
          offerDetails: {
            tipoMercato: '02', // Gas
            tipoCliente: '01', // Domestic
            tipoOfferta: '01', // Fixed
            tipologiaAttContr: ['01'], // Supplier change
            nomeOfferta: 'Gas Casa Fixed',
            descrizione: 'Fixed price gas offer for domestic users',
            durata: 12,
            garanzie: 'Fixed price guarantee',
          },
          activationContacts: {
            modalita: ['02'], // Any channel
            telefono: '800222333',
          },
          pricingConfig: {
            riferimentiPrezzoEnergia: {
              idxPrezzoEnergia: '03', // PSV Quarterly
            },
          },
          companyComponents: {
            componentiRegolate: {
              codice: ['03', '04', '05'], // CCR, CPR, GRAD
            },
            componenteImpresa: [
              {
                nome: 'Commercializzazione gas',
                descrizione: 'Fixed fee for gas',
                tipologia: '01',
                macroArea: '01',
                intervalloPrezzi: [
                  {
                    prezzo: 60,
                    unitaMisura: '01', // €/Year
                  },
                ],
              },
            ],
          },
          paymentConditions: {
            metodoPagamento: [
              {
                modalitaPagamento: '02', // Postal direct debit
              },
            ],
          },
          additionalFeatures: {},
          validityReview: {
            validitaOfferta: {
              dataInizio: '2024-01-01 00:00:00',
              dataFine: '2024-12-31 23:59:59',
            },
          },
        }

        const xml = buildXML(formData)

        // Check gas-specific fields
        expect(xml).toContain('<TIPO_MERCATO>02</TIPO_MERCATO>')

        // Should not have electricity-specific fields
        expect(xml).not.toContain('<OFFERTA_SINGOLA>')
        expect(xml).not.toContain('<DOMESTICO_RESIDENTE>')
        expect(xml).not.toContain('<TipoPrezzo>')
        expect(xml).not.toContain('<FasceOrarieSettimanale>')

        // Check gas-specific regulated components
        expect(xml).toContain('<CODICE>03</CODICE>')
        expect(xml).toContain('<CODICE>04</CODICE>')
        expect(xml).toContain('<CODICE>05</CODICE>')
      })

      it('should generate valid XML for residential condominium gas offer', () => {
        const formData = createMinimalFormData()
        formData.offerDetails.tipoMercato = '02' // Gas
        formData.offerDetails.tipoCliente = '03' // Residential Condominium
        formData.offerDetails.tipoOfferta = '02' // Variable
        formData.pricingConfig = {
          riferimentiPrezzoEnergia: {
            idxPrezzoEnergia: '14', // PSV Monthly
          },
        }

        const xml = buildXML(formData)

        expect(xml).toContain('<TIPO_MERCATO>02</TIPO_MERCATO>')
        expect(xml).toContain('<TIPO_CLIENTE>03</TIPO_CLIENTE>')
        expect(xml).toContain('<IDX_PREZZO_ENERGIA>14</IDX_PREZZO_ENERGIA>')
      })
    })

    describe('Dual Fuel Offers (Market Type 03)', () => {
      it('should generate valid XML for dual fuel offer', () => {
        const formData = {
          basicInfo: {
            pivaUtente: 'IT33333333333',
            codOfferta: 'DUAL_01',
          },
          offerDetails: {
            tipoMercato: '03', // Dual Fuel
            tipoCliente: '01', // Domestic
            tipoOfferta: '01', // Fixed
            tipologiaAttContr: ['01', '99'], // Supplier change, Always
            nomeOfferta: 'Dual Energy Home',
            descrizione: 'Combined electricity and gas offer',
            durata: 24,
            garanzie: 'Fixed price for both commodities',
          },
          activationContacts: {
            modalita: ['02', '03'], // Any channel, Point of sale
            descrizioneModalita: 'Available through all channels',
            telefono: '800333444',
          },
          pricingConfig: {},
          companyComponents: {},
          paymentConditions: {
            metodoPagamento: [
              {
                modalitaPagamento: '01', // Bank direct debit
              },
            ],
          },
          additionalFeatures: {
            offertaDUAL: {
              offerteCongiungeEE: ['ELEC_BASE_01', 'ELEC_GREEN_01'],
              offerteCongiungeGas: ['GAS_BASE_01', 'GAS_ECO_01'],
            },
          },
          validityReview: {
            validitaOfferta: {
              dataInizio: '2024-01-01 00:00:00',
              dataFine: '2024-12-31 23:59:59',
            },
          },
        }

        const xml = buildXML(formData)

        // Check dual fuel specific fields
        expect(xml).toContain('<TIPO_MERCATO>03</TIPO_MERCATO>')

        // Dual fuel requires linked offer codes
        expect(xml).toContain('<OffertaDUAL>')
        expect(xml).toContain(
          '<OFFERTE_CONGIUNTE_EE>ELEC_BASE_01</OFFERTE_CONGIUNTE_EE>',
        )
        expect(xml).toContain(
          '<OFFERTE_CONGIUNTE_EE>ELEC_GREEN_01</OFFERTE_CONGIUNTE_EE>',
        )
        expect(xml).toContain(
          '<OFFERTE_CONGIUNTE_GAS>GAS_BASE_01</OFFERTE_CONGIUNTE_GAS>',
        )
        expect(xml).toContain(
          '<OFFERTE_CONGIUNTE_GAS>GAS_ECO_01</OFFERTE_CONGIUNTE_GAS>',
        )
      })
    })
  })

  describe('Complex Configuration Tests', () => {
    it('should handle all time band configurations correctly', () => {
      const formData = createCompleteFormData()
      formData.pricingConfig.tipoPrezzo = {
        tipologiaFasce: '07', // Peak/OffPeak
      }
      formData.pricingConfig.fasceOrarieSettimanale = {
        fLunedi: 'Peak',
        fMartedi: 'Peak',
        fMercoledi: 'Peak',
        fGiovedi: 'Peak',
        fVenerdi: 'Peak',
        fSabato: 'OffPeak',
        fDomenica: 'OffPeak',
        fFestivita: 'OffPeak',
      }

      const xml = buildXML(formData)

      expect(xml).toContain('<TIPOLOGIA_FASCE>07</TIPOLOGIA_FASCE>')
      expect(xml).toContain('<F_LUNEDI>Peak</F_LUNEDI>')
      expect(xml).toContain('<F_SABATO>OffPeak</F_SABATO>')
    })

    it('should handle multiple dispatching configurations', () => {
      const formData = createCompleteFormData()
      formData.pricingConfig.dispacciamento = [
        {
          tipoDispacciamento: '01',
          nome: 'Disp standard',
          valoreDisp: 0,
          descrizione: '',
        },
        {
          tipoDispacciamento: '02',
          nome: 'PD',
          valoreDisp: 0,
          descrizione: '',
        },
        {
          tipoDispacciamento: '99',
          valoreDisp: 0.15,
          nome: 'Custom dispatching',
          descrizione: 'Custom dispatching fee',
        },
      ]

      const xml = buildXML(formData)

      expect(xml).toContain('<TIPO_DISPACCIAMENTO>01</TIPO_DISPACCIAMENTO>')
      expect(xml).toContain('<TIPO_DISPACCIAMENTO>02</TIPO_DISPACCIAMENTO>')
      expect(xml).toContain('<TIPO_DISPACCIAMENTO>99</TIPO_DISPACCIAMENTO>')
      expect(xml).toContain('<VALORE_DISP>0.15</VALORE_DISP>')
    })

    it('should handle complex discount structures', () => {
      const formData = createCompleteFormData()
      formData.additionalFeatures.sconto = [
        {
          nome: 'Welcome Bonus',
          descrizione: 'First year discount',
          codiceComponenteFascia: ['01', '02'], // PCV, PPE
          validita: '01', // Entry
          ivaSconto: '01', // Yes
          periodoValidita: {
            durata: 12,
            validoFino: '2024-12-31',
            meseValidita: ['01', '02', '03'],
          },
          scontoCondizione: {
            condizioneApplicazione: '01', // Electronic billing
            descrizioneCondizione: '',
          },
          prezziSconto: [
            {
              tipologia: '01', // Fixed discount
              validoDa: 0,
              validoFino: 0,
              prezzo: 50,
              unitaMisura: '05', // €
            },
          ],
        },
        {
          nome: 'Loyalty Discount',
          descrizione: 'Long term customer discount',
          codiceComponenteFascia: [],
          validita: '03', // Beyond 12 months
          ivaSconto: '02', // No
          periodoValidita: {
            durata: 24,
            validoFino: '2025-12-31',
            meseValidita: ['01', '02', '03', '04', '05', '06'],
          },
          scontoCondizione: {
            condizioneApplicazione: '03', // Electronic billing + bank debit
            descrizioneCondizione: '',
          },
          prezziSconto: [
            {
              tipologia: '03',
              validoDa: 0,
              validoFino: 1000,
              prezzo: 5,
              unitaMisura: '06', // Percentage
            },
            {
              tipologia: '03',
              validoDa: 1001,
              validoFino: 5000,
              prezzo: 10,
              unitaMisura: '06',
            },
          ],
        },
      ]

      const xml = buildXML(formData)

      // Check first discount
      expect(xml).toContain('<NOME>Welcome Bonus</NOME>')
      expect(xml).toContain(
        '<CODICE_COMPONENTE_FASCIA>01</CODICE_COMPONENTE_FASCIA>',
      )
      expect(xml).toContain('<VALIDITA>01</VALIDITA>')
      expect(xml).toContain('<IVA_SCONTO>01</IVA_SCONTO>')

      // Check second discount with period validity
      expect(xml).toContain('<NOME>Loyalty Discount</NOME>')
      expect(xml).toContain('<VALIDITA>03</VALIDITA>')
      expect(xml).toContain('<DURATA>24</DURATA>')

      // Check price ranges
      expect(xml).toContain('<VALIDO_DA>0</VALIDO_DA>')
      expect(xml).toContain('<VALIDO_FINO>1000</VALIDO_FINO>')
      expect(xml).toContain('<VALIDO_DA>1001</VALIDO_DA>')
      expect(xml).toContain('<VALIDO_FINO>5000</VALIDO_FINO>')
    })

    it('should handle zone restrictions', () => {
      const formData = createCompleteFormData()
      formData.additionalFeatures.zoneOfferta = {
        regione: ['03', '09', '12'], // Lombardia, Toscana, Lazio
        provincia: ['015', '048', '058'], // Milano, Firenze, Roma
        comune: ['015146', '048017', '058091'], // Milano, Firenze, Roma
      }

      const xml = buildXML(formData)

      expect(xml).toContain('<ZoneOfferta>')
      expect(xml).toContain('<REGIONE>03</REGIONE>')
      expect(xml).toContain('<REGIONE>09</REGIONE>')
      expect(xml).toContain('<REGIONE>12</REGIONE>')
      expect(xml).toContain('<PROVINCIA>015</PROVINCIA>')
      expect(xml).toContain('<COMUNE>015146</COMUNE>')
    })

    it('should handle additional products and services', () => {
      const formData = createCompleteFormData()
      formData.additionalFeatures.prodottiServiziAggiuntivi = [
        {
          nome: 'Smart Thermostat',
          dettaglio: 'WiFi enabled smart thermostat',
          macroArea: '05', // Air conditioning
          dettagliMacroArea: '',
        },
        {
          nome: 'Solar Panels',
          dettaglio: 'Rooftop solar installation',
          macroArea: '04', // Photovoltaic
          dettagliMacroArea: '',
        },
        {
          nome: 'Custom Service',
          dettaglio: 'Special custom service',
          macroArea: '99', // Other
          dettagliMacroArea: 'Energy consulting services',
        },
      ]

      const xml = buildXML(formData)

      expect(xml).toContain('<NOME>Smart Thermostat</NOME>')
      expect(xml).toContain('<MACROAREA>05</MACROAREA>')
      expect(xml).toContain('<NOME>Solar Panels</NOME>')
      expect(xml).toContain('<MACROAREA>04</MACROAREA>')
      expect(xml).toContain('<NOME>Custom Service</NOME>')
      expect(xml).toContain('<MACROAREA>99</MACROAREA>')
      expect(xml).toContain(
        '<DETTAGLI_MACROAREA>Energy consulting services</DETTAGLI_MACROAREA>',
      )
    })
  })

  describe('Conditional Field Requirements', () => {
    it('should include required fields when activation method is OTHER', () => {
      const formData = {
        ...createMinimalFormData(),
        activationContacts: {
          modalita: ['99'], // Other
          telefono: '800123456',
          descrizioneModalita: 'Door-to-door sales',
        },
      }

      const xml = buildXML(formData)

      expect(xml).toContain('<MODALITA>99</MODALITA>')
      expect(xml).toContain('<DESCRIZIONE>Door-to-door sales</DESCRIZIONE>')
    })

    it('should include required fields when payment method is OTHER', () => {
      const formData = {
        ...createMinimalFormData(),
        paymentConditions: {
          metodoPagamento: [
            {
              modalitaPagamento: '99', // Other
              descrizione: 'Cryptocurrency payment',
            },
          ],
        },
      }

      const xml = buildXML(formData)

      expect(xml).toContain('<MODALITA_PAGAMENTO>99</MODALITA_PAGAMENTO>')
      expect(xml).toContain('<DESCRIZIONE>Cryptocurrency payment</DESCRIZIONE>')
    })

    it('should include required fields when energy price index is OTHER', () => {
      const formData = createMinimalFormData()
      formData.pricingConfig = {
        riferimentiPrezzoEnergia: {
          idxPrezzoEnergia: '99', // Other
          altro: 'Custom energy index based on renewable sources',
        },
      }

      const xml = buildXML(formData)

      expect(xml).toContain('<IDX_PREZZO_ENERGIA>99</IDX_PREZZO_ENERGIA>')
      expect(xml).toContain(
        '<ALTRO>Custom energy index based on renewable sources</ALTRO>',
      )
    })

    it('should include required fields when contractual condition is OTHER', () => {
      const formData = {
        ...createMinimalFormData(),
        paymentConditions: {
          ...createMinimalFormData().paymentConditions,
          condizioniContrattuali: [
            {
              tipologiaCondizione: '99', // Other
              altro: 'Special loyalty program',
              descrizione: 'Points-based rewards system',
              limitante: '02',
            },
          ],
        },
      }

      const xml = buildXML(formData)

      expect(xml).toContain('<TIPOLOGIA_CONDIZIONE>99</TIPOLOGIA_CONDIZIONE>')
      expect(xml).toContain('<ALTRO>Special loyalty program</ALTRO>')
    })
  })

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle indeterminate duration (-1)', () => {
      const formData = createMinimalFormData()
      formData.offerDetails.durata = -1

      const xml = buildXML(formData)

      expect(xml).toContain('<DURATA>-1</DURATA>')
    })

    it('should handle maximum duration (99 months)', () => {
      const formData = createMinimalFormData()
      formData.offerDetails.durata = 99

      const xml = buildXML(formData)

      expect(xml).toContain('<DURATA>99</DURATA>')
    })

    it('should handle offers with no optional sections', () => {
      const formData = {
        basicInfo: {
          pivaUtente: 'IT00000000000',
          codOfferta: 'BARE_MINIMUM',
        },
        offerDetails: {
          tipoMercato: '02', // Gas
          tipoCliente: '02', // Other uses
          tipoOfferta: '01', // Fixed
          tipologiaAttContr: ['99'], // Always
          nomeOfferta: 'Bare Minimum',
          descrizione: 'Minimal offer',
          durata: 12,
          garanzie: 'None',
        },
        activationContacts: {
          modalita: ['02'], // Any channel
          telefono: '800000000',
        },
        pricingConfig: {},
        companyComponents: {},
        paymentConditions: {
          metodoPagamento: [
            {
              modalitaPagamento: '04', // Pre-filled bulletin
            },
          ],
        },
        additionalFeatures: {},
        validityReview: {
          validitaOfferta: {
            dataInizio: '2024-01-01 00:00:00',
            dataFine: '2024-12-31 23:59:59',
          },
        },
      }

      const xml = buildXML(formData)

      // Should have all mandatory sections
      expect(xml).toContain('<IdentificativiOfferta>')
      expect(xml).toContain('<DettaglioOfferta>')
      expect(xml).toContain('<DettaglioOfferta.ModalitaAttivazione>')
      expect(xml).toContain('<DettaglioOfferta.Contatti>')
      expect(xml).toContain('<ValiditaOfferta>')
      expect(xml).toContain('<MetodoPagamento>')

      // Should not have any optional sections
      expect(xml).not.toContain('<RiferimentiPrezzoEnergia>')
      expect(xml).not.toContain('<CaratteristicheOfferta>')
      expect(xml).not.toContain('<OffertaDUAL>')
      expect(xml).not.toContain('<ComponentiRegolate>')
      expect(xml).not.toContain('<TipoPrezzo>')
      expect(xml).not.toContain('<ComponenteImpresa>')
      expect(xml).not.toContain('<CondizioniContrattuali>')
      expect(xml).not.toContain('<ZoneOfferta>')
      expect(xml).not.toContain('<Sconto>')
      expect(xml).not.toContain('<ProdottiServiziAggiuntivi>')
    })

    it('should handle offers with all limiting conditions', () => {
      const formData = {
        ...createMinimalFormData(),
        paymentConditions: {
          ...createMinimalFormData().paymentConditions,
          condizioniContrattuali: [
            {
              tipologiaCondizione: '01',
              descrizione: 'Activation fee required',
              limitante: '01', // Yes, limiting
            },
            {
              tipologiaCondizione: '04',
              descrizione: 'Multi-year contract required',
              limitante: '01', // Yes, limiting
            },
            {
              tipologiaCondizione: '05',
              descrizione: 'Early withdrawal penalty applies',
              limitante: '01', // Yes, limiting
            },
          ],
        },
      }

      const xml = buildXML(formData)

      // All conditions should be marked as limiting
      const limitingMatches = xml.match(/<LIMITANTE>01<\/LIMITANTE>/g)
      expect(limitingMatches).toHaveLength(3)
    })

    it('should handle very long text fields with proper escaping', () => {
      const longText = `${'A'.repeat(1000)} & < > " ' special chars`
      const formData = createMinimalFormData()
      formData.offerDetails.descrizione = longText
      formData.offerDetails.garanzie = longText

      const xml = buildXML(formData)

      // Check that long text is included and properly escaped
      expect(xml).toContain(
        `${'A'.repeat(1000)} &amp; &lt; &gt; &quot; &apos; special chars`,
      )
    })

    it('should handle all activation types combination', () => {
      const formData = createMinimalFormData()
      formData.offerDetails.tipologiaAttContr = ['01', '02', '03', '04', '99']

      const xml = buildXML(formData)

      expect(xml).toContain('<TIPOLOGIA_ATT_CONTR>01</TIPOLOGIA_ATT_CONTR>')
      expect(xml).toContain('<TIPOLOGIA_ATT_CONTR>02</TIPOLOGIA_ATT_CONTR>')
      expect(xml).toContain('<TIPOLOGIA_ATT_CONTR>03</TIPOLOGIA_ATT_CONTR>')
      expect(xml).toContain('<TIPOLOGIA_ATT_CONTR>04</TIPOLOGIA_ATT_CONTR>')
      expect(xml).toContain('<TIPOLOGIA_ATT_CONTR>99</TIPOLOGIA_ATT_CONTR>')
    })
  })

  describe('XML Structure Validation', () => {
    it('should maintain correct element ordering according to XSD', () => {
      const formData = createCompleteFormData()
      const xml = buildXML(formData)

      // Convert to single line for easier position checking
      const singleLineXml = xml.replace(/\n/g, ' ').replace(/\s+/g, ' ')

      // Check that elements appear in the correct order
      const identOffset = singleLineXml.indexOf('<IdentificativiOfferta>')
      const dettaglioOffset = singleLineXml.indexOf('<DettaglioOfferta>')
      const modalitaOffset = singleLineXml.indexOf(
        '<DettaglioOfferta.ModalitaAttivazione>',
      )
      const contattiOffset = singleLineXml.indexOf(
        '<DettaglioOfferta.Contatti>',
      )
      const validitaOffset = singleLineXml.indexOf('<ValiditaOfferta>')
      const pagamentoOffset = singleLineXml.indexOf('<MetodoPagamento>')

      expect(identOffset).toBeLessThan(dettaglioOffset)
      expect(dettaglioOffset).toBeLessThan(modalitaOffset)
      expect(modalitaOffset).toBeLessThan(contattiOffset)
      expect(contattiOffset).toBeLessThan(validitaOffset)
      expect(validitaOffset).toBeLessThan(pagamentoOffset)
    })

    it('should properly nest all sub-elements', () => {
      const formData = createCompleteFormData()
      const xml = buildXML(formData)

      // Check proper nesting of complex structures
      expect(xml).toMatch(COMPONENTE_IMPRESA_NOME_REGEX)
      expect(xml).toMatch(INTERVALLO_PREZZI_FASCIA_REGEX)
      expect(xml).toMatch(PERIODO_VALIDITA_DURATA_REGEX)
      expect(xml).toMatch(SCONTO_NOME_REGEX)
      expect(xml).toMatch(CONDIZIONE_APPLICAZIONE_REGEX)
      expect(xml).toMatch(PREZZI_SCONTO_TIPOLOGIA_REGEX)
    })

    it('should handle timestamp formatting correctly', () => {
      const formData = createMinimalFormData()
      formData.validityReview.validitaOfferta = {
        dataInizio: '2024-01-15 10:30:45',
        dataFine: '2024-12-31 23:59:59',
      }

      const xml = buildXML(formData)

      expect(xml).toContain('<DATA_INIZIO>2024-01-15 10:30:45</DATA_INIZIO>')
      expect(xml).toContain('<DATA_FINE>2024-12-31 23:59:59</DATA_FINE>')
    })

    it('should handle month/year formatting correctly', () => {
      const formData = createCompleteFormData()
      formData.companyComponents.componenteImpresa[0].intervalloPrezzi[0].periodoValidita =
        {
          ...formData.companyComponents.componenteImpresa[0].intervalloPrezzi[0]
            .periodoValidita,
          validoFino: '12/2024',
        }

      const xml = buildXML(formData)

      expect(xml).toContain('<VALIDO_FINO>12/2024</VALIDO_FINO>')
    })
  })
})
