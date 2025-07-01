/**
 * Step 12: Weekly Time Bands Schema (FasceOrarieSettimanali)
 * Schema Zod per la configurazione delle fasce orarie settimanali
 * 
 * Defines the weekly time band configurations for energy pricing,
 * including F1, F2, F3 time slots and weekly/daily schedules.
 */

import { z } from 'zod';
import { 
  TIPOLOGIA_FASCE, 
  TIPOLOGIA_FASCE_LABELS,
  type TipologiaFasce as TipologiaFasceType 
} from '../constants';

// =====================================================
// CORE SCHEMA DEFINITION
// =====================================================

export const Step12Schema = z.object({
  // Configurazione delle fasce orarie
  CONFIGURAZIONE_FASCE: z.enum([
    TIPOLOGIA_FASCE.MONORARIO,
    TIPOLOGIA_FASCE.F1_F2,
    TIPOLOGIA_FASCE.F1_F2_F3,
    TIPOLOGIA_FASCE.F1_F2_F3_F4,
    TIPOLOGIA_FASCE.F1_F2_F3_F4_F5,
    TIPOLOGIA_FASCE.F1_F2_F3_F4_F5_F6,
    TIPOLOGIA_FASCE.PEAK_OFFPEAK,
    TIPOLOGIA_FASCE.BIORARIO_F1_F2F3,
    TIPOLOGIA_FASCE.BIORARIO_F2_F1F3,
    TIPOLOGIA_FASCE.BIORARIO_F3_F1F2
  ] as const, {
    errorMap: () => ({ message: 'Seleziona una configurazione valida delle fasce orarie' })
  }),

  // Fascia F1 (hours configuration)
  FASCIA_F1: z.string()
    .min(1, 'Specifica gli orari per la fascia F1')
    .max(200, 'Gli orari F1 non possono superare 200 caratteri')
    .regex(/^([0-9]{1,2}:[0-9]{2}-[0-9]{1,2}:[0-9]{2})(,\s*[0-9]{1,2}:[0-9]{2}-[0-9]{1,2}:[0-9]{2})*$/, 
      'Formato orari non valido. Usa: 08:00-19:00, 20:00-22:00')
    .optional(),

  // Fascia F2 (hours configuration)
  FASCIA_F2: z.string()
    .min(1, 'Specifica gli orari per la fascia F2')
    .max(200, 'Gli orari F2 non possono superare 200 caratteri')
    .regex(/^([0-9]{1,2}:[0-9]{2}-[0-9]{1,2}:[0-9]{2})(,\s*[0-9]{1,2}:[0-9]{2}-[0-9]{1,2}:[0-9]{2})*$/, 
      'Formato orari non valido. Usa: 07:00-08:00, 19:00-23:00')
    .optional(),

  // Fascia F3 (hours configuration)
  FASCIA_F3: z.string()
    .min(1, 'Specifica gli orari per la fascia F3')
    .max(200, 'Gli orari F3 non possono superare 200 caratteri')
    .regex(/^([0-9]{1,2}:[0-9]{2}-[0-9]{1,2}:[0-9]{2})(,\s*[0-9]{1,2}:[0-9]{2}-[0-9]{1,2}:[0-9]{2})*$/, 
      'Formato orari non valido. Usa: 23:00-07:00, sabato/domenica')
    .optional(),

  // Giorni della settimana per ogni fascia
  GIORNI_SETTIMANA: z.string()
    .min(1, 'Specifica i giorni della settimana')
    .max(100, 'I giorni della settimana non possono superare 100 caratteri')
    .regex(/^(lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)(,\s*(lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica))*$/i, 
      'Giorni non validi. Usa: lunedì, martedì, mercoledì, ecc.')
    .optional(),

  // Ore per giorno (detailed daily scheduling)
  ORE_GIORNO: z.string()
    .min(1, 'Specifica le ore per giorno')
    .max(500, 'Le ore per giorno non possono superare 500 caratteri')
    .regex(/^.+$/, 'Specifica una configurazione oraria valida')
    .optional()

}).superRefine((data, ctx) => {
  // Conditional validation based on time band configuration
  const isSingleBand = data.CONFIGURAZIONE_FASCE === TIPOLOGIA_FASCE.MONORARIO;
  const isDualBand = [
    TIPOLOGIA_FASCE.F1_F2,
    TIPOLOGIA_FASCE.PEAK_OFFPEAK,
    TIPOLOGIA_FASCE.BIORARIO_F1_F2F3,
    TIPOLOGIA_FASCE.BIORARIO_F2_F1F3,
    TIPOLOGIA_FASCE.BIORARIO_F3_F1F2
  ].includes(data.CONFIGURAZIONE_FASCE);
  const isTripleBand = [
    TIPOLOGIA_FASCE.F1_F2_F3
  ].includes(data.CONFIGURAZIONE_FASCE);
  const isMultiBand = [
    TIPOLOGIA_FASCE.F1_F2_F3_F4,
    TIPOLOGIA_FASCE.F1_F2_F3_F4_F5,
    TIPOLOGIA_FASCE.F1_F2_F3_F4_F5_F6
  ].includes(data.CONFIGURAZIONE_FASCE);

  // Validate required time bands based on configuration
  if (!isSingleBand) {
    if (!data.FASCIA_F1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['FASCIA_F1'],
        message: 'La fascia F1 è obbligatoria per questa configurazione'
      });
    }
  }

  if (isDualBand || isTripleBand || isMultiBand) {
    if (!data.FASCIA_F2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['FASCIA_F2'],
        message: 'La fascia F2 è obbligatoria per questa configurazione'
      });
    }
  }

  if (isTripleBand || isMultiBand) {
    if (!data.FASCIA_F3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['FASCIA_F3'],
        message: 'La fascia F3 è obbligatoria per questa configurazione'
      });
    }
  }

  // Validate time format consistency
  const timeFields = [data.FASCIA_F1, data.FASCIA_F2, data.FASCIA_F3].filter(Boolean);
  timeFields.forEach(timeField => {
    if (timeField) {
      const timeRanges = timeField.split(',');
      timeRanges.forEach((range) => {
        const trimmedRange = range.trim();
        const [start, end] = trimmedRange.split('-');
        if (start && end) {
          const startMinutes = convertTimeToMinutes(start.trim());
          const endMinutes = convertTimeToMinutes(end.trim());
          if (startMinutes >= endMinutes && endMinutes !== 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Orario non valido: ${trimmedRange}. L'ora di fine deve essere successiva all'ora di inizio`
            });
          }
        }
      });
    }
  });
});

export type Step12Data = z.infer<typeof Step12Schema>;

// =====================================================
// VALIDATION UTILITIES
// =====================================================

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function convertTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Validates time range format and logic
 */
export function validateTimeRange(timeRange: string): boolean {
  const regex = /^[0-9]{1,2}:[0-9]{2}-[0-9]{1,2}:[0-9]{2}$/;
  if (!regex.test(timeRange)) return false;

  const [start, end] = timeRange.split('-');
  const startMinutes = convertTimeToMinutes(start);
  const endMinutes = convertTimeToMinutes(end);
  
  // Allow overnight spans (end = 00:00 means midnight)
  return startMinutes < endMinutes || endMinutes === 0;
}

/**
 * Validates day of week in Italian
 */
export function validateDayOfWeek(day: string): boolean {
  const validDays = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
  return validDays.includes(day.toLowerCase());
}

// =====================================================
// BUSINESS LOGIC HELPERS
// =====================================================

/**
 * Get time band complexity level
 */
export function getTimeBandComplexity(configurazione: TipologiaFasceType): 'semplice' | 'intermedio' | 'complesso' {
  if (configurazione === TIPOLOGIA_FASCE.MONORARIO) return 'semplice';
  if ([TIPOLOGIA_FASCE.F1_F2, TIPOLOGIA_FASCE.F1_F2_F3].includes(configurazione)) return 'intermedio';
  return 'complesso';
}

/**
 * Get required time bands for configuration
 */
export function getRequiredTimeBands(configurazione: TipologiaFasceType): string[] {
  switch (configurazione) {
    case TIPOLOGIA_FASCE.MONORARIO:
      return ['F1'];
    case TIPOLOGIA_FASCE.F1_F2:
    case TIPOLOGIA_FASCE.PEAK_OFFPEAK:
      return ['F1', 'F2'];
    case TIPOLOGIA_FASCE.F1_F2_F3:
      return ['F1', 'F2', 'F3'];
    case TIPOLOGIA_FASCE.F1_F2_F3_F4:
      return ['F1', 'F2', 'F3', 'F4'];
    case TIPOLOGIA_FASCE.F1_F2_F3_F4_F5:
      return ['F1', 'F2', 'F3', 'F4', 'F5'];
    case TIPOLOGIA_FASCE.F1_F2_F3_F4_F5_F6:
      return ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'];
    case TIPOLOGIA_FASCE.BIORARIO_F1_F2F3:
      return ['F1', 'F2+F3'];
    case TIPOLOGIA_FASCE.BIORARIO_F2_F1F3:
      return ['F2', 'F1+F3'];
    case TIPOLOGIA_FASCE.BIORARIO_F3_F1F2:
      return ['F3', 'F1+F2'];
    default:
      return ['F1', 'F2'];
  }
}

/**
 * Get configuration recommendations
 */
export function getConfigurationRecommendations(configurazione: TipologiaFasceType): {
  description: string;
  benefits: string[];
  considerations: string[];
} {
  const recommendations = {
    [TIPOLOGIA_FASCE.MONORARIO]: {
      description: 'Tariffa unica per tutte le ore del giorno',
      benefits: ['Semplicità massima', 'Facile comprensione', 'Gestione semplificata'],
      considerations: ['Non sfrutta i vantaggi delle fasce orarie', 'Meno ottimizzazione dei costi']
    },
    [TIPOLOGIA_FASCE.F1_F2]: {
      description: 'Due fasce orarie: F1 (punta) e F2 (fuori punta)',
      benefits: ['Buon equilibrio semplicità/ottimizzazione', 'Adatto per utenti domestici'],
      considerations: ['Richiede comprensione delle fasce orarie']
    },
    [TIPOLOGIA_FASCE.F1_F2_F3]: {
      description: 'Tre fasce orarie standard ARERA',
      benefits: ['Standard italiano', 'Massima ottimizzazione', 'Ampia disponibilità'],
      considerations: ['Maggiore complessità', 'Richiede attenzione agli orari']
    },
    [TIPOLOGIA_FASCE.PEAK_OFFPEAK]: {
      description: 'Configurazione internazionale Peak/OffPeak',
      benefits: ['Standard internazionale', 'Semplice da comprendere'],
      considerations: ['Potrebbe non essere ottimale in Italia']
    }
  };

  return recommendations[configurazione] || {
    description: 'Configurazione personalizzata avanzata',
    benefits: ['Massima flessibilità', 'Ottimizzazione specifica'],
    considerations: ['Elevata complessità', 'Richiede expertise tecnica']
  };
}

/**
 * Generate standard time schedules for common configurations
 */
export function generateStandardSchedule(configurazione: TipologiaFasceType): {
  FASCIA_F1?: string;
  FASCIA_F2?: string;
  FASCIA_F3?: string;
  GIORNI_SETTIMANA?: string;
} {
  switch (configurazione) {
    case TIPOLOGIA_FASCE.MONORARIO:
      return {
        FASCIA_F1: '00:00-24:00',
        GIORNI_SETTIMANA: 'lunedì, martedì, mercoledì, giovedì, venerdì, sabato, domenica'
      };

    case TIPOLOGIA_FASCE.F1_F2_F3:
      return {
        FASCIA_F1: '08:00-19:00',
        FASCIA_F2: '07:00-08:00, 19:00-23:00',
        FASCIA_F3: '23:00-07:00',
        GIORNI_SETTIMANA: 'lunedì, martedì, mercoledì, giovedì, venerdì (F1-F2), sabato, domenica (F3)'
      };

    case TIPOLOGIA_FASCE.PEAK_OFFPEAK:
      return {
        FASCIA_F1: '08:00-20:00',
        FASCIA_F2: '20:00-08:00',
        GIORNI_SETTIMANA: 'lunedì, martedì, mercoledì, giovedì, venerdì (Peak/OffPeak), sabato, domenica (OffPeak)'
      };

    default:
      return {};
  }
}

// =====================================================
// UI HELPERS
// =====================================================

/**
 * Get available configurations with labels
 */
export function getTimeBandConfigurations(): Array<{
  value: TipologiaFasceType;
  label: string;
  complexity: string;
  category: 'standard' | 'international' | 'bi-hourly' | 'advanced';
}> {
  return [
    {
      value: TIPOLOGIA_FASCE.MONORARIO,
      label: TIPOLOGIA_FASCE_LABELS[TIPOLOGIA_FASCE.MONORARIO],
      complexity: 'semplice',
      category: 'standard'
    },
    {
      value: TIPOLOGIA_FASCE.F1_F2,
      label: TIPOLOGIA_FASCE_LABELS[TIPOLOGIA_FASCE.F1_F2],
      complexity: 'intermedio',
      category: 'standard'
    },
    {
      value: TIPOLOGIA_FASCE.F1_F2_F3,
      label: TIPOLOGIA_FASCE_LABELS[TIPOLOGIA_FASCE.F1_F2_F3],
      complexity: 'intermedio',
      category: 'standard'
    },
    {
      value: TIPOLOGIA_FASCE.PEAK_OFFPEAK,
      label: TIPOLOGIA_FASCE_LABELS[TIPOLOGIA_FASCE.PEAK_OFFPEAK],
      complexity: 'semplice',
      category: 'international'
    },
    {
      value: TIPOLOGIA_FASCE.BIORARIO_F1_F2F3,
      label: TIPOLOGIA_FASCE_LABELS[TIPOLOGIA_FASCE.BIORARIO_F1_F2F3],
      complexity: 'intermedio',
      category: 'bi-hourly'
    },
    {
      value: TIPOLOGIA_FASCE.F1_F2_F3_F4,
      label: TIPOLOGIA_FASCE_LABELS[TIPOLOGIA_FASCE.F1_F2_F3_F4],
      complexity: 'complesso',
      category: 'advanced'
    },
    {
      value: TIPOLOGIA_FASCE.F1_F2_F3_F4_F5,
      label: TIPOLOGIA_FASCE_LABELS[TIPOLOGIA_FASCE.F1_F2_F3_F4_F5],
      complexity: 'complesso',
      category: 'advanced'
    },
    {
      value: TIPOLOGIA_FASCE.F1_F2_F3_F4_F5_F6,
      label: TIPOLOGIA_FASCE_LABELS[TIPOLOGIA_FASCE.F1_F2_F3_F4_F5_F6],
      complexity: 'complesso',
      category: 'advanced'
    }
  ];
}

/**
 * Format time bands for display
 */
export function formatTimeBandsForDisplay(data: Step12Data): string {
  const bands: string[] = [];
  
  if (data.FASCIA_F1) bands.push(`F1: ${data.FASCIA_F1}`);
  if (data.FASCIA_F2) bands.push(`F2: ${data.FASCIA_F2}`);
  if (data.FASCIA_F3) bands.push(`F3: ${data.FASCIA_F3}`);
  
  return bands.join(' | ');
}

/**
 * Validate complete time band configuration
 */
export function validateTimeBandConfiguration(data: Step12Data): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if required fields are present
  const complexity = getTimeBandComplexity(data.CONFIGURAZIONE_FASCE);

  if (complexity === 'complesso') {
    warnings.push('Configurazione complessa: assicurati che gli utenti comprendano le fasce orarie');
  }

  // Validate time overlaps
  const timeFields = [data.FASCIA_F1, data.FASCIA_F2, data.FASCIA_F3].filter(Boolean);
  if (timeFields.length > 1) {
    warnings.push('Verifica che non ci siano sovrapposizioni tra le fasce orarie');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// =====================================================
// XML GENERATION HELPERS
// =====================================================

/**
 * Convert to XML-compatible format
 */
export function formatForXML(data: Step12Data): Record<string, unknown> {
  return {
    TipologiaFasce: data.CONFIGURAZIONE_FASCE,
    FasciaF1: data.FASCIA_F1 || '',
    FasciaF2: data.FASCIA_F2 || '',
    FasciaF3: data.FASCIA_F3 || '',
    GiorniSettimana: data.GIORNI_SETTIMANA || '',
    OreGiorno: data.ORE_GIORNO || ''
  };
}

/**
 * Validate for XML generation
 */
export function validateForXMLGeneration(data: Step12Data): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.CONFIGURAZIONE_FASCE) {
    errors.push('Configurazione fasce orarie obbligatoria per XML');
  }

  const requiredBands = getRequiredTimeBands(data.CONFIGURAZIONE_FASCE);
  if (requiredBands.includes('F1') && !data.FASCIA_F1) {
    errors.push('Fascia F1 obbligatoria per questa configurazione');
  }
  if (requiredBands.includes('F2') && !data.FASCIA_F2) {
    errors.push('Fascia F2 obbligatoria per questa configurazione');
  }
  if (requiredBands.includes('F3') && !data.FASCIA_F3) {
    errors.push('Fascia F3 obbligatoria per questa configurazione');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export default schema
export default Step12Schema; 