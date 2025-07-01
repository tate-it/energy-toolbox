/**
 * Step 15: Contractual Conditions Schema (CondizioniContrattuali)
 * Schema Zod per la gestione delle condizioni contrattuali
 * 
 * Defines contractual terms, penalties, guarantees, and additional clauses
 * for energy offer contracts with regulatory compliance validation.
 */

import { z } from 'zod';
import { 
  TIPOLOGIA_CONDIZIONE,
  TIPOLOGIA_CONDIZIONE_LABELS,
  LIMITANTE
} from '../constants';

// =====================================================
// CORE SCHEMA DEFINITION
// =====================================================

export const Step15Schema = z.object({
  // Condizioni generali di contratto
  CONDIZIONI_GENERALI: z.string()
    .min(10, 'Le condizioni generali devono avere almeno 10 caratteri')
    .max(5000, 'Le condizioni generali non possono superare 5000 caratteri')
    .regex(/^[^<>]*$/, 'Le condizioni non possono contenere caratteri HTML'),

  // Clausole aggiuntive specifiche
  CLAUSOLE_AGGIUNTIVE: z.array(z.object({
    TIPOLOGIA: z.enum([
      TIPOLOGIA_CONDIZIONE.ATTIVAZIONE,
      TIPOLOGIA_CONDIZIONE.DISATTIVAZIONE,
      TIPOLOGIA_CONDIZIONE.RECESSO,
      TIPOLOGIA_CONDIZIONE.OFFERTA_PLURIENNALE,
      TIPOLOGIA_CONDIZIONE.ONERI_RECESSO_ANTICIPATO,
      TIPOLOGIA_CONDIZIONE.ALTRO
    ] as const),
    DESCRIZIONE: z.string()
      .min(5, 'La descrizione deve avere almeno 5 caratteri')
      .max(1000, 'La descrizione non può superare 1000 caratteri'),
    LIMITANTE: z.enum([LIMITANTE.SI, LIMITANTE.NO] as const),
    VALORE: z.number()
      .min(0, 'Il valore non può essere negativo')
      .max(999999.99, 'Il valore non può superare 999.999,99 €')
      .optional(),
    DURATA_GIORNI: z.number()
      .int('La durata deve essere un numero intero')
      .min(0, 'La durata non può essere negativa')
      .max(3650, 'La durata non può superare 10 anni')
      .optional()
  }))
    .min(1, 'Specificare almeno una clausola aggiuntiva')
    .max(20, 'Non è possibile aggiungere più di 20 clausole')
    .optional(),

  // Penali previste
  PENALI: z.array(z.object({
    DESCRIZIONE: z.string()
      .min(5, 'La descrizione della penale deve avere almeno 5 caratteri')
      .max(500, 'La descrizione non può superare 500 caratteri'),
    IMPORTO: z.number()
      .min(0, 'L\'importo non può essere negativo')
      .max(99999.99, 'L\'importo non può superare 99.999,99 €'),
    MODALITA_CALCOLO: z.enum(['FISSO', 'PERCENTUALE', 'FORFETTARIO'] as const),
    CONDIZIONI_APPLICAZIONE: z.string()
      .min(3, 'Le condizioni di applicazione devono avere almeno 3 caratteri')
      .max(300, 'Le condizioni non possono superare 300 caratteri')
  }))
    .max(10, 'Non è possibile aggiungere più di 10 penali')
    .optional(),

  // Garanzie aggiuntive offerte
  GARANZIE_AGGIUNTIVE: z.array(z.object({
    TIPO_GARANZIA: z.enum(['RIMBORSO', 'SOSTITUZIONE', 'ASSISTENZA', 'QUALITA', 'PREZZO', 'ALTRO'] as const),
    DESCRIZIONE: z.string()
      .min(5, 'La descrizione della garanzia deve avere almeno 5 caratteri')
      .max(500, 'La descrizione non può superare 500 caratteri'),
    DURATA_MESI: z.number()
      .int('La durata deve essere un numero intero')
      .min(1, 'La durata deve essere almeno 1 mese')
      .max(240, 'La durata non può superare 20 anni'),
    VALORE_MASSIMO: z.number()
      .min(0, 'Il valore massimo non può essere negativo')
      .max(999999.99, 'Il valore massimo non può superare 999.999,99 €')
      .optional(),
    CONDIZIONI: z.string()
      .max(300, 'Le condizioni non possono superare 300 caratteri')
      .optional()
  }))
    .max(15, 'Non è possibile aggiungere più di 15 garanzie')
    .optional(),

  // Durata minima del contratto
  DURATA_MINIMA_MESI: z.number()
    .int('La durata deve essere un numero intero')
    .min(0, 'La durata minima non può essere negativa')
    .max(240, 'La durata minima non può superare 20 anni')
    .optional(),

  // Preavviso per recesso
  PREAVVISO_RECESSO_GIORNI: z.number()
    .int('Il preavviso deve essere un numero intero')
    .min(0, 'Il preavviso non può essere negativo')
    .max(365, 'Il preavviso non può superare 365 giorni')
    .optional(),

  // Rinnovo automatico
  RINNOVO_AUTOMATICO: z.boolean().default(false),

  // Durata del rinnovo
  DURATA_RINNOVO_MESI: z.number()
    .int('La durata del rinnovo deve essere un numero intero')
    .min(1, 'La durata del rinnovo deve essere almeno 1 mese')
    .max(60, 'La durata del rinnovo non può superare 5 anni')
    .optional(),

  // Modalità di comunicazione delle variazioni
  MODALITA_COMUNICAZIONE_VARIAZIONI: z.enum([
    'EMAIL', 'PEC', 'RACCOMANDATA', 'FATTURA', 'SMS', 'AREA_CLIENTI', 'ALTRO'
  ] as const).optional(),

  // Foro competente
  FORO_COMPETENTE: z.string()
    .min(2, 'Il foro competente deve avere almeno 2 caratteri')
    .max(100, 'Il foro competente non può superare 100 caratteri')
    .regex(/^[A-Za-z\s\-\'àèéìíîòóùúç]+$/, 'Il foro competente può contenere solo lettere, spazi e apostrofi')
    .optional()

}).superRefine((data, ctx) => {
  // Validate renewal logic
  if (data.RINNOVO_AUTOMATICO && !data.DURATA_RINNOVO_MESI) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DURATA_RINNOVO_MESI'],
      message: 'La durata del rinnovo è obbligatoria se il rinnovo automatico è attivo'
    });
  }

  // Validate minimum duration vs notice period
  if (data.DURATA_MINIMA_MESI && data.PREAVVISO_RECESSO_GIORNI) {
    const durataGiorni = data.DURATA_MINIMA_MESI * 30; // Approximate
    if (data.PREAVVISO_RECESSO_GIORNI > durataGiorni / 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['PREAVVISO_RECESSO_GIORNI'],
        message: 'Il preavviso di recesso non dovrebbe superare metà della durata minima del contratto'
      });
    }
  }

  // Validate clauses consistency
  if (data.CLAUSOLE_AGGIUNTIVE) {
    data.CLAUSOLE_AGGIUNTIVE.forEach((clausola, index) => {
      // Activation clauses should have reasonable values
      if (clausola.TIPOLOGIA === TIPOLOGIA_CONDIZIONE.ATTIVAZIONE && clausola.VALORE && clausola.VALORE > 200) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['CLAUSOLE_AGGIUNTIVE', index, 'VALORE'],
          message: 'I costi di attivazione superiori a 200€ sono considerati elevati'
        });
      }

      // Early termination fees validation
      if (clausola.TIPOLOGIA === TIPOLOGIA_CONDIZIONE.ONERI_RECESSO_ANTICIPATO) {
        if (!clausola.VALORE) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['CLAUSOLE_AGGIUNTIVE', index, 'VALORE'],
            message: 'Gli oneri di recesso anticipato devono specificare un valore'
          });
        }
        if (clausola.LIMITANTE !== LIMITANTE.SI) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['CLAUSOLE_AGGIUNTIVE', index, 'LIMITANTE'],
            message: 'Gli oneri di recesso anticipato sono sempre limitanti'
          });
        }
      }

      // Multi-year offers validation
      if (clausola.TIPOLOGIA === TIPOLOGIA_CONDIZIONE.OFFERTA_PLURIENNALE) {
        if (!clausola.DURATA_GIORNI || clausola.DURATA_GIORNI < 365) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['CLAUSOLE_AGGIUNTIVE', index, 'DURATA_GIORNI'],
            message: 'Le offerte pluriennali devono avere durata di almeno 365 giorni'
          });
        }
      }
    });
  }

  // Validate penalties logic
  if (data.PENALI) {
    data.PENALI.forEach((penale, index) => {
      if (penale.MODALITA_CALCOLO === 'PERCENTUALE' && penale.IMPORTO > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['PENALI', index, 'IMPORTO'],
          message: 'Le penali percentuali non possono superare 100%'
        });
      }
    });
  }

  // Validate guarantees reasonableness
  if (data.GARANZIE_AGGIUNTIVE) {
    data.GARANZIE_AGGIUNTIVE.forEach((garanzia, index) => {
      if (garanzia.DURATA_MESI > 60 && !garanzia.VALORE_MASSIMO) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['GARANZIE_AGGIUNTIVE', index, 'VALORE_MASSIMO'],
          message: 'Garanzie oltre 5 anni dovrebbero specificare un valore massimo'
        });
      }
    });
  }
});

export type Step15Data = z.infer<typeof Step15Schema>;

// =====================================================
// VALIDATION UTILITIES
// =====================================================

/**
 * Validates contractual duration consistency
 */
export function validateContractualDuration(
  durataMinima?: number,
  preavviso?: number,
  rinnovo?: boolean,
  durataRinnovo?: number
): boolean {
  if (rinnovo && !durataRinnovo) return false;
  if (durataMinima && preavviso && (preavviso * 30) > (durataMinima * 30)) return false;
  return true;
}

/**
 * Calculate total potential contract costs
 */
export function calculateContractualCosts(data: Step15Data): {
  activationCosts: number;
  terminationCosts: number;
  guaranteeValue: number;
  penaltiesMaximum: number;
} {
  let activationCosts = 0;
  let terminationCosts = 0;
  let guaranteeValue = 0;
  let penaltiesMaximum = 0;

  if (data.CLAUSOLE_AGGIUNTIVE) {
    data.CLAUSOLE_AGGIUNTIVE.forEach(clausola => {
      if (clausola.VALORE) {
        if (clausola.TIPOLOGIA === TIPOLOGIA_CONDIZIONE.ATTIVAZIONE) {
          activationCosts += clausola.VALORE;
        }
        if (clausola.TIPOLOGIA === TIPOLOGIA_CONDIZIONE.ONERI_RECESSO_ANTICIPATO) {
          terminationCosts += clausola.VALORE;
        }
      }
    });
  }

  if (data.GARANZIE_AGGIUNTIVE) {
    data.GARANZIE_AGGIUNTIVE.forEach(garanzia => {
      if (garanzia.VALORE_MASSIMO) {
        guaranteeValue += garanzia.VALORE_MASSIMO;
      }
    });
  }

  if (data.PENALI) {
    data.PENALI.forEach(penale => {
      if (penale.MODALITA_CALCOLO === 'FISSO') {
        penaltiesMaximum = Math.max(penaltiesMaximum, penale.IMPORTO);
      }
    });
  }

  return {
    activationCosts,
    terminationCosts,
    guaranteeValue,
    penaltiesMaximum
  };
}

// =====================================================
// BUSINESS LOGIC HELPERS
// =====================================================

/**
 * Get contractual complexity assessment
 */
export function getContractualComplexity(data: Step15Data): {
  level: 'semplice' | 'standard' | 'complesso';
  factors: string[];
  recommendations: string[];
} {
  const factors: string[] = [];
  const recommendations: string[] = [];
  let complexity = 0;

  // Basic complexity factors
  if (data.CLAUSOLE_AGGIUNTIVE && data.CLAUSOLE_AGGIUNTIVE.length > 0) {
    complexity += data.CLAUSOLE_AGGIUNTIVE.length;
    factors.push(`${data.CLAUSOLE_AGGIUNTIVE.length} clausole aggiuntive`);
  }

  if (data.PENALI && data.PENALI.length > 0) {
    complexity += data.PENALI.length * 2;
    factors.push(`${data.PENALI.length} penali specificate`);
  }

  if (data.GARANZIE_AGGIUNTIVE && data.GARANZIE_AGGIUNTIVE.length > 0) {
    complexity += data.GARANZIE_AGGIUNTIVE.length;
    factors.push(`${data.GARANZIE_AGGIUNTIVE.length} garanzie aggiuntive`);
  }

  if (data.DURATA_MINIMA_MESI && data.DURATA_MINIMA_MESI > 24) {
    complexity += 3;
    factors.push('Durata minima superiore a 2 anni');
  }

  if (data.RINNOVO_AUTOMATICO) {
    complexity += 2;
    factors.push('Rinnovo automatico attivo');
  }

  // Recommendations based on complexity
  if (complexity <= 3) {
    recommendations.push('Contratto semplice e trasparente');
    recommendations.push('Facile comprensione per il cliente');
  } else if (complexity <= 8) {
    recommendations.push('Contratto standard con condizioni chiare');
    recommendations.push('Assicurarsi che le condizioni siano ben spiegate');
  } else {
    recommendations.push('Contratto complesso - richiede attenzione particolare');
    recommendations.push('Considerare semplificazione delle condizioni');
    recommendations.push('Fornire riassunto delle condizioni principali');
  }

  const level = complexity <= 3 ? 'semplice' : complexity <= 8 ? 'standard' : 'complesso';

  return { level, factors, recommendations };
}

/**
 * Check regulatory compliance
 */
export function checkRegulatoryCompliance(data: Step15Data): {
  isCompliant: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check for early termination fees (mandatory from 2024)
  const hasEarlyTerminationClause = data.CLAUSOLE_AGGIUNTIVE?.some(
    clausola => clausola.TIPOLOGIA === TIPOLOGIA_CONDIZIONE.ONERI_RECESSO_ANTICIPATO
  );

  if (!hasEarlyTerminationClause && data.DURATA_MINIMA_MESI && data.DURATA_MINIMA_MESI > 12) {
    issues.push('Contratti con durata superiore a 12 mesi devono specificare oneri di recesso anticipato');
  }

  // Check notice period reasonableness
  if (data.PREAVVISO_RECESSO_GIORNI && data.PREAVVISO_RECESSO_GIORNI > 90) {
    warnings.push('Preavviso di recesso superiore a 90 giorni potrebbe essere considerato eccessivo');
  }

  // Check activation costs
  const activationCosts = calculateContractualCosts(data).activationCosts;
  if (activationCosts > 100) {
    warnings.push('Costi di attivazione elevati (>100€) richiedono giustificazione');
  }

  // Check automatic renewal duration
  if (data.RINNOVO_AUTOMATICO && data.DURATA_RINNOVO_MESI && data.DURATA_RINNOVO_MESI > 12) {
    warnings.push('Rinnovi automatici superiori a 12 mesi richiedono particolare trasparenza');
  }

  return {
    isCompliant: issues.length === 0,
    issues,
    warnings
  };
}

/**
 * Get customer-friendly summary
 */
export function getCustomerFriendlySummary(data: Step15Data): {
  keyPoints: string[];
  costsOverview: string;
  termination: string;
  guarantees: string;
} {
  const keyPoints: string[] = [];
  const costs = calculateContractualCosts(data);

  // Duration and renewal
  if (data.DURATA_MINIMA_MESI) {
    keyPoints.push(`Durata minima: ${data.DURATA_MINIMA_MESI} mesi`);
  }

  if (data.RINNOVO_AUTOMATICO && data.DURATA_RINNOVO_MESI) {
    keyPoints.push(`Rinnovo automatico per ${data.DURATA_RINNOVO_MESI} mesi`);
  }

  // Notice period
  if (data.PREAVVISO_RECESSO_GIORNI) {
    keyPoints.push(`Preavviso recesso: ${data.PREAVVISO_RECESSO_GIORNI} giorni`);
  }

  // Costs overview
  let costsOverview = 'Costi: ';
  const costElements: string[] = [];
  if (costs.activationCosts > 0) costElements.push(`Attivazione €${costs.activationCosts}`);
  if (costs.terminationCosts > 0) costElements.push(`Recesso anticipato €${costs.terminationCosts}`);
  costsOverview += costElements.length > 0 ? costElements.join(', ') : 'Nessun costo aggiuntivo';

  // Termination info
  let termination = 'Recesso: ';
  if (data.PREAVVISO_RECESSO_GIORNI) {
    termination += `Preavviso ${data.PREAVVISO_RECESSO_GIORNI} giorni`;
  } else {
    termination += 'Secondo normativa vigente';
  }
  if (costs.terminationCosts > 0) {
    termination += `, Penale €${costs.terminationCosts}`;
  }

  // Guarantees info
  let guarantees = 'Garanzie: ';
  if (data.GARANZIE_AGGIUNTIVE && data.GARANZIE_AGGIUNTIVE.length > 0) {
    guarantees += `${data.GARANZIE_AGGIUNTIVE.length} garanzie aggiuntive`;
    if (costs.guaranteeValue > 0) {
      guarantees += ` (valore max €${costs.guaranteeValue})`;
    }
  } else {
    guarantees += 'Garanzie di legge';
  }

  return {
    keyPoints,
    costsOverview,
    termination,
    guarantees
  };
}

// =====================================================
// UI HELPERS
// =====================================================

/**
 * Get available clause types with descriptions
 */
export function getClauseTypes(): Array<{
  value: string;
  label: string;
  description: string;
  isLimiting: boolean;
  requiresValue: boolean;
}> {
  return [
    {
      value: TIPOLOGIA_CONDIZIONE.ATTIVAZIONE,
      label: TIPOLOGIA_CONDIZIONE_LABELS[TIPOLOGIA_CONDIZIONE.ATTIVAZIONE],
      description: 'Condizioni e costi per l\'attivazione del servizio',
      isLimiting: false,
      requiresValue: true
    },
    {
      value: TIPOLOGIA_CONDIZIONE.DISATTIVAZIONE,
      label: TIPOLOGIA_CONDIZIONE_LABELS[TIPOLOGIA_CONDIZIONE.DISATTIVAZIONE],
      description: 'Modalità e tempistiche per la disattivazione',
      isLimiting: true,
      requiresValue: false
    },
    {
      value: TIPOLOGIA_CONDIZIONE.RECESSO,
      label: TIPOLOGIA_CONDIZIONE_LABELS[TIPOLOGIA_CONDIZIONE.RECESSO],
      description: 'Condizioni per il recesso dal contratto',
      isLimiting: true,
      requiresValue: false
    },
    {
      value: TIPOLOGIA_CONDIZIONE.OFFERTA_PLURIENNALE,
      label: TIPOLOGIA_CONDIZIONE_LABELS[TIPOLOGIA_CONDIZIONE.OFFERTA_PLURIENNALE],
      description: 'Condizioni specifiche per contratti pluriennali',
      isLimiting: true,
      requiresValue: false
    },
    {
      value: TIPOLOGIA_CONDIZIONE.ONERI_RECESSO_ANTICIPATO,
      label: TIPOLOGIA_CONDIZIONE_LABELS[TIPOLOGIA_CONDIZIONE.ONERI_RECESSO_ANTICIPATO],
      description: 'Penali per recesso anticipato (obbligatorio dal 2024)',
      isLimiting: true,
      requiresValue: true
    },
    {
      value: TIPOLOGIA_CONDIZIONE.ALTRO,
      label: TIPOLOGIA_CONDIZIONE_LABELS[TIPOLOGIA_CONDIZIONE.ALTRO],
      description: 'Altre condizioni contrattuali specifiche',
      isLimiting: false,
      requiresValue: false
    }
  ];
}

/**
 * Format contractual conditions for display
 */
export function formatContractualConditionsForDisplay(data: Step15Data): string {
  const parts: string[] = [];

  if (data.DURATA_MINIMA_MESI) {
    parts.push(`Durata: ${data.DURATA_MINIMA_MESI} mesi`);
  }

  if (data.CLAUSOLE_AGGIUNTIVE && data.CLAUSOLE_AGGIUNTIVE.length > 0) {
    parts.push(`${data.CLAUSOLE_AGGIUNTIVE.length} clausole`);
  }

  if (data.GARANZIE_AGGIUNTIVE && data.GARANZIE_AGGIUNTIVE.length > 0) {
    parts.push(`${data.GARANZIE_AGGIUNTIVE.length} garanzie`);
  }

  if (data.RINNOVO_AUTOMATICO) {
    parts.push('Rinnovo automatico');
  }

  return parts.length > 0 ? parts.join(' | ') : 'Condizioni standard';
}

// =====================================================
// XML GENERATION HELPERS
// =====================================================

/**
 * Convert to XML-compatible format
 */
export function formatForXML(data: Step15Data): Record<string, unknown> {
  const xmlData: Record<string, unknown> = {
    CondizioniGenerali: data.CONDIZIONI_GENERALI
  };

  if (data.CLAUSOLE_AGGIUNTIVE && data.CLAUSOLE_AGGIUNTIVE.length > 0) {
    xmlData.ClausoleAggiuntive = data.CLAUSOLE_AGGIUNTIVE.map(clausola => ({
      Tipologia: clausola.TIPOLOGIA,
      Descrizione: clausola.DESCRIZIONE,
      Limitante: clausola.LIMITANTE,
      Valore: clausola.VALORE?.toFixed(2) || '',
      DurataGiorni: clausola.DURATA_GIORNI || ''
    }));
  }

  if (data.PENALI && data.PENALI.length > 0) {
    xmlData.Penali = data.PENALI.map(penale => ({
      Descrizione: penale.DESCRIZIONE,
      Importo: penale.IMPORTO.toFixed(2),
      ModalitaCalcolo: penale.MODALITA_CALCOLO,
      CondizioniApplicazione: penale.CONDIZIONI_APPLICAZIONE
    }));
  }

  if (data.GARANZIE_AGGIUNTIVE && data.GARANZIE_AGGIUNTIVE.length > 0) {
    xmlData.GaranzieAggiuntive = data.GARANZIE_AGGIUNTIVE.map(garanzia => ({
      TipoGaranzia: garanzia.TIPO_GARANZIA,
      Descrizione: garanzia.DESCRIZIONE,
      DurataMesi: garanzia.DURATA_MESI,
      ValoreMassimo: garanzia.VALORE_MASSIMO?.toFixed(2) || '',
      Condizioni: garanzia.CONDIZIONI || ''
    }));
  }

  if (data.DURATA_MINIMA_MESI) {
    xmlData.DurataMinimaMesi = data.DURATA_MINIMA_MESI;
  }

  if (data.PREAVVISO_RECESSO_GIORNI) {
    xmlData.PreavvisoRecessoGiorni = data.PREAVVISO_RECESSO_GIORNI;
  }

  xmlData.RinnovoAutomatico = data.RINNOVO_AUTOMATICO ? 'SI' : 'NO';

  if (data.DURATA_RINNOVO_MESI) {
    xmlData.DurataRinnovoMesi = data.DURATA_RINNOVO_MESI;
  }

  if (data.MODALITA_COMUNICAZIONE_VARIAZIONI) {
    xmlData.ModalitaComunicazioneVariazioni = data.MODALITA_COMUNICAZIONE_VARIAZIONI;
  }

  if (data.FORO_COMPETENTE) {
    xmlData.ForoCompetente = data.FORO_COMPETENTE;
  }

  return xmlData;
}

/**
 * Validate for XML generation
 */
export function validateForXMLGeneration(data: Step15Data): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.CONDIZIONI_GENERALI || data.CONDIZIONI_GENERALI.trim().length < 10) {
    errors.push('Condizioni generali obbligatorie per XML (minimo 10 caratteri)');
  }

  // Validate clauses if present
  if (data.CLAUSOLE_AGGIUNTIVE) {
    data.CLAUSOLE_AGGIUNTIVE.forEach((clausola, index) => {
      if (!clausola.TIPOLOGIA || !clausola.DESCRIZIONE) {
        errors.push(`Clausola ${index + 1}: tipologia e descrizione obbligatorie`);
      }
    });
  }

  // Validate penalties if present
  if (data.PENALI) {
    data.PENALI.forEach((penale, index) => {
      if (!penale.DESCRIZIONE || penale.IMPORTO <= 0) {
        errors.push(`Penale ${index + 1}: descrizione e importo valido obbligatori`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export default schema
export default Step15Schema; 