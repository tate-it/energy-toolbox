'use client'

import React from 'react'
import { 
  FormSection, 
  FormField,
  FormActions, 
  StatusBadge, 
  InfoAlert,
  Contacts,
  type RepeatableObjectItem
} from '../form'

// Temporary mock data type until useStep4 is implemented
interface MockStep4Data {
  contatti?: RepeatableObjectItem[]
  note_contatti?: string
  orario_ufficio?: string
  numero_verde?: string
  email_generale?: string
  sito_web?: string
}

// Temporary mock hook until useStep4 is implemented
function useMockStep4() {
  const [data, setData] = React.useState<MockStep4Data>({
    contatti: []
  })
  
  const generateId = () => `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    data,
    errors: {},
    isValid: (data.contatti?.length || 0) > 0,
    isComplete: (data.contatti?.length || 0) > 0 && (data.contatti?.every(contact => contact.isValid) || false),
    hasUnsavedChanges: false,
    updateData: (newData: Partial<MockStep4Data>) => setData((prev: MockStep4Data) => ({ ...prev, ...newData })),
    clearData: () => setData({ contatti: [] }),
    resetData: () => setData({ contatti: [] }),
    saveData: () => console.log('Save Step4 data', data),
    fillExampleData: () => {
      const exampleContacts: RepeatableObjectItem[] = [
        {
          id: generateId(),
          data: {
            nome: 'Marco Rossi',
            ruolo: 'referente_commerciale',
            telefono: '+39 02 1234567',
            email: 'marco.rossi@energycompany.it',
            orari: 'Lun-Ven 9:00-18:00',
            note: 'Referente principale per nuove attivazioni'
          },
          errors: {},
          isValid: true,
          isDirty: true
        },
        {
          id: generateId(),
          data: {
            nome: 'Giulia Bianchi',
            ruolo: 'assistenza_clienti',
            telefono: '+39 02 7654321',
            email: 'assistenza@energycompany.it',
            orari: 'Lun-Dom 8:00-20:00',
            note: 'Supporto clienti e risoluzione problemi'
          },
          errors: {},
          isValid: true,
          isDirty: true
        },
        {
          id: generateId(),
          data: {
            nome: 'Alessandro Verde',
            ruolo: 'supporto_tecnico',
            telefono: '+39 02 5555555',
            email: 'tecnico@energycompany.it',
            orari: 'Lun-Ven 8:00-17:00',
            note: 'Supporto tecnico per problemi di fornitura'
          },
          errors: {},
          isValid: true,
          isDirty: true
        }
      ]
      setData({
        contatti: exampleContacts,
        note_contatti: 'Tutti i contatti sono disponibili in lingua italiana. Per emergenze fuori orario, utilizzare il numero verde.',
        orario_ufficio: 'Lun-Ven 9:00-18:00, Sab 9:00-13:00',
        numero_verde: '800-123456',
        email_generale: 'info@energycompany.it',
        sito_web: 'https://www.energycompany.it'
      })
    }
  }
}

/**
 * Step 4: Contact Information (Contatti)
 * 
 * Questo step gestisce tutte le informazioni di contatto per l'offerta energetica.
 * Utilizza il componente Contacts specializzato per array di oggetti contatto complessi.
 * 
 * Caratteristiche:
 * - Array di contatti con ruoli, telefoni, email, orari
 * - Validazione per ogni contatto (nome, ruolo, telefono obbligatori)
 * - Informazioni di contatto generali
 * - Gestione orari e disponibilità
 * - Integrazione con il sistema di validazione complesso
 */
export default function Step4() {
  // TODO: Replace with actual useStep4 hook when implemented
  const step4 = useMockStep4()
  
  // Extract current values
  const currentData = step4.data || {}
  const contatti = currentData.contatti || []
  
  // Form validation state
  const hasErrors = Object.keys(step4.errors || {}).length > 0
  const isComplete = step4.isValid && step4.isComplete
  const validContactsCount = contatti.filter(contact => contact.isValid).length
  const totalContactsCount = contatti.length
  const invalidContactsCount = contatti.filter(contact => Object.keys(contact.errors).length > 0).length
  
  // Status for the step
  const getStepStatus = () => {
    if (hasErrors) return 'errori'
    if (isComplete) return 'completo'
    if (totalContactsCount > 0) return 'in_corso'
    return 'incompleto'
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <FormSection
        title="Informazioni di Contatto"
        description="Gestisci i contatti di riferimento e le informazioni generali per l'assistenza clienti"
        icon="📞"
        status={<StatusBadge status={getStepStatus()} />}
      />

      {/* Contacts Array Management */}
      <Contacts
        items={contatti}
        onChange={(items) => step4.updateData({ contatti: items })}
        required={true}
        disabled={false}
      />

      {/* General Contact Information */}
      <FormSection
        title="Informazioni Generali di Contatto"
        description="Informazioni di contatto comuni e orari di disponibilità"
        icon="🏢"
        isOptional={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business Hours */}
          <FormField
            label="Orari Ufficio"
            type="text"
            value={currentData.orario_ufficio || ''}
            onChange={(value) => step4.updateData({ orario_ufficio: value })}
            placeholder="Lun-Ven 9:00-18:00"
            description="Orari generali di apertura uffici"
            maxLength={100}
          />

          {/* Toll-free Number */}
          <FormField
            label="Numero Verde"
            type="tel"
            value={currentData.numero_verde || ''}
            onChange={(value) => step4.updateData({ numero_verde: value })}
            placeholder="800-123456"
            description="Numero verde per assistenza clienti"
            maxLength={20}
          />

          {/* General Email */}
          <FormField
            label="Email Generale"
            type="email"
            value={currentData.email_generale || ''}
            onChange={(value) => step4.updateData({ email_generale: value })}
            placeholder="info@azienda.it"
            description="Indirizzo email principale aziendale"
            maxLength={100}
          />

          {/* Website */}
          <FormField
            label="Sito Web"
            type="url"
            value={currentData.sito_web || ''}
            onChange={(value) => step4.updateData({ sito_web: value })}
            placeholder="https://www.azienda.it"
            description="Sito web aziendale ufficiale"
            maxLength={200}
          />
        </div>
      </FormSection>

      {/* Additional Contact Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Note sui Contatti
        </label>
        <textarea
          value={currentData.note_contatti || ''}
          onChange={(e) => step4.updateData({ note_contatti: e.target.value })}
          placeholder="Informazioni aggiuntive sui contatti, procedure di escalation, lingue supportate, servizi speciali..."
          className="w-full min-h-[120px] p-3 border border-input rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={800}
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Note opzionali sui contatti e procedure</span>
          <span>{(currentData.note_contatti || '').length}/800</span>
        </div>
      </div>

      {/* Contact Statistics Dashboard */}
      {totalContactsCount > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">Riepilogo Contatti</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-foreground">Contatti Totali</div>
              <div className="text-2xl font-bold text-primary">{totalContactsCount}</div>
            </div>
            <div>
              <div className="font-medium text-green-600">Contatti Validi</div>
              <div className="text-2xl font-bold text-green-600">{validContactsCount}</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Copertura</div>
              <div className="text-2xl font-bold text-blue-600">
                {totalContactsCount > 0 ? Math.round((validContactsCount / totalContactsCount) * 100) : 0}%
              </div>
            </div>
            <div>
              <div className="font-medium text-foreground">Stato</div>
              <div className="text-sm font-medium">
                <StatusBadge status={getStepStatus()} />
              </div>
            </div>
          </div>
          
          {/* Contact roles breakdown */}
          {validContactsCount > 0 && (
            <div className="mt-4 pt-4 border-t border-muted">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">RUOLI CONFIGURATI:</h5>
              <div className="space-y-1">
                {contatti.filter(contact => contact.isValid).map((contact) => {
                  const ruolo = contact.data.ruolo
                  const ruoloLabel = ruolo === 'referente_commerciale' ? 'Referente Commerciale' :
                                   ruolo === 'assistenza_clienti' ? 'Assistenza Clienti' :
                                   ruolo === 'supporto_tecnico' ? 'Supporto Tecnico' :
                                   ruolo === 'responsabile_vendite' ? 'Responsabile Vendite' :
                                   ruolo === 'customer_care' ? 'Customer Care' :
                                   ruolo === 'amministrazione' ? 'Amministrazione' : 'Altro'
                  
                  return (
                    <div key={contact.id} className="text-xs text-foreground flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="font-medium">{contact.data.nome}</span>
                      <span className="text-muted-foreground">-</span>
                      <span>{ruoloLabel}</span>
                      {contact.data.telefono && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-blue-600">{contact.data.telefono}</span>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation and Guidance */}
      {totalContactsCount === 0 && (
        <InfoAlert
          type="info"
          title="Contatti di Riferimento Richiesti"
          message={
            <div className="space-y-2">
              <p>Aggiungi almeno un contatto di riferimento per completare questo step.</p>
              <p className="text-sm">Tipi di contatto consigliati:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li><strong>Referente Commerciale:</strong> Per nuove attivazioni e informazioni offerte</li>
                <li><strong>Assistenza Clienti:</strong> Per supporto generale e risoluzione problemi</li>
                <li><strong>Supporto Tecnico:</strong> Per problemi tecnici e guasti</li>
                <li><strong>Customer Care:</strong> Per gestione account e fatturazione</li>
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
              {Object.entries(step4.errors || {}).map(([field, error]) => (
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
          message={`Hai configurato ${validContactsCount} ${validContactsCount === 1 ? 'contatto' : 'contatti'} di riferimento. I clienti potranno utilizzare queste informazioni per ottenere assistenza.`}
        />
      )}

      {/* Best Practices and Recommendations */}
      {totalContactsCount > 0 && validContactsCount < 2 && (
        <InfoAlert
          type="warning"
          title="Suggerimento"
          message="Considera l'aggiunta di più contatti con ruoli diversi per offrire un migliore supporto ai clienti. Un contatto commerciale e uno per l'assistenza sono generalmente consigliati."
        />
      )}

      {totalContactsCount >= 3 && invalidContactsCount === 0 && (
        <InfoAlert
          type="success"
          title="Configurazione Ottimale"
          message="Hai configurato un set completo di contatti con diversi ruoli. Questo garantisce un eccellente supporto ai clienti per tutte le loro esigenze."
        />
      )}

      {/* Quality Check */}
      {contatti.some(contact => contact.data.email && contact.data.telefono) && (
        <InfoAlert
          type="info"
          title="Informazioni Complete"
          message="I tuoi contatti includono sia telefono che email, offrendo flessibilità ai clienti nella scelta del canale di comunicazione preferito."
        />
      )}

      {/* Action Buttons */}
      <FormActions
        onClear={() => step4.clearData()}
        onReset={() => step4.resetData()}
        onSave={() => step4.saveData()}
        onFillExample={() => step4.fillExampleData()}
        canClear={totalContactsCount > 0}
        canReset={step4.hasUnsavedChanges}
        canSave={step4.isValid}
        showFillExample={process.env.NODE_ENV === 'development'}
      />
    </div>
  )
} 