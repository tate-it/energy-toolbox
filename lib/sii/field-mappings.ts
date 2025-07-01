/**
 * Abbreviated field name mappings for SII wizard steps
 * Optimizes URL length while maintaining readability
 * Following NuQS best practices for URL state management
 */

// Step 1: Identification Information (Identificativi Offerta)
export const STEP1_FIELD_MAPPINGS = {
  // Full field name → abbreviated name
  PIVA_UTENTE: 'piva',
  COD_OFFERTA: 'cod',
} as const;

// Step 2: Offer Details (DettaglioOfferta)
export const STEP2_FIELD_MAPPINGS = {
  TIPO_MERCATO: 'tm',
  OFFERTA_SINGOLA: 'os',
  TIPO_CLIENTE: 'tc',
  DOMESTICO_RESIDENTE: 'dr',
  TIPO_OFFERTA: 'to',
  TIPOLOGIA_ATT_CONTR: 'tac',
  NOME_OFFERTA: 'nome',
  DESCRIZIONE: 'desc',
  DURATA: 'dur',
  GARANZIE: 'gar',
} as const;

// Step 3: Activation Methods (ModalitaAttivazione)
export const STEP3_FIELD_MAPPINGS = {
  MODALITA: 'mod',
  DESCRIZIONE: 'desc',
} as const;

// Step 4: Contact Information (Contatti)
export const STEP4_FIELD_MAPPINGS = {
  TELEFONO: 'tel',
  URL_SITO_VENDITORE: 'url_sito',
  URL_OFFERTA: 'url_off',
} as const;

// Step 5: Energy Price References (RiferimentiPrezzoEnergia)
export const STEP5_FIELD_MAPPINGS = {
  IDX_PREZZO_ENERGIA: 'idx_prezzo',
  ALTRO: 'altro',
} as const;

// Step 6: Offer Validity (ValiditaOfferta)
export const STEP6_FIELD_MAPPINGS = {
  DATA_INIZIO: 'dt_inizio',
  DATA_FINE: 'dt_fine',
} as const;

// Step 7: Offer Characteristics (CaratteristicheOfferta)
export const STEP7_FIELD_MAPPINGS = {
  CONSUMO_MIN: 'cons_min',
  CONSUMO_MAX: 'cons_max',
  POTENZA_MIN: 'pot_min',
  POTENZA_MAX: 'pot_max',
} as const;

// Step 8: Dual Offer (OffertaDUAL)
export const STEP8_FIELD_MAPPINGS = {
  OFFERTE_CONGIUNTE_EE: 'off_ee',
  OFFERTE_CONGIUNTE_GAS: 'off_gas',
} as const;

// Step 9: Payment Methods (MetodoPagamento)
export const STEP9_FIELD_MAPPINGS = {
  MODALITA_PAGAMENTO: 'mod_pag',
  DESCRIZIONE: 'desc',
} as const;

// Step 10: Regulated Components (ComponentiRegolate)
export const STEP10_FIELD_MAPPINGS = {
  CODICE: 'cod',
} as const;

// Step 11: Price Type (TipoPrezzo)
export const STEP11_FIELD_MAPPINGS = {
  TIPOLOGIA_FASCE: 'tip_fasce',
} as const;

// Step 12: Weekly Time Bands (FasceOrarieSettimanali)
export const STEP12_FIELD_MAPPINGS = {
  CONFIGURAZIONE_FASCE: 'conf_fasce',
  FASCIA_F1: 'f1',
  FASCIA_F2: 'f2',
  FASCIA_F3: 'f3',
  GIORNI_SETTIMANA: 'gg_sett',
  ORE_GIORNO: 'ore_gg',
} as const;

// Step 13: Dispatching (Dispacciamento)
export const STEP13_FIELD_MAPPINGS = {
  COSTO_DISPACCIAMENTO: 'costo_disp',
  MODALITA_CALCOLO: 'mod_calc',
  VALORE_FISSO: 'val_fisso',
  PERCENTUALE: 'perc',
} as const;

// Step 14: Company Component (ComponenteImpresa)
export const STEP14_FIELD_MAPPINGS = {
  TIPO_COMPONENTE: 'tip_comp',
  VALORE: 'val',
  UNITA_MISURA: 'um',
  DESCRIZIONE: 'desc',
} as const;

// Step 15: Contractual Conditions (CondizioniContrattuali)
export const STEP15_FIELD_MAPPINGS = {
  CONDIZIONI_GENERALI: 'cond_gen',
  CLAUSOLE_AGGIUNTIVE: 'claus_agg',
  PENALI: 'penali',
  GARANZIE_AGGIUNTIVE: 'gar_agg',
} as const;

// Step 16: Offer Zones (ZoneOfferta)
export const STEP16_FIELD_MAPPINGS = {
  ZONE_GEOGRAFICHE: 'zone_geo',
  CODICI_ISTAT: 'cod_istat',
  REGIONI: 'regioni',
  PROVINCE: 'prov',
  COMUNI: 'comuni',
} as const;

// Step 17: Discounts (Sconti)
export const STEP17_FIELD_MAPPINGS = {
  TIPO_SCONTO: 'tip_sconto',
  VALORE_SCONTO: 'val_sconto',
  DURATA_SCONTO: 'dur_sconto',
  CONDIZIONI_APPLICAZIONE: 'cond_app',
  DESCRIZIONE: 'desc',
} as const;

// Step 18: Additional Services (ServiziAggiuntivi)
export const STEP18_FIELD_MAPPINGS = {
  NOME_SERVIZIO: 'nome_serv',
  DESCRIZIONE_SERVIZIO: 'desc_serv',
  COSTO_SERVIZIO: 'costo_serv',
  MODALITA_FATTURAZIONE: 'mod_fatt',
  OBBLIGATORIO: 'obb',
} as const;

// Consolidated mapping for all steps
export const ALL_FIELD_MAPPINGS = {
  step1: STEP1_FIELD_MAPPINGS,
  step2: STEP2_FIELD_MAPPINGS,
  step3: STEP3_FIELD_MAPPINGS,
  step4: STEP4_FIELD_MAPPINGS,
  step5: STEP5_FIELD_MAPPINGS,
  step6: STEP6_FIELD_MAPPINGS,
  step7: STEP7_FIELD_MAPPINGS,
  step8: STEP8_FIELD_MAPPINGS,
  step9: STEP9_FIELD_MAPPINGS,
  step10: STEP10_FIELD_MAPPINGS,
  step11: STEP11_FIELD_MAPPINGS,
  step12: STEP12_FIELD_MAPPINGS,
  step13: STEP13_FIELD_MAPPINGS,
  step14: STEP14_FIELD_MAPPINGS,
  step15: STEP15_FIELD_MAPPINGS,
  step16: STEP16_FIELD_MAPPINGS,
  step17: STEP17_FIELD_MAPPINGS,
  step18: STEP18_FIELD_MAPPINGS,
} as const;

// Reverse mappings for decoding (abbreviated → full field name)
export const STEP1_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP1_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP2_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP2_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP3_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP3_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP4_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP4_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP5_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP5_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP6_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP6_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP7_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP7_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP8_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP8_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP9_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP9_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP10_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP10_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP11_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP11_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP12_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP12_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP13_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP13_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP14_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP14_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP15_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP15_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP16_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP16_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP17_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP17_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

export const STEP18_REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(STEP18_FIELD_MAPPINGS).map(([full, abbrev]) => [abbrev, full])
) as Record<string, string>;

// All reverse mappings consolidated
export const ALL_REVERSE_MAPPINGS = {
  step1: STEP1_REVERSE_MAPPINGS,
  step2: STEP2_REVERSE_MAPPINGS,
  step3: STEP3_REVERSE_MAPPINGS,
  step4: STEP4_REVERSE_MAPPINGS,
  step5: STEP5_REVERSE_MAPPINGS,
  step6: STEP6_REVERSE_MAPPINGS,
  step7: STEP7_REVERSE_MAPPINGS,
  step8: STEP8_REVERSE_MAPPINGS,
  step9: STEP9_REVERSE_MAPPINGS,
  step10: STEP10_REVERSE_MAPPINGS,
  step11: STEP11_REVERSE_MAPPINGS,
  step12: STEP12_REVERSE_MAPPINGS,
  step13: STEP13_REVERSE_MAPPINGS,
  step14: STEP14_REVERSE_MAPPINGS,
  step15: STEP15_REVERSE_MAPPINGS,
  step16: STEP16_REVERSE_MAPPINGS,
  step17: STEP17_REVERSE_MAPPINGS,
  step18: STEP18_REVERSE_MAPPINGS,
} as const;

// Type helpers for better TypeScript integration
export type StepId = keyof typeof ALL_FIELD_MAPPINGS;
export type FieldMapping<T extends StepId> = typeof ALL_FIELD_MAPPINGS[T];
export type AbbreviatedField<T extends StepId> = FieldMapping<T>[keyof FieldMapping<T>];

// Utility functions for field mapping conversion
export function abbreviateField<T extends StepId>(
  stepId: T,
  fullFieldName: keyof FieldMapping<T>
): AbbreviatedField<T> {
  return ALL_FIELD_MAPPINGS[stepId][fullFieldName];
}

export function expandField<T extends StepId>(
  stepId: T,
  abbreviatedName: string
): string | undefined {
  return ALL_REVERSE_MAPPINGS[stepId][abbreviatedName];
}

// Utility for transforming objects with full field names to abbreviated ones
export function abbreviateFieldsObject<T extends StepId>(
  stepId: T,
  obj: Record<string, any>
): Record<string, any> {
  const mappings = ALL_FIELD_MAPPINGS[stepId];
  const result: Record<string, any> = {};
  
  for (const [fullField, value] of Object.entries(obj)) {
    const abbreviatedField = mappings[fullField as keyof typeof mappings];
    if (abbreviatedField) {
      result[abbreviatedField as string] = value;
    } else {
      // Keep unmapped fields as-is
      result[fullField] = value;
    }
  }
  
  return result;
}

// Utility for transforming objects with abbreviated field names back to full ones
export function expandFieldsObject<T extends StepId>(
  stepId: T,
  obj: Record<string, any>
): Record<string, any> {
  const reverseMappings = ALL_REVERSE_MAPPINGS[stepId];
  const result: Record<string, any> = {};
  
  for (const [abbreviatedField, value] of Object.entries(obj)) {
    const fullField = reverseMappings[abbreviatedField];
    if (fullField) {
      result[fullField as string] = value;
    } else {
      // Keep unmapped fields as-is
      result[abbreviatedField] = value;
    }
  }
  
  return result;
} 