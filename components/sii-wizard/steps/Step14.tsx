'use client'

import React from 'react'
import { 
  FormSection, 
  StatusBadge, 
  InfoAlert
} from '../form'

// Temporary mock data type until useStep14 is implemented
interface MockStep14Data {
  tipi_notifica?: string[]
  canali_preferiti?: string[]
  frequenza_notifiche?: string
  note_notifiche?: string
}

// Temporary mock hook until useStep14 is implemented (currently unused, will be used when step is fully implemented)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useMockStep14() {
  const [data, setData] = React.useState<MockStep14Data>({
    tipi_notifica: [],
    canali_preferiti: []
  })
  
  return {
    data,
    errors: {},
    isValid: true,
    isComplete: true,
    hasUnsavedChanges: false,
    updateData: (newData: Partial<MockStep14Data>) => setData((prev: MockStep14Data) => ({ ...prev, ...newData })),
    clearData: () => setData({ tipi_notifica: [], canali_preferiti: [] }),
    resetData: () => setData({ tipi_notifica: [], canali_preferiti: [] }),
    saveData: () => console.log('Save Step14 data', data),
    fillExampleData: () => {
      setData({
        tipi_notifica: ['fatture', 'consumi_anomali', 'manutenzioni'],
        canali_preferiti: ['email', 'sms'],
        frequenza_notifiche: 'settimanale',
        note_notifiche: 'Preferenze di notifica configurate per comunicazioni tempestive.'
      })
    }
  }
}

/**
 * Step 14: Notification Configuration (Configurazione Notifiche)
 * 
 * Questo step configura le preferenze di notifica e comunicazione del cliente.
 * Include canali di comunicazione, frequenze e tipologie di notifiche.
 * 
 * Caratteristiche:
 * - Configurazione canali di comunicazione preferiti
 * - Selezione tipologie di notifiche
 * - Impostazione frequenze di invio
 * - Gestione consensi comunicazioni marketing
 * - Configurazione notifiche di emergenza
 */
export default function Step14() {
  return (
    <div className="space-y-6">
      <FormSection
        title="Configurazione Notifiche"
        description="Impostazione preferenze di comunicazione e notifiche"
        icon="🔔"
        status={<StatusBadge status="incompleto" />}
      />
      
      <InfoAlert
        type="info"
        title="Step in Sviluppo"
        message="Questo step sarà implementato con configurazione completa delle notifiche."
      />
    </div>
  )
} 