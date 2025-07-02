'use client'

import React from 'react'
import { 
  FormSection, 
  FormField,
  FormSelect,
  FormActions, 
  StatusBadge, 
  InfoAlert,
  Discounts,
  type RepeatableObjectItem
} from '../form'

// Temporary mock data type until useStep17 is implemented
interface MockStep17Data {
  sconti?: RepeatableObjectItem[]
  applica_sconti?: boolean
  politica_sconto?: 'automatica' | 'manuale' | 'condizionale'
  sconto_massimo?: number
  note_sconti?: string
  termini_condizioni?: string
}

// Temporary mock hook until useStep17 is implemented
function useMockStep17() {
  const [data, setData] = React.useState<MockStep17Data>({
    sconti: [],
    applica_sconti: false,
    politica_sconto: 'automatica',
    sconto_massimo: 25
  })
  
  const generateId = () => `discount-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    data,
    errors: {},
    isValid: data.applica_sconti ? (data.sconti?.length || 0) > 0 : true,
    isComplete: data.applica_sconti ? 
      (data.sconti?.length || 0) > 0 && (data.sconti?.every(discount => discount.isValid) || false) : true,
    hasUnsavedChanges: false,
    updateData: (newData: Partial<MockStep17Data>) => setData((prev: MockStep17Data) => ({ ...prev, ...newData })),
    clearData: () => setData({ 
      sconti: [], 
      applica_sconti: false,
      politica_sconto: 'automatica',
      sconto_massimo: 25 
    }),
    resetData: () => setData({ 
      sconti: [], 
      applica_sconti: false,
      politica_sconto: 'automatica',
      sconto_massimo: 25 
    }),
    saveData: () => console.log('Save Step17 data', data),
    fillExampleData: () => {
      const exampleDiscounts: RepeatableObjectItem[] = [
        {
          id: generateId(),
          data: {
            nome: 'Sconto Benvenuto',
            tipo: 'percentuale',
            valore: '10',
            condizioni: 'Valido per i primi 12 mesi di fornitura',
            data_inizio: '2024-01-01',
            data_fine: '2024-12-31',
            target: 'nuovi_clienti',
            note: 'Sconto automatico applicato alla prima fattura'
          },
          errors: {},
          isValid: true,
          isDirty: true
        },
        {
          id: generateId(),
          data: {
            nome: 'Sconto Fedeltà Plus',
            tipo: 'fisso',
            valore: '50',
            condizioni: 'Per clienti con contratto attivo da oltre 2 anni',
            data_inizio: '2024-01-01',
            data_fine: '2025-12-31',
            target: 'clienti_esistenti',
            note: 'Applicato automaticamente sui consumi mensili'
          },
          errors: {},
          isValid: true,
          isDirty: true
        },
        {
          id: generateId(),
          data: {
            nome: 'Promo Estate 2024',
            tipo: 'percentuale',
            valore: '15',
            condizioni: 'Attivazione entro il 31 agosto 2024 con consumo minimo 3000 kWh/anno',
            data_inizio: '2024-06-01',
            data_fine: '2024-08-31',
            target: 'tutti_clienti',
            note: 'Sconto limitato ai primi 500 clienti che aderiscono'
          },
          errors: {},
          isValid: true,
          isDirty: true
        }
      ]
      setData({
        sconti: exampleDiscounts,
        applica_sconti: true,
        politica_sconto: 'condizionale',
        sconto_massimo: 25,
        note_sconti: 'Gli sconti sono cumulabili fino al massimo consentito. Verificare sempre i termini e condizioni specifici.',
        termini_condizioni: 'Tutti gli sconti sono soggetti ad approvazione e possono essere modificati senza preavviso. Non validi per contratti già in corso con altre promozioni attive.'
      })
    }
  }
}

/**
 * Step 17: Discount Management (Sconti)
 * 
 * Questo step gestisce la configurazione degli sconti e promozioni per l'offerta energetica.
 * Utilizza il componente Discounts specializzato per array di oggetti sconto complessi.
 * 
 * Caratteristiche:
 * - Array di sconti con tipi, valori, condizioni, validità
 * - Politiche di applicazione automatica o manuale
 * - Gestione targetting clienti e limiti temporali
 * - Calcolo automatico cumulabilità sconti
 * - Integrazione con termini e condizioni
 */
export default function Step17() {
  // TODO: Replace with actual useStep17 hook when implemented
  const step17 = useMockStep17()
  
  // Extract current values
  const currentData = step17.data || {}
  const sconti = currentData.sconti || []
  const applicaSconti = currentData.applica_sconti || false
  
  // Form validation state
  const hasErrors = Object.keys(step17.errors || {}).length > 0
  const isComplete = step17.isValid && step17.isComplete
  const validDiscountsCount = sconti.filter(discount => discount.isValid).length
  const totalDiscountsCount = sconti.length
  
  // Calculate total potential savings
  const totalPercentageDiscount = sconti
    .filter(discount => discount.isValid && discount.data.tipo === 'percentuale')
    .reduce((sum, discount) => sum + (parseFloat(discount.data.valore) || 0), 0)
  
  const totalFixedDiscount = sconti
    .filter(discount => discount.isValid && discount.data.tipo === 'fisso')
    .reduce((sum, discount) => sum + (parseFloat(discount.data.valore) || 0), 0)
  
  // Status for the step
  const getStepStatus = () => {
    if (hasErrors) return 'errori'
    if (isComplete) return 'completo'
    if (applicaSconti && totalDiscountsCount > 0) return 'in_corso'
    if (!applicaSconti) return 'completo'
    return 'incompleto'
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <FormSection
        title="Gestione Sconti e Promozioni"
        description="Configura sconti, promozioni e politiche di sconto per l'offerta energetica"
        icon="🏷️"
        status={<StatusBadge status={getStepStatus()} />}
      />

      {/* Enable/Disable Discounts */}
      <FormSection
        title="Configurazione Base Sconti"
        description="Attiva o disattiva il sistema di sconti per questa offerta"
        icon="⚙️"
      >
        <div className="space-y-4">
          {/* Apply Discounts Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="applica_sconti"
              checked={applicaSconti}
              onChange={(e) => step17.updateData({ applica_sconti: e.target.checked })}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="applica_sconti" className="text-sm font-medium text-foreground">
              Applica sistema di sconti a questa offerta
            </label>
          </div>

          {applicaSconti && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-muted">
              {/* Discount Policy */}
              <FormSelect
                label="Politica di Applicazione"
                value={currentData.politica_sconto || 'automatica'}
                onChange={(value) => step17.updateData({ politica_sconto: value as MockStep17Data['politica_sconto'] })}
                options={[
                  { value: 'automatica', label: 'Automatica - Applicazione immediata' },
                  { value: 'manuale', label: 'Manuale - Richiede approvazione' },
                  { value: 'condizionale', label: 'Condizionale - Verifica requisiti' }
                ]}
                description="Come vengono applicati gli sconti ai clienti"
                required={true}
              />

              {/* Maximum Discount */}
              <FormField
                label="Sconto Massimo Cumulativo (%)"
                type="number"
                value={currentData.sconto_massimo?.toString() || ''}
                onChange={(value) => step17.updateData({ sconto_massimo: parseFloat(value) || 0 })}
                placeholder="25"
                description="Limite massimo di sconto applicabile"
                min={0}
                max={100}
                step={0.1}
                required={true}
              />
            </div>
          )}
        </div>
      </FormSection>

      {/* Discounts Array Management */}
      {applicaSconti && (
        <Discounts
          items={sconti}
          onChange={(items) => step17.updateData({ sconti: items })}
          required={true}
          disabled={false}
        />
      )}

      {/* Discount Terms and Conditions */}
      {applicaSconti && totalDiscountsCount > 0 && (
        <FormSection
          title="Termini e Condizioni Sconti"
          description="Definisci note aggiuntive e termini legali per l'applicazione degli sconti"
          icon="📋"
          isOptional={true}
        >
          <div className="space-y-4">
            {/* General Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Note Operative sui Sconti
              </label>
              <textarea
                value={currentData.note_sconti || ''}
                onChange={(e) => step17.updateData({ note_sconti: e.target.value })}
                placeholder="Note operative, procedure di applicazione, informazioni per i clienti..."
                className="w-full min-h-[100px] p-3 border border-input rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={500}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Note operative per staff e clienti</span>
                <span>{(currentData.note_sconti || '').length}/500</span>
              </div>
            </div>

            {/* Legal Terms */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Termini e Condizioni Legali
              </label>
              <textarea
                value={currentData.termini_condizioni || ''}
                onChange={(e) => step17.updateData({ termini_condizioni: e.target.value })}
                placeholder="Clausole legali, limitazioni, esclusioni, diritti di modifica..."
                className="w-full min-h-[120px] p-3 border border-input rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={1000}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Termini legali e clausole contrattuali</span>
                <span>{(currentData.termini_condizioni || '').length}/1000</span>
              </div>
            </div>
          </div>
        </FormSection>
      )}

      {/* Discount Analysis Dashboard */}
      {applicaSconti && totalDiscountsCount > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">Analisi Sconti Configurati</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-foreground">Sconti Totali</div>
              <div className="text-2xl font-bold text-primary">{totalDiscountsCount}</div>
            </div>
            <div>
              <div className="font-medium text-green-600">Sconti Validi</div>
              <div className="text-2xl font-bold text-green-600">{validDiscountsCount}</div>
            </div>
            <div>
              <div className="font-medium text-blue-600">Sconto %</div>
              <div className="text-2xl font-bold text-blue-600">{totalPercentageDiscount.toFixed(1)}%</div>
            </div>
            <div>
              <div className="font-medium text-orange-600">Sconto €</div>
              <div className="text-2xl font-bold text-orange-600">€{totalFixedDiscount}</div>
            </div>
          </div>

          {/* Discount breakdown by type */}
          {validDiscountsCount > 0 && (
            <div className="mt-4 pt-4 border-t border-muted">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">SCONTI ATTIVI:</h5>
              <div className="space-y-1">
                {sconti.filter(discount => discount.isValid).map((discount) => {
                  const tipo = discount.data.tipo
                  const valore = discount.data.valore
                  const nome = discount.data.nome
                  const target = discount.data.target
                  
                  const targetLabel = target === 'nuovi_clienti' ? 'Nuovi Clienti' :
                                   target === 'clienti_esistenti' ? 'Clienti Esistenti' : 'Tutti i Clienti'
                  
                  return (
                    <div key={discount.id} className="text-xs text-foreground flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="font-medium">{nome}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className={tipo === 'percentuale' ? 'text-blue-600' : 'text-orange-600'}>
                        {tipo === 'percentuale' ? `${valore}%` : `€${valore}`}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs">{targetLabel}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Cumulative discount warning */}
          {totalPercentageDiscount > (currentData.sconto_massimo || 25) && (
            <div className="mt-4 pt-4 border-t border-destructive/20">
              <div className="text-xs text-destructive font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>
                  ATTENZIONE: Gli sconti percentuali cumulativi ({totalPercentageDiscount.toFixed(1)}%) 
                  superano il limite massimo configurato ({currentData.sconto_massimo}%)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation and Guidance */}
      {!applicaSconti && (
        <InfoAlert
          type="info"
          title="Sistema Sconti Disattivato"
          message="Il sistema di sconti è attualmente disattivato per questa offerta. Attivalo per configurare promozioni e riduzioni di prezzo per i clienti."
        />
      )}

      {applicaSconti && totalDiscountsCount === 0 && (
        <InfoAlert
          type="info"
          title="Sconti da Configurare"
          message={
            <div className="space-y-2">
              <p>Aggiungi almeno uno sconto per attivare il sistema promozionale.</p>
              <p className="text-sm">Tipi di sconto disponibili:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li><strong>Percentuale:</strong> Sconto calcolato come percentuale sui consumi</li>
                <li><strong>Fisso:</strong> Sconto fisso in euro applicato mensilmente</li>
                <li><strong>Target specifici:</strong> Per nuovi clienti, esistenti o tutti</li>
                <li><strong>Validità temporale:</strong> Con date di inizio e fine</li>
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
              {Object.entries(step17.errors || {}).map(([field, error]) => (
                <li key={field}><strong>{field}:</strong> {error}</li>
              ))}
            </ul>
          }
        />
      )}

      {isComplete && applicaSconti && validDiscountsCount > 0 && (
        <InfoAlert
          type="success"
          title="Sistema Sconti Attivo"
          message={`Hai configurato ${validDiscountsCount} ${validDiscountsCount === 1 ? 'sconto' : 'sconti'} per questa offerta. I clienti potranno beneficiare delle promozioni secondo le condizioni specificate.`}
        />
      )}

      {isComplete && !applicaSconti && (
        <InfoAlert
          type="success"
          title="Configurazione Completata"
          message="Hai scelto di non applicare sconti a questa offerta. La configurazione è completa."
        />
      )}

      {/* Recommendations */}
      {applicaSconti && validDiscountsCount === 1 && (
        <InfoAlert
          type="info"
          title="Suggerimento"
          message="Considera l'aggiunta di sconti con target diversi (nuovi vs esistenti) per massimizzare l'appeal dell'offerta verso segmenti specifici di clientela."
        />
      )}

      {totalPercentageDiscount > 0 && totalFixedDiscount > 0 && (
        <InfoAlert
          type="warning"
          title="Sconti Misti"
          message="Hai configurato sia sconti percentuali che fissi. Assicurati che i clienti comprendano chiaramente come vengono applicati entrambi i tipi di sconto."
        />
      )}

      {/* Action Buttons */}
      <FormActions
        onClear={() => step17.clearData()}
        onReset={() => step17.resetData()}
        onSave={() => step17.saveData()}
        onFillExample={() => step17.fillExampleData()}
        canClear={applicaSconti && totalDiscountsCount > 0}
        canReset={step17.hasUnsavedChanges}
        canSave={step17.isValid}
        showFillExample={process.env.NODE_ENV === 'development'}
      />
    </div>
  )
} 