'use client'

import React from 'react'
import { 
  FormSection, 
  StatusBadge, 
  InfoAlert
} from '../form'

// Temporary mock data type until useStep10 is implemented
interface MockStep10Data {
  modalita_pagamento?: string
  frequenza_fatturazione?: string
  note_fatturazione?: string
}

// Temporary mock hook until useStep10 is implemented (currently unused, will be used when step is fully implemented)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useMockStep10() {
  const [data, setData] = React.useState<MockStep10Data>({})
  
  return {
    data,
    errors: {},
    isValid: true,
    isComplete: true,
    hasUnsavedChanges: false,
    updateData: (newData: Partial<MockStep10Data>) => setData((prev: MockStep10Data) => ({ ...prev, ...newData })),
    clearData: () => setData({}),
    resetData: () => setData({}),
    saveData: () => console.log('Save Step10 data', data),
    fillExampleData: () => {
      setData({
        modalita_pagamento: 'bonifico_bancario',
        frequenza_fatturazione: 'mensile',
        note_fatturazione: 'Fatturazione elettronica configurata correttamente.'
      })
    }
  }
}

/**
 * Step 10: Billing Configuration (Configurazione Fatturazione)
 * 
 * Questo step configura le modalità di fatturazione e pagamento.
 * Include impostazioni per fatturazione elettronica e metodi di pagamento.
 * 
 * Caratteristiche:
 * - Configurazione fatturazione elettronica
 * - Selezione modalità di pagamento
 * - Impostazione frequenza fatturazione
 * - Configurazione dati bancari
 * - Gestione scadenze e termini di pagamento
 */
export default function Step10() {
  return (
    <div className="space-y-6">
      <FormSection
        title="Configurazione Fatturazione"
        description="Impostazioni fatturazione elettronica e modalità di pagamento"
        icon="💳"
        status={<StatusBadge status="incompleto" />}
      />
      
      <InfoAlert
        type="info"
        title="Step in Sviluppo"
        message="Questo step sarà implementato con configurazione completa della fatturazione."
      />
    </div>
  )
} 