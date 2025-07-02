'use client'

import React from 'react'
import { 
  FormSection, 
  StatusBadge, 
  InfoAlert
} from '../form'

// Temporary mock data type until useStep2 is implemented
interface MockStep2Data {
  nome_offerta?: string
  descrizione_breve?: string
  descrizione_dettagliata?: string
  tipo_offerta?: 'residenziale' | 'business' | 'industriale' | 'mista'
  mercato_target?: 'libero' | 'tutelato' | 'entrambi'
  categoria_prezzo?: 'fisso' | 'variabile' | 'indicizzato' | 'dual'
  durata_contratto?: number
  unita_durata?: 'mesi' | 'anni'
  preavviso_disdetta?: number
  tipo_fornitura?: 'solo_energia' | 'solo_gas' | 'dual_fuel'
  potenza_minima?: number
  potenza_massima?: number
  consumo_minimo_annuo?: number
  vincoli_geografici?: string
  canali_vendita?: string[]
  commissioni_attivazione?: number
  deposito_cauzionale?: boolean
  requisiti_cliente?: string
  vantaggi_principali?: string
  note_interne?: string
}

// Temporary mock hook until useStep2 is implemented (currently unused, will be used when step is fully implemented)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useMockStep2() {
  const [data, setData] = React.useState<MockStep2Data>({
    tipo_offerta: 'residenziale',
    mercato_target: 'libero',
    categoria_prezzo: 'fisso',
    durata_contratto: 12,
    unita_durata: 'mesi',
    preavviso_disdetta: 30,
    tipo_fornitura: 'solo_energia',
    potenza_minima: 3,
    potenza_massima: 20,
    consumo_minimo_annuo: 1000,
    canali_vendita: [],
    commissioni_attivazione: 0,
    deposito_cauzionale: false
  })
  
  const isFormValid = () => {
    return !!(
      data.nome_offerta &&
      data.descrizione_breve &&
      data.tipo_offerta &&
      data.mercato_target &&
      data.categoria_prezzo &&
      data.durata_contratto &&
      data.tipo_fornitura &&
      data.canali_vendita?.length
    )
  }
  
  const isFormComplete = () => {
    return isFormValid() && !!(
      data.descrizione_dettagliata &&
      data.vantaggi_principali &&
      data.requisiti_cliente
    )
  }
  
  return {
    data,
    errors: {},
    isValid: isFormValid(),
    isComplete: isFormComplete(),
    hasUnsavedChanges: false,
    updateData: (newData: Partial<MockStep2Data>) => setData((prev: MockStep2Data) => ({ ...prev, ...newData })),
    clearData: () => setData({
      tipo_offerta: 'residenziale',
      mercato_target: 'libero',
      categoria_prezzo: 'fisso',
      durata_contratto: 12,
      unita_durata: 'mesi',
      preavviso_disdetta: 30,
      tipo_fornitura: 'solo_energia',
      potenza_minima: 3,
      potenza_massima: 20,
      consumo_minimo_annuo: 1000,
      canali_vendita: [],
      commissioni_attivazione: 0,
      deposito_cauzionale: false
    }),
    resetData: () => setData({
      tipo_offerta: 'residenziale',
      mercato_target: 'libero',
      categoria_prezzo: 'fisso',
      durata_contratto: 12,
      unita_durata: 'mesi',
      preavviso_disdetta: 30,
      tipo_fornitura: 'solo_energia',
      potenza_minima: 3,
      potenza_massima: 20,
      consumo_minimo_annuo: 1000,
      canali_vendita: [],
      commissioni_attivazione: 0,
      deposito_cauzionale: false
    }),
    saveData: () => console.log('Save Step2 data', data),
    fillExampleData: () => {
      setData({
        nome_offerta: 'Green Energy Plus 2024',
        descrizione_breve: 'Offerta energia rinnovabile con prezzo fisso e servizi premium inclusi',
        descrizione_dettagliata: 'Soluzione energetica completa dedicata alle famiglie italiane che desiderano energia 100% rinnovabile a prezzo fisso garantito per 24 mesi. Include assistenza clienti premium, app di monitoraggio consumi e consulenza personalizzata per il risparmio energetico.',
        tipo_offerta: 'residenziale',
        mercato_target: 'libero',
        categoria_prezzo: 'fisso',
        durata_contratto: 24,
        unita_durata: 'mesi',
        preavviso_disdetta: 30,
        tipo_fornitura: 'solo_energia',
        potenza_minima: 3,
        potenza_massima: 15,
        consumo_minimo_annuo: 2000,
        vincoli_geografici: 'Disponibile in tutto il territorio nazionale, escluse isole minori',
        canali_vendita: ['online', 'call_center', 'agenti', 'negozi'],
        commissioni_attivazione: 0,
        deposito_cauzionale: false,
        requisiti_cliente: 'Cliente maggiorenne, residente in Italia, senza pendenze su precedenti contratti energetici, ISEE sotto i 50.000€ per accedere alle agevolazioni',
        vantaggi_principali: '• Prezzo fisso garantito per 24 mesi\n• Energia 100% da fonti rinnovabili\n• Assistenza clienti premium 24/7\n• App mobile per monitoraggio consumi\n• Consulenza energetica gratuita\n• Zero commissioni di attivazione\n• Possibilità di rateizzazione bollette',
        note_interne: 'Offerta strategica per acquisizione nuovi clienti nel segmento residenziale premium. Focus su sostenibilità e servizio clienti. Target: 5000 nuovi contratti nei primi 6 mesi.'
      })
    }
  }
}

/**
 * Step 2: Offer Details (Dettaglio Offerta)
 * 
 * Questo step raccoglie le informazioni dettagliate sull'offerta energetica.
 * Include dati commerciali, tecnici e contrattuali fondamentali.
 * 
 * Caratteristiche:
 * - Informazioni base offerta (nome, descrizione, tipo)
 * - Parametri commerciali (durata, preavviso, commissioni)
 * - Requisiti tecnici (potenza, consumi)
 * - Canali di vendita e vincoli
 * - Vantaggi e requisiti cliente
 */
export default function Step2() {
  return (
    <div className="space-y-6">
      <FormSection
        title="Dettaglio Offerta"
        description="Configura le informazioni principali dell'offerta energetica"
        icon="📋"
        status={<StatusBadge status="incompleto" />}
      />
      
      <InfoAlert
        type="info"
        title="Step in Sviluppo"
        message="Questo step sarà implementato con le informazioni dettagliate dell'offerta."
      />
    </div>
  )
} 