/**
 * Step 17: Discounts Schema (Sconti)
 * Schema Zod per la gestione degli sconti dell'offerta
 * 
 * Defines discount structures, conditions, and validity periods
 * for energy offers with regulatory compliance validation.
 */

import { z } from 'zod';
import { 
  TIPOLOGIA_SCONTO,
  TIPOLOGIA_SCONTO_LABELS,
  VALIDITA_SCONTO,
  IVA_SCONTO,
  CONDIZIONE_APPLICAZIONE_SCONTO,
  CONDIZIONE_APPLICAZIONE_SCONTO_LABELS,
  UNITA_MISURA,
  UNITA_MISURA_LABELS
} from '../constants';

// =====================================================
// CORE SCHEMA DEFINITION
// =====================================================

export const Step17Schema = z.object({
  // Array di sconti applicabili
  SCONTI: z.array(z.object({
    // Tipologia di sconto
    TIPO_SCONTO: z.enum([
      TIPOLOGIA_SCONTO.SCONTO_FISSO,
      TIPOLOGIA_SCONTO.SCONTO_POTENZA,
      TIPOLOGIA_SCONTO.SCONTO_VENDITA,
      TIPOLOGIA_SCONTO.SCONTO_PREZZO_REGOLATO
    ] as const),

    // Valore dello sconto
    VALORE_SCONTO: z.number()
      .min(0, 'Il valore dello sconto non può essere negativo')
      .max(999999.99, 'Il valore dello sconto non può superare 999.999,99')
      .multipleOf(0.01, 'Il valore dello sconto deve avere massimo 2 decimali'),

    // Unità di misura del valore
    UNITA_MISURA: z.enum([
      UNITA_MISURA.EURO_ANNO,
      UNITA_MISURA.EURO_KW,
      UNITA_MISURA.EURO_KWH,
      UNITA_MISURA.EURO,
      UNITA_MISURA.PERCENTUALE
    ] as const),

    // Durata dello sconto in mesi
    DURATA_SCONTO_MESI: z.number()
      .int('La durata deve essere un numero intero')
      .min(1, 'La durata minima è 1 mese')
      .max(240, 'La durata massima è 240 mesi (20 anni)'),

    // Periodo di validità
    VALIDITA: z.enum([
      VALIDITA_SCONTO.INGRESSO,
      VALIDITA_SCONTO.ENTRO_12_MESI,
      VALIDITA_SCONTO.OLTRE_12_MESI
    ] as const),

    // Condizioni di applicazione
    CONDIZIONI_APPLICAZIONE: z.enum([
      CONDIZIONE_APPLICAZIONE_SCONTO.NON_CONDIZIONATO,
      CONDIZIONE_APPLICAZIONE_SCONTO.FATTURAZIONE_ELETTRONICA,
      CONDIZIONE_APPLICAZIONE_SCONTO.GESTIONE_ONLINE,
      CONDIZIONE_APPLICAZIONE_SCONTO.FATTURAZIONE_ADDEBITO,
      CONDIZIONE_APPLICAZIONE_SCONTO.ALTRO
    ] as const),

    // Sconto soggetto a IVA
    SOGGETTO_IVA: z.enum([IVA_SCONTO.SI, IVA_SCONTO.NO] as const),

    // Descrizione dello sconto
    DESCRIZIONE: z.string()
      .min(5, 'La descrizione deve avere almeno 5 caratteri')
      .max(500, 'La descrizione non può superare 500 caratteri')
      .regex(/^[^<>]*$/, 'La descrizione non può contenere caratteri HTML'),

    // Nome dello sconto (identificativo breve)
    NOME_SCONTO: z.string()
      .min(2, 'Il nome deve avere almeno 2 caratteri')
      .max(100, 'Il nome non può superare 100 caratteri')
      .regex(/^[A-Za-z0-9\s\-_àèéìíîòóùúç]+$/, 'Il nome può contenere solo lettere, numeri, spazi e trattini')
      .optional(),

    // Sconto cumulabile con altri
    CUMULABILE: z.boolean().default(true),

    // Condizioni aggiuntive
    CONDIZIONI_AGGIUNTIVE: z.string()
      .max(1000, 'Le condizioni aggiuntive non possono superare 1000 caratteri')
      .optional(),

    // Valore minimo di consumo per applicazione
    CONSUMO_MINIMO_KWH: z.number()
      .min(0, 'Il consumo minimo non può essere negativo')
      .max(100000, 'Il consumo minimo non può superare 100.000 kWh')
      .optional(),

    // Valore massimo di consumo per applicazione
    CONSUMO_MASSIMO_KWH: z.number()
      .min(0, 'Il consumo massimo non può essere negativo')
      .max(100000, 'Il consumo massimo non può superare 100.000 kWh')
      .optional(),

    // Data inizio validità
    DATA_INIZIO: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido (YYYY-MM-DD)')
      .optional(),

    // Data fine validità
    DATA_FINE: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido (YYYY-MM-DD)')
      .optional()

  }).superRefine((discount, ctx) => {
    // Validate unit of measure based on discount type
    if (discount.TIPO_SCONTO === TIPOLOGIA_SCONTO.SCONTO_FISSO) {
      const validUnits = [UNITA_MISURA.EURO_ANNO, UNITA_MISURA.EURO];
      if (!validUnits.includes(discount.UNITA_MISURA)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['UNITA_MISURA'],
          message: 'Per sconti fissi utilizzare €/Anno o €'
        });
      }
    }

    if (discount.TIPO_SCONTO === TIPOLOGIA_SCONTO.SCONTO_POTENZA) {
      const validUnits = [UNITA_MISURA.EURO_KW, UNITA_MISURA.PERCENTUALE];
      if (!validUnits.includes(discount.UNITA_MISURA)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['UNITA_MISURA'],
          message: 'Per sconti potenza utilizzare €/kW o Percentuale'
        });
      }
    }

    if (discount.TIPO_SCONTO === TIPOLOGIA_SCONTO.SCONTO_VENDITA) {
      const validUnits = [UNITA_MISURA.EURO_KWH, UNITA_MISURA.PERCENTUALE];
      if (!validUnits.includes(discount.UNITA_MISURA)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['UNITA_MISURA'],
          message: 'Per sconti vendita utilizzare €/kWh o Percentuale'
        });
      }
    }

    // Validate percentage values
    if (discount.UNITA_MISURA === UNITA_MISURA.PERCENTUALE && discount.VALORE_SCONTO > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['VALORE_SCONTO'],
        message: 'Le percentuali non possono superare 100%'
      });
    }

    // Validate consumption range
    if (discount.CONSUMO_MINIMO_KWH && discount.CONSUMO_MASSIMO_KWH) {
      if (discount.CONSUMO_MASSIMO_KWH <= discount.CONSUMO_MINIMO_KWH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['CONSUMO_MASSIMO_KWH'],
          message: 'Il consumo massimo deve essere superiore al consumo minimo'
        });
      }
    }

    // Validate date range
    if (discount.DATA_INIZIO && discount.DATA_FINE) {
      const inizio = new Date(discount.DATA_INIZIO);
      const fine = new Date(discount.DATA_FINE);
      
      if (fine <= inizio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATA_FINE'],
          message: 'La data di fine deve essere successiva alla data di inizio'
        });
      }
    }

    // Validate discount value reasonableness
    if (discount.UNITA_MISURA === UNITA_MISURA.EURO_ANNO && discount.VALORE_SCONTO > 1000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['VALORE_SCONTO'],
        message: 'Sconto annuale superiore a 1000€ potrebbe essere eccessivo'
      });
    }

    // Validate condition requirements
    if (discount.CONDIZIONI_APPLICAZIONE === CONDIZIONE_APPLICAZIONE_SCONTO.ALTRO && 
        (!discount.CONDIZIONI_AGGIUNTIVE || discount.CONDIZIONI_AGGIUNTIVE.length < 10)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CONDIZIONI_AGGIUNTIVE'],
        message: 'Per "Altro" specificare le condizioni aggiuntive (minimo 10 caratteri)'
      });
    }
  }))
    .min(1, 'Specificare almeno uno sconto')
    .max(10, 'Non è possibile aggiungere più di 10 sconti'),

  // Sconto totale massimo applicabile
  SCONTO_MASSIMO_TOTALE: z.number()
    .min(0, 'Lo sconto massimo totale non può essere negativo')
    .max(100, 'Lo sconto massimo totale non può superare 100%')
    .optional(),

  // Note generali sugli sconti
  NOTE_SCONTI: z.string()
    .max(2000, 'Le note non possono superare 2000 caratteri')
    .optional()

}).superRefine((data, ctx) => {
  // Validate cumulative discounts logic
  const nonCumulableDiscounts = data.SCONTI.filter(sconto => !sconto.CUMULABILE);
  if (nonCumulableDiscounts.length > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['SCONTI'],
      message: 'Non è possibile avere più di uno sconto non cumulabile'
    });
  }

  // Calculate total discount impact
  let totalAnnualDiscount = 0;
  data.SCONTI.forEach((sconto) => {
    if (sconto.UNITA_MISURA === UNITA_MISURA.EURO_ANNO) {
      totalAnnualDiscount += sconto.VALORE_SCONTO;
    } else if (sconto.UNITA_MISURA === UNITA_MISURA.PERCENTUALE) {
      // Estimate based on typical bill
      totalAnnualDiscount += (675 * sconto.VALORE_SCONTO) / 100; // €675 = typical annual bill
    }
  });

  if (totalAnnualDiscount > 2000) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['SCONTI'],
      message: 'Sconto totale stimato eccessivo (>2000€/anno)'
    });
  }

  // Validate discount names uniqueness
  const discountNames = data.SCONTI
    .map(sconto => sconto.NOME_SCONTO)
    .filter(nome => nome !== undefined);
  
  const uniqueNames = new Set(discountNames);
  if (discountNames.length !== uniqueNames.size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['SCONTI'],
      message: 'I nomi degli sconti devono essere unici'
    });
  }
});

export type Step17Data = z.infer<typeof Step17Schema>;

// =====================================================
// VALIDATION UTILITIES
// =====================================================

/**
 * Calculate total annual discount value
 */
export function calculateTotalAnnualDiscount(
  sconti: Step17Data['SCONTI'],
  averageConsumption = 2700, // kWh/year
  averagePower = 3.0 // kW
): number {
  return sconti.reduce((total, sconto) => {
    switch (sconto.UNITA_MISURA) {
      case UNITA_MISURA.EURO_ANNO:
        return total + sconto.VALORE_SCONTO;
      case UNITA_MISURA.EURO_KWH:
        return total + (sconto.VALORE_SCONTO * averageConsumption);
      case UNITA_MISURA.EURO_KW:
        return total + (sconto.VALORE_SCONTO * averagePower);
      case UNITA_MISURA.EURO:
        return total + sconto.VALORE_SCONTO; // One-time discount
      case UNITA_MISURA.PERCENTUALE:
        // Estimate based on typical energy bill
        return total + ((675 * sconto.VALORE_SCONTO) / 100);
      default:
        return total;
    }
  }, 0);
}

/**
 * Validate discount eligibility based on consumption
 */
export function validateDiscountEligibility(
  sconto: Step17Data['SCONTI'][0],
  customerConsumption: number
): boolean {
  if (sconto.CONSUMO_MINIMO_KWH && customerConsumption < sconto.CONSUMO_MINIMO_KWH) {
    return false;
  }
  
  if (sconto.CONSUMO_MASSIMO_KWH && customerConsumption > sconto.CONSUMO_MASSIMO_KWH) {
    return false;
  }
  
  return true;
}

// =====================================================
// BUSINESS LOGIC HELPERS
// =====================================================

/**
 * Get discount attractiveness assessment
 */
export function getDiscountAttractiveness(data: Step17Data): {
  level: 'basso' | 'medio' | 'alto';
  totalAnnualSavings: number;
  mainAttractions: string[];
  concerns: string[];
} {
  const totalSavings = calculateTotalAnnualDiscount(data.SCONTI);
  const mainAttractions: string[] = [];
  const concerns: string[] = [];

  // Assess total savings level
  let level: 'basso' | 'medio' | 'alto' = 'basso';
  if (totalSavings > 200) level = 'alto';
  else if (totalSavings > 100) level = 'medio';

  // Identify main attractions
  data.SCONTI.forEach(sconto => {
    if (sconto.CONDIZIONI_APPLICAZIONE === CONDIZIONE_APPLICAZIONE_SCONTO.NON_CONDIZIONATO) {
      mainAttractions.push('Sconti senza condizioni');
    }
    
    if (sconto.DURATA_SCONTO_MESI >= 12) {
      mainAttractions.push('Sconti a lungo termine');
    }
    
    if (sconto.CUMULABILE) {
      mainAttractions.push('Sconti cumulabili');
    }
  });

  // Identify potential concerns
  const hasConditionedDiscounts = data.SCONTI.some(
    sconto => sconto.CONDIZIONI_APPLICAZIONE !== CONDIZIONE_APPLICAZIONE_SCONTO.NON_CONDIZIONATO
  );
  if (hasConditionedDiscounts) {
    concerns.push('Alcuni sconti hanno condizioni');
  }

  const hasShortTermDiscounts = data.SCONTI.some(
    sconto => sconto.DURATA_SCONTO_MESI < 12
  );
  if (hasShortTermDiscounts) {
    concerns.push('Alcuni sconti a breve termine');
  }

  const hasConsumptionRequirements = data.SCONTI.some(
    sconto => sconto.CONSUMO_MINIMO_KWH || sconto.CONSUMO_MASSIMO_KWH
  );
  if (hasConsumptionRequirements) {
    concerns.push('Sconti legati al consumo');
  }

  return {
    level,
    totalAnnualSavings: Math.round(totalSavings),
    mainAttractions: [...new Set(mainAttractions)], // Remove duplicates
    concerns: [...new Set(concerns)]
  };
}

/**
 * Get discount strategy recommendations
 */
export function getDiscountStrategyRecommendations(data: Step17Data): {
  strategy: string;
  recommendations: string[];
  competitivePosition: string;
} {
  const attractiveness = getDiscountAttractiveness(data);
  const hasMultipleDiscounts = data.SCONTI.length > 1;
  const hasCumulableDiscounts = data.SCONTI.some(sconto => sconto.CUMULABILE);

  let strategy = 'Strategia sconti standard';
  if (attractiveness.level === 'alto') {
    strategy = 'Strategia aggressiva di acquisizione clienti';
  } else if (hasMultipleDiscounts && hasCumulableDiscounts) {
    strategy = 'Strategia sconti diversificata e flessibile';
  }

  const recommendations: string[] = [];

  if (attractiveness.totalAnnualSavings > 300) {
    recommendations.push('Comunicare chiaramente il valore dello sconto');
    recommendations.push('Evidenziare il risparmio annuale totale');
  }

  if (data.SCONTI.some(s => s.CONDIZIONI_APPLICAZIONE !== CONDIZIONE_APPLICAZIONE_SCONTO.NON_CONDIZIONATO)) {
    recommendations.push('Rendere le condizioni di applicazione molto chiare');
  }

  if (hasMultipleDiscounts) {
    recommendations.push('Fornire esempi di combinazioni di sconti');
    recommendations.push('Creare una tabella riassuntiva degli sconti');
  }

  const competitivePosition = attractiveness.level === 'alto' 
    ? 'Posizione competitiva forte'
    : attractiveness.level === 'medio'
    ? 'Posizione competitiva media'
    : 'Considerare rafforzamento sconti';

  return {
    strategy,
    recommendations,
    competitivePosition
  };
}

/**
 * Generate customer-friendly discount summary
 */
export function generateDiscountSummary(data: Step17Data): {
  totalSavings: string;
  mainDiscounts: string[];
  conditions: string[];
  validity: string;
} {
  const totalAnnual = calculateTotalAnnualDiscount(data.SCONTI);
  
  const mainDiscounts = data.SCONTI.map(sconto => {
    let description = sconto.NOME_SCONTO || sconto.DESCRIZIONE;
    
    if (sconto.UNITA_MISURA === UNITA_MISURA.PERCENTUALE) {
      description += ` (${sconto.VALORE_SCONTO}%)`;
    } else {
      description += ` (${sconto.VALORE_SCONTO} ${UNITA_MISURA_LABELS[sconto.UNITA_MISURA]})`;
    }
    
    return description;
  });

  const conditions: string[] = [];
  data.SCONTI.forEach(sconto => {
    if (sconto.CONDIZIONI_APPLICAZIONE !== CONDIZIONE_APPLICAZIONE_SCONTO.NON_CONDIZIONATO) {
      conditions.push(CONDIZIONE_APPLICAZIONE_SCONTO_LABELS[sconto.CONDIZIONI_APPLICAZIONE]);
    }
  });

  const durate = data.SCONTI.map(s => s.DURATA_SCONTO_MESI);
  const durataMin = Math.min(...durate);
  const durataMax = Math.max(...durate);
  
  let validity = '';
  if (durataMin === durataMax) {
    validity = `Durata: ${durataMin} mesi`;
  } else {
    validity = `Durata: ${durataMin}-${durataMax} mesi`;
  }

  return {
    totalSavings: `Risparmio stimato: €${Math.round(totalAnnual)}/anno`,
    mainDiscounts,
    conditions: [...new Set(conditions)],
    validity
  };
}

// =====================================================
// UI HELPERS
// =====================================================

/**
 * Get available discount types with descriptions
 */
export function getDiscountTypes(): Array<{
  value: string;
  label: string;
  description: string;
  suggestedUnits: string[];
}> {
  return [
    {
      value: TIPOLOGIA_SCONTO.SCONTO_FISSO,
      label: TIPOLOGIA_SCONTO_LABELS[TIPOLOGIA_SCONTO.SCONTO_FISSO],
      description: 'Sconto fisso indipendente dal consumo',
      suggestedUnits: [UNITA_MISURA.EURO_ANNO, UNITA_MISURA.EURO]
    },
    {
      value: TIPOLOGIA_SCONTO.SCONTO_POTENZA,
      label: TIPOLOGIA_SCONTO_LABELS[TIPOLOGIA_SCONTO.SCONTO_POTENZA],
      description: 'Sconto basato sulla potenza impegnata',
      suggestedUnits: [UNITA_MISURA.EURO_KW, UNITA_MISURA.PERCENTUALE]
    },
    {
      value: TIPOLOGIA_SCONTO.SCONTO_VENDITA,
      label: TIPOLOGIA_SCONTO_LABELS[TIPOLOGIA_SCONTO.SCONTO_VENDITA],
      description: 'Sconto sul prezzo di vendita dell\'energia',
      suggestedUnits: [UNITA_MISURA.EURO_KWH, UNITA_MISURA.PERCENTUALE]
    },
    {
      value: TIPOLOGIA_SCONTO.SCONTO_PREZZO_REGOLATO,
      label: TIPOLOGIA_SCONTO_LABELS[TIPOLOGIA_SCONTO.SCONTO_PREZZO_REGOLATO],
      description: 'Sconto sui prezzi regolati (componenti ARERA)',
      suggestedUnits: [UNITA_MISURA.PERCENTUALE, UNITA_MISURA.EURO_KWH]
    }
  ];
}

/**
 * Format discounts for display
 */
export function formatDiscountsForDisplay(data: Step17Data): string {
  const summary = generateDiscountSummary(data);
  
  if (data.SCONTI.length === 1) {
    return `${summary.mainDiscounts[0]} - ${summary.totalSavings}`;
  } else {
    return `${data.SCONTI.length} sconti - ${summary.totalSavings}`;
  }
}

// =====================================================
// XML GENERATION HELPERS
// =====================================================

/**
 * Convert to XML-compatible format
 */
export function formatForXML(data: Step17Data): Record<string, unknown> {
  const xmlData: Record<string, unknown> = {
    Sconti: data.SCONTI.map(sconto => ({
      TipoSconto: sconto.TIPO_SCONTO,
      ValoreSconto: sconto.VALORE_SCONTO.toFixed(2),
      UnitaMisura: sconto.UNITA_MISURA,
      DurataScontoMesi: sconto.DURATA_SCONTO_MESI,
      Validita: sconto.VALIDITA,
      CondizioniApplicazione: sconto.CONDIZIONI_APPLICAZIONE,
      SoggettoIVA: sconto.SOGGETTO_IVA,
      Descrizione: sconto.DESCRIZIONE,
      NomeSconto: sconto.NOME_SCONTO || '',
      Cumulabile: sconto.CUMULABILE ? 'SI' : 'NO',
      CondizioniAggiuntive: sconto.CONDIZIONI_AGGIUNTIVE || '',
      ConsumoMinimoKWh: sconto.CONSUMO_MINIMO_KWH || '',
      ConsumoMassimoKWh: sconto.CONSUMO_MASSIMO_KWH || '',
      DataInizio: sconto.DATA_INIZIO || '',
      DataFine: sconto.DATA_FINE || ''
    }))
  };

  if (data.SCONTO_MASSIMO_TOTALE) {
    xmlData.ScontoMassimoTotale = data.SCONTO_MASSIMO_TOTALE.toFixed(2);
  }

  if (data.NOTE_SCONTI) {
    xmlData.NoteSconti = data.NOTE_SCONTI;
  }

  return xmlData;
}

/**
 * Validate for XML generation
 */
export function validateForXMLGeneration(data: Step17Data): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.SCONTI || data.SCONTI.length === 0) {
    errors.push('Almeno uno sconto obbligatorio per XML');
  }

  data.SCONTI.forEach((sconto, index) => {
    if (!sconto.TIPO_SCONTO) {
      errors.push(`Sconto ${index + 1}: tipo sconto obbligatorio`);
    }
    
    if (sconto.VALORE_SCONTO <= 0) {
      errors.push(`Sconto ${index + 1}: valore deve essere positivo`);
    }
    
    if (!sconto.UNITA_MISURA) {
      errors.push(`Sconto ${index + 1}: unità di misura obbligatoria`);
    }
    
    if (sconto.DURATA_SCONTO_MESI <= 0) {
      errors.push(`Sconto ${index + 1}: durata deve essere positiva`);
    }
    
    if (!sconto.DESCRIZIONE || sconto.DESCRIZIONE.trim().length < 5) {
      errors.push(`Sconto ${index + 1}: descrizione obbligatoria (minimo 5 caratteri)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export default schema
export default Step17Schema; 