'use client'

import React from 'react'
import { 
  FormSection, 
  StatusBadge, 
  InfoAlert
} from '../form'

// Temporary mock data type until useStep6 is implemented
interface MockStep6Data {
  ragione_sociale_completa?: string
  forma_giuridica?: 'srl' | 'spa' | 'snc' | 'sas' | 'ditta_individuale' | 'associazione' | 'cooperativa' | 'altro'
  codice_fiscale?: string
  numero_rea?: string
  camera_commercio?: string
  data_costituzione?: string
  capitale_sociale?: number
  settore_attivita?: string
  codice_ateco?: string
  
  // Legal representative
  rappresentante_legale_nome?: string
  rappresentante_legale_cognome?: string
  rappresentante_legale_cf?: string
  rappresentante_legale_nascita_data?: string
  rappresentante_legale_nascita_luogo?: string
  rappresentante_legale_ruolo?: string
  
  // Registered office
  sede_legale_via?: string
  sede_legale_civico?: string
  sede_legale_cap?: string
  sede_legale_citta?: string
  sede_legale_provincia?: string
  sede_legale_telefono?: string
  sede_legale_fax?: string
  sede_legale_pec?: string
  
  // Operational office (if different)
  sede_operativa_diversa?: boolean
  sede_operativa_via?: string
  sede_operativa_civico?: string
  sede_operativa_cap?: string
  sede_operativa_citta?: string
  sede_operativa_provincia?: string
  sede_operativa_telefono?: string
  
  // Additional information
  numero_dipendenti?: number
  fatturato_annuo?: number
  certificazioni?: string[]
  note_aggiuntive?: string
}

// Temporary mock hook until useStep6 is implemented (currently unused, will be used when step is fully implemented)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useMockStep6() {
  const [data, setData] = React.useState<MockStep6Data>({
    forma_giuridica: 'srl',
    sede_operativa_diversa: false,
    numero_dipendenti: 0,
    fatturato_annuo: 0,
    certificazioni: []
  })
  
  const isFormValid = () => {
    return !!(
      data.ragione_sociale_completa &&
      data.forma_giuridica &&
      data.codice_fiscale &&
      data.rappresentante_legale_nome &&
      data.rappresentante_legale_cognome &&
      data.sede_legale_via &&
      data.sede_legale_cap &&
      data.sede_legale_citta &&
      data.sede_legale_provincia
    )
  }
  
  const isFormComplete = () => {
    return isFormValid() && !!(
      data.numero_rea &&
      data.settore_attivita &&
      data.codice_ateco &&
      data.rappresentante_legale_cf &&
      data.capitale_sociale &&
      data.data_costituzione
    )
  }
  
  return {
    data,
    errors: {},
    isValid: isFormValid(),
    isComplete: isFormComplete(),
    hasUnsavedChanges: false,
    updateData: (newData: Partial<MockStep6Data>) => setData((prev: MockStep6Data) => ({ ...prev, ...newData })),
    clearData: () => setData({
      forma_giuridica: 'srl',
      sede_operativa_diversa: false,
      numero_dipendenti: 0,
      fatturato_annuo: 0,
      certificazioni: []
    }),
    resetData: () => setData({
      forma_giuridica: 'srl',
      sede_operativa_diversa: false,
      numero_dipendenti: 0,
      fatturato_annuo: 0,
      certificazioni: []
    }),
    saveData: () => console.log('Save Step6 data', data),
    fillExampleData: () => {
      setData({
        ragione_sociale_completa: 'Green Energy Solutions S.r.l.',
        forma_giuridica: 'srl',
        codice_fiscale: '12345678901',
        numero_rea: 'MI-1234567',
        camera_commercio: 'Milano Monza Brianza Lodi',
        data_costituzione: '2019-03-15',
        capitale_sociale: 100000,
        settore_attivita: 'Fornitura di energia elettrica e gas',
        codice_ateco: '35.11.00',
        
        rappresentante_legale_nome: 'Mario',
        rappresentante_legale_cognome: 'Rossi',
        rappresentante_legale_cf: 'RSSMRA75A01F205X',
        rappresentante_legale_nascita_data: '1975-01-01',
        rappresentante_legale_nascita_luogo: 'Milano (MI)',
        rappresentante_legale_ruolo: 'Amministratore Delegato',
        
        sede_legale_via: 'Via Roma',
        sede_legale_civico: '123',
        sede_legale_cap: '20121',
        sede_legale_citta: 'Milano',
        sede_legale_provincia: 'MI',
        sede_legale_telefono: '+39 02 12345678',
        sede_legale_fax: '+39 02 12345679',
        sede_legale_pec: 'amministrazione@pec.greenenergyolutions.it',
        
        sede_operativa_diversa: true,
        sede_operativa_via: 'Via Torino',
        sede_operativa_civico: '456',
        sede_operativa_cap: '20123',
        sede_operativa_citta: 'Milano',
        sede_operativa_provincia: 'MI',
        sede_operativa_telefono: '+39 02 87654321',
        
        numero_dipendenti: 25,
        fatturato_annuo: 2500000,
        certificazioni: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
        note_aggiuntive: 'Azienda specializzata nella fornitura di energia rinnovabile con oltre 5 anni di esperienza nel mercato italiano. Certificata per la qualità e sostenibilità ambientale.'
      })
    }
  }
}

/**
 * Step 6: Advanced Customer Details (Dettagli Anagrafici Avanzati)
 * 
 * Questo step raccoglie informazioni anagrafiche dettagliate dell&apos;azienda cliente.
 * Include dati societari completi, rappresentante legale, sedi operative e legali.
 * 
 * Caratteristiche:
 * - Informazioni societarie complete (ragione sociale, forma giuridica, REA)
 * - Dati rappresentante legale con validazione codice fiscale
 * - Gestione sede legale e operativa (anche se diverse)
 * - Informazioni aggiuntive su certificazioni e attività
 * - Validazione completa per conformità SII
 */
export default function Step6() {
  return (
    <div className="space-y-6">
      <FormSection
        title="Dettagli Anagrafici Avanzati"
        description="Informazioni societarie complete e dati rappresentante legale"
        icon="🏢"
        status={<StatusBadge status="incompleto" />}
      />
      
      <InfoAlert
        type="info"
        title="Step in Sviluppo"
        message="Questo step sarà implementato con i dettagli anagrafici avanzati dell&apos;azienda."
      />
    </div>
  )
} 