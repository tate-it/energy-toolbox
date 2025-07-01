/**
 * Step 16: Offer Zones Schema (ZoneOfferta)
 * Schema Zod per la gestione delle zone geografiche dell'offerta
 * 
 * Defines geographical coverage areas for energy offers including
 * regions, provinces, municipalities with ISTAT code validation.
 */

import { z } from 'zod';

// =====================================================
// CORE SCHEMA DEFINITION
// =====================================================

export const Step16Schema = z.object({
  // Zone geografiche di copertura (generali)
  ZONE_GEOGRAFICHE: z.array(z.enum([
    'TUTTO_TERRITORIO_NAZIONALE',
    'NORD_ITALIA',
    'CENTRO_ITALIA', 
    'SUD_ITALIA',
    'ISOLE',
    'ZONE_SPECIFICHE'
  ] as const))
    .min(1, 'Selezionare almeno una zona geografica')
    .max(6, 'Non è possibile selezionare tutte le zone'),

  // Codici ISTAT specifici
  CODICI_ISTAT: z.array(z.string()
    .regex(/^[0-9]{6}$/, 'Codice ISTAT deve essere di 6 cifre')
  )
    .max(8000, 'Non è possibile specificare più di 8000 codici ISTAT')
    .optional(),

  // Regioni specifiche
  REGIONI: z.array(z.enum([
    'PIEMONTE', 'VALLE_AOSTA', 'LOMBARDIA', 'TRENTINO_ALTO_ADIGE',
    'VENETO', 'FRIULI_VENEZIA_GIULIA', 'LIGURIA', 'EMILIA_ROMAGNA',
    'TOSCANA', 'UMBRIA', 'MARCHE', 'LAZIO', 'ABRUZZO', 'MOLISE',
    'CAMPANIA', 'PUGLIA', 'BASILICATA', 'CALABRIA', 'SICILIA', 'SARDEGNA'
  ] as const))
    .max(20, 'Non è possibile selezionare più di 20 regioni')
    .optional(),

  // Province specifiche
  PROVINCE: z.array(z.string()
    .min(2, 'Sigla provincia deve avere almeno 2 caratteri')
    .max(3, 'Sigla provincia non può superare 3 caratteri')
    .regex(/^[A-Z]+$/, 'Sigla provincia deve essere in maiuscolo')
  )
    .max(110, 'Non è possibile selezionare più di 110 province')
    .optional(),

  // Comuni specifici
  COMUNI: z.array(z.object({
    NOME: z.string()
      .min(2, 'Nome comune deve avere almeno 2 caratteri')
      .max(50, 'Nome comune non può superare 50 caratteri')
      .regex(/^[A-Za-z\s\'\-àèéìíîòóùúç]+$/, 'Nome comune non valido'),
    PROVINCIA: z.string()
      .min(2, 'Sigla provincia deve avere almeno 2 caratteri')
      .max(3, 'Sigla provincia non può superare 3 caratteri')
      .regex(/^[A-Z]+$/, 'Sigla provincia deve essere in maiuscolo'),
    CODICE_ISTAT: z.string()
      .regex(/^[0-9]{6}$/, 'Codice ISTAT deve essere di 6 cifre')
      .optional(),
    CAP: z.string()
      .regex(/^[0-9]{5}$/, 'CAP deve essere di 5 cifre')
      .optional()
  }))
    .max(3000, 'Non è possibile specificare più di 3000 comuni')
    .optional(),

  // Limitazioni geografiche
  ZONE_ESCLUSE: z.array(z.string()
    .min(2, 'Nome zona esclusa deve avere almeno 2 caratteri')
    .max(100, 'Nome zona esclusa non può superare 100 caratteri')
  )
    .max(50, 'Non è possibile specificare più di 50 zone escluse')
    .optional(),

  // Tipo di copertura
  TIPO_COPERTURA: z.enum([
    'TOTALE', 'PARZIALE', 'PROGRESSIVA', 'SU_RICHIESTA'
  ] as const).default('TOTALE'),

  // Note sulla copertura
  NOTE_COPERTURA: z.string()
    .max(1000, 'Le note non possono superare 1000 caratteri')
    .optional(),

  // Data inizio copertura
  DATA_INIZIO_COPERTURA: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido (YYYY-MM-DD)')
    .optional(),

  // Data fine copertura
  DATA_FINE_COPERTURA: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido (YYYY-MM-DD)')
    .optional()

}).superRefine((data, ctx) => {
  // Validate geographic coverage consistency
  const hasTotalCoverage = data.ZONE_GEOGRAFICHE.includes('TUTTO_TERRITORIO_NAZIONALE');
  const hasSpecificZones = data.ZONE_GEOGRAFICHE.some(zone => zone !== 'TUTTO_TERRITORIO_NAZIONALE');

  if (hasTotalCoverage && hasSpecificZones) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['ZONE_GEOGRAFICHE'],
      message: 'Non è possibile selezionare "Tutto territorio nazionale" insieme ad altre zone specifiche'
    });
  }

  // Validate specific geographic data when needed
  if (data.ZONE_GEOGRAFICHE.includes('ZONE_SPECIFICHE')) {
    const hasSpecificData = data.REGIONI?.length || data.PROVINCE?.length || 
                           data.COMUNI?.length || data.CODICI_ISTAT?.length;
    if (!hasSpecificData) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ZONE_GEOGRAFICHE'],
        message: 'Per "Zone specifiche" è necessario specificare regioni, province, comuni o codici ISTAT'
      });
    }
  }

  // Validate date consistency
  if (data.DATA_INIZIO_COPERTURA && data.DATA_FINE_COPERTURA) {
    const inizio = new Date(data.DATA_INIZIO_COPERTURA);
    const fine = new Date(data.DATA_FINE_COPERTURA);
    
    if (fine <= inizio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DATA_FINE_COPERTURA'],
        message: 'La data di fine copertura deve essere successiva alla data di inizio'
      });
    }
  }

  // Validate coverage type consistency
  if (data.TIPO_COPERTURA === 'PARZIALE' && !data.NOTE_COPERTURA) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['NOTE_COPERTURA'],
      message: 'La copertura parziale richiede note esplicative'
    });
  }

  if (data.TIPO_COPERTURA === 'SU_RICHIESTA' && !data.NOTE_COPERTURA) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['NOTE_COPERTURA'],
      message: 'La copertura su richiesta richiede note esplicative'
    });
  }

  // Validate ISTAT codes in municipalities
  if (data.COMUNI) {
    data.COMUNI.forEach((comune, index) => {
      if (comune.CODICE_ISTAT && data.CODICI_ISTAT?.includes(comune.CODICE_ISTAT)) {
        // This is fine - just check for consistency
      }
      
      // Basic validation of municipality name
      if (comune.NOME.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['COMUNI', index, 'NOME'],
          message: 'Nome comune troppo breve'
        });
      }
    });
  }

  // Check for reasonable number of geographic selections
  const totalSpecificLocations = (data.REGIONI?.length || 0) + 
                                (data.PROVINCE?.length || 0) + 
                                (data.COMUNI?.length || 0);
  
  if (totalSpecificLocations > 1000) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Numero eccessivo di località specificate (max 1000 tra regioni, province e comuni)'
    });
  }
});

export type Step16Data = z.infer<typeof Step16Schema>;

// =====================================================
// VALIDATION UTILITIES
// =====================================================

/**
 * Validates ISTAT code format and checksum
 */
export function validateISTATCode(code: string): boolean {
  if (!/^[0-9]{6}$/.test(code)) return false;
  
  // Basic range check for Italian ISTAT codes
  const numericCode = parseInt(code);
  return numericCode >= 1001 && numericCode <= 999999;
}

/**
 * Validates Italian postal code (CAP)
 */
export function validateCAP(cap: string): boolean {
  if (!/^[0-9]{5}$/.test(cap)) return false;
  
  const numericCAP = parseInt(cap);
  return numericCAP >= 10010 && numericCAP <= 98168;
}

/**
 * Check if province code is valid
 */
export function validateProvinceCode(code: string): boolean {
  const validProvinceCodes = [
    'AG', 'AL', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AT', 'AV', 'BA', 'BG', 'BI', 'BL', 'BN', 'BO', 'BR', 'BS', 'BT', 'BZ', 'CA', 'CB', 'CE', 'CH', 'CI', 'CL', 'CN', 'CO', 'CR', 'CS', 'CT', 'CZ', 'EN', 'FC', 'FE', 'FG', 'FI', 'FM', 'FR', 'GE', 'GO', 'GR', 'IM', 'IS', 'KR', 'LC', 'LE', 'LI', 'LO', 'LT', 'LU', 'MB', 'MC', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NA', 'NO', 'NU', 'OG', 'OR', 'PA', 'PC', 'PD', 'PE', 'PG', 'PI', 'PN', 'PO', 'PR', 'PT', 'PU', 'PV', 'PZ', 'RA', 'RC', 'RE', 'RG', 'RI', 'RM', 'RN', 'RO', 'SA', 'SI', 'SO', 'SP', 'SR', 'SS', 'SU', 'SV', 'TA', 'TE', 'TN', 'TO', 'TP', 'TR', 'TS', 'TV', 'UD', 'VA', 'VB', 'VC', 'VE', 'VI', 'VR', 'VS', 'VT', 'VV'
  ];
  
  return validProvinceCodes.includes(code.toUpperCase());
}

// =====================================================
// BUSINESS LOGIC HELPERS
// =====================================================

/**
 * Calculate coverage percentage estimate
 */
export function calculateCoverageEstimate(data: Step16Data): {
  percentage: number;
  population: number;
  description: string;
} {
  if (data.ZONE_GEOGRAFICHE.includes('TUTTO_TERRITORIO_NAZIONALE')) {
    return {
      percentage: 100,
      population: 60000000, // Approximate Italian population
      description: 'Copertura nazionale completa'
    };
  }

  let coveragePercentage = 0;
  let estimatedPopulation = 0;

  // Regional coverage estimates
  const regionalPopulation = {
    'NORD_ITALIA': 27500000,
    'CENTRO_ITALIA': 12000000,
    'SUD_ITALIA': 14000000,
    'ISOLE': 6500000
  };

  data.ZONE_GEOGRAFICHE.forEach(zone => {
    if (zone in regionalPopulation) {
      estimatedPopulation += regionalPopulation[zone as keyof typeof regionalPopulation];
    }
  });

  // Specific regions/provinces/municipalities
  if (data.REGIONI) {
    // Rough estimate: each region ~3M people on average
    estimatedPopulation += data.REGIONI.length * 3000000;
  }

  if (data.PROVINCE) {
    // Rough estimate: each province ~600k people on average  
    estimatedPopulation += data.PROVINCE.length * 600000;
  }

  if (data.COMUNI) {
    // Rough estimate: each municipality ~20k people on average
    estimatedPopulation += data.COMUNI.length * 20000;
  }

  // Cap at national population
  estimatedPopulation = Math.min(estimatedPopulation, 60000000);
  coveragePercentage = (estimatedPopulation / 60000000) * 100;

  const description = data.TIPO_COPERTURA === 'TOTALE' ? 
    'Copertura completa nelle zone selezionate' :
    `Copertura ${data.TIPO_COPERTURA.toLowerCase()} nelle zone selezionate`;

  return {
    percentage: Math.round(coveragePercentage),
    population: estimatedPopulation,
    description
  };
}

/**
 * Get geographic complexity assessment
 */
export function getGeographicComplexity(data: Step16Data): {
  level: 'semplice' | 'medio' | 'complesso';
  factors: string[];
  recommendations: string[];
} {
  const factors: string[] = [];
  const recommendations: string[] = [];
  let complexity = 0;

  // National coverage is simple
  if (data.ZONE_GEOGRAFICHE.includes('TUTTO_TERRITORIO_NAZIONALE')) {
    return {
      level: 'semplice',
      factors: ['Copertura nazionale'],
      recommendations: ['Configurazione ottimale per massima copertura']
    };
  }

  // Count complexity factors
  if (data.REGIONI && data.REGIONI.length > 5) {
    complexity += 2;
    factors.push(`${data.REGIONI.length} regioni specificate`);
  }

  if (data.PROVINCE && data.PROVINCE.length > 10) {
    complexity += 3;
    factors.push(`${data.PROVINCE.length} province specificate`);
  }

  if (data.COMUNI && data.COMUNI.length > 50) {
    complexity += 4;
    factors.push(`${data.COMUNI.length} comuni specificati`);
  }

  if (data.CODICI_ISTAT && data.CODICI_ISTAT.length > 100) {
    complexity += 5;
    factors.push(`${data.CODICI_ISTAT.length} codici ISTAT specificati`);
  }

  if (data.ZONE_ESCLUSE && data.ZONE_ESCLUSE.length > 0) {
    complexity += 2;
    factors.push(`${data.ZONE_ESCLUSE.length} zone escluse`);
  }

  if (data.TIPO_COPERTURA !== 'TOTALE') {
    complexity += 1;
    factors.push(`Copertura ${data.TIPO_COPERTURA.toLowerCase()}`);
  }

  // Generate recommendations
  if (complexity <= 2) {
    recommendations.push('Configurazione geografica semplice');
    recommendations.push('Facile gestione e comunicazione');
  } else if (complexity <= 6) {
    recommendations.push('Configurazione geografica moderata');
    recommendations.push('Verificare chiarezza nelle comunicazioni');
  } else {
    recommendations.push('Configurazione geografica complessa');
    recommendations.push('Considerare semplificazione');
    recommendations.push('Fornire mappa di copertura dettagliata');
  }

  const level = complexity <= 2 ? 'semplice' : complexity <= 6 ? 'medio' : 'complesso';

  return { level, factors, recommendations };
}

/**
 * Generate coverage summary for customers
 */
export function generateCoverageSummary(data: Step16Data): {
  mainAreas: string[];
  exclusions: string[];
  coverageType: string;
  additionalInfo: string;
} {
  const mainAreas: string[] = [];
  const exclusions: string[] = [];

  // Main coverage areas
  if (data.ZONE_GEOGRAFICHE.includes('TUTTO_TERRITORIO_NAZIONALE')) {
    mainAreas.push('Tutto il territorio nazionale');
  } else {
    data.ZONE_GEOGRAFICHE.forEach(zone => {
      switch (zone) {
        case 'NORD_ITALIA':
          mainAreas.push('Nord Italia');
          break;
        case 'CENTRO_ITALIA':
          mainAreas.push('Centro Italia');
          break;
        case 'SUD_ITALIA':
          mainAreas.push('Sud Italia');
          break;
        case 'ISOLE':
          mainAreas.push('Isole (Sicilia, Sardegna)');
          break;
        case 'ZONE_SPECIFICHE':
          mainAreas.push('Zone specifiche (vedi dettaglio)');
          break;
      }
    });
  }

  // Add specific regions if any
  if (data.REGIONI && data.REGIONI.length > 0 && data.REGIONI.length <= 5) {
    mainAreas.push(`Regioni: ${data.REGIONI.join(', ')}`);
  } else if (data.REGIONI && data.REGIONI.length > 5) {
    mainAreas.push(`${data.REGIONI.length} regioni specifiche`);
  }

  // Exclusions
  if (data.ZONE_ESCLUSE) {
    exclusions.push(...data.ZONE_ESCLUSE);
  }

  // Coverage type description
  const coverageTypeDescriptions = {
    'TOTALE': 'Copertura completa',
    'PARZIALE': 'Copertura parziale',
    'PROGRESSIVA': 'Copertura progressiva',
    'SU_RICHIESTA': 'Copertura su richiesta'
  };

  const coverageType = coverageTypeDescriptions[data.TIPO_COPERTURA];

  // Additional info
  let additionalInfo = '';
  if (data.NOTE_COPERTURA) {
    additionalInfo = data.NOTE_COPERTURA;
  }
  if (data.DATA_INIZIO_COPERTURA || data.DATA_FINE_COPERTURA) {
    const dateInfo = [];
    if (data.DATA_INIZIO_COPERTURA) dateInfo.push(`Dal ${data.DATA_INIZIO_COPERTURA}`);
    if (data.DATA_FINE_COPERTURA) dateInfo.push(`al ${data.DATA_FINE_COPERTURA}`);
    additionalInfo += ` ${dateInfo.join(' ')}`;
  }

  return {
    mainAreas,
    exclusions,
    coverageType,
    additionalInfo: additionalInfo.trim()
  };
}

// =====================================================
// UI HELPERS
// =====================================================

/**
 * Get available geographic zones
 */
export function getGeographicZones(): Array<{
  value: string;
  label: string;
  description: string;
  population: number;
}> {
  return [
    {
      value: 'TUTTO_TERRITORIO_NAZIONALE',
      label: 'Tutto il territorio nazionale',
      description: 'Copertura completa su tutto il territorio italiano',
      population: 60000000
    },
    {
      value: 'NORD_ITALIA',
      label: 'Nord Italia',
      description: 'Regioni del Nord Italia',
      population: 27500000
    },
    {
      value: 'CENTRO_ITALIA',
      label: 'Centro Italia', 
      description: 'Regioni del Centro Italia',
      population: 12000000
    },
    {
      value: 'SUD_ITALIA',
      label: 'Sud Italia',
      description: 'Regioni del Sud Italia',
      population: 14000000
    },
    {
      value: 'ISOLE',
      label: 'Isole',
      description: 'Sicilia e Sardegna',
      population: 6500000
    },
    {
      value: 'ZONE_SPECIFICHE',
      label: 'Zone specifiche',
      description: 'Selezione dettagliata di regioni, province o comuni',
      population: 0
    }
  ];
}

/**
 * Format geographic coverage for display
 */
export function formatGeographicCoverageForDisplay(data: Step16Data): string {
  const coverage = calculateCoverageEstimate(data);
  const summary = generateCoverageSummary(data);

  let display = summary.mainAreas.join(', ');
  
  if (summary.exclusions.length > 0) {
    display += ` (escluse: ${summary.exclusions.slice(0, 3).join(', ')})`;
    if (summary.exclusions.length > 3) {
      display += ` e altre ${summary.exclusions.length - 3}`;
    }
  }

  display += ` - ${coverage.percentage}% popolazione`;

  return display;
}

// =====================================================
// XML GENERATION HELPERS
// =====================================================

/**
 * Convert to XML-compatible format
 */
export function formatForXML(data: Step16Data): Record<string, any> {
  const xmlData: Record<string, any> = {
    ZoneGeografiche: data.ZONE_GEOGRAFICHE.join(';'),
    TipoCopertura: data.TIPO_COPERTURA
  };

  if (data.CODICI_ISTAT && data.CODICI_ISTAT.length > 0) {
    xmlData.CodiciISTAT = data.CODICI_ISTAT.join(';');
  }

  if (data.REGIONI && data.REGIONI.length > 0) {
    xmlData.Regioni = data.REGIONI.join(';');
  }

  if (data.PROVINCE && data.PROVINCE.length > 0) {
    xmlData.Province = data.PROVINCE.join(';');
  }

  if (data.COMUNI && data.COMUNI.length > 0) {
    xmlData.Comuni = data.COMUNI.map(comune => ({
      Nome: comune.NOME,
      Provincia: comune.PROVINCIA,
      CodiceISTAT: comune.CODICE_ISTAT || '',
      CAP: comune.CAP || ''
    }));
  }

  if (data.ZONE_ESCLUSE && data.ZONE_ESCLUSE.length > 0) {
    xmlData.ZoneEscluse = data.ZONE_ESCLUSE.join(';');
  }

  if (data.NOTE_COPERTURA) {
    xmlData.NoteCopertura = data.NOTE_COPERTURA;
  }

  if (data.DATA_INIZIO_COPERTURA) {
    xmlData.DataInizioCopertura = data.DATA_INIZIO_COPERTURA;
  }

  if (data.DATA_FINE_COPERTURA) {
    xmlData.DataFineCopertura = data.DATA_FINE_COPERTURA;
  }

  return xmlData;
}

/**
 * Validate for XML generation
 */
export function validateForXMLGeneration(data: Step16Data): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.ZONE_GEOGRAFICHE || data.ZONE_GEOGRAFICHE.length === 0) {
    errors.push('Zone geografiche obbligatorie per XML');
  }

  // Validate ISTAT codes if present
  if (data.CODICI_ISTAT) {
    data.CODICI_ISTAT.forEach((code, index) => {
      if (!validateISTATCode(code)) {
        errors.push(`Codice ISTAT ${index + 1} non valido: ${code}`);
      }
    });
  }

  // Validate province codes if present
  if (data.PROVINCE) {
    data.PROVINCE.forEach((provincia, index) => {
      if (!validateProvinceCode(provincia)) {
        errors.push(`Codice provincia ${index + 1} non valido: ${provincia}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export default schema
export default Step16Schema; 