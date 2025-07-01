/**
 * Step 13: Dispatching Schema (Dispacciamento)
 * Schema Zod per la gestione dei costi di dispacciamento
 * 
 * Defines dispatching costs and calculation methods for energy offers,
 * including fixed values, percentages, and various dispatching types.
 */

import { z } from 'zod';
import { 
  TIPO_DISPACCIAMENTO, 
  TIPO_DISPACCIAMENTO_LABELS,
  UNITA_MISURA,
  UNITA_MISURA_LABELS
} from '../constants';

// =====================================================
// CORE SCHEMA DEFINITION
// =====================================================

export const Step13Schema = z.object({
  // Tipo di dispacciamento
  TIPO_DISPACCIAMENTO: z.enum([
    TIPO_DISPACCIAMENTO.DISP_DEL_111_06,
    TIPO_DISPACCIAMENTO.PD,
    TIPO_DISPACCIAMENTO.MSD,
    TIPO_DISPACCIAMENTO.MODULAZIONE_EOLICO,
    TIPO_DISPACCIAMENTO.UNITA_ESSENZIALI,
    TIPO_DISPACCIAMENTO.FUNZ_TERNA,
    TIPO_DISPACCIAMENTO.CAPACITA_PRODUTTIVA,
    TIPO_DISPACCIAMENTO.INTERROMPIBILITA,
    TIPO_DISPACCIAMENTO.CORRISPETTIVO_CAPACITA_STG,
    TIPO_DISPACCIAMENTO.CORRISPETTIVO_CAPACITA_MT,
    TIPO_DISPACCIAMENTO.REINTEGRAZIONE_SALVAGUARDIA,
    TIPO_DISPACCIAMENTO.REINTEGRAZIONE_TUTELE,
    TIPO_DISPACCIAMENTO.DISP_BT,
    TIPO_DISPACCIAMENTO.ALTRO
  ] as const, {
    errorMap: () => ({ message: 'Seleziona un tipo di dispacciamento valido' })
  }),

  // Modalità di calcolo del costo
  MODALITA_CALCOLO: z.enum(['FISSO', 'PERCENTUALE', 'VARIABILE'] as const, {
    errorMap: () => ({ message: 'Seleziona una modalità di calcolo valida' })
  }),

  // Valore fisso (quando modalità = FISSO)
  VALORE_FISSO: z.number()
    .min(0, 'Il valore fisso non può essere negativo')
    .max(999999.99, 'Il valore fisso non può superare 999.999,99 €')
    .multipleOf(0.01, 'Il valore fisso deve avere massimo 2 decimali')
    .optional(),

  // Percentuale (quando modalità = PERCENTUALE)
  PERCENTUALE: z.number()
    .min(0, 'La percentuale non può essere negativa')
    .max(100, 'La percentuale non può superare 100%')
    .multipleOf(0.01, 'La percentuale deve avere massimo 2 decimali')
    .optional(),

  // Unità di misura per il valore fisso
  UNITA_MISURA: z.enum([
    UNITA_MISURA.EURO_ANNO,
    UNITA_MISURA.EURO_KW,
    UNITA_MISURA.EURO_KWH,
    UNITA_MISURA.EURO,
    UNITA_MISURA.PERCENTUALE
  ] as const, {
    errorMap: () => ({ message: 'Seleziona un\'unità di misura valida' })
  }).optional(),

  // Descrizione aggiuntiva per modalità variabile o altro
  DESCRIZIONE: z.string()
    .min(1, 'La descrizione non può essere vuota')
    .max(1000, 'La descrizione non può superare 1000 caratteri')
    .regex(/^[^<>]*$/, 'La descrizione non può contenere caratteri HTML')
    .optional(),

  // Incluso nel prezzo base
  INCLUSO_PREZZO: z.boolean().default(false),

  // Applicabile solo a determinati clienti
  SOLO_CLIENTI_SPECIFICI: z.boolean().default(false),

  // Lista delle categorie di clienti (se applicabile)
  CATEGORIE_CLIENTI: z.array(z.string())
    .max(10, 'Non è possibile selezionare più di 10 categorie')
    .optional()

}).superRefine((data, ctx) => {
  // Validation based on calculation method
  if (data.MODALITA_CALCOLO === 'FISSO') {
    if (data.VALORE_FISSO === undefined || data.VALORE_FISSO <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['VALORE_FISSO'],
        message: 'Il valore fisso è obbligatorio per la modalità di calcolo fissa'
      });
    }
    if (!data.UNITA_MISURA) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['UNITA_MISURA'],
        message: 'L\'unità di misura è obbligatoria per la modalità di calcolo fissa'
      });
    }
    // Clear percentage when using fixed value
    if (data.PERCENTUALE !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['PERCENTUALE'],
        message: 'Non è possibile specificare una percentuale con modalità di calcolo fissa'
      });
    }
  }

  if (data.MODALITA_CALCOLO === 'PERCENTUALE') {
    if (data.PERCENTUALE === undefined || data.PERCENTUALE <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['PERCENTUALE'],
        message: 'La percentuale è obbligatoria per la modalità di calcolo percentuale'
      });
    }
    // Clear fixed value when using percentage
    if (data.VALORE_FISSO !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['VALORE_FISSO'],
        message: 'Non è possibile specificare un valore fisso con modalità di calcolo percentuale'
      });
    }
  }

  if (data.MODALITA_CALCOLO === 'VARIABILE') {
    if (!data.DESCRIZIONE || data.DESCRIZIONE.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DESCRIZIONE'],
        message: 'Una descrizione dettagliata (minimo 10 caratteri) è obbligatoria per la modalità variabile'
      });
    }
  }

  // Validate specific client categories when flag is set
  if (data.SOLO_CLIENTI_SPECIFICI && (!data.CATEGORIE_CLIENTI || data.CATEGORIE_CLIENTI.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['CATEGORIE_CLIENTI'],
      message: 'Specificare le categorie di clienti quando è selezionato "Solo clienti specifici"'
    });
  }

  // Validate unit of measure consistency
  if (data.UNITA_MISURA === UNITA_MISURA.PERCENTUALE && data.MODALITA_CALCOLO !== 'PERCENTUALE') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['UNITA_MISURA'],
      message: 'L\'unità di misura "Percentuale" può essere usata solo con modalità di calcolo percentuale'
    });
  }

  // Business rule: Some dispatching types have restrictions
  if (data.TIPO_DISPACCIAMENTO === TIPO_DISPACCIAMENTO.ALTRO && (!data.DESCRIZIONE || data.DESCRIZIONE.length < 20)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DESCRIZIONE'],
      message: 'Per "Altro" è necessaria una descrizione dettagliata (minimo 20 caratteri)'
    });
  }
});

export type Step13Data = z.infer<typeof Step13Schema>;

// =====================================================
// VALIDATION UTILITIES
// =====================================================

/**
 * Validates dispatching cost calculation
 */
export function validateDispatchingCalculation(modalita: string, valore?: number, percentuale?: number): boolean {
  switch (modalita) {
    case 'FISSO':
      return valore !== undefined && valore > 0;
    case 'PERCENTUALE':
      return percentuale !== undefined && percentuale > 0 && percentuale <= 100;
    case 'VARIABILE':
      return true; // Description validation handled in schema
    default:
      return false;
  }
}

/**
 * Calculate estimated annual cost based on average consumption
 */
export function calculateEstimatedAnnualCost(
  modalita: string,
  valore?: number,
  percentuale?: number,
  unitaMisura?: string,
  averageConsumption = 2700 // kWh/year for typical household
): number | null {
  if (modalita === 'FISSO' && valore && unitaMisura) {
    switch (unitaMisura) {
      case UNITA_MISURA.EURO_ANNO:
        return valore;
      case UNITA_MISURA.EURO_KWH:
        return valore * averageConsumption;
      case UNITA_MISURA.EURO:
        return valore; // One-time cost
      default:
        return null;
    }
  }
  
  if (modalita === 'PERCENTUALE' && percentuale) {
    // Estimate based on typical energy cost (€0.25/kWh)
    const typicalEnergyCost = averageConsumption * 0.25;
    return (typicalEnergyCost * percentuale) / 100;
  }
  
  return null; // Variable calculation not possible without more info
}

// =====================================================
// BUSINESS LOGIC HELPERS
// =====================================================

/**
 * Get dispatching type category and complexity
 */
export function getDispatchingTypeInfo(tipo: string): {
  category: 'standard' | 'advanced' | 'special' | 'other';
  complexity: 'semplice' | 'intermedio' | 'complesso';
  requiresApproval: boolean;
  description: string;
} {
  const typeInfo = {
    [TIPO_DISPACCIAMENTO.DISP_DEL_111_06]: {
      category: 'standard' as const,
      complexity: 'semplice' as const,
      requiresApproval: false,
      description: 'Dispacciamento standard secondo delibera 111/06'
    },
    [TIPO_DISPACCIAMENTO.PD]: {
      category: 'standard' as const,
      complexity: 'semplice' as const,
      requiresApproval: false,
      description: 'Prezzo di Dispacciamento standard'
    },
    [TIPO_DISPACCIAMENTO.MSD]: {
      category: 'advanced' as const,
      complexity: 'intermedio' as const,
      requiresApproval: true,
      description: 'Mercato del Servizio del Dispacciamento'
    },
    [TIPO_DISPACCIAMENTO.CAPACITA_PRODUTTIVA]: {
      category: 'special' as const,
      complexity: 'complesso' as const,
      requiresApproval: true,
      description: 'Corrispettivo per capacità produttiva'
    },
    [TIPO_DISPACCIAMENTO.ALTRO]: {
      category: 'other' as const,
      complexity: 'complesso' as const,
      requiresApproval: true,
      description: 'Tipo di dispacciamento personalizzato'
    }
  };

  return typeInfo[tipo] || {
    category: 'standard' as const,
    complexity: 'intermedio' as const,
    requiresApproval: false,
    description: 'Tipo di dispacciamento non categorizzato'
  };
}

/**
 * Get calculation method recommendations
 */
export function getCalculationMethodRecommendations(modalita: string): {
  description: string;
  benefits: string[];
  considerations: string[];
  bestFor: string[];
} {
  const recommendations = {
    FISSO: {
      description: 'Valore fisso costante indipendente dal consumo',
      benefits: [
        'Prevedibilità massima per il cliente',
        'Semplicità di calcolo e comunicazione',
        'Trasparenza nei costi'
      ],
      considerations: [
        'Non riflette variazioni di mercato',
        'Può essere svantaggioso per consumi variabili'
      ],
      bestFor: ['Piccoli consumatori', 'Clienti domestici', 'Offerte semplici']
    },
    PERCENTUALE: {
      description: 'Percentuale calcolata sul costo dell\'energia',
      benefits: [
        'Si adatta ai consumi del cliente',
        'Riflette le variazioni di mercato',
        'Equità proporzionale'
      ],
      considerations: [
        'Meno prevedibilità per il cliente',
        'Complessità di calcolo maggiore'
      ],
      bestFor: ['Grandi consumatori', 'Clienti business', 'Offerte indicizzate']
    },
    VARIABILE: {
      description: 'Calcolo variabile secondo criteri specifici',
      benefits: [
        'Massima flessibilità',
        'Ottimizzazione caso per caso',
        'Adattabilità a situazioni speciali'
      ],
      considerations: [
        'Complessità elevata',
        'Necessita comunicazione dettagliata',
        'Richiede approvazione regolamentare'
      ],
      bestFor: ['Offerte speciali', 'Clienti industriali', 'Contratti personalizzati']
    }
  };

  return recommendations[modalita] || recommendations.FISSO;
}

/**
 * Check if dispatching type is available for market type
 */
export function isDispatchingAvailableForMarket(tipoDisp: string, tipoMercato: string): boolean {
  // Some dispatching types are only available for electricity
  const electricityOnly = [
    TIPO_DISPACCIAMENTO.DISP_DEL_111_06,
    TIPO_DISPACCIAMENTO.PD,
    TIPO_DISPACCIAMENTO.MSD,
    TIPO_DISPACCIAMENTO.MODULAZIONE_EOLICO,
    TIPO_DISPACCIAMENTO.DISP_BT
  ];

  if (electricityOnly.includes(tipoDisp) && tipoMercato === 'GAS') {
    return false;
  }

  return true;
}

/**
 * Get impact on final price
 */
export function getPriceImpactAnalysis(data: Step13Data): {
  impact: 'basso' | 'medio' | 'alto';
  explanation: string;
  estimatedIncrease: string;
} {
  if (data.INCLUSO_PREZZO) {
    return {
      impact: 'basso',
      explanation: 'Costo già incluso nel prezzo base',
      estimatedIncrease: '0%'
    };
  }

  if (data.MODALITA_CALCOLO === 'FISSO' && data.VALORE_FISSO) {
    const annualCost = calculateEstimatedAnnualCost(
      data.MODALITA_CALCOLO,
      data.VALORE_FISSO,
      undefined,
      data.UNITA_MISURA
    );

    if (annualCost && annualCost < 50) {
      return {
        impact: 'basso',
        explanation: 'Costo fisso contenuto',
        estimatedIncrease: '<2%'
      };
    } else if (annualCost && annualCost < 150) {
      return {
        impact: 'medio',
        explanation: 'Costo fisso moderato',
        estimatedIncrease: '2-5%'
      };
    } else {
      return {
        impact: 'alto',
        explanation: 'Costo fisso significativo',
        estimatedIncrease: '>5%'
      };
    }
  }

  if (data.MODALITA_CALCOLO === 'PERCENTUALE' && data.PERCENTUALE) {
    if (data.PERCENTUALE < 2) {
      return {
        impact: 'basso',
        explanation: 'Percentuale contenuta',
        estimatedIncrease: `${data.PERCENTUALE}%`
      };
    } else if (data.PERCENTUALE < 5) {
      return {
        impact: 'medio',
        explanation: 'Percentuale moderata',
        estimatedIncrease: `${data.PERCENTUALE}%`
      };
    } else {
      return {
        impact: 'alto',
        explanation: 'Percentuale significativa',
        estimatedIncrease: `${data.PERCENTUALE}%`
      };
    }
  }

  return {
    impact: 'medio',
    explanation: 'Impatto variabile da determinare',
    estimatedIncrease: 'Variabile'
  };
}

// =====================================================
// UI HELPERS
// =====================================================

/**
 * Get available dispatching types with categorization
 */
export function getDispatchingTypes(): Array<{
  value: string;
  label: string;
  category: string;
  complexity: string;
  requiresApproval: boolean;
}> {
  return Object.entries(TIPO_DISPACCIAMENTO_LABELS).map(([value, label]) => {
    const info = getDispatchingTypeInfo(value);
    return {
      value,
      label,
      category: info.category,
      complexity: info.complexity,
      requiresApproval: info.requiresApproval
    };
  });
}

/**
 * Format dispatching cost for display
 */
export function formatDispatchingCostForDisplay(data: Step13Data): string {
  if (data.INCLUSO_PREZZO) {
    return 'Incluso nel prezzo';
  }

  if (data.MODALITA_CALCOLO === 'FISSO' && data.VALORE_FISSO && data.UNITA_MISURA) {
    return `${data.VALORE_FISSO.toFixed(2)} ${UNITA_MISURA_LABELS[data.UNITA_MISURA]}`;
  }

  if (data.MODALITA_CALCOLO === 'PERCENTUALE' && data.PERCENTUALE) {
    return `${data.PERCENTUALE}% sul costo energia`;
  }

  if (data.MODALITA_CALCOLO === 'VARIABILE') {
    return 'Calcolo variabile (vedi descrizione)';
  }

  return 'Non specificato';
}

/**
 * Validate complete dispatching configuration
 */
export function validateDispatchingConfiguration(data: Step13Data): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const typeInfo = getDispatchingTypeInfo(data.TIPO_DISPACCIAMENTO);
  const priceImpact = getPriceImpactAnalysis(data);

  // Check for approval requirements
  if (typeInfo.requiresApproval) {
    warnings.push('Questo tipo di dispacciamento richiede approvazione regolamentare');
  }

  // Check price impact
  if (priceImpact.impact === 'alto') {
    warnings.push('Impatto significativo sul prezzo finale - considera comunicazione chiara al cliente');
  }

  // Check calculation consistency
  if (data.MODALITA_CALCOLO === 'FISSO' && data.UNITA_MISURA === UNITA_MISURA.PERCENTUALE) {
    errors.push('Inconsistenza: modalità fissa con unità percentuale');
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
export function formatForXML(data: Step13Data): Record<string, unknown> {
  const xmlData: Record<string, unknown> = {
    TipoDisp: data.TIPO_DISPACCIAMENTO,
    ModalitaCalcolo: data.MODALITA_CALCOLO,
    InclusoPrezzo: data.INCLUSO_PREZZO ? 'SI' : 'NO'
  };

  if (data.VALORE_FISSO !== undefined) {
    xmlData.ValoreFisso = data.VALORE_FISSO.toFixed(2);
  }

  if (data.PERCENTUALE !== undefined) {
    xmlData.Percentuale = data.PERCENTUALE.toFixed(2);
  }

  if (data.UNITA_MISURA) {
    xmlData.UnitaMisura = data.UNITA_MISURA;
  }

  if (data.DESCRIZIONE) {
    xmlData.Descrizione = data.DESCRIZIONE;
  }

  if (data.SOLO_CLIENTI_SPECIFICI) {
    xmlData.SoloClientiSpecifici = 'SI';
    if (data.CATEGORIE_CLIENTI && data.CATEGORIE_CLIENTI.length > 0) {
      xmlData.CategorieClienti = data.CATEGORIE_CLIENTI.join(';');
    }
  }

  return xmlData;
}

/**
 * Validate for XML generation
 */
export function validateForXMLGeneration(data: Step13Data): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.TIPO_DISPACCIAMENTO) {
    errors.push('Tipo di dispacciamento obbligatorio per XML');
  }

  if (!data.MODALITA_CALCOLO) {
    errors.push('Modalità di calcolo obbligatoria per XML');
  }

  if (data.MODALITA_CALCOLO === 'FISSO' && !data.VALORE_FISSO) {
    errors.push('Valore fisso obbligatorio per modalità fissa');
  }

  if (data.MODALITA_CALCOLO === 'PERCENTUALE' && !data.PERCENTUALE) {
    errors.push('Percentuale obbligatoria per modalità percentuale');
  }

  if (data.MODALITA_CALCOLO === 'VARIABILE' && !data.DESCRIZIONE) {
    errors.push('Descrizione obbligatoria per modalità variabile');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export default schema
export default Step13Schema; 