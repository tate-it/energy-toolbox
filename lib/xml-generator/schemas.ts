import { z } from 'zod'
import { getFormContext } from './resolver'

// Basic Information Schema - matching SII specification
export const basicInfoSchema = z.object({
  pivaUtente: z
    .string()
    .min(11, 'La PIVA deve contenere almeno 11 caratteri')
    .max(16, 'La PIVA non può superare i 16 caratteri')
    .regex(
      /^[A-Z0-9]+$/,
      'La PIVA deve contenere solo lettere maiuscole e numeri',
    ),
  codOfferta: z
    .string()
    .min(1, 'Il codice offerta è obbligatorio')
    .max(32, 'Il codice offerta non può superare i 32 caratteri')
    .regex(
      /^[A-Z0-9]+$/,
      'Il codice offerta deve contenere solo lettere maiuscole e numeri',
    ),
})

// Offer Details Schema - matching SII specification
export const offerDetailsSchema = z
  .object({
    // Market type (TIPO_MERCATO) - mandatory
    marketType: z.enum(['01', '02', '03'], {
      invalid_type_error: 'Seleziona un tipo di mercato',
      required_error: 'Seleziona un tipo di mercato',
    }),

    // Single offer (OFFERTA_SINGOLA) - mandatory if marketType is not '03' (Dual Fuel)
    singleOffer: z.enum(['SI', 'NO']).optional(),

    // Client type (TIPO_CLIENTE) - mandatory
    clientType: z.enum(['01', '02', '03'], {
      invalid_type_error: 'Seleziona un tipo di cliente',
      required_error: 'Seleziona un tipo di cliente',
    }),

    // Residential status (DOMESTICO_RESIDENTE) - optional
    residentialStatus: z.enum(['01', '02', '03']).optional(),

    // Offer type (TIPO_OFFERTA) - mandatory
    offerType: z.enum(['01', '02', '03'], {
      invalid_type_error: 'Seleziona un tipo di offerta',
      required_error: 'Seleziona un tipo di offerta',
    }),

    // Contract activation types (TIPOLOGIA_ATT_CONTR) - mandatory, can be multiple
    contractActivationTypes: z
      .array(z.enum(['01', '02', '03', '04', '99']))
      .min(1, 'Seleziona almeno un tipo di attivazione contratto'),

    // Offer name (NOME_OFFERTA) - mandatory
    offerName: z
      .string()
      .min(1, "Il nome dell'offerta è obbligatorio")
      .max(255, "Il nome dell'offerta non può superare i 255 caratteri"),

    // Offer description (DESCRIZIONE) - mandatory
    offerDescription: z
      .string()
      .min(1, "La descrizione dell'offerta è obbligatoria")
      .max(
        3000,
        "La descrizione dell'offerta non può superare i 3000 caratteri",
      ),

    // Duration in months (DURATA) - mandatory
    duration: z
      .number()
      .int()
      .min(
        -1,
        'La durata deve essere -1 per durata indeterminata o un valore da 1 a 99',
      )
      .max(99, 'La durata non può superare i 99 mesi'),

    // Guarantees (GARANZIE) - mandatory
    guarantees: z
      .string()
      .min(1, 'Le garanzie sono obbligatorie')
      .max(3000, 'Le garanzie non possono superare i 3000 caratteri'),
  })
  .refine(
    (data) => {
      // OFFERTA_SINGOLA is mandatory if TIPO_MERCATO is not '03' (Dual Fuel)
      if (data.marketType !== '03' && !data.singleOffer) {
        return false
      }
      return true
    },
    {
      message: "L'offerta singola è obbligatoria per i mercati Elettrico e Gas",
      path: ['singleOffer'],
    },
  )

// Activation & Contacts Schema - matching SII specification
export const activationContactsSchema = z
  .object({
    // Activation methods (MODALITA) - mandatory, multiple selection allowed
    activationMethods: z
      .array(z.enum(['01', '02', '03', '04', '05', '99']))
      .min(1, 'Seleziona almeno un metodo di attivazione'),

    // Activation description (DESCRIZIONE) - mandatory when "Other" (99) is selected
    activationDescription: z
      .string()
      .max(2000, 'La descrizione non può superare i 2000 caratteri')
      .optional(),

    // Contact Information
    // Phone number (TELEFONO) - mandatory
    phone: z
      .string()
      .min(1, 'Il numero di telefono è obbligatorio')
      .max(15, 'Il numero di telefono non può superare i 15 caratteri')
      .regex(
        /^[\d\s\-+()]+$/,
        'Il numero di telefono può contenere solo numeri, spazi, trattini, più e parentesi',
      ),

    // Vendor website (URL_SITO_VENDITORE) - mandatory if available
    vendorWebsite: z
      .string()
      .max(100, "L'URL del sito venditore non può superare i 100 caratteri")
      .url('Inserisci un URL valido')
      .optional()
      .or(z.literal('')),

    // Offer URL (URL_OFFERTA) - mandatory if available
    offerUrl: z
      .string()
      .max(100, "L'URL dell'offerta non può superare i 100 caratteri")
      .url('Inserisci un URL valido')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      // activationDescription is mandatory when "Other" (99) is selected
      if (
        data.activationMethods.includes('99') &&
        (!data.activationDescription ||
          data.activationDescription.trim() === '')
      ) {
        return false
      }
      return true
    },
    {
      message:
        'La descrizione del metodo di attivazione è obbligatoria quando si seleziona "Altro"',
      path: ['activationDescription'],
    },
  )

// Pricing Configuration Schema - matching SII specification
export const pricingConfigSchema = z
  .object({
    // Energy Price References (RiferimentiPrezzoEnergia)
    // This section is mandatory only if TIPO_OFFERTA = 02 (Variable) and SCONTO/TIPOLOGIA is not 04
    energyPriceIndex: z
      .enum([
        // Quarterly
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        // Bimonthly
        '08',
        '09',
        '10',
        '11',
        // Monthly
        '12',
        '13',
        '14',
        '15',
        // Other
        '99',
      ])
      .optional(),

    // Alternative index description (ALTRO) - mandatory when energyPriceIndex = 99
    alternativeIndexDescription: z
      .string()
      .max(3000, 'La descrizione non può superare i 3000 caratteri')
      .optional(),

    // Price Type (TipoPrezzo)
    // Time band configuration (TIPOLOGIA_FASCE) - mandatory if TIPO_MERCATO = 01 (Electricity) and TIPO_OFFERTA ≠ 03 (not FLAT)
    timeBandConfiguration: z
      .enum(['01', '02', '03', '04', '05', '06', '07', '91', '92', '93'])
      .optional(),

    // Weekly Time Bands (FasceOrarieSettimanale)
    // Mandatory if TIPOLOGIA_FASCE = 02 or 04 or 05 or 06
    weeklyTimeBands: z
      .object({
        monday: z
          .string()
          .max(49, 'Il formato non può superare i 49 caratteri')
          .optional(),
        tuesday: z
          .string()
          .max(49, 'Il formato non può superare i 49 caratteri')
          .optional(),
        wednesday: z
          .string()
          .max(49, 'Il formato non può superare i 49 caratteri')
          .optional(),
        thursday: z
          .string()
          .max(49, 'Il formato non può superare i 49 caratteri')
          .optional(),
        friday: z
          .string()
          .max(49, 'Il formato non può superare i 49 caratteri')
          .optional(),
        saturday: z
          .string()
          .max(49, 'Il formato non può superare i 49 caratteri')
          .optional(),
        sunday: z
          .string()
          .max(49, 'Il formato non può superare i 49 caratteri')
          .optional(),
        holidays: z
          .string()
          .max(49, 'Il formato non può superare i 49 caratteri')
          .optional(),
      })
      .optional(),

    // Dispatching (Dispacciamento)
    // Mandatory if TIPO_MERCATO = 01 (Electricity), can occur multiple times
    dispatching: z
      .array(
        z.object({
          // Dispatching type (TIPO_DISPACCIAMENTO) - mandatory
          dispatchingType: z.enum(
            [
              '01',
              '02',
              '03',
              '04',
              '05',
              '06',
              '07',
              '08',
              '09',
              '10',
              '11',
              '12',
              '13',
              '99',
            ],
            {
              required_error: 'Seleziona un tipo di dispacciamento',
            },
          ),

          // Dispatching value (VALORE_DISP) - mandatory if TIPO_DISPACCIAMENTO = 99
          dispatchingValue: z
            .number()
            .min(0, 'Il valore deve essere maggiore o uguale a 0')
            .max(9_999_999, 'Il valore non può superare 9999999')
            .optional(),

          // Component name (NOME) - mandatory
          componentName: z
            .string()
            .min(1, 'Il nome del componente è obbligatorio')
            .max(25, 'Il nome del componente non può superare i 25 caratteri'),

          // Component description (DESCRIZIONE) - optional
          componentDescription: z
            .string()
            .max(255, 'La descrizione non può superare i 255 caratteri')
            .optional(),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => {
      // alternativeIndexDescription is mandatory when energyPriceIndex = 99
      if (
        data.energyPriceIndex === '99' &&
        (!data.alternativeIndexDescription ||
          data.alternativeIndexDescription.trim() === '')
      ) {
        return false
      }
      return true
    },
    {
      message:
        'La descrizione dell\'indice alternativo è obbligatoria quando si seleziona "Altro"',
      path: ['alternativeIndexDescription'],
    },
  )
  .refine(
    (data) => {
      // dispatchingValue is mandatory when dispatchingType = 99
      if (data.dispatching) {
        for (const dispatch of data.dispatching) {
          if (
            dispatch.dispatchingType === '99' &&
            (dispatch.dispatchingValue === undefined ||
              dispatch.dispatchingValue === null)
          ) {
            return false
          }
        }
      }
      return true
    },
    {
      message:
        'Il valore di dispacciamento è obbligatorio quando si seleziona "Altro"',
      path: ['dispatching'],
    },
  )

// Company Components Schema - matching SII specification
export const companyComponentsSchema = z
  .object({
    // Regulated Components (ComponentiRegolate)
    // Optional section - regulated components by market type
    regulatedComponents: z
      .array(
        z.enum([
          '01', // PCV
          '02', // PPE
          '03', // CCR
          '04', // CPR
          '05', // GRAD
          '06', // QTint
          '07', // QTpsv
          '09', // QVD_fissa
          '10', // QVD_Variabile
        ]),
      )
      .optional(),

    // Company Components (ComponenteImpresa)
    // Optional section - can have multiple company components
    companyComponents: z
      .array(
        z.object({
          // Component name (NOME) - mandatory
          name: z
            .string()
            .min(1, 'Il nome del componente è obbligatorio')
            .max(
              255,
              'Il nome del componente non può superare i 255 caratteri',
            ),

          // Component description (DESCRIZIONE) - mandatory
          description: z
            .string()
            .min(1, 'La descrizione del componente è obbligatoria')
            .max(3000, 'La descrizione non può superare i 3000 caratteri'),

          // Component type (TIPOLOGIA) - mandatory
          componentType: z.enum(['01', '02'], {
            required_error: 'Seleziona il tipo di componente',
          }),

          // Macro area (MACROAREA) - mandatory
          macroArea: z.enum(['01', '02', '04', '05', '06'], {
            required_error: 'Seleziona la macroarea',
          }),

          // Price intervals (IntervalloPrezzi) - mandatory, at least one
          priceIntervals: z
            .array(
              z.object({
                // Component time band (FASCIA_COMPONENTE) - optional
                componentTimeBand: z
                  .enum([
                    '01', // Monorario/F1
                    '02', // F2
                    '03', // F3
                    '04', // F4
                    '05', // F5
                    '06', // F6
                    '07', // Peak
                    '08', // OffPeak
                    '91', // F2+F3
                    '92', // F1+F3
                    '93', // F1+F2
                  ])
                  .optional(),

                // Consumption range from (CONSUMO_DA) - optional
                consumptionFrom: z
                  .number()
                  .int()
                  .min(0, 'Il consumo da deve essere maggiore o uguale a 0')
                  .max(999_999_999, 'Il consumo da non può superare 999999999')
                  .optional(),

                // Consumption range to (CONSUMO_A) - optional
                consumptionTo: z
                  .number()
                  .int()
                  .min(0, 'Il consumo a deve essere maggiore o uguale a 0')
                  .max(999_999_999, 'Il consumo a non può superare 999999999')
                  .optional(),

                // Price (PREZZO) - mandatory
                price: z
                  .number()
                  .min(0, 'Il prezzo deve essere maggiore o uguale a 0')
                  .max(
                    999_999_999.99,
                    'Il prezzo non può superare 999999999.99',
                  ),

                // Unit of measure (UNITA_MISURA) - mandatory
                unitOfMeasure: z.enum(['01', '02', '03', '04', '05', '06'], {
                  required_error: "Seleziona l'unità di misura",
                }),

                // Validity period (PeriodoValidita) - optional
                validityPeriod: z
                  .object({
                    // From date (DATA_INIZIO) - format: gg/mm/aaaa
                    fromDate: z
                      .string()
                      .regex(
                        /^\d{2}\/\d{2}\/\d{4}$/,
                        'Formato data non valido (gg/mm/aaaa)',
                      )
                      .optional(),

                    // To date (DATA_FINE) - format: gg/mm/aaaa
                    toDate: z
                      .string()
                      .regex(
                        /^\d{2}\/\d{2}\/\d{4}$/,
                        'Formato data non valido (gg/mm/aaaa)',
                      )
                      .optional(),
                  })
                  .optional(),
              }),
            )
            .min(1, 'È richiesto almeno un intervallo di prezzo'),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Access form context through the special context object
    // This will be available when using createContextualResolver
    try {
      const contextData = ctx as unknown as {
        context?: { formStates?: CompleteFormValues }
      }
      const formStates = contextData?.context?.formStates

      if (!formStates) {
        // If no context is available, skip cross-step validation
        return
      }

      const marketType = formStates.offerDetails?.marketType

      // Gas market validation: Each ComponenteImpresa must have at least one IntervalloPrezzi
      if (marketType === '02' && data.companyComponents) {
        data.companyComponents.forEach((component, index) => {
          if (
            !component.priceIntervals ||
            component.priceIntervals.length === 0
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                'Per il mercato gas, ogni componente aziendale deve avere almeno un intervallo di prezzo',
              path: ['companyComponents', index, 'priceIntervals'],
            })
          }
        })
      }

      // Additional cross-step validations can be added here
    } catch {
      // If context access fails, skip validation silently
      // This ensures the schema works even without the custom resolver
    }
  })
  .refine(
    (data) => {
      // Check consumption range consistency in price intervals
      if (!data.companyComponents) {
        return true
      }

      for (const component of data.companyComponents) {
        for (const interval of component.priceIntervals) {
          const { consumptionFrom, consumptionTo } = interval
          if (
            consumptionFrom !== undefined &&
            consumptionTo !== undefined &&
            consumptionFrom >= consumptionTo
          ) {
            return false
          }
        }
      }
      return true
    },
    {
      message: 'Il consumo da deve essere inferiore al consumo a',
      path: ['companyComponents'],
    },
  )
  .refine(
    (data) => {
      // Check validity period consistency
      if (!data.companyComponents) {
        return true
      }

      for (const component of data.companyComponents) {
        for (const interval of component.priceIntervals) {
          const validityPeriod = interval.validityPeriod
          if (!validityPeriod?.fromDate) {
            continue
          }
          if (!validityPeriod?.toDate) {
            continue
          }

          const fromDate = new Date(
            validityPeriod.fromDate.split('/').reverse().join('-'),
          )
          const toDate = new Date(
            validityPeriod.toDate.split('/').reverse().join('-'),
          )

          if (fromDate >= toDate) {
            return false
          }
        }
      }
      return true
    },
    {
      message: 'La data di inizio deve essere precedente alla data di fine',
      path: ['companyComponents'],
    },
  )

// Helper function to validate early withdrawal charges date
function validateEarlyWithdrawalDate(
  startDateStr: string | undefined,
  conditionIndex: number,
  ctx: z.RefinementCtx,
) {
  if (!startDateStr) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Per utilizzare gli Oneri di Recesso Anticipato (condizione 05), è necessario prima impostare una data di validità dal 1 gennaio 2024 in poi nel passo "Validità e Revisione"',
      path: ['contractualConditions', conditionIndex, 'conditionType'],
    })
    return
  }

  const dateParts = startDateStr.split('/')
  if (dateParts.length !== 3) {
    return
  }

  const startDate = new Date(
    Number.parseInt(dateParts[2], 10), // year
    Number.parseInt(dateParts[1], 10) - 1, // month (0-indexed)
    Number.parseInt(dateParts[0], 10), // day
  )

  const minimumDate = new Date(2024, 0, 1) // January 1, 2024

  if (startDate < minimumDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Gli Oneri di Recesso Anticipato (condizione 05) possono essere utilizzati solo per offerte con validità dal 1 gennaio 2024 in poi',
      path: ['contractualConditions', conditionIndex, 'conditionType'],
    })
  }
}

// Payment & Conditions Schema - matching SII specification
export const paymentConditionsSchema = z
  .object({
    // Payment methods (MetodoPagamento) - mandatory, at least one required
    paymentMethods: z
      .array(
        z.object({
          // Payment method type (MODALITA_PAGAMENTO) - mandatory
          paymentMethodType: z.enum(['01', '02', '03', '04', '99'], {
            required_error: 'Seleziona un metodo di pagamento',
          }),

          // Description (DESCRIZIONE) - mandatory when paymentMethodType = '99'
          description: z
            .string()
            .max(3000, 'La descrizione non può superare i 3000 caratteri')
            .optional(),
        }),
      )
      .min(1, 'È richiesto almeno un metodo di pagamento'),

    // Contractual conditions (CondizioniContrattuali) - optional, can be multiple
    contractualConditions: z
      .array(
        z.object({
          // Condition type (TIPOLOGIA_CONDIZIONE) - mandatory
          conditionType: z.enum(['01', '02', '03', '04', '05', '99'], {
            required_error: 'Seleziona un tipo di condizione',
          }),

          // Alternative description (ALTRO) - mandatory when conditionType = '99'
          alternativeDescription: z
            .string()
            .max(
              3000,
              'La descrizione alternativa non può superare i 3000 caratteri',
            )
            .optional(),

          // Condition description (DESCRIZIONE) - mandatory
          description: z
            .string()
            .min(1, 'La descrizione della condizione è obbligatoria')
            .max(3000, 'La descrizione non può superare i 3000 caratteri'),

          // Is limiting (LIMITANTE) - mandatory
          isLimiting: z.enum(['01', '02'], {
            required_error: 'Specifica se la condizione è limitante',
          }),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => {
      // description is mandatory when paymentMethodType = '99'
      for (const paymentMethod of data.paymentMethods) {
        if (
          paymentMethod.paymentMethodType === '99' &&
          (!paymentMethod.description ||
            paymentMethod.description.trim() === '')
        ) {
          return false
        }
      }
      return true
    },
    {
      message:
        'La descrizione del metodo di pagamento è obbligatoria quando si seleziona "Altro"',
      path: ['paymentMethods'],
    },
  )
  .refine(
    (data) => {
      // alternativeDescription is mandatory when conditionType = '99'
      if (data.contractualConditions) {
        for (const condition of data.contractualConditions) {
          if (
            condition.conditionType === '99' &&
            (!condition.alternativeDescription ||
              condition.alternativeDescription.trim() === '')
          ) {
            return false
          }
        }
      }
      return true
    },
    {
      message:
        'La descrizione alternativa è obbligatoria quando si seleziona "Altro"',
      path: ['contractualConditions'],
    },
  )
  .superRefine((data, ctx) => {
    // TIPOLOGIA_CONDIZIONE = 05 (Early Withdrawal Charges) can only be used starting from January 1, 2024
    if (!data.contractualConditions) {
      return
    }

    const formContext = getFormContext(ctx)
    const validityReview = formContext.validityReview

    for (const [index, condition] of data.contractualConditions.entries()) {
      if (condition.conditionType === '05') {
        validateEarlyWithdrawalDate(
          validityReview?.validityPeriod?.startDate,
          index,
          ctx,
        )
      }
    }
  })

// Additional Features Schema - matching SII specification
export const additionalFeaturesSchema = z
  .object({
    // Offer Characteristics (CaratteristicheOfferta)
    // Mandatory if TIPO_OFFERTA = "03" (FLAT)
    offerCharacteristics: z
      .object({
        // Minimum consumption (CONSUMO_MIN) - mandatory if TIPO_OFFERTA = "03"
        consumptionMin: z
          .number()
          .int()
          .min(0, 'Il consumo minimo deve essere maggiore o uguale a 0')
          .max(999_999_999, 'Il consumo minimo non può superare 999999999')
          .optional(),

        // Maximum consumption (CONSUMO_MAX) - mandatory if TIPO_OFFERTA = "03"
        consumptionMax: z
          .number()
          .int()
          .min(0, 'Il consumo massimo deve essere maggiore o uguale a 0')
          .max(999_999_999, 'Il consumo massimo non può superare 999999999')
          .optional(),

        // Minimum power (POTENZA_MIN) - optional, for electricity offers
        powerMin: z
          .number()
          .min(0, 'La potenza minima deve essere maggiore o uguale a 0')
          .max(
            999_999_999.99,
            'La potenza minima non può superare 999999999.99',
          )
          .optional(),

        // Maximum power (POTENZA_MAX) - optional, for electricity offers
        powerMax: z
          .number()
          .min(0, 'La potenza massima deve essere maggiore o uguale a 0')
          .max(
            999_999_999.99,
            'La potenza massima non può superare 999999999.99',
          )
          .optional(),
      })
      .optional(),

    // Dual Offer (OffertaDUAL)
    // Mandatory if TIPO_MERCATO = "03" (Dual Fuel)
    dualOffer: z
      .object({
        // Electricity joint offers (OFFERTE_CONGIUNTE_EE) - mandatory if TIPO_MERCATO = "03"
        electricityJointOffers: z
          .array(
            z
              .string()
              .min(1, 'Il codice offerta elettrica è obbligatorio')
              .max(32, 'Il codice offerta non può superare i 32 caratteri'),
          )
          .min(1, 'È richiesta almeno una offerta elettrica congiunta')
          .optional(),

        // Gas joint offers (OFFERTE_CONGIUNTE_GAS) - mandatory if TIPO_MERCATO = "03"
        gasJointOffers: z
          .array(
            z
              .string()
              .min(1, 'Il codice offerta gas è obbligatorio')
              .max(32, 'Il codice offerta non può superare i 32 caratteri'),
          )
          .min(1, 'È richiesta almeno una offerta gas congiunta')
          .optional(),
      })
      .optional(),

    // Zone Offers (ZoneOfferta) - optional
    zoneOffers: z
      .object({
        // Regions (REGIONE) - optional
        regions: z
          .array(
            z
              .string()
              .length(2, 'Il codice regione deve essere di 2 caratteri')
              .regex(/^\d{2}$/, 'Il codice regione deve contenere solo numeri'),
          )
          .optional(),

        // Provinces (PROVINCIA) - optional
        provinces: z
          .array(
            z
              .string()
              .length(3, 'Il codice provincia deve essere di 3 caratteri')
              .regex(
                /^\d{3}$/,
                'Il codice provincia deve contenere solo numeri',
              ),
          )
          .optional(),

        // Municipalities (COMUNE) - optional
        municipalities: z
          .array(
            z
              .string()
              .length(6, 'Il codice comune deve essere di 6 caratteri')
              .regex(/^\d{6}$/, 'Il codice comune deve contenere solo numeri'),
          )
          .optional(),
      })
      .optional(),

    // Discounts (Sconto) - optional, can be multiple
    discounts: z
      .array(
        z.object({
          // Discount name (NOME) - mandatory
          name: z
            .string()
            .min(1, 'Il nome dello sconto è obbligatorio')
            .max(255, 'Il nome dello sconto non può superare i 255 caratteri'),

          // Discount description (DESCRIZIONE) - mandatory
          description: z
            .string()
            .min(1, 'La descrizione dello sconto è obbligatoria')
            .max(3000, 'La descrizione non può superare i 3000 caratteri'),

          // Component/band codes (CODICE_COMPONENTE_FASCIA) - optional
          componentBandCodes: z
            .array(
              z.enum([
                // Components
                '01',
                '02',
                '03',
                '04',
                '05',
                '06',
                '07',
                '09',
                '10',
                // Bands
                '11',
                '12',
                '13',
                '14',
                '15',
                '16',
                '17',
                '18',
                // Combined bands
                '91',
                '92',
                '93',
              ]),
            )
            .optional(),

          // Discount validity (VALIDITA) - mandatory if PeriodoValidita is not populated
          validity: z.enum(['01', '02', '03']).optional(),

          // VAT applicability (IVA_SCONTO) - mandatory
          vatApplicability: z.enum(['01', '02'], {
            required_error: "Specifica l'applicabilità IVA",
          }),

          // Validity period (PeriodoValidita) - optional
          validityPeriod: z
            .object({
              // Duration (DURATA) - optional
              duration: z
                .number()
                .int()
                .min(1, 'La durata deve essere maggiore di 0')
                .max(99, 'La durata non può superare 99')
                .optional(),

              // Valid until (VALIDO_FINO) - format: MM/AAAA
              validUntil: z
                .string()
                .regex(/^\d{2}\/\d{4}$/, 'Formato non valido (MM/AAAA)')
                .optional(),

              // Valid months (MESE_VALIDITA) - optional
              validMonths: z
                .array(
                  z.enum([
                    '01',
                    '02',
                    '03',
                    '04',
                    '05',
                    '06',
                    '07',
                    '08',
                    '09',
                    '10',
                    '11',
                    '12',
                  ]),
                )
                .optional(),
            })
            .optional(),

          // Discount condition (Condizione) - mandatory
          condition: z.object({
            // Application condition (CONDIZIONE_APPLICAZIONE) - mandatory
            applicationCondition: z.enum(['00', '01', '02', '03', '99'], {
              required_error: 'Seleziona la condizione di applicazione',
            }),

            // Condition description (DESCRIZIONE_CONDIZIONE) - mandatory if CONDIZIONE_APPLICAZIONE = "99"
            conditionDescription: z
              .string()
              .max(3000, 'La descrizione non può superare i 3000 caratteri')
              .optional(),
          }),

          // Discount prices (PREZZISconto) - mandatory, at least one
          discountPrices: z
            .array(
              z.object({
                // Discount type (TIPOLOGIA) - mandatory
                discountType: z.enum(['01', '02', '03', '04'], {
                  required_error: 'Seleziona il tipo di sconto',
                }),

                // Valid from (VALIDO_DA) - optional
                validFrom: z
                  .number()
                  .int()
                  .min(0, 'Il valore deve essere maggiore o uguale a 0')
                  .max(999_999_999, 'Il valore non può superare 999999999')
                  .optional(),

                // Valid to (VALIDO_FINO) - optional
                validTo: z
                  .number()
                  .int()
                  .min(0, 'Il valore deve essere maggiore o uguale a 0')
                  .max(999_999_999, 'Il valore non può superare 999999999')
                  .optional(),

                // Unit of measure (UNITA_MISURA) - mandatory
                unitOfMeasure: z.enum(['01', '02', '03', '04', '05', '06'], {
                  required_error: "Seleziona l'unità di misura",
                }),

                // Price (PREZZO) - mandatory
                price: z
                  .number()
                  .min(0, 'Il prezzo deve essere maggiore o uguale a 0')
                  .max(
                    999_999_999.99,
                    'Il prezzo non può superare 999999999.99',
                  ),
              }),
            )
            .min(1, 'È richiesto almeno un prezzo di sconto'),
        }),
      )
      .optional(),

    // Additional Products/Services (ProdottiServiziAggiuntivi) - optional, can be multiple
    additionalProducts: z
      .array(
        z.object({
          // Product name (NOME) - mandatory
          name: z
            .string()
            .min(1, 'Il nome del prodotto è obbligatorio')
            .max(255, 'Il nome del prodotto non può superare i 255 caratteri'),

          // Product details (DETTAGLIO) - mandatory
          details: z
            .string()
            .min(1, 'I dettagli del prodotto sono obbligatori')
            .max(3000, 'I dettagli non possono superare i 3000 caratteri'),

          // Macro area (MACROAREA) - optional
          macroArea: z
            .enum(['01', '02', '03', '04', '05', '06', '99'])
            .optional(),

          // Macro area details (DETTAGLI_MACROAREA) - mandatory if MACROAREA = "99"
          macroAreaDetails: z
            .string()
            .max(
              3000,
              'I dettagli della macroarea non possono superare i 3000 caratteri',
            )
            .optional(),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => {
      // Validate consumption range consistency
      if (
        data.offerCharacteristics?.consumptionMin &&
        data.offerCharacteristics?.consumptionMax
      ) {
        return (
          data.offerCharacteristics.consumptionMin <=
          data.offerCharacteristics.consumptionMax
        )
      }
      return true
    },
    {
      message:
        'Il consumo minimo deve essere inferiore o uguale al consumo massimo',
      path: ['offerCharacteristics', 'consumptionMax'],
    },
  )
  .refine(
    (data) => {
      // Validate power range consistency
      if (
        data.offerCharacteristics?.powerMin &&
        data.offerCharacteristics?.powerMax
      ) {
        return (
          data.offerCharacteristics.powerMin <=
          data.offerCharacteristics.powerMax
        )
      }
      return true
    },
    {
      message:
        'La potenza minima deve essere inferiore o uguale alla potenza massima',
      path: ['offerCharacteristics', 'powerMax'],
    },
  )
  .refine(
    (data) => {
      // Validate discount condition description when "Other" is selected
      if (data.discounts) {
        for (const discount of data.discounts) {
          if (
            discount.condition.applicationCondition === '99' &&
            (!discount.condition.conditionDescription ||
              discount.condition.conditionDescription.trim() === '')
          ) {
            return false
          }
        }
      }
      return true
    },
    {
      message:
        'La descrizione della condizione è obbligatoria quando si seleziona "Altro"',
      path: ['discounts'],
    },
  )
  .refine(
    (data) => {
      // Validate discount validity: either validity or validityPeriod must be specified
      if (data.discounts) {
        for (const discount of data.discounts) {
          if (!(discount.validity || discount.validityPeriod)) {
            return false
          }
        }
      }
      return true
    },
    {
      message:
        'È necessario specificare la validità dello sconto o il periodo di validità',
      path: ['discounts'],
    },
  )
  .refine(
    (data) => {
      // Validate additional products macro area details when "Other" is selected
      if (data.additionalProducts) {
        for (const product of data.additionalProducts) {
          if (
            product.macroArea === '99' &&
            (!product.macroAreaDetails ||
              product.macroAreaDetails.trim() === '')
          ) {
            return false
          }
        }
      }
      return true
    },
    {
      message:
        'I dettagli della macroarea sono obbligatori quando si seleziona "Altro"',
      path: ['additionalProducts'],
    },
  )
  .refine(
    (data) => {
      // Validate discount price ranges
      if (data.discounts) {
        for (const discount of data.discounts) {
          for (const price of discount.discountPrices) {
            if (
              price.validFrom !== undefined &&
              price.validTo !== undefined &&
              price.validFrom >= price.validTo
            ) {
              return false
            }
          }
        }
      }
      return true
    },
    {
      message:
        'Il valore "Valido Da" deve essere inferiore al valore "Valido Fino"',
      path: ['discounts'],
    },
  )

// Validity & Review Schema - matching SII specification
export const validityReviewSchema = z
  .object({
    // Validity period (PeriodoValidita) - mandatory for offer validity
    validityPeriod: z.object({
      // Start date (DATA_INIZIO) - format: gg/mm/aaaa - mandatory
      startDate: z
        .string()
        .min(1, 'La data di inizio è obbligatoria')
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato data non valido (gg/mm/aaaa)'),

      // End date (DATA_FINE) - format: gg/mm/aaaa - optional (null means indefinite)
      endDate: z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato data non valido (gg/mm/aaaa)')
        .optional()
        .or(z.literal('')),
    }),

    // Review confirmation - to ensure user has reviewed all data
    reviewConfirmed: z.boolean().refine((val) => val === true, {
      message: 'È necessario confermare la revisione prima di procedere',
    }),

    // Optional notes for internal use
    notes: z
      .string()
      .max(3000, 'Le note non possono superare i 3000 caratteri')
      .optional(),
  })
  .refine(
    (data) => {
      // Validate date range if both dates are provided
      if (data.validityPeriod.endDate && data.validityPeriod.endDate !== '') {
        const startParts = data.validityPeriod.startDate.split('/')
        const endParts = data.validityPeriod.endDate.split('/')

        const startDate = new Date(
          Number.parseInt(startParts[2], 10), // year
          Number.parseInt(startParts[1], 10) - 1, // month (0-indexed)
          Number.parseInt(startParts[0], 10), // day
        )

        const endDate = new Date(
          Number.parseInt(endParts[2], 10), // year
          Number.parseInt(endParts[1], 10) - 1, // month (0-indexed)
          Number.parseInt(endParts[0], 10), // day
        )

        return startDate <= endDate
      }
      return true
    },
    {
      message:
        'La data di fine deve essere successiva o uguale alla data di inizio',
      path: ['validityPeriod', 'endDate'],
    },
  )
  .refine(
    (data) => {
      // Validate that start date is not in the past (at least today)
      const startParts = data.validityPeriod.startDate.split('/')
      const startDate = new Date(
        Number.parseInt(startParts[2], 10), // year
        Number.parseInt(startParts[1], 10) - 1, // month (0-indexed)
        Number.parseInt(startParts[0], 10), // day
      )

      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day

      return startDate >= today
    },
    {
      message: 'La data di inizio non può essere precedente alla data odierna',
      path: ['validityPeriod', 'startDate'],
    },
  )

// Type exports for use in components
export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>
export type OfferDetailsFormValues = z.infer<typeof offerDetailsSchema>
export type ActivationContactsFormValues = z.infer<
  typeof activationContactsSchema
>
export type PricingConfigFormValues = z.infer<typeof pricingConfigSchema>
export type CompanyComponentsFormValues = z.infer<
  typeof companyComponentsSchema
>
export type PaymentConditionsFormValues = z.infer<
  typeof paymentConditionsSchema
>
export type AdditionalFeaturesFormValues = z.infer<
  typeof additionalFeaturesSchema
>
export type ValidityReviewFormValues = z.infer<typeof validityReviewSchema>

export const schemaMap = {
  basicInfo: basicInfoSchema,
  offerDetails: offerDetailsSchema,
  activationContacts: activationContactsSchema,
  pricingConfig: pricingConfigSchema,
  companyComponents: companyComponentsSchema,
  paymentConditions: paymentConditionsSchema,
  additionalFeatures: additionalFeaturesSchema,
  validityReview: validityReviewSchema,
} as const

export type SchemaMap = typeof schemaMap

// Complete form schema that combines all steps and applies conditional validation
export const completeFormSchema = z.object({
  basicInfo: basicInfoSchema.optional(),
  offerDetails: offerDetailsSchema.optional(),
  activationContacts: activationContactsSchema.optional(),
  pricingConfig: pricingConfigSchema.optional(),
  companyComponents: companyComponentsSchema.optional(),
  paymentConditions: paymentConditionsSchema.optional(),
  additionalFeatures: additionalFeaturesSchema.optional(),
  validityReview: validityReviewSchema.optional(),
})

export type CompleteFormValues = z.infer<typeof completeFormSchema>
