'use client'

import React from 'react'
import { 
  FormSection, 
  FormSelect,
  FormActions, 
  StatusBadge, 
  InfoAlert,
  AdditionalServices,
  type RepeatableObjectItem
} from '../form'

// Temporary mock data type until useStep18 is implemented
interface MockStep18Data {
  servizi_aggiuntivi?: RepeatableObjectItem[]
  offre_servizi?: boolean
  modalita_fatturazione?: 'separata' | 'integrata' | 'mista'
  politica_prezzo?: 'fisso' | 'variabile' | 'promozionale'
  note_servizi?: string
  condizioni_servizio?: string
}

// Temporary mock hook until useStep18 is implemented
function useMockStep18() {
  const [data, setData] = React.useState<MockStep18Data>({
    servizi_aggiuntivi: [],
    offre_servizi: false,
    modalita_fatturazione: 'separata',
    politica_prezzo: 'fisso'
  })
  
  const generateId = () => `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    data,
    errors: {},
    isValid: data.offre_servizi ? (data.servizi_aggiuntivi?.length || 0) > 0 : true,
    isComplete: data.offre_servizi ? 
      (data.servizi_aggiuntivi?.length || 0) > 0 && (data.servizi_aggiuntivi?.every(service => service.isValid) || false) : true,
    hasUnsavedChanges: false,
    updateData: (newData: Partial<MockStep18Data>) => setData((prev: MockStep18Data) => ({ ...prev, ...newData })),
    clearData: () => setData({ 
      servizi_aggiuntivi: [], 
      offre_servizi: false,
      modalita_fatturazione: 'separata',
      politica_prezzo: 'fisso'
    }),
    resetData: () => setData({ 
      servizi_aggiuntivi: [], 
      offre_servizi: false,
      modalita_fatturazione: 'separata',
      politica_prezzo: 'fisso'
    }),
    saveData: () => console.log('Save Step18 data', data),
    fillExampleData: () => {
      const exampleServices: RepeatableObjectItem[] = [
        {
          id: generateId(),
          data: {
            nome: 'Assistenza Tecnica Premium',
            categoria: 'assistenza',
            descrizione: 'Supporto tecnico prioritario 24/7 con intervento garantito entro 4 ore',
            prezzo: '29.90',
            unita: 'mensile',
            disponibilita: 'sempre',
            condizioni: 'Servizio attivo solo con contratto energia in corso',
            note: 'Include diagnostica remota e sostituzione componenti'
          },
          errors: {},
          isValid: true,
          isDirty: true
        },
        {
          id: generateId(),
          data: {
            nome: 'Monitoraggio Consumi Real-Time',
            categoria: 'monitoraggio',
            descrizione: 'Sistema di monitoraggio avanzato con notifiche su anomalie e picchi di consumo',
            prezzo: '15.00',
            unita: 'mensile',
            disponibilita: 'sempre',
            condizioni: 'Richiede installazione contatore smart compatibile',
            note: 'App mobile inclusa con dashboard personalizzabile'
          },
          errors: {},
          isValid: true,
          isDirty: true
        },
        {
          id: generateId(),
          data: {
            nome: 'Assicurazione Elettrodomestici',
            categoria: 'assicurazione',
            descrizione: 'Copertura completa per danni da sovratensione e guasti elettrici su elettrodomestici',
            prezzo: '8.50',
            unita: 'mensile',
            disponibilita: 'condizionale',
            condizioni: 'Validità certificati conformità elettrodomestici, max 10 anni di età',
            note: 'Massimale €5000 per sinistro, franchigia €50'
          },
          errors: {},
          isValid: true,
          isDirty: true
        },
        {
          id: generateId(),
          data: {
            nome: 'Consulenza Efficienza Energetica',
            categoria: 'consulenza',
            descrizione: 'Audit energetico annuale con raccomandazioni personalizzate per il risparmio',
            prezzo: '199.00',
            unita: 'una_tantum',
            disponibilita: 'sempre',
            condizioni: 'Disponibile per utenze con consumo annuo superiore a 2500 kWh',
            note: 'Include rapporto dettagliato e piano di miglioramento personalizzato'
          },
          errors: {},
          isValid: true,
          isDirty: true
        }
      ]
      setData({
        servizi_aggiuntivi: exampleServices,
        offre_servizi: true,
        modalita_fatturazione: 'integrata',
        politica_prezzo: 'promozionale',
        note_servizi: 'Tutti i servizi sono forniti in partnership con aziende certificate. Possibilità di personalizzazione su richiesta.',
        condizioni_servizio: 'I servizi aggiuntivi sono opzionali e possono essere attivati/disattivati in qualsiasi momento. Fatturazione separata disponibile su richiesta.'
      })
    }
  }
}

/**
 * Step 18: Additional Services Management (Servizi Aggiuntivi)
 * 
 * Questo step gestisce la configurazione dei servizi aggiuntivi offerti con l&apos;energia.
 * Utilizza il componente AdditionalServices specializzato per array di oggetti servizio complessi.
 * 
 * Caratteristiche:
 * - Array di servizi con categorie, prezzi, condizioni, disponibilità
 * - Modalità di fatturazione flessibili (separata/integrata)
 * - Gestione disponibilità e condizioni di attivazione
 * - Calcolo automatico ricavi aggiuntivi
 * - Integrazione con termini di servizio
 */
export default function Step18() {
  // TODO: Replace with actual useStep18 hook when implemented
  const step18 = useMockStep18()
  
  // Extract current values
  const currentData = step18.data || {}
  const servizi = currentData.servizi_aggiuntivi || []
  const offreServizi = currentData.offre_servizi || false
  
  // Form validation state
  const hasErrors = Object.keys(step18.errors || {}).length > 0
  const isComplete = step18.isValid && step18.isComplete
  const validServicesCount = servizi.filter(service => service.isValid).length
  const totalServicesCount = servizi.length
  
  // Calculate potential revenue
  const monthlyRevenue = servizi
    .filter(service => service.isValid && service.data.unita === 'mensile')
    .reduce((sum, service) => sum + (parseFloat(service.data.prezzo) || 0), 0)
  
  const oneTimeRevenue = servizi
    .filter(service => service.isValid && service.data.unita === 'una_tantum')
    .reduce((sum, service) => sum + (parseFloat(service.data.prezzo) || 0), 0)
  
  const annualRevenue = servizi
    .filter(service => service.isValid && service.data.unita === 'annuale')
    .reduce((sum, service) => sum + (parseFloat(service.data.prezzo) || 0), 0)
  
  // Service categories breakdown
  const servicesByCategory = servizi.filter(service => service.isValid).reduce((acc, service) => {
    const category = service.data.categoria || 'altro'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Status for the step
  const getStepStatus = () => {
    if (hasErrors) return 'errori'
    if (isComplete) return 'completo'
    if (offreServizi && totalServicesCount > 0) return 'in_corso'
    if (!offreServizi) return 'completo'
    return 'incompleto'
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <FormSection
        title="Servizi Aggiuntivi"
        description="Configura i servizi extra offerti insieme alla fornitura energetica"
        icon="🛠️"
        status={<StatusBadge status={getStepStatus()} />}
      />

      {/* Enable/Disable Additional Services */}
      <FormSection
        title="Configurazione Base Servizi"
        description="Attiva o disattiva l&apos;offerta di servizi aggiuntivi"
        icon="⚙️"
      >
        <div className="space-y-4">
          {/* Offer Services Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="offre_servizi"
              checked={offreServizi}
              onChange={(e) => step18.updateData({ offre_servizi: e.target.checked })}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="offre_servizi" className="text-sm font-medium text-foreground">
              Offri servizi aggiuntivi con questa offerta energetica
            </label>
          </div>

          {offreServizi && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-muted">
              {/* Billing Method */}
              <FormSelect
                label="Modalità di Fatturazione"
                value={currentData.modalita_fatturazione || 'separata'}
                onChange={(value) => step18.updateData({ modalita_fatturazione: value as MockStep18Data['modalita_fatturazione'] })}
                options={[
                  { value: 'separata', label: 'Separata - Fatture distinte per servizi' },
                  { value: 'integrata', label: 'Integrata - Tutto in una fattura' },
                  { value: 'mista', label: 'Mista - Cliente può scegliere' }
                ]}
                description="Come vengono fatturati i servizi aggiuntivi"
                required={true}
              />

              {/* Pricing Policy */}
              <FormSelect
                label="Politica Prezzo"
                value={currentData.politica_prezzo || 'fisso'}
                onChange={(value) => step18.updateData({ politica_prezzo: value as MockStep18Data['politica_prezzo'] })}
                options={[
                  { value: 'fisso', label: 'Fisso - Prezzi invariabili' },
                  { value: 'variabile', label: 'Variabile - Prezzi adattabili' },
                  { value: 'promozionale', label: 'Promozionale - Sconti temporanei' }
                ]}
                description="Strategia di prezzo per i servizi"
                required={true}
              />
            </div>
          )}
        </div>
      </FormSection>

      {/* Additional Services Array Management */}
      {offreServizi && (
        <AdditionalServices
          items={servizi}
          onChange={(items) => step18.updateData({ servizi_aggiuntivi: items })}
          required={true}
          disabled={false}
        />
      )}

      {/* Service Terms and Conditions */}
      {offreServizi && totalServicesCount > 0 && (
        <FormSection
          title="Condizioni di Servizio"
          description="Definisci note operative e condizioni generali per i servizi aggiuntivi"
          icon="📋"
          isOptional={true}
        >
          <div className="space-y-4">
            {/* Service Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Note Operative sui Servizi
              </label>
              <textarea
                value={currentData.note_servizi || ''}
                onChange={(e) => step18.updateData({ note_servizi: e.target.value })}
                placeholder="Informazioni operative, partnership, modalità di erogazione, supporto clienti..."
                className="w-full min-h-[100px] p-3 border border-input rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={600}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Note operative per staff e clienti</span>
                <span>{(currentData.note_servizi || '').length}/600</span>
              </div>
            </div>

            {/* Service Conditions */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Condizioni Generali di Servizio
              </label>
              <textarea
                value={currentData.condizioni_servizio || ''}
                onChange={(e) => step18.updateData({ condizioni_servizio: e.target.value })}
                placeholder="Termini di attivazione, modifiche, cancellazione, responsabilità, garanzie..."
                className="w-full min-h-[120px] p-3 border border-input rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={1000}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Condizioni contrattuali e legali</span>
                <span>{(currentData.condizioni_servizio || '').length}/1000</span>
              </div>
            </div>
          </div>
        </FormSection>
      )}

      {/* Service Portfolio Dashboard */}
      {offreServizi && totalServicesCount > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">Portfolio Servizi Aggiuntivi</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-foreground">Servizi Totali</div>
              <div className="text-2xl font-bold text-primary">{totalServicesCount}</div>
            </div>
            <div>
              <div className="font-medium text-green-600">Servizi Attivi</div>
              <div className="text-2xl font-bold text-green-600">{validServicesCount}</div>
            </div>
            <div>
              <div className="font-medium text-blue-600">Ricavo Mensile</div>
              <div className="text-2xl font-bold text-blue-600">€{monthlyRevenue.toFixed(2)}</div>
            </div>
            <div>
              <div className="font-medium text-orange-600">Una Tantum</div>
              <div className="text-2xl font-bold text-orange-600">€{oneTimeRevenue.toFixed(2)}</div>
            </div>
          </div>

          {/* Revenue projection */}
          {(monthlyRevenue > 0 || oneTimeRevenue > 0 || annualRevenue > 0) && (
            <div className="mt-4 pt-4 border-t border-muted">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">PROIEZIONI RICAVI:</h5>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Annuale (solo mensili):</span>
                  <div className="font-bold text-green-600">€{(monthlyRevenue * 12).toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Una tantum:</span>
                  <div className="font-bold text-orange-600">€{oneTimeRevenue.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Totale primo anno:</span>
                  <div className="font-bold text-primary">€{(monthlyRevenue * 12 + oneTimeRevenue + annualRevenue).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Service categories breakdown */}
          {validServicesCount > 0 && Object.keys(servicesByCategory).length > 0 && (
            <div className="mt-4 pt-4 border-t border-muted">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">SERVIZI PER CATEGORIA:</h5>
              <div className="space-y-1">
                {Object.entries(servicesByCategory).map(([category, count]) => {
                  const categoryLabel = category === 'assistenza' ? 'Assistenza' :
                                       category === 'monitoraggio' ? 'Monitoraggio' :
                                       category === 'assicurazione' ? 'Assicurazione' :
                                       category === 'consulenza' ? 'Consulenza' :
                                       category === 'manutenzione' ? 'Manutenzione' :
                                       category === 'installazione' ? 'Installazione' : 'Altro'
                  
                  return (
                    <div key={category} className="text-xs text-foreground flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="font-medium">{categoryLabel}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-blue-600">{count} {count === 1 ? 'servizio' : 'servizi'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Active services summary */}
          {validServicesCount > 0 && (
            <div className="mt-4 pt-4 border-t border-muted">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">SERVIZI CONFIGURATI:</h5>
              <div className="space-y-1">
                {servizi.filter(service => service.isValid).map((service) => {
                  const prezzo = parseFloat(service.data.prezzo) || 0
                  const unita = service.data.unita
                  const unitaLabel = unita === 'mensile' ? '/mese' :
                                   unita === 'annuale' ? '/anno' :
                                   unita === 'una_tantum' ? 'una tantum' : ''
                  
                  return (
                    <div key={service.id} className="text-xs text-foreground flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="font-medium">{service.data.nome}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-green-600 font-bold">€{prezzo.toFixed(2)} {unitaLabel}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation and Guidance */}
      {!offreServizi && (
        <InfoAlert
          type="info"
          title="Servizi Aggiuntivi Disattivati"
          message="I servizi aggiuntivi sono attualmente disattivati per questa offerta. Attivali per offrire valore aggiunto ai clienti e aumentare i ricavi."
        />
      )}

      {offreServizi && totalServicesCount === 0 && (
        <InfoAlert
          type="info"
          title="Servizi da Configurare"
          message={
            <div className="space-y-2">
              <p>Aggiungi almeno un servizio aggiuntivo per arricchire l&apos;offerta.</p>
              <p className="text-sm">Categorie di servizio disponibili:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li><strong>Assistenza:</strong> Supporto tecnico, help desk, interventi</li>
                <li><strong>Monitoraggio:</strong> Controllo consumi, diagnostica, reporting</li>
                <li><strong>Assicurazione:</strong> Coperture, garanzie, protezioni</li>
                <li><strong>Consulenza:</strong> Audit, ottimizzazione, formazione</li>
                <li><strong>Manutenzione:</strong> Controlli periodici, pulizie, verifiche</li>
                <li><strong>Installazione:</strong> Dispositivi, impianti, configurazioni</li>
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
              {Object.entries(step18.errors || {}).map(([field, error]) => (
                <li key={field}><strong>{field}:</strong> {error}</li>
              ))}
            </ul>
          }
        />
      )}

      {isComplete && offreServizi && validServicesCount > 0 && (
        <InfoAlert
          type="success"
          title="Portfolio Servizi Attivo"
          message={`Hai configurato ${validServicesCount} ${validServicesCount === 1 ? 'servizio' : 'servizi'} aggiuntivi. Il ricavo mensile potenziale è di €${monthlyRevenue.toFixed(2)}.`}
        />
      )}

      {isComplete && !offreServizi && (
        <InfoAlert
          type="success"
          title="Configurazione Completata"
          message="Hai scelto di offrire solo la fornitura energetica senza servizi aggiuntivi. La configurazione è completa."
        />
      )}

      {/* Business Recommendations */}
      {offreServizi && validServicesCount === 1 && (
        <InfoAlert
          type="info"
          title="Opportunità di Crescita"
          message="Con un solo servizio attivo, considera l&apos;aggiunta di servizi complementari per creare pacchetti più attraenti e aumentare il valore per il cliente."
        />
      )}

      {validServicesCount >= 3 && Object.keys(servicesByCategory).length >= 2 && (
        <InfoAlert
          type="success"
          title="Portfolio Diversificato"
          message="Hai creato un portfolio ben diversificato con servizi in multiple categorie. Questo aumenta il valore percepito dell&apos;offerta e le opportunità di cross-selling."
        />
      )}

      {monthlyRevenue > 50 && (
        <InfoAlert
          type="info"
          title="Ricavi Significativi"
          message={`Con €${monthlyRevenue.toFixed(2)} di ricavi mensili potenziali, i servizi aggiuntivi rappresentano una fonte importante di entrate ricorrenti.`}
        />
      )}

      {/* Quality Checks */}
      {servizi.some(service => service.data.disponibilita === 'condizionale') && (
        <InfoAlert
          type="warning"
          title="Servizi Condizionali"
          message="Alcuni servizi hanno disponibilità condizionale. Assicurati che le condizioni siano chiaramente comunicate ai clienti per evitare malintesi."
        />
      )}

      {/* Action Buttons */}
      <FormActions
        onClear={() => step18.clearData()}
        onReset={() => step18.resetData()}
        onSave={() => step18.saveData()}
        onFillExample={() => step18.fillExampleData()}
        canClear={offreServizi && totalServicesCount > 0}
        canReset={step18.hasUnsavedChanges}
        canSave={step18.isValid}
        showFillExample={process.env.NODE_ENV === 'development'}
      />
    </div>
  )
} 