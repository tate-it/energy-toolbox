import { z } from 'zod'

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
      required_error: 'Seleziona un tipo di mercato',
    }),

    // Single offer (OFFERTA_SINGOLA) - mandatory if marketType is not '03' (Dual Fuel)
    singleOffer: z.enum(['SI', 'NO']).optional(),

    // Client type (TIPO_CLIENTE) - mandatory
    clientType: z.enum(['01', '02', '03'], {
      required_error: 'Seleziona un tipo di cliente',
    }),

    // Residential status (DOMESTICO_RESIDENTE) - optional
    residentialStatus: z.enum(['01', '02', '03']).optional(),

    // Offer type (TIPO_OFFERTA) - mandatory
    offerType: z.enum(['01', '02', '03'], {
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

// Payment & Conditions Schema (placeholder for now)
export const paymentConditionsSchema = z.object({
  // TODO: Add fields when implementing this step
})

// Additional Features Schema (placeholder for now)
export const additionalFeaturesSchema = z.object({
  // TODO: Add fields when implementing this step
})

// Validity & Review Schema (placeholder for now)
export const validityReviewSchema = z.object({
  // TODO: Add fields when implementing this step
})

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
