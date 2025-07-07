export const baseConfig = [
  {
    id: 'basicInfo',
    title: 'Informazioni di Base',
    description: 'Partita IVA e Codice Offerta',
  },
  {
    id: 'offerDetails',
    title: 'Dettagli Offerta',
    description: 'Tipo mercato, tipo cliente e configurazione offerta',
  },
  {
    id: 'activationContacts',
    title: 'Attivazione e Contatti',
    description: 'Modalità di attivazione e informazioni di contatto',
  },
  {
    id: 'pricingConfig',
    title: 'Configurazione Prezzi',
    description: 'Prezzi energia, fasce orarie e dispacciamento',
  },
  {
    id: 'companyComponents',
    title: 'Componenti Impresa',
    description: 'Definizione componenti con intervalli di prezzo',
  },
  {
    id: 'paymentConditions',
    title: 'Pagamenti e Condizioni',
    description: 'Metodi di pagamento e condizioni contrattuali',
  },
  {
    id: 'additionalFeatures',
    title: 'Funzionalità Aggiuntive',
    description: 'Sconti, zone e servizi aggiuntivi',
  },
  {
    id: 'validityReview',
    title: 'Validità e Revisione',
    description: 'Date di validità offerta e revisione finale',
  },
] as const;

export const steps = baseConfig.map((step) => step.id);

export type Step = (typeof steps)[number];
