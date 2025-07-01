/**
 * Step 14: Company Component Schema (ComponenteImpresa)
 * Schema Zod per la gestione delle componenti di prezzo dell'impresa
 * 
 * Defines company-specific pricing components including fixed/energy costs,
 * commercialization fees, and optional services with their pricing structures.
 */

import { z } from 'zod';
import { 
  TIPOLOGIA_COMPONENTE,
  TIPOLOGIA_COMPONENTE_LABELS,
  MACROAREA_COMPONENTE,
  MACROAREA_COMPONENTE_LABELS,
  UNITA_MISURA,
  UNITA_MISURA_LABELS,
  type TipologiaComponente,
  type MacroareaComponente,
  type UnitaMisura 
} from '../constants';

// =====================================================
// CORE SCHEMA DEFINITION
// =====================================================

export const Step14Schema = z.object({
  // Tipologia del componente (standard o optional)
  TIPOLOGIA_COMPONENTE: z.enum([
    TIPOLOGIA_COMPONENTE.STANDARD,
    TIPOLOGIA_COMPONENTE.OPTIONAL
  ] as const, {
    errorMap: () => ({ message: 'Seleziona una tipologia di componente valida' })
  }),

  // Macroarea del componente
  MACROAREA_COMPONENTE: z.enum([
    MACROAREA_COMPONENTE.CORRISPETTIVO_FISSO_COMMERCIALIZZAZIONE,
    MACROAREA_COMPONENTE.CORRISPETTIVO_ENERGIA_COMMERCIALIZZAZIONE,
    MACROAREA_COMPONENTE.COMPONENTE_PREZZO_ENERGIA,
    MACROAREA_COMPONENTE.CORRISPETTIVO_UNA_TANTUM,
    MACROAREA_COMPONENTE.ENERGIA_RINNOVABILE_GREEN
  ] as const, {
    errorMap: () => ({ message: 'Seleziona una macroarea valida' })
  }),

  // Valore del componente
  VALORE: z.number()
    .min(0, 'Il valore non può essere negativo')
    .max(9999999.99, 'Il valore non può superare 9.999.999,99')
    .multipleOf(0.01, 'Il valore deve avere massimo 2 decimali'),

  // Unità di misura
  UNITA_MISURA: z.enum([
    UNITA_MISURA.EURO_ANNO,
    UNITA_MISURA.EURO_KW,
    UNITA_MISURA.EURO_KWH,
    UNITA_MISURA.EURO_SM3,
    UNITA_MISURA.EURO,
    UNITA_MISURA.PERCENTUALE
  ] as const, {
    errorMap: () => ({ message: 'Seleziona un\'unità di misura valida' })
  }),

  // Descrizione del componente
  DESCRIZIONE: z.string()
    .min(3, 'La descrizione deve avere almeno 3 caratteri')
    .max(500, 'La descrizione non può superare 500 caratteri')
    .regex(/^[^<>]*$/, 'La descrizione non può contenere caratteri HTML'),

  // Nome del componente (breve identificativo)
  NOME_COMPONENTE: z.string()
    .min(2, 'Il nome deve avere almeno 2 caratteri')
    .max(100, 'Il nome non può superare 100 caratteri')
    .regex(/^[A-Za-z0-9\s\-_àèéìíîòóùúç]+$/, 'Il nome può contenere solo lettere, numeri, spazi e trattini')
    .optional(),

  // Applicabilità fascia oraria
  FASCIA_APPLICABILITA: z.array(z.string())
    .max(6, 'Non è possibile selezionare più di 6 fasce orarie')
    .optional(),

  // Scadenza temporale del componente
  DATA_SCADENZA: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido (YYYY-MM-DD)')
    .optional(),

  // Condizioni di applicabilità
  CONDIZIONI_APPLICABILITA: z.string()
    .max(1000, 'Le condizioni non possono superare 1000 caratteri')
    .optional(),

  // Componente soggetto a IVA
  SOGGETTO_IVA: z.boolean().default(true)

}).superRefine((data, ctx) => {
  // Validation based on component type and macro area
  const isFixedComponent = [
    MACROAREA_COMPONENTE.CORRISPETTIVO_FISSO_COMMERCIALIZZAZIONE,
    MACROAREA_COMPONENTE.CORRISPETTIVO_UNA_TANTUM
  ].includes(data.MACROAREA_COMPONENTE);

  const isEnergyComponent = [
    MACROAREA_COMPONENTE.CORRISPETTIVO_ENERGIA_COMMERCIALIZZAZIONE,
    MACROAREA_COMPONENTE.COMPONENTE_PREZZO_ENERGIA
  ].includes(data.MACROAREA_COMPONENTE);

  // Validate unit of measure compatibility with macro area
  if (isFixedComponent) {
    const validUnits = [UNITA_MISURA.EURO_ANNO, UNITA_MISURA.EURO, UNITA_MISURA.EURO_KW];
    if (!validUnits.includes(data.UNITA_MISURA)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['UNITA_MISURA'],
        message: 'Per componenti fissi utilizzare €/Anno, € o €/kW'
      });
    }
  }

  if (isEnergyComponent) {
    const validUnits = [UNITA_MISURA.EURO_KWH, UNITA_MISURA.EURO_SM3, UNITA_MISURA.PERCENTUALE];
    if (!validUnits.includes(data.UNITA_MISURA)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['UNITA_MISURA'],
        message: 'Per componenti energia utilizzare €/kWh, €/Sm3 o Percentuale'
      });
    }
  }

  // Validate percentage values
  if (data.UNITA_MISURA === UNITA_MISURA.PERCENTUALE && data.VALORE > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['VALORE'],
      message: 'Le percentuali non possono superare 100%'
    });
  }

  // Optional components require more detailed description
  if (data.TIPOLOGIA_COMPONENTE === TIPOLOGIA_COMPONENTE.OPTIONAL) {
    if (data.DESCRIZIONE.length < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DESCRIZIONE'],
        message: 'I componenti opzionali richiedono una descrizione dettagliata (minimo 20 caratteri)'
      });
    }
  }

  // Green energy components have specific requirements
  if (data.MACROAREA_COMPONENTE === MACROAREA_COMPONENTE.ENERGIA_RINNOVABILE_GREEN) {
    if (!data.DESCRIZIONE.toLowerCase().includes('rinnovabil') && !data.DESCRIZIONE.toLowerCase().includes('green')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DESCRIZIONE'],
        message: 'Per energia rinnovabile/green includere nel testo "rinnovabile" o "green"'
      });
    }
  }

  // Validate date format and logic
  if (data.DATA_SCADENZA) {
    const scadenza = new Date(data.DATA_SCADENZA);
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0); // Reset time to compare only dates
    
    if (scadenza <= oggi) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DATA_SCADENZA'],
        message: 'La data di scadenza deve essere futura'
      });
    }
  }

  // Business rule: One-time components should have euro unit
  if (data.MACROAREA_COMPONENTE === MACROAREA_COMPONENTE.CORRISPETTIVO_UNA_TANTUM) {
    if (data.UNITA_MISURA !== UNITA_MISURA.EURO) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['UNITA_MISURA'],
        message: 'I corrispettivi una tantum devono essere espressi in Euro'
      });
    }
  }
});

export type Step14Data = z.infer<typeof Step14Schema>;

// =====================================================
// VALIDATION UTILITIES
// =====================================================

/**
 * Validates component value based on unit and type
 */
export function validateComponentValue(valore: number, unitaMisura: string, tipologia: string): boolean {
  if (valore <= 0) return false;
  
  if (unitaMisura === UNITA_MISURA.PERCENTUALE && valore > 100) return false;
  
  // Optional components should have reasonable values
  if (tipologia === TIPOLOGIA_COMPONENTE.OPTIONAL && unitaMisura === UNITA_MISURA.EURO_ANNO && valore > 500) {
    // Warning: high annual optional component
    return true; // Valid but might warrant warning
  }
  
  return true;
}

/**
 * Calculate estimated annual impact of component
 */
export function calculateAnnualImpact(
  valore: number,
  unitaMisura: string,
  averageConsumption = 2700, // kWh/year
  averagePower = 3.0 // kW
): number {
  switch (unitaMisura) {
    case UNITA_MISURA.EURO_ANNO:
      return valore;
    case UNITA_MISURA.EURO_KWH:
      return valore * averageConsumption;
    case UNITA_MISURA.EURO_SM3:
      return valore * (averageConsumption * 0.8); // Approximate gas consumption
    case UNITA_MISURA.EURO_KW:
      return valore * averagePower;
    case UNITA_MISURA.EURO:
      return valore; // One-time cost
    case UNITA_MISURA.PERCENTUALE:
      // Estimate based on typical energy bill (€675/year for 2700 kWh)
      return (675 * valore) / 100;
    default:
      return 0;
  }
}

// =====================================================
// BUSINESS LOGIC HELPERS
// =====================================================

/**
 * Get component category information
 */
export function getComponentCategoryInfo(macroarea: string): {
  category: 'fixed' | 'energy' | 'service' | 'special';
  description: string;
  typicalRange: { min: number; max: number; unit: string };
  impact: 'basso' | 'medio' | 'alto';
} {
  const categoryInfo = {
    [MACROAREA_COMPONENTE.CORRISPETTIVO_FISSO_COMMERCIALIZZAZIONE]: {
      category: 'fixed' as const,
      description: 'Costo fisso per la commercializzazione',
      typicalRange: { min: 50, max: 150, unit: '€/anno' },
      impact: 'medio' as const
    },
    [MACROAREA_COMPONENTE.CORRISPETTIVO_ENERGIA_COMMERCIALIZZAZIONE]: {
      category: 'energy' as const,
      description: 'Margine sulla vendita dell\'energia',
      typicalRange: { min: 0.005, max: 0.02, unit: '€/kWh' },
      impact: 'alto' as const
    },
    [MACROAREA_COMPONENTE.COMPONENTE_PREZZO_ENERGIA]: {
      category: 'energy' as const,
      description: 'Componente del prezzo dell\'energia',
      typicalRange: { min: 0.001, max: 0.01, unit: '€/kWh' },
      impact: 'medio' as const
    },
    [MACROAREA_COMPONENTE.CORRISPETTIVO_UNA_TANTUM]: {
      category: 'service' as const,
      description: 'Costo una tantum per attivazione o servizi',
      typicalRange: { min: 10, max: 100, unit: '€' },
      impact: 'basso' as const
    },
    [MACROAREA_COMPONENTE.ENERGIA_RINNOVABILE_GREEN]: {
      category: 'special' as const,
      description: 'Supplemento per energia verde/rinnovabile',
      typicalRange: { min: 1, max: 5, unit: '% o €/MWh' },
      impact: 'basso' as const
    }
  };

  return categoryInfo[macroarea] || {
    category: 'service' as const,
    description: 'Componente non categorizzato',
    typicalRange: { min: 0, max: 0, unit: '' },
    impact: 'medio' as const
  };
}

/**
 * Get pricing recommendations based on component type
 */
export function getPricingRecommendations(tipologia: string, macroarea: string): {
  strategy: string;
  considerations: string[];
  competitiveAnalysis: string;
} {
  const isOptional = tipologia === TIPOLOGIA_COMPONENTE.OPTIONAL;
  const categoryInfo = getComponentCategoryInfo(macroarea);

  return {
    strategy: isOptional 
      ? 'Prezzo competitivo per servizi aggiuntivi'
      : 'Costo incluso nell\'offerta base',
    considerations: [
      isOptional ? 'Valore percepito dal cliente' : 'Trasparenza nella comunicazione',
      'Confronto con la concorrenza',
      categoryInfo.impact === 'alto' ? 'Impatto significativo sul prezzo finale' : 'Impatto limitato sui costi',
      'Chiarezza nelle condizioni contrattuali'
    ],
    competitiveAnalysis: `Componente ${categoryInfo.category} con impatto ${categoryInfo.impact} sui costi`
  };
}

/**
 * Check component compatibility with market type
 */
export function isComponentCompatibleWithMarket(macroarea: string, unitaMisura: string, tipoMercato: string): boolean {
  // Gas-specific units only for gas market
  if (unitaMisura === UNITA_MISURA.EURO_SM3 && tipoMercato !== 'GAS' && tipoMercato !== 'DUAL_FUEL') {
    return false;
  }

  // Some components might be market-specific
  if (macroarea === MACROAREA_COMPONENTE.ENERGIA_RINNOVABILE_GREEN && tipoMercato === 'GAS') {
    return false; // Green energy typically applies to electricity
  }

  return true;
}

/**
 * Get time band applicability suggestions
 */
export function getTimeBandSuggestions(macroarea: string): string[] {
  const energyComponents = [
    MACROAREA_COMPONENTE.CORRISPETTIVO_ENERGIA_COMMERCIALIZZAZIONE,
    MACROAREA_COMPONENTE.COMPONENTE_PREZZO_ENERGIA
  ];

  if (energyComponents.includes(macroarea)) {
    return ['F1', 'F2', 'F3', 'Peak', 'OffPeak'];
  }

  return []; // Fixed components typically don't depend on time bands
}

// =====================================================
// UI HELPERS
// =====================================================

/**
 * Get available component types with descriptions
 */
export function getComponentTypes(): Array<{
  value: string;
  label: string;
  description: string;
  includedInPrice: boolean;
}> {
  return [
    {
      value: TIPOLOGIA_COMPONENTE.STANDARD,
      label: TIPOLOGIA_COMPONENTE_LABELS[TIPOLOGIA_COMPONENTE.STANDARD],
      description: 'Componente incluso nel prezzo base dell\'offerta',
      includedInPrice: true
    },
    {
      value: TIPOLOGIA_COMPONENTE.OPTIONAL,
      label: TIPOLOGIA_COMPONENTE_LABELS[TIPOLOGIA_COMPONENTE.OPTIONAL],
      description: 'Servizio aggiuntivo opzionale con costo separato',
      includedInPrice: false
    }
  ];
}

/**
 * Get macro areas with categorization
 */
export function getMacroAreas(): Array<{
  value: string;
  label: string;
  category: string;
  suggestedUnits: string[];
}> {
  return Object.entries(MACROAREA_COMPONENTE_LABELS).map(([value, label]) => {
    const info = getComponentCategoryInfo(value);
    
    let suggestedUnits: string[] = [];
    if (info.category === 'fixed') {
      suggestedUnits = [UNITA_MISURA.EURO_ANNO, UNITA_MISURA.EURO, UNITA_MISURA.EURO_KW];
    } else if (info.category === 'energy') {
      suggestedUnits = [UNITA_MISURA.EURO_KWH, UNITA_MISURA.EURO_SM3, UNITA_MISURA.PERCENTUALE];
    } else if (info.category === 'service') {
      suggestedUnits = [UNITA_MISURA.EURO];
    }

    return {
      value,
      label,
      category: info.category,
      suggestedUnits
    };
  });
}

/**
 * Format component for display
 */
export function formatComponentForDisplay(data: Step14Data): string {
  const valoreParts = [data.VALORE.toFixed(2), UNITA_MISURA_LABELS[data.UNITA_MISURA]];
  const valore = valoreParts.join(' ');
  
  const tipologia = data.TIPOLOGIA_COMPONENTE === TIPOLOGIA_COMPONENTE.OPTIONAL ? ' (Opzionale)' : '';
  
  return `${data.DESCRIZIONE}: ${valore}${tipologia}`;
}

/**
 * Validate complete component configuration
 */
export function validateComponentConfiguration(data: Step14Data): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const categoryInfo = getComponentCategoryInfo(data.MACROAREA_COMPONENTE);
  const annualImpact = calculateAnnualImpact(data.VALORE, data.UNITA_MISURA);

  // Check value reasonableness
  const { min, max } = categoryInfo.typicalRange;
  if (data.UNITA_MISURA === UNITA_MISURA.EURO_ANNO) {
    if (data.VALORE < min || data.VALORE > max * 2) {
      warnings.push(`Valore fuori dal range tipico (${min}-${max} €/anno)`);
    }
  }

  // Check high impact components
  if (annualImpact > 300) {
    warnings.push('Componente con impatto elevato sui costi annuali (>300€)');
  }

  // Check optional pricing strategy
  if (data.TIPOLOGIA_COMPONENTE === TIPOLOGIA_COMPONENTE.OPTIONAL && annualImpact < 10) {
    warnings.push('Componente opzionale con valore molto basso - considera se includerlo nell\'offerta base');
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
export function formatForXML(data: Step14Data): Record<string, any> {
  const xmlData: Record<string, any> = {
    TipologiaComponente: data.TIPOLOGIA_COMPONENTE,
    MacroareaComponente: data.MACROAREA_COMPONENTE,
    Valore: data.VALORE.toFixed(2),
    UnitaMisura: data.UNITA_MISURA,
    Descrizione: data.DESCRIZIONE,
    SoggettoIVA: data.SOGGETTO_IVA ? 'SI' : 'NO'
  };

  if (data.NOME_COMPONENTE) {
    xmlData.NomeComponente = data.NOME_COMPONENTE;
  }

  if (data.FASCIA_APPLICABILITA && data.FASCIA_APPLICABILITA.length > 0) {
    xmlData.FasceApplicabilita = data.FASCIA_APPLICABILITA.join(';');
  }

  if (data.DATA_SCADENZA) {
    xmlData.DataScadenza = data.DATA_SCADENZA;
  }

  if (data.CONDIZIONI_APPLICABILITA) {
    xmlData.CondizioniApplicabilita = data.CONDIZIONI_APPLICABILITA;
  }

  return xmlData;
}

/**
 * Validate for XML generation
 */
export function validateForXMLGeneration(data: Step14Data): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.TIPOLOGIA_COMPONENTE) {
    errors.push('Tipologia componente obbligatoria per XML');
  }

  if (!data.MACROAREA_COMPONENTE) {
    errors.push('Macroarea componente obbligatoria per XML');
  }

  if (data.VALORE <= 0) {
    errors.push('Valore componente deve essere positivo per XML');
  }

  if (!data.UNITA_MISURA) {
    errors.push('Unità di misura obbligatoria per XML');
  }

  if (!data.DESCRIZIONE || data.DESCRIZIONE.trim().length < 3) {
    errors.push('Descrizione componente obbligatoria per XML (minimo 3 caratteri)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export default schema
export default Step14Schema; 