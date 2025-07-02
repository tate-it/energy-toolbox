'use client'

import React from 'react'
import { 
  FormSection, 
  StatusBadge, 
  InfoAlert
} from '../form'

// Temporary mock data type until useStep13 is implemented
interface MockStep13Data {
  utenze_multiple?: string[]
  configurazione_centralizzata?: boolean
  note_gestione?: string
}

// Temporary mock hook until useStep13 is implemented (currently unused, will be used when step is fully implemented)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useMockStep13() {
  const [data, setData] = React.useState<MockStep13Data>({
    utenze_multiple: [],
    configurazione_centralizzata: false
  })
  
  return {
    data,
    errors: {},
    isValid: true,
    isComplete: true,
    hasUnsavedChanges: false,
    updateData: (newData: Partial<MockStep13Data>) => setData((prev: MockStep13Data) => ({ ...prev, ...newData })),
    clearData: () => setData({ utenze_multiple: [], configurazione_centralizzata: false }),
    resetData: () => setData({ utenze_multiple: [], configurazione_centralizzata: false }),
    saveData: () => console.log('Save Step13 data', data),
    fillExampleData: () => {
      setData({
        utenze_multiple: ['sede_principale', 'filiale_milano', 'magazzino_roma'],
        configurazione_centralizzata: true,
        note_gestione: 'Gestione centralizzata per tutte le utenze aziendali.'
      })
    }
  }
}

/**
 * Step 13: Multi-Utility Management (Gestione Utenze Multiple)
 * 
 * Questo step gestisce la configurazione per utenze multiple dello stesso cliente.
 * Include gestione centralizzata e coordinamento tra diverse forniture.
 * 
 * Caratteristiche:
 * - Gestione utenze multiple per un singolo cliente
 * - Configurazione centralizzata vs decentralizzata
 * - Coordinamento fatturazione e pagamenti
 * - Gestione contratti collegati
 * - Monitoraggio aggregato consumi
 */
export default function Step13() {
  return (
    <div className="space-y-6">
      <FormSection
        title="Gestione Utenze Multiple"
        description="Configurazione e coordinamento per forniture multiple"
        icon="🏭"
        status={<StatusBadge status="incompleto" />}
      />
      
      <InfoAlert
        type="info"
        title="Step in Sviluppo"
        message="Questo step sarà implementato con gestione completa delle utenze multiple."
      />
    </div>
  )
} 