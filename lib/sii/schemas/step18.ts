/**
 * Step 18: Additional Services Schema (ServiziAggiuntivi)
 * Schema Zod per la gestione dei servizi aggiuntivi dell'offerta
 * 
 * Defines additional services, products, and value-added offerings
 * with pricing structures and service categories.
 */

import { z } from 'zod';
import { 
  MACROAREA_SERVIZI,
  MACROAREA_SERVIZI_LABELS,
  UNITA_MISURA,
  UNITA_MISURA_LABELS,
  type MacroareaServizi,
  type UnitaMisura 
} from '../constants';

// =====================================================
// CORE SCHEMA DEFINITION
// =====================================================

export const Step18Schema = z.object({
  // Array di servizi aggiuntivi
  SERVIZI: z.array(z.object({
    // Nome del servizio
    NOME_SERVIZIO: z.string()
      .min(2, 'Il nome del servizio deve avere almeno 2 caratteri')
      .max(200, 'Il nome del servizio non può superare 200 caratteri')
      .regex(/^[^<>]*$/, 'Il nome non può contenere caratteri HTML'),

    // Macroarea del servizio
    MACROAREA: z.enum([
      MACROAREA_SERVIZI.CALDAIA,
      MACROAREA_SERVIZI.MOBILITA,
      MACROAREA_SERVIZI.SOLARE_TERMICO,
      MACROAREA_SERVIZI.FOTOVOLTAICO,
      MACROAREA_SERVIZI.CLIMATIZZAZIONE,
      MACROAREA_SERVIZI.POLIZZA_ASSICURATIVA,
      MACROAREA_SERVIZI.ALTRO
    ] as const),

    // Descrizione dettagliata del servizio
    DESCRIZIONE_SERVIZIO: z.string()
      .min(10, 'La descrizione deve avere almeno 10 caratteri')
      .max(2000, 'La descrizione non può superare 2000 caratteri')
      .regex(/^[^<>]*$/, 'La descrizione non può contenere caratteri HTML'),

    // Costo del servizio
    COSTO_SERVIZIO: z.number()
      .min(0, 'Il costo non può essere negativo')
      .max(999999.99, 'Il costo non può superare 999.999,99 €')
      .multipleOf(0.01, 'Il costo deve avere massimo 2 decimali'),

    // Unità di misura del costo
    UNITA_MISURA_COSTO: z.enum([
      UNITA_MISURA.EURO_ANNO,
      UNITA_MISURA.EURO,
      UNITA_MISURA.PERCENTUALE
    ] as const),

    // Modalità di fatturazione
    MODALITA_FATTURAZIONE: z.enum([
      'UNA_TANTUM',
      'MENSILE',
      'BIMESTRALE',
      'TRIMESTRALE',
      'SEMESTRALE',
      'ANNUALE',
      'SU_UTILIZZO',
      'ALTRO'
    ] as const),

    // Servizio obbligatorio
    OBBLIGATORIO: z.boolean().default(false),

    // Servizio incluso nel prezzo base
    INCLUSO_PREZZO: z.boolean().default(false),

    // Categoria del servizio
    CATEGORIA: z.enum([
      'ENERGIA',
      'ASSISTENZA',
      'MANUTENZIONE',
      'ASSICURAZIONE',
      'TECNOLOGIA',
      'CONSULENZA',
      'INSTALLAZIONE',
      'MONITORAGGIO'
    ] as const).optional(),

    // Provider del servizio (se diverso dal fornitore energia)
    PROVIDER_ESTERNO: z.string()
      .min(2, 'Il nome del provider deve avere almeno 2 caratteri')
      .max(200, 'Il nome del provider non può superare 200 caratteri')
      .optional(),

    // Durata del servizio in mesi
    DURATA_MESI: z.number()
      .int('La durata deve essere un numero intero')
      .min(1, 'La durata minima è 1 mese')
      .max(600, 'La durata massima è 600 mesi (50 anni)')
      .optional(),

    // Condizioni di attivazione
    CONDIZIONI_ATTIVAZIONE: z.string()
      .max(1000, 'Le condizioni non possono superare 1000 caratteri')
      .optional(),

    // Disponibilità geografica limitata
    LIMITAZIONI_GEOGRAFICHE: z.boolean().default(false),

    // Zone di disponibilità (se limitato geograficamente)
    ZONE_DISPONIBILITA: z.array(z.string())
      .max(50, 'Non più di 50 zone di disponibilità')
      .optional(),

    // Servizio soggetto a IVA
    SOGGETTO_IVA: z.boolean().default(true),

    // Aliquota IVA se diversa da standard
    ALIQUOTA_IVA: z.number()
      .min(0, 'Aliquota IVA non può essere negativa')
      .max(30, 'Aliquota IVA non può superare 30%')
      .multipleOf(0.1, 'Aliquota IVA deve avere massimo 1 decimale')
      .optional(),

    // Data inizio disponibilità
    DATA_INIZIO_DISPONIBILITA: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido (YYYY-MM-DD)')
      .optional(),

    // Data fine disponibilità
    DATA_FINE_DISPONIBILITA: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido (YYYY-MM-DD)')
      .optional(),

    // Link a informazioni aggiuntive
    URL_INFO: z.string()
      .url('URL non valido')
      .max(500, 'URL non può superare 500 caratteri')
      .optional(),

    // Contatto specifico per il servizio
    CONTATTO_SERVIZIO: z.string()
      .max(200, 'Contatto non può superare 200 caratteri')
      .optional()

  }).superRefine((service, ctx) => {
    // Validate cost vs unit of measure
    if (service.UNITA_MISURA_COSTO === UNITA_MISURA.PERCENTUALE && service.COSTO_SERVIZIO > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COSTO_SERVIZIO'],
        message: 'Le percentuali non possono superare 100%'
      });
    }

    // Validate included vs cost logic
    if (service.INCLUSO_PREZZO && service.COSTO_SERVIZIO > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COSTO_SERVIZIO'],
        message: 'Servizi inclusi nel prezzo non dovrebbero avere costo aggiuntivo'
      });
    }

    // Validate mandatory vs optional logic
    if (service.OBBLIGATORIO && service.COSTO_SERVIZIO > 1000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COSTO_SERVIZIO'],
        message: 'Servizi obbligatori con costo elevato (>1000€) richiedono particolare attenzione'
      });
    }

    // Validate geographic limitations
    if (service.LIMITAZIONI_GEOGRAFICHE && (!service.ZONE_DISPONIBILITA || service.ZONE_DISPONIBILITA.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ZONE_DISPONIBILITA'],
        message: 'Specificare le zone di disponibilità quando ci sono limitazioni geografiche'
      });
    }

    // Validate date consistency
    if (service.DATA_INIZIO_DISPONIBILITA && service.DATA_FINE_DISPONIBILITA) {
      const inizio = new Date(service.DATA_INIZIO_DISPONIBILITA);
      const fine = new Date(service.DATA_FINE_DISPONIBILITA);
      
      if (fine <= inizio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATA_FINE_DISPONIBILITA'],
          message: 'La data di fine disponibilità deve essere successiva alla data di inizio'
        });
      }
    }

    // Validate service type vs billing frequency
    if (service.MODALITA_FATTURAZIONE === 'UNA_TANTUM' && service.DURATA_MESI && service.DURATA_MESI > 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MODALITA_FATTURAZIONE'],
        message: 'Servizi con durata superiore a 12 mesi dovrebbero avere fatturazione ricorrente'
      });
    }

    // Validate macro area vs category consistency
    const categoryValidation = {
      [MACROAREA_SERVIZI.CALDAIA]: ['ASSISTENZA', 'MANUTENZIONE', 'INSTALLAZIONE'],
      [MACROAREA_SERVIZI.FOTOVOLTAICO]: ['ENERGIA', 'TECNOLOGIA', 'INSTALLAZIONE', 'MONITORAGGIO'],
      [MACROAREA_SERVIZI.POLIZZA_ASSICURATIVA]: ['ASSICURAZIONE'],
      [MACROAREA_SERVIZI.MOBILITA]: ['TECNOLOGIA', 'ENERGIA']
    };

    if (service.CATEGORIA && service.MACROAREA in categoryValidation) {
      const validCategories = categoryValidation[service.MACROAREA as keyof typeof categoryValidation];
      if (!validCategories.includes(service.CATEGORIA)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['CATEGORIA'],
          message: `Categoria non coerente con la macroarea ${service.MACROAREA}`
        });
      }
    }

    // Validate "altro" macroarea requirements
    if (service.MACROAREA === MACROAREA_SERVIZI.ALTRO) {
      if (service.DESCRIZIONE_SERVIZIO.length < 50) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DESCRIZIONE_SERVIZIO'],
          message: 'Per macroarea "Altro" fornire descrizione dettagliata (minimo 50 caratteri)'
        });
      }
    }
  }))
    .max(20, 'Non è possibile aggiungere più di 20 servizi'),

  // Note generali sui servizi
  NOTE_SERVIZI: z.string()
    .max(2000, 'Le note non possono superare 2000 caratteri')
    .optional(),

  // Pacchetti di servizi predefiniti
  PACCHETTI_PREDEFINITI: z.array(z.object({
    NOME_PACCHETTO: z.string()
      .min(2, 'Il nome del pacchetto deve avere almeno 2 caratteri')
      .max(100, 'Il nome del pacchetto non può superare 100 caratteri'),
    DESCRIZIONE_PACCHETTO: z.string()
      .min(10, 'La descrizione deve avere almeno 10 caratteri')
      .max(500, 'La descrizione non può superare 500 caratteri'),
    SERVIZI_INCLUSI: z.array(z.string())
      .min(2, 'Un pacchetto deve includere almeno 2 servizi')
      .max(10, 'Un pacchetto non può includere più di 10 servizi'),
    SCONTO_PACCHETTO: z.number()
      .min(0, 'Lo sconto non può essere negativo')
      .max(50, 'Lo sconto non può superare 50%')
      .optional()
  }))
    .max(5, 'Non più di 5 pacchetti predefiniti')
    .optional()

}).superRefine((data, ctx) => {
  // Validate service name uniqueness
  if (data.SERVIZI) {
    const serviceNames = data.SERVIZI.map(servizio => servizio.NOME_SERVIZIO);
    const uniqueNames = new Set(serviceNames);
    if (serviceNames.length !== uniqueNames.size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SERVIZI'],
        message: 'I nomi dei servizi devono essere unici'
      });
    }
  }

  // Validate package service references
  if (data.PACCHETTI_PREDEFINITI && data.SERVIZI) {
    const availableServiceNames = data.SERVIZI.map(s => s.NOME_SERVIZIO);
    
    data.PACCHETTI_PREDEFINITI.forEach((pacchetto, pIndex) => {
      pacchetto.SERVIZI_INCLUSI.forEach((nomeServizio, sIndex) => {
        if (!availableServiceNames.includes(nomeServizio)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['PACCHETTI_PREDEFINITI', pIndex, 'SERVIZI_INCLUSI', sIndex],
            message: `Servizio "${nomeServizio}" non trovato nell'elenco servizi disponibili`
          });
        }
      });
    });
  }

  // Check for excessive mandatory services
  if (data.SERVIZI) {
    const mandatoryServices = data.SERVIZI.filter(s => s.OBBLIGATORIO);
    if (mandatoryServices.length > 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SERVIZI'],
        message: 'Troppi servizi obbligatori (>3) potrebbero scoraggiare i clienti'
      });
    }
  }

  // Calculate total mandatory cost
  if (data.SERVIZI) {
    const totalMandatoryCost = data.SERVIZI
      .filter(s => s.OBBLIGATORIO && !s.INCLUSO_PREZZO)
      .reduce((total, service) => {
        if (service.UNITA_MISURA_COSTO === UNITA_MISURA.EURO_ANNO) {
          return total + service.COSTO_SERVIZIO;
        } else if (service.UNITA_MISURA_COSTO === UNITA_MISURA.EURO) {
          return total + service.COSTO_SERVIZIO; // One-time cost
        }
        return total;
      }, 0);

    if (totalMandatoryCost > 500) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SERVIZI'],
        message: 'Costo totale servizi obbligatori eccessivo (>500€)'
      });
    }
  }
});

export type Step18Data = z.infer<typeof Step18Schema>;

// =====================================================
// VALIDATION UTILITIES
// =====================================================

/**
 * Calculate total annual cost of services
 */
export function calculateTotalServicesAnnualCost(servizi: Step18Data['SERVIZI']): {
  mandatory: number;
  optional: number;
  total: number;
} {
  let mandatory = 0;
  let optional = 0;

  servizi.forEach(service => {
    if (service.INCLUSO_PREZZO) return; // Skip included services

    let annualCost = 0;
    switch (service.UNITA_MISURA_COSTO) {
      case UNITA_MISURA.EURO_ANNO:
        annualCost = service.COSTO_SERVIZIO;
        break;
      case UNITA_MISURA.EURO:
        // For one-time costs, assume amortized over service duration or 1 year
        const duration = service.DURATA_MESI || 12;
        annualCost = (service.COSTO_SERVIZIO * 12) / duration;
        break;
      case UNITA_MISURA.PERCENTUALE:
        // Estimate based on typical energy bill
        annualCost = (675 * service.COSTO_SERVIZIO) / 100;
        break;
    }

    if (service.OBBLIGATORIO) {
      mandatory += annualCost;
    } else {
      optional += annualCost;
    }
  });

  return {
    mandatory: Math.round(mandatory),
    optional: Math.round(optional),
    total: Math.round(mandatory + optional)
  };
}

/**
 * Validate service availability for geographic area
 */
export function validateServiceAvailability(
  service: Step18Data['SERVIZI'][0],
  customerZone: string
): boolean {
  if (!service.LIMITAZIONI_GEOGRAFICHE) return true;
  
  return service.ZONE_DISPONIBILITA?.includes(customerZone) || false;
}

// =====================================================
// BUSINESS LOGIC HELPERS
// =====================================================

/**
 * Get services portfolio assessment
 */
export function getServicesPortfolioAssessment(data: Step18Data): {
  diversity: 'limitata' | 'buona' | 'eccellente';
  valueProposition: 'basica' | 'competitiva' | 'premium';
  customerImpact: 'basso' | 'medio' | 'alto';
  recommendations: string[];
} {
  const servicesCount = data.SERVIZI?.length || 0;
  const costs = calculateTotalServicesAnnualCost(data.SERVIZI || []);
  const macroAreas = [...new Set(data.SERVIZI?.map(s => s.MACROAREA) || [])];
  const hasPackages = (data.PACCHETTI_PREDEFINITI?.length || 0) > 0;

  // Assess diversity
  let diversity: 'limitata' | 'buona' | 'eccellente' = 'limitata';
  if (macroAreas.length >= 4 && servicesCount >= 8) diversity = 'eccellente';
  else if (macroAreas.length >= 3 && servicesCount >= 5) diversity = 'buona';

  // Assess value proposition
  let valueProposition: 'basica' | 'competitiva' | 'premium' = 'basica';
  if (hasPackages && costs.optional > 300) valueProposition = 'premium';
  else if (servicesCount >= 5 && macroAreas.length >= 3) valueProposition = 'competitiva';

  // Assess customer impact
  let customerImpact: 'basso' | 'medio' | 'alto' = 'basso';
  if (costs.mandatory > 200) customerImpact = 'alto';
  else if (costs.total > 100) customerImpact = 'medio';

  // Generate recommendations
  const recommendations: string[] = [];

  if (diversity === 'limitata') {
    recommendations.push('Considerare ampliamento portfolio servizi');
  }

  if (costs.mandatory > 300) {
    recommendations.push('Valutare riduzione servizi obbligatori');
  }

  if (!hasPackages && servicesCount > 3) {
    recommendations.push('Creare pacchetti di servizi per semplificare scelta');
  }

  if (servicesCount > 10) {
    recommendations.push('Organizzare servizi in categorie per migliorare UX');
  }

  const energyServices = data.SERVIZI?.filter(s => 
    [MACROAREA_SERVIZI.FOTOVOLTAICO, MACROAREA_SERVIZI.SOLARE_TERMICO].includes(s.MACROAREA)
  ) || [];
  if (energyServices.length === 0) {
    recommendations.push('Aggiungere servizi energetici per differenziazione');
  }

  return {
    diversity,
    valueProposition,
    customerImpact,
    recommendations
  };
}

/**
 * Generate customer-friendly services summary
 */
export function generateServicesSummary(data: Step18Data): {
  mainServices: string[];
  mandatoryServices: string[];
  costs: string;
  packages: string[];
  availability: string;
} {
  const servizi = data.SERVIZI || [];
  const costs = calculateTotalServicesAnnualCost(servizi);

  const mainServices = servizi
    .filter(s => !s.OBBLIGATORIO)
    .slice(0, 5)
    .map(s => s.NOME_SERVIZIO);

  const mandatoryServices = servizi
    .filter(s => s.OBBLIGATORIO)
    .map(s => s.NOME_SERVIZIO);

  let costsString = '';
  if (costs.mandatory > 0 && costs.optional > 0) {
    costsString = `Obbligatori: €${costs.mandatory}/anno, Opzionali: €${costs.optional}/anno`;
  } else if (costs.mandatory > 0) {
    costsString = `Servizi obbligatori: €${costs.mandatory}/anno`;
  } else if (costs.optional > 0) {
    costsString = `Servizi opzionali: €${costs.optional}/anno`;
  } else {
    costsString = 'Servizi inclusi nel prezzo';
  }

  const packages = data.PACCHETTI_PREDEFINITI?.map(p => p.NOME_PACCHETTO) || [];

  const limitedServices = servizi.filter(s => s.LIMITAZIONI_GEOGRAFICHE);
  const availability = limitedServices.length > 0 
    ? `${limitedServices.length} servizi con limitazioni geografiche`
    : 'Tutti i servizi disponibili su territorio nazionale';

  return {
    mainServices,
    mandatoryServices,
    costs: costsString,
    packages,
    availability
  };
}

/**
 * Get service recommendations by macro area
 */
export function getServiceRecommendationsByMacroArea(macroarea: string): {
  description: string;
  typicalServices: string[];
  pricingStrategy: string;
  targetCustomers: string[];
} {
  const recommendations = {
    [MACROAREA_SERVIZI.CALDAIA]: {
      description: 'Servizi per manutenzione e assistenza caldaie',
      typicalServices: ['Controllo annuale caldaia', 'Pronto intervento', 'Sostituzione caldaia'],
      pricingStrategy: 'Canone annuale fisso con interventi inclusi',
      targetCustomers: ['Clienti domestici', 'Condomini', 'Piccole attività']
    },
    [MACROAREA_SERVIZI.FOTOVOLTAICO]: {
      description: 'Soluzioni per energia solare fotovoltaica',
      typicalServices: ['Installazione impianto', 'Monitoraggio produzione', 'Manutenzione pannelli'],
      pricingStrategy: 'Investimento iniziale + canone monitoraggio',
      targetCustomers: ['Proprietari casa', 'Aziende con tetto', 'Investitori green']
    },
    [MACROAREA_SERVIZI.MOBILITA]: {
      description: 'Servizi per mobilità elettrica',
      typicalServices: ['Wallbox domestica', 'App ricarica', 'Tariffe dedicate'],
      pricingStrategy: 'Hardware + canone servizi digitali',
      targetCustomers: ['Possessori auto elettriche', 'Fleet aziendali']
    },
    [MACROAREA_SERVIZI.POLIZZA_ASSICURATIVA]: {
      description: 'Coperture assicurative per casa e famiglia',
      typicalServices: ['Polizza casa', 'Assistenza 24h', 'Danni elettrodomestici'],
      pricingStrategy: 'Premio annuale o mensile',
      targetCustomers: ['Proprietari casa', 'Famiglie con figli']
    }
  };

  return recommendations[macroarea] || {
    description: 'Servizio personalizzato',
    typicalServices: ['Da definire'],
    pricingStrategy: 'Da valutare',
    targetCustomers: ['Da analizzare']
  };
}

// =====================================================
// UI HELPERS
// =====================================================

/**
 * Get available service macro areas
 */
export function getServiceMacroAreas(): Array<{
  value: string;
  label: string;
  description: string;
  suggestedCategories: string[];
}> {
  return Object.entries(MACROAREA_SERVIZI_LABELS).map(([value, label]) => {
    const recommendations = getServiceRecommendationsByMacroArea(value);
    
    let suggestedCategories: string[] = [];
    switch (value) {
      case MACROAREA_SERVIZI.CALDAIA:
        suggestedCategories = ['ASSISTENZA', 'MANUTENZIONE'];
        break;
      case MACROAREA_SERVIZI.FOTOVOLTAICO:
        suggestedCategories = ['ENERGIA', 'TECNOLOGIA', 'INSTALLAZIONE'];
        break;
      case MACROAREA_SERVIZI.MOBILITA:
        suggestedCategories = ['TECNOLOGIA', 'ENERGIA'];
        break;
      case MACROAREA_SERVIZI.POLIZZA_ASSICURATIVA:
        suggestedCategories = ['ASSICURAZIONE'];
        break;
      default:
        suggestedCategories = ['ASSISTENZA', 'TECNOLOGIA'];
    }

    return {
      value,
      label,
      description: recommendations.description,
      suggestedCategories
    };
  });
}

/**
 * Format services for display
 */
export function formatServicesForDisplay(data: Step18Data): string {
  const servizi = data.SERVIZI || [];
  const costs = calculateTotalServicesAnnualCost(servizi);
  
  if (servizi.length === 0) {
    return 'Nessun servizio aggiuntivo';
  }

  const mandatoryCount = servizi.filter(s => s.OBBLIGATORIO).length;
  const optionalCount = servizi.length - mandatoryCount;

  let display = `${servizi.length} servizi`;
  if (mandatoryCount > 0) {
    display += ` (${mandatoryCount} obbligatori)`;
  }
  
  if (costs.total > 0) {
    display += ` - €${costs.total}/anno`;
  }

  return display;
}

// =====================================================
// XML GENERATION HELPERS
// =====================================================

/**
 * Convert to XML-compatible format
 */
export function formatForXML(data: Step18Data): Record<string, any> {
  const xmlData: Record<string, any> = {};

  if (data.SERVIZI && data.SERVIZI.length > 0) {
    xmlData.Servizi = data.SERVIZI.map(servizio => ({
      NomeServizio: servizio.NOME_SERVIZIO,
      Macroarea: servizio.MACROAREA,
      DescrizioneServizio: servizio.DESCRIZIONE_SERVIZIO,
      CostoServizio: servizio.COSTO_SERVIZIO.toFixed(2),
      UnitaMisuraCosto: servizio.UNITA_MISURA_COSTO,
      ModalitaFatturazione: servizio.MODALITA_FATTURAZIONE,
      Obbligatorio: servizio.OBBLIGATORIO ? 'SI' : 'NO',
      InclusoPrezzo: servizio.INCLUSO_PREZZO ? 'SI' : 'NO',
      Categoria: servizio.CATEGORIA || '',
      ProviderEsterno: servizio.PROVIDER_ESTERNO || '',
      DurataMesi: servizio.DURATA_MESI || '',
      CondizioniAttivazione: servizio.CONDIZIONI_ATTIVAZIONE || '',
      LimitazioniGeografiche: servizio.LIMITAZIONI_GEOGRAFICHE ? 'SI' : 'NO',
      ZoneDisponibilita: servizio.ZONE_DISPONIBILITA?.join(';') || '',
      SoggettoIVA: servizio.SOGGETTO_IVA ? 'SI' : 'NO',
      AliquotaIVA: servizio.ALIQUOTA_IVA?.toFixed(1) || '',
      DataInizioDisponibilita: servizio.DATA_INIZIO_DISPONIBILITA || '',
      DataFineDisponibilita: servizio.DATA_FINE_DISPONIBILITA || '',
      URLInfo: servizio.URL_INFO || '',
      ContattoServizio: servizio.CONTATTO_SERVIZIO || ''
    }));
  }

  if (data.NOTE_SERVIZI) {
    xmlData.NoteServizi = data.NOTE_SERVIZI;
  }

  if (data.PACCHETTI_PREDEFINITI && data.PACCHETTI_PREDEFINITI.length > 0) {
    xmlData.PacchettiPredefiniti = data.PACCHETTI_PREDEFINITI.map(pacchetto => ({
      NomePacchetto: pacchetto.NOME_PACCHETTO,
      DescrizionePacchetto: pacchetto.DESCRIZIONE_PACCHETTO,
      ServiziInclusi: pacchetto.SERVIZI_INCLUSI.join(';'),
      ScontoPacchetto: pacchetto.SCONTO_PACCHETTO?.toFixed(2) || ''
    }));
  }

  return xmlData;
}

/**
 * Validate for XML generation
 */
export function validateForXMLGeneration(data: Step18Data): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Services validation
  if (data.SERVIZI) {
    data.SERVIZI.forEach((servizio, index) => {
      if (!servizio.NOME_SERVIZIO || servizio.NOME_SERVIZIO.trim().length < 2) {
        errors.push(`Servizio ${index + 1}: nome obbligatorio (minimo 2 caratteri)`);
      }
      
      if (!servizio.MACROAREA) {
        errors.push(`Servizio ${index + 1}: macroarea obbligatoria`);
      }
      
      if (!servizio.DESCRIZIONE_SERVIZIO || servizio.DESCRIZIONE_SERVIZIO.trim().length < 10) {
        errors.push(`Servizio ${index + 1}: descrizione obbligatoria (minimo 10 caratteri)`);
      }
      
      if (servizio.COSTO_SERVIZIO < 0) {
        errors.push(`Servizio ${index + 1}: costo non può essere negativo`);
      }
      
      if (!servizio.UNITA_MISURA_COSTO) {
        errors.push(`Servizio ${index + 1}: unità di misura costo obbligatoria`);
      }
      
      if (!servizio.MODALITA_FATTURAZIONE) {
        errors.push(`Servizio ${index + 1}: modalità fatturazione obbligatoria`);
      }
    });
  }

  // Packages validation
  if (data.PACCHETTI_PREDEFINITI) {
    data.PACCHETTI_PREDEFINITI.forEach((pacchetto, index) => {
      if (!pacchetto.NOME_PACCHETTO || pacchetto.NOME_PACCHETTO.trim().length < 2) {
        errors.push(`Pacchetto ${index + 1}: nome obbligatorio (minimo 2 caratteri)`);
      }
      
      if (!pacchetto.SERVIZI_INCLUSI || pacchetto.SERVIZI_INCLUSI.length < 2) {
        errors.push(`Pacchetto ${index + 1}: deve includere almeno 2 servizi`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export default schema
export default Step18Schema; 