'use client'

import React from 'react'
import { 
  FormSection, 
  FormActions, 
  StatusBadge, 
  InfoAlert,
  ActivationMethods,
  type RepeatableFieldItem
} from '../form'

// Temporary mock data type until useStep3 is implemented
interface MockStep3Data {
  metodi_attivazione?: RepeatableFieldItem[]
  note_aggiuntive?: string
}

// Temporary mock hook until useStep3 is implemented
function useMockStep3() {
  const [data, setData] = React.useState<MockStep3Data>({
    metodi_attivazione: []
  })
  
  const generateId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    data,
    errors: {},
    isValid: (data.metodi_attivazione?.length || 0) > 0,
    isComplete: (data.metodi_attivazione?.length || 0) > 0 && (data.metodi_attivazione?.every(item => item.isValid) || false),
    hasUnsavedChanges: false,
    updateData: (newData: Partial<MockStep3Data>) => setData((prev: MockStep3Data) => ({ ...prev, ...newData })),
    clearData: () => setData({ metodi_attivazione: [] }),
    resetData: () => setData({ metodi_attivazione: [] }),
    saveData: () => console.log('Save Step3 data', data),
    fillExampleData: () => {
      const exampleMethods: RepeatableFieldItem[] = [
        {
          id: generateId(),
          value: 'Attivazione online tramite sito web aziendale',
          isValid: true,
          errors: []
        },
        {
          id: generateId(),
          value: 'Chiamata telefonica al call center',
          isValid: true,
          errors: []
        },
        {
          id: generateId(),
          value: 'Visita presso i punti vendita fisici',
          isValid: true,
          errors: []
        },
        {
          id: generateId(),
          value: 'Tramite agenti commerciali autorizzati',
          isValid: true,
          errors: []
        }
      ]
      setData({
        metodi_attivazione: exampleMethods,
        note_aggiuntive: 'I metodi di attivazione sono disponibili 24/7 per il canale online, mentre call center e punti vendita seguono orari specifici.'
      })
    }
  }
}

/**
 * Step 3: Activation Methods (Metodi di Attivazione)
 * 
 * Questo step gestisce i metodi attraverso cui i clienti possono attivare l'offerta.
 * Utilizza il componente ActivationMethods specializzato per array di stringhe.
 * 
 * Caratteristiche:
 * - Array di metodi di attivazione (stringhe)
 * - Validazione per ogni metodo
 * - No duplicati
 * - Minimo 1 metodo richiesto per completare lo step
 */
export default function Step3() {
  // TODO: Replace with actual useStep3 hook when implemented
  const step3 = useMockStep3()
  
  // Extract current values
  const currentData = step3.data || {}
  const metodiAttivazione = currentData.metodi_attivazione || []
  
  // Form validation state
  const hasErrors = Object.keys(step3.errors || {}).length > 0
  const isComplete = step3.isValid && step3.isComplete
  const validMethodsCount = metodiAttivazione.filter(method => method.isValid).length
  const totalMethodsCount = metodiAttivazione.length
  
  // Status for the step
  const getStepStatus = () => {
    if (hasErrors) return 'errori'
    if (isComplete) return 'completo'
    if (totalMethodsCount > 0) return 'in_corso'
    return 'incompleto'
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <FormSection
        title="Metodi di Attivazione"
        description="Specifica le modalità attraverso cui i clienti possono attivare l'offerta"
        icon="🚀"
        status={<StatusBadge status={getStepStatus()} />}
      />

      {/* Activation Methods Array */}
      <ActivationMethods
        items={metodiAttivazione}
        onChange={(items) => step3.updateData({ metodi_attivazione: items })}
        required={true}
        disabled={false}
      />

      {/* Additional Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Note Aggiuntive sui Metodi di Attivazione
        </label>
        <textarea
          value={currentData.note_aggiuntive || ''}
          onChange={(e) => step3.updateData({ note_aggiuntive: e.target.value })}
          placeholder="Informazioni aggiuntive sui metodi di attivazione, orari di disponibilità, condizioni particolari..."
          className="w-full min-h-[100px] p-3 border border-input rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={500}
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Note opzionali sui metodi di attivazione</span>
          <span>{(currentData.note_aggiuntive || '').length}/500</span>
        </div>
      </div>

      {/* Step Statistics */}
      {totalMethodsCount > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">Riepilogo Metodi di Attivazione</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-foreground">Metodi Totali</div>
              <div className="text-2xl font-bold text-primary">{totalMethodsCount}</div>
            </div>
            <div>
              <div className="font-medium text-green-600">Metodi Validi</div>
              <div className="text-2xl font-bold text-green-600">{validMethodsCount}</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Copertura</div>
              <div className="text-2xl font-bold text-blue-600">
                {totalMethodsCount > 0 ? Math.round((validMethodsCount / totalMethodsCount) * 100) : 0}%
              </div>
            </div>
            <div>
              <div className="font-medium text-foreground">Stato</div>
              <div className="text-sm font-medium">
                <StatusBadge status={getStepStatus()} />
              </div>
            </div>
          </div>
          
          {/* Methods breakdown */}
          {validMethodsCount > 0 && (
            <div className="mt-4 pt-4 border-t border-muted">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">METODI CONFIGURATI:</h5>
              <div className="space-y-1">
                {metodiAttivazione.filter(method => method.isValid).map((method, index) => (
                  <div key={method.id} className="text-xs text-foreground flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="font-medium">{index + 1}.</span>
                    <span>{method.value.length > 50 ? `${method.value.substring(0, 50)}...` : method.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation Status */}
      {totalMethodsCount === 0 && (
        <InfoAlert
          type="info"
          title="Metodi di Attivazione Richiesti"
          message={
            <div className="space-y-2">
              <p>Aggiungi almeno un metodo di attivazione per completare questo step.</p>
              <p className="text-sm">Esempi di metodi comuni:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li><strong>Online:</strong> Sito web, app mobile, portale clienti</li>
                <li><strong>Telefono:</strong> Call center, numero verde</li>
                <li><strong>Fisico:</strong> Punti vendita, sportelli, agenti</li>
                <li><strong>Email:</strong> Invio moduli via email</li>
              </ul>
            </div>
          }
        />
      )}

      {hasErrors && (
        <InfoAlert
          type="error"
          title="Errori di Validazione"
          message={
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(step3.errors || {}).map(([field, error]) => (
                <li key={field}><strong>{field}:</strong> {error}</li>
              ))}
            </ul>
          }
        />
      )}

      {isComplete && (
        <InfoAlert
          type="success"
          title="Step Completato"
          message={`Hai configurato ${validMethodsCount} ${validMethodsCount === 1 ? 'metodo di attivazione' : 'metodi di attivazione'}. I clienti potranno utilizzare queste modalità per attivare l'offerta.`}
        />
      )}

      {/* Best Practices */}
      {totalMethodsCount > 0 && totalMethodsCount < 3 && (
        <InfoAlert
          type="warning"
          title="Suggerimento"
          message="Considera l'aggiunta di più metodi di attivazione per offrire maggiore flessibilità ai clienti. I metodi digitali (online, app) sono generalmente più convenienti per gli utenti."
        />
      )}

      {/* Action Buttons */}
      <FormActions
        onClear={() => step3.clearData()}
        onReset={() => step3.resetData()}
        onSave={() => step3.saveData()}
        onFillExample={() => step3.fillExampleData()}
        canClear={totalMethodsCount > 0}
        canReset={step3.hasUnsavedChanges}
        canSave={step3.isValid}
        showFillExample={process.env.NODE_ENV === 'development'}
      />
    </div>
  )
} 