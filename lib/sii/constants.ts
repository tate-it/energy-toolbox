/**
 * Costanti e enumerazioni per la generazione XML SII v4.5
 * Constants and enumerations for SII XML generation v4.5
 */

// =====================================================
// TIPI MERCATO E OFFERTA (Market and Offer Types)
// =====================================================

export const TIPO_MERCATO = {
  ELETTRICITA: '01',
  GAS: '02',
  DUAL_FUEL: '03'
} as const;

export const TIPO_MERCATO_LABELS = {
  [TIPO_MERCATO.ELETTRICITA]: 'Elettricità',
  [TIPO_MERCATO.GAS]: 'Gas',
  [TIPO_MERCATO.DUAL_FUEL]: 'Dual Fuel'
} as const;

export const OFFERTA_SINGOLA = {
  SI: 'SI',
  NO: 'NO'
} as const;

export const OFFERTA_SINGOLA_LABELS = {
  [OFFERTA_SINGOLA.SI]: 'Può essere sottoscritta singolarmente',
  [OFFERTA_SINGOLA.NO]: 'Solo in combinazione con altra commodity'
} as const;

export const TIPO_CLIENTE = {
  DOMESTICO: '01',
  ALTRI_USI: '02',
  CONDOMINIO_RESIDENZIALE: '03'
} as const;

export const TIPO_CLIENTE_LABELS = {
  [TIPO_CLIENTE.DOMESTICO]: 'Domestico',
  [TIPO_CLIENTE.ALTRI_USI]: 'Altri Usi',
  [TIPO_CLIENTE.CONDOMINIO_RESIDENZIALE]: 'Condominio Residenziale (Gas)'
} as const;

export const DOMESTICO_RESIDENTE = {
  RESIDENTE: '01',
  NON_RESIDENTE: '02',
  TUTTI: '03'
} as const;

export const DOMESTICO_RESIDENTE_LABELS = {
  [DOMESTICO_RESIDENTE.RESIDENTE]: 'Domestico Residente',
  [DOMESTICO_RESIDENTE.NON_RESIDENTE]: 'Domestico Non Residente',
  [DOMESTICO_RESIDENTE.TUTTI]: 'Tutti i tipi'
} as const;

export const TIPO_OFFERTA = {
  FISSA: '01',
  VARIABILE: '02',
  FLAT: '03'
} as const;

export const TIPO_OFFERTA_LABELS = {
  [TIPO_OFFERTA.FISSA]: 'Fissa',
  [TIPO_OFFERTA.VARIABILE]: 'Variabile',
  [TIPO_OFFERTA.FLAT]: 'FLAT'
} as const;

// =====================================================
// ATTIVAZIONE E MODALITÀ (Activation and Methods)
// =====================================================

export const TIPOLOGIA_ATT_CONTR = {
  CAMBIO_FORNITORE: '01',
  PRIMA_ATTIVAZIONE: '02',
  RIATTIVAZIONE: '03',
  VOLTURA: '04',
  SEMPRE: '99'
} as const;

export const TIPOLOGIA_ATT_CONTR_LABELS = {
  [TIPOLOGIA_ATT_CONTR.CAMBIO_FORNITORE]: 'Cambio Fornitore',
  [TIPOLOGIA_ATT_CONTR.PRIMA_ATTIVAZIONE]: 'Prima Attivazione (Contatore non presente)',
  [TIPOLOGIA_ATT_CONTR.RIATTIVAZIONE]: 'Riattivazione (Contatore presente ma disattivato)',
  [TIPOLOGIA_ATT_CONTR.VOLTURA]: 'Voltura Contrattuale',
  [TIPOLOGIA_ATT_CONTR.SEMPRE]: 'Sempre'
} as const;

export const MODALITA_ATTIVAZIONE = {
  WEB: '01',
  QUALSIASI_CANALE: '02',
  PUNTO_VENDITA: '03',
  TELEVENDITA: '04',
  AGENZIA: '05',
  ALTRO: '99'
} as const;

export const MODALITA_ATTIVAZIONE_LABELS = {
  [MODALITA_ATTIVAZIONE.WEB]: 'Solo attivazione Web',
  [MODALITA_ATTIVAZIONE.QUALSIASI_CANALE]: 'Attivazione con qualsiasi canale',
  [MODALITA_ATTIVAZIONE.PUNTO_VENDITA]: 'Punto di vendita',
  [MODALITA_ATTIVAZIONE.TELEVENDITA]: 'Televendita',
  [MODALITA_ATTIVAZIONE.AGENZIA]: 'Agenzia',
  [MODALITA_ATTIVAZIONE.ALTRO]: 'Altro'
} as const;

// =====================================================
// PREZZI E RIFERIMENTI (Prices and References)
// =====================================================

export const PREZZO_RIFERIMENTO = {
  FISSO: 'FISSO',
  VARIABILE: 'VARIABILE',
  INDICIZZATO: 'INDICIZZATO'
} as const;

export const PREZZO_RIFERIMENTO_LABELS = {
  [PREZZO_RIFERIMENTO.FISSO]: 'Prezzo Fisso',
  [PREZZO_RIFERIMENTO.VARIABILE]: 'Prezzo Variabile',
  [PREZZO_RIFERIMENTO.INDICIZZATO]: 'Prezzo Indicizzato'
} as const;

export const FASCE_ORARIE = {
  MONORARIA: 'MONORARIA',
  BIORARIA: 'BIORARIA',
  MULTIORARIA: 'MULTIORARIA'
} as const;

export const FASCE_ORARIE_LABELS = {
  [FASCE_ORARIE.MONORARIA]: 'Monoraria (Solo F1)',
  [FASCE_ORARIE.BIORARIA]: 'Bioraria (F1, F2)',
  [FASCE_ORARIE.MULTIORARIA]: 'Multioraria (F1, F2, F3)'
} as const;

export const IDX_PREZZO_ENERGIA = {
  // Trimestrali
  PUN_TRIMESTRALE: '01',
  TTF_TRIMESTRALE: '02',
  PSV_TRIMESTRALE: '03',
  PSBIL_TRIMESTRALE: '04',
  PE_TRIMESTRALE: '05',
  CMEM_TRIMESTRALE: '06',
  PFOR_TRIMESTRALE: '07',
  // Bimestrali
  PUN_BIMESTRALE: '08',
  TTF_BIMESTRALE: '09',
  PSV_BIMESTRALE: '10',
  PSBIL_BIMESTRALE: '11',
  // Mensili
  PUN_MENSILE: '12',
  TTF_MENSILE: '13',
  PSV_MENSILE: '14',
  PSBIL_MENSILE: '15',
  // Altro
  ALTRO: '99'
} as const;

export const IDX_PREZZO_ENERGIA_LABELS = {
  [IDX_PREZZO_ENERGIA.PUN_TRIMESTRALE]: 'PUN (Trimestrale)',
  [IDX_PREZZO_ENERGIA.TTF_TRIMESTRALE]: 'TTF (Trimestrale)',
  [IDX_PREZZO_ENERGIA.PSV_TRIMESTRALE]: 'PSV (Trimestrale)',
  [IDX_PREZZO_ENERGIA.PSBIL_TRIMESTRALE]: 'Psbil (Trimestrale)',
  [IDX_PREZZO_ENERGIA.PE_TRIMESTRALE]: 'PE (Trimestrale)',
  [IDX_PREZZO_ENERGIA.CMEM_TRIMESTRALE]: 'Cmem (Trimestrale)',
  [IDX_PREZZO_ENERGIA.PFOR_TRIMESTRALE]: 'Pfor (Trimestrale)',
  [IDX_PREZZO_ENERGIA.PUN_BIMESTRALE]: 'PUN (Bimestrale)',
  [IDX_PREZZO_ENERGIA.TTF_BIMESTRALE]: 'TTF (Bimestrale)',
  [IDX_PREZZO_ENERGIA.PSV_BIMESTRALE]: 'PSV (Bimestrale)',
  [IDX_PREZZO_ENERGIA.PSBIL_BIMESTRALE]: 'Psbil (Bimestrale)',
  [IDX_PREZZO_ENERGIA.PUN_MENSILE]: 'PUN (Mensile)',
  [IDX_PREZZO_ENERGIA.TTF_MENSILE]: 'TTF (Mensile)',
  [IDX_PREZZO_ENERGIA.PSV_MENSILE]: 'PSV (Mensile)',
  [IDX_PREZZO_ENERGIA.PSBIL_MENSILE]: 'Psbil (Mensile)',
  [IDX_PREZZO_ENERGIA.ALTRO]: 'Altro (non gestito dal Portale)'
} as const;

// =====================================================
// FASCE ORARIE (Time Bands)
// =====================================================

export const TIPOLOGIA_FASCE = {
  MONORARIO: '01',
  F1_F2: '02',
  F1_F2_F3: '03',
  F1_F2_F3_F4: '04',
  F1_F2_F3_F4_F5: '05',
  F1_F2_F3_F4_F5_F6: '06',
  PEAK_OFFPEAK: '07',
  BIORARIO_F1_F2F3: '91',
  BIORARIO_F2_F1F3: '92',
  BIORARIO_F3_F1F2: '93'
} as const;

export const TIPOLOGIA_FASCE_LABELS = {
  [TIPOLOGIA_FASCE.MONORARIO]: 'Monorario',
  [TIPOLOGIA_FASCE.F1_F2]: 'F1, F2',
  [TIPOLOGIA_FASCE.F1_F2_F3]: 'F1, F2, F3 (Standard 3 fasce)',
  [TIPOLOGIA_FASCE.F1_F2_F3_F4]: 'F1, F2, F3, F4',
  [TIPOLOGIA_FASCE.F1_F2_F3_F4_F5]: 'F1, F2, F3, F4, F5',
  [TIPOLOGIA_FASCE.F1_F2_F3_F4_F5_F6]: 'F1, F2, F3, F4, F5, F6',
  [TIPOLOGIA_FASCE.PEAK_OFFPEAK]: 'Peak/OffPeak (Standard peak/off-peak)',
  [TIPOLOGIA_FASCE.BIORARIO_F1_F2F3]: 'Biorario (F1 / F2+F3)',
  [TIPOLOGIA_FASCE.BIORARIO_F2_F1F3]: 'Biorario (F2 / F1+F3)',
  [TIPOLOGIA_FASCE.BIORARIO_F3_F1F2]: 'Biorario (F3 / F1+F2)'
} as const;

export const FASCIA_COMPONENTE = {
  MONORARIO_F1: '01',
  F2: '02',
  F3: '03',
  F4: '04',
  F5: '05',
  F6: '06',
  PEAK: '07',
  OFFPEAK: '08',
  F2_F3: '91',
  F1_F3: '92',
  F1_F2: '93'
} as const;

export const FASCIA_COMPONENTE_LABELS = {
  [FASCIA_COMPONENTE.MONORARIO_F1]: 'Monorario/F1',
  [FASCIA_COMPONENTE.F2]: 'F2',
  [FASCIA_COMPONENTE.F3]: 'F3',
  [FASCIA_COMPONENTE.F4]: 'F4',
  [FASCIA_COMPONENTE.F5]: 'F5',
  [FASCIA_COMPONENTE.F6]: 'F6',
  [FASCIA_COMPONENTE.PEAK]: 'Peak',
  [FASCIA_COMPONENTE.OFFPEAK]: 'OffPeak',
  [FASCIA_COMPONENTE.F2_F3]: 'F2+F3',
  [FASCIA_COMPONENTE.F1_F3]: 'F1+F3',
  [FASCIA_COMPONENTE.F1_F2]: 'F1+F2'
} as const;

// =====================================================
// DISPACCIAMENTO (Dispatching)
// =====================================================

export const TIPO_DISPACCIAMENTO = {
  DISP_DEL_111_06: '01',
  PD: '02',
  MSD: '03',
  MODULAZIONE_EOLICO: '04',
  UNITA_ESSENZIALI: '05',
  FUNZ_TERNA: '06',
  CAPACITA_PRODUTTIVA: '07',
  INTERROMPIBILITA: '08',
  CORRISPETTIVO_CAPACITA_STG: '09',
  CORRISPETTIVO_CAPACITA_MT: '10',
  REINTEGRAZIONE_SALVAGUARDIA: '11',
  REINTEGRAZIONE_TUTELE: '12',
  DISP_BT: '13',
  ALTRO: '99'
} as const;

export const TIPO_DISPACCIAMENTO_LABELS = {
  [TIPO_DISPACCIAMENTO.DISP_DEL_111_06]: 'Disp. del.111/06',
  [TIPO_DISPACCIAMENTO.PD]: 'PD',
  [TIPO_DISPACCIAMENTO.MSD]: 'MSD',
  [TIPO_DISPACCIAMENTO.MODULAZIONE_EOLICO]: 'Modulazione Eolico',
  [TIPO_DISPACCIAMENTO.UNITA_ESSENZIALI]: 'Unità essenziali',
  [TIPO_DISPACCIAMENTO.FUNZ_TERNA]: 'Funz. Terna',
  [TIPO_DISPACCIAMENTO.CAPACITA_PRODUTTIVA]: 'Capacità Produttiva',
  [TIPO_DISPACCIAMENTO.INTERROMPIBILITA]: 'Interrompibilità',
  [TIPO_DISPACCIAMENTO.CORRISPETTIVO_CAPACITA_STG]: 'Corrispettivo Capacità di Mercato STG',
  [TIPO_DISPACCIAMENTO.CORRISPETTIVO_CAPACITA_MT]: 'Corrispettivo capacità di mercato MT',
  [TIPO_DISPACCIAMENTO.REINTEGRAZIONE_SALVAGUARDIA]: 'Reintegrazione oneri salvaguardia',
  [TIPO_DISPACCIAMENTO.REINTEGRAZIONE_TUTELE]: 'Reintegrazione oneri tutele graduali',
  [TIPO_DISPACCIAMENTO.DISP_BT]: 'DispBT (solo in calcolo Portale se selezionato)',
  [TIPO_DISPACCIAMENTO.ALTRO]: 'Altro'
} as const;

// =====================================================
// PAGAMENTI (Payments)
// =====================================================

export const MODALITA_PAGAMENTO = {
  ADDEBITO_BANCARIO: '01',
  ADDEBITO_POSTALE: '02',
  ADDEBITO_CARTA_CREDITO: '03',
  BOLLETTINO_PRECOMPILATO: '04',
  ALTRO: '99'
} as const;

export const MODALITA_PAGAMENTO_LABELS = {
  [MODALITA_PAGAMENTO.ADDEBITO_BANCARIO]: 'Addebito diretto bancario',
  [MODALITA_PAGAMENTO.ADDEBITO_POSTALE]: 'Addebito diretto postale',
  [MODALITA_PAGAMENTO.ADDEBITO_CARTA_CREDITO]: 'Addebito diretto carta di credito',
  [MODALITA_PAGAMENTO.BOLLETTINO_PRECOMPILATO]: 'Bollettino precompilato',
  [MODALITA_PAGAMENTO.ALTRO]: 'Altro'
} as const;

// =====================================================
// COMPONENTI REGOLATE (Regulated Components)
// =====================================================

export const COMPONENTI_REGOLATE_ELETTRICITA = {
  PCV: '01',
  PPE: '02'
} as const;

export const COMPONENTI_REGOLATE_GAS = {
  CCR: '03',
  CPR: '04',
  GRAD: '05',
  QT_INT: '06',
  QT_PSV: '07',
  QVD_FISSA: '09',
  QVD_VARIABILE: '10'
} as const;

export const COMPONENTI_REGOLATE = {
  ...COMPONENTI_REGOLATE_ELETTRICITA,
  ...COMPONENTI_REGOLATE_GAS
} as const;

export const COMPONENTI_REGOLATE_LABELS = {
  [COMPONENTI_REGOLATE.PCV]: 'PCV (Elettricità)',
  [COMPONENTI_REGOLATE.PPE]: 'PPE (Elettricità)',
  [COMPONENTI_REGOLATE.CCR]: 'CCR (Gas)',
  [COMPONENTI_REGOLATE.CPR]: 'CPR (Gas)',
  [COMPONENTI_REGOLATE.GRAD]: 'GRAD (Gas)',
  [COMPONENTI_REGOLATE.QT_INT]: 'QTint (Gas)',
  [COMPONENTI_REGOLATE.QT_PSV]: 'QTpsv (Gas)',
  [COMPONENTI_REGOLATE.QVD_FISSA]: 'QVD_fissa (Gas)',
  [COMPONENTI_REGOLATE.QVD_VARIABILE]: 'QVD_Variabile (Gas)'
} as const;

// =====================================================
// COMPONENTI IMPRESA (Company Components)
// =====================================================

export const TIPOLOGIA_COMPONENTE = {
  STANDARD: '01',
  OPTIONAL: '02'
} as const;

export const TIPOLOGIA_COMPONENTE_LABELS = {
  [TIPOLOGIA_COMPONENTE.STANDARD]: 'STANDARD (Prezzo incluso)',
  [TIPOLOGIA_COMPONENTE.OPTIONAL]: 'OPTIONAL (Prezzo non incluso)'
} as const;

export const MACROAREA_COMPONENTE = {
  CORRISPETTIVO_FISSO_COMMERCIALIZZAZIONE: '01',
  CORRISPETTIVO_ENERGIA_COMMERCIALIZZAZIONE: '02',
  COMPONENTE_PREZZO_ENERGIA: '04',
  CORRISPETTIVO_UNA_TANTUM: '05',
  ENERGIA_RINNOVABILE_GREEN: '06'
} as const;

export const MACROAREA_COMPONENTE_LABELS = {
  [MACROAREA_COMPONENTE.CORRISPETTIVO_FISSO_COMMERCIALIZZAZIONE]: 'Corrispettivo fisso di commercializzazione',
  [MACROAREA_COMPONENTE.CORRISPETTIVO_ENERGIA_COMMERCIALIZZAZIONE]: 'Corrispettivo energia di commercializzazione',
  [MACROAREA_COMPONENTE.COMPONENTE_PREZZO_ENERGIA]: 'Componente prezzo energia',
  [MACROAREA_COMPONENTE.CORRISPETTIVO_UNA_TANTUM]: 'Corrispettivo una tantum',
  [MACROAREA_COMPONENTE.ENERGIA_RINNOVABILE_GREEN]: 'Energia rinnovabile / Green energy'
} as const;

export const UNITA_MISURA = {
  EURO_ANNO: '01',
  EURO_KW: '02',
  EURO_KWH: '03',
  EURO_SM3: '04',
  EURO: '05',
  PERCENTUALE: '06'
} as const;

export const UNITA_MISURA_LABELS = {
  [UNITA_MISURA.EURO_ANNO]: '€/Anno',
  [UNITA_MISURA.EURO_KW]: '€/kW',
  [UNITA_MISURA.EURO_KWH]: '€/kWh',
  [UNITA_MISURA.EURO_SM3]: '€/Sm3',
  [UNITA_MISURA.EURO]: '€',
  [UNITA_MISURA.PERCENTUALE]: 'Percentuale'
} as const;

// =====================================================
// CONDIZIONI CONTRATTUALI (Contractual Conditions)
// =====================================================

export const TIPOLOGIA_CONDIZIONE = {
  ATTIVAZIONE: '01',
  DISATTIVAZIONE: '02',
  RECESSO: '03',
  OFFERTA_PLURIENNALE: '04',
  ONERI_RECESSO_ANTICIPATO: '05',
  ALTRO: '99'
} as const;

export const TIPOLOGIA_CONDIZIONE_LABELS = {
  [TIPOLOGIA_CONDIZIONE.ATTIVAZIONE]: 'Attivazione',
  [TIPOLOGIA_CONDIZIONE.DISATTIVAZIONE]: 'Disattivazione',
  [TIPOLOGIA_CONDIZIONE.RECESSO]: 'Recesso',
  [TIPOLOGIA_CONDIZIONE.OFFERTA_PLURIENNALE]: 'Offerta Pluriennale',
  [TIPOLOGIA_CONDIZIONE.ONERI_RECESSO_ANTICIPATO]: 'Oneri di Recesso Anticipato (dal 1° gennaio 2024)',
  [TIPOLOGIA_CONDIZIONE.ALTRO]: 'Altro'
} as const;

export const LIMITANTE = {
  SI: '01',
  NO: '02'
} as const;

export const LIMITANTE_LABELS = {
  [LIMITANTE.SI]: 'Sì, è limitante',
  [LIMITANTE.NO]: 'No, non è limitante'
} as const;

// =====================================================
// SCONTI (Discounts)
// =====================================================

export const VALIDITA_SCONTO = {
  INGRESSO: '01',
  ENTRO_12_MESI: '02',
  OLTRE_12_MESI: '03'
} as const;

export const VALIDITA_SCONTO_LABELS = {
  [VALIDITA_SCONTO.INGRESSO]: 'Ingresso',
  [VALIDITA_SCONTO.ENTRO_12_MESI]: 'Entro 12 mesi',
  [VALIDITA_SCONTO.OLTRE_12_MESI]: 'Oltre 12 mesi'
} as const;

export const IVA_SCONTO = {
  SI: '01',
  NO: '02'
} as const;

export const IVA_SCONTO_LABELS = {
  [IVA_SCONTO.SI]: 'Sì',
  [IVA_SCONTO.NO]: 'No'
} as const;

export const CONDIZIONE_APPLICAZIONE_SCONTO = {
  NON_CONDIZIONATO: '00',
  FATTURAZIONE_ELETTRONICA: '01',
  GESTIONE_ONLINE: '02',
  FATTURAZIONE_ADDEBITO: '03',
  ALTRO: '99'
} as const;

export const CONDIZIONE_APPLICAZIONE_SCONTO_LABELS = {
  [CONDIZIONE_APPLICAZIONE_SCONTO.NON_CONDIZIONATO]: 'Non condizionato',
  [CONDIZIONE_APPLICAZIONE_SCONTO.FATTURAZIONE_ELETTRONICA]: 'Fatturazione elettronica',
  [CONDIZIONE_APPLICAZIONE_SCONTO.GESTIONE_ONLINE]: 'Gestione online',
  [CONDIZIONE_APPLICAZIONE_SCONTO.FATTURAZIONE_ADDEBITO]: 'Fatturazione elettronica + addebito diretto bancario',
  [CONDIZIONE_APPLICAZIONE_SCONTO.ALTRO]: 'Altro'
} as const;

export const TIPOLOGIA_SCONTO = {
  SCONTO_FISSO: '01',
  SCONTO_POTENZA: '02',
  SCONTO_VENDITA: '03',
  SCONTO_PREZZO_REGOLATO: '04'
} as const;

export const TIPOLOGIA_SCONTO_LABELS = {
  [TIPOLOGIA_SCONTO.SCONTO_FISSO]: 'Sconto fisso',
  [TIPOLOGIA_SCONTO.SCONTO_POTENZA]: 'Sconto potenza',
  [TIPOLOGIA_SCONTO.SCONTO_VENDITA]: 'Sconto vendita',
  [TIPOLOGIA_SCONTO.SCONTO_PREZZO_REGOLATO]: 'Sconto su prezzo regolato'
} as const;

// =====================================================
// PRODOTTI E SERVIZI AGGIUNTIVI (Additional Products and Services)
// =====================================================

export const MACROAREA_SERVIZI = {
  CALDAIA: '01',
  MOBILITA: '02',
  SOLARE_TERMICO: '03',
  FOTOVOLTAICO: '04',
  CLIMATIZZAZIONE: '05',
  POLIZZA_ASSICURATIVA: '06',
  ALTRO: '99'
} as const;

export const MACROAREA_SERVIZI_LABELS = {
  [MACROAREA_SERVIZI.CALDAIA]: 'Caldaia',
  [MACROAREA_SERVIZI.MOBILITA]: 'Mobilità',
  [MACROAREA_SERVIZI.SOLARE_TERMICO]: 'Solare termico',
  [MACROAREA_SERVIZI.FOTOVOLTAICO]: 'Fotovoltaico',
  [MACROAREA_SERVIZI.CLIMATIZZAZIONE]: 'Climatizzazione',
  [MACROAREA_SERVIZI.POLIZZA_ASSICURATIVA]: 'Polizza assicurativa',
  [MACROAREA_SERVIZI.ALTRO]: 'Altro'
} as const;

// =====================================================
// MESI PER VALIDITÀ (Months for Validity)
// =====================================================

export const MESI = {
  GENNAIO: '01',
  FEBBRAIO: '02',
  MARZO: '03',
  APRILE: '04',
  MAGGIO: '05',
  GIUGNO: '06',
  LUGLIO: '07',
  AGOSTO: '08',
  SETTEMBRE: '09',
  OTTOBRE: '10',
  NOVEMBRE: '11',
  DICEMBRE: '12'
} as const;

export const MESI_LABELS = {
  [MESI.GENNAIO]: 'Gennaio',
  [MESI.FEBBRAIO]: 'Febbraio',
  [MESI.MARZO]: 'Marzo',
  [MESI.APRILE]: 'Aprile',
  [MESI.MAGGIO]: 'Maggio',
  [MESI.GIUGNO]: 'Giugno',
  [MESI.LUGLIO]: 'Luglio',
  [MESI.AGOSTO]: 'Agosto',
  [MESI.SETTEMBRE]: 'Settembre',
  [MESI.OTTOBRE]: 'Ottobre',
  [MESI.NOVEMBRE]: 'Novembre',
  [MESI.DICEMBRE]: 'Dicembre'
} as const;

// =====================================================
// CODICI COMPONENTE FASCIA (Component Band Codes)
// =====================================================

export const CODICE_COMPONENTE_FASCIA = {
  // Componenti regolate (1-10)
  PCV: '01',
  PPE: '02',
  CCR: '03',
  CPR: '04',
  GRAD: '05',
  QT_INT: '06',
  QT_PSV: '07',
  QVD_FISSA: '09',
  QVD_VARIABILE: '10',
  // Fasce orarie (11-18, 91-93)
  F1: '11',
  F2: '12',
  F3: '13',
  F4: '14',
  F5: '15',
  F6: '16',
  PEAK: '17',
  OFFPEAK: '18',
  F2_PLUS_F3: '91',
  F1_PLUS_F3: '92',
  F1_PLUS_F2: '93'
} as const;

export const CODICE_COMPONENTE_FASCIA_LABELS = {
  // Componenti regolate
  [CODICE_COMPONENTE_FASCIA.PCV]: 'PCV',
  [CODICE_COMPONENTE_FASCIA.PPE]: 'PPE',
  [CODICE_COMPONENTE_FASCIA.CCR]: 'CCR',
  [CODICE_COMPONENTE_FASCIA.CPR]: 'CPR',
  [CODICE_COMPONENTE_FASCIA.GRAD]: 'GRAD',
  [CODICE_COMPONENTE_FASCIA.QT_INT]: 'QTint',
  [CODICE_COMPONENTE_FASCIA.QT_PSV]: 'QTpsv',
  [CODICE_COMPONENTE_FASCIA.QVD_FISSA]: 'QVD_fissa',
  [CODICE_COMPONENTE_FASCIA.QVD_VARIABILE]: 'QVD_Variabile',
  // Fasce orarie
  [CODICE_COMPONENTE_FASCIA.F1]: 'F1',
  [CODICE_COMPONENTE_FASCIA.F2]: 'F2',
  [CODICE_COMPONENTE_FASCIA.F3]: 'F3',
  [CODICE_COMPONENTE_FASCIA.F4]: 'F4',
  [CODICE_COMPONENTE_FASCIA.F5]: 'F5',
  [CODICE_COMPONENTE_FASCIA.F6]: 'F6',
  [CODICE_COMPONENTE_FASCIA.PEAK]: 'Peak',
  [CODICE_COMPONENTE_FASCIA.OFFPEAK]: 'OffPeak',
  [CODICE_COMPONENTE_FASCIA.F2_PLUS_F3]: 'F2+F3',
  [CODICE_COMPONENTE_FASCIA.F1_PLUS_F3]: 'F1+F3',
  [CODICE_COMPONENTE_FASCIA.F1_PLUS_F2]: 'F1+F2'
} as const;

// =====================================================
// UTILITIES E HELPER TYPES
// =====================================================

// Union types per TypeScript
export type TipoMercato = typeof TIPO_MERCATO[keyof typeof TIPO_MERCATO];
export type TipoOfferta = typeof TIPO_OFFERTA[keyof typeof TIPO_OFFERTA];
export type TipoCliente = typeof TIPO_CLIENTE[keyof typeof TIPO_CLIENTE];
export type ModalitaAttivazione = typeof MODALITA_ATTIVAZIONE[keyof typeof MODALITA_ATTIVAZIONE];
export type ModalitaPagamento = typeof MODALITA_PAGAMENTO[keyof typeof MODALITA_PAGAMENTO];
export type UnitaMisura = typeof UNITA_MISURA[keyof typeof UNITA_MISURA];
export type PrezzoRiferimentoType = typeof PREZZO_RIFERIMENTO[keyof typeof PREZZO_RIFERIMENTO];
export type FasceOrarieType = typeof FASCE_ORARIE[keyof typeof FASCE_ORARIE];
export type IndicizzazioneType = typeof IDX_PREZZO_ENERGIA[keyof typeof IDX_PREZZO_ENERGIA];

// Helper per validazione campi condizionali
export const isElettricita = (tipoMercato: string): boolean => tipoMercato === TIPO_MERCATO.ELETTRICITA;
export const isGas = (tipoMercato: string): boolean => tipoMercato === TIPO_MERCATO.GAS;
export const isDualFuel = (tipoMercato: string): boolean => tipoMercato === TIPO_MERCATO.DUAL_FUEL;
export const isOffertaVariabile = (tipoOfferta: string): boolean => tipoOfferta === TIPO_OFFERTA.VARIABILE;
export const isOffertaFlat = (tipoOfferta: string): boolean => tipoOfferta === TIPO_OFFERTA.FLAT;

// Durata speciale per durata indeterminata
export const DURATA_INDETERMINATA = -1; 