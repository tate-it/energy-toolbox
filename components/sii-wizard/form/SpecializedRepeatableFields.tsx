'use client'

import React from 'react'
import { RepeatableField, type RepeatableFieldItem } from './RepeatableField'
import { RepeatableObjectField, type RepeatableObjectItem, type ObjectFieldDefinition } from './RepeatableObjectField'
import { Mail, Phone, Percent, Cog } from 'lucide-react'

// =====================================================
// ACTIVATION METHODS COMPONENT
// =====================================================

export interface ActivationMethodsProps {
  items: RepeatableFieldItem[]
  onChange: (items: RepeatableFieldItem[]) => void
  disabled?: boolean
  required?: boolean
  className?: string
}

/**
 * Componente specializzato per metodi di attivazione
 * Step 3: Array di stringhe per metodi di attivazione offerta
 */
export function ActivationMethods({
  items,
  onChange,
  disabled = false,
  required = false,
  className = ''
}: ActivationMethodsProps) {
  
  const validateActivationMethod = (value: string): string[] | undefined => {
    const errors: string[] = []
    
    if (value.trim().length < 3) {
      errors.push('Metodo deve contenere almeno 3 caratteri')
    }
    
    if (value.length > 100) {
      errors.push('Metodo troppo lungo (massimo 100 caratteri)')
    }
    
    // Common validation patterns
    const commonMethods = [
      'online', 'telefono', 'sportello', 'posta', 'email', 
      'web', 'call center', 'agente', 'dealer'
    ]
    
    const lowerValue = value.toLowerCase()
    if (!commonMethods.some(method => lowerValue.includes(method)) && value.trim().length > 0) {
      // Just a suggestion, not an error
      console.log(`Suggerimento: "${value}" potrebbe essere specifico. Metodi comuni: ${commonMethods.join(', ')}`)
    }
    
    return errors.length > 0 ? errors : undefined
  }
  
  return (
    <RepeatableField
      label="Metodi di Attivazione"
      description="Modalità attraverso cui i clienti possono attivare l'offerta (es. online, telefono, sportello)"
      placeholder="Es: Attivazione online tramite sito web"
      items={items}
      onChange={onChange}
      onValidate={validateActivationMethod}
      required={required}
      disabled={disabled}
      minItems={required ? 1 : 0}
      maxItems={10}
      allowDuplicates={false}
      maxItemLength={100}
      inputType="text"
      addButtonText="Aggiungi Metodo di Attivazione"
      emptyStateMessage="Nessun metodo di attivazione specificato. Aggiungi almeno un metodo per permettere ai clienti di attivare l'offerta."
      className={className}
    />
  )
}

// =====================================================
// CONTACTS COMPONENT
// =====================================================

export interface ContactsProps {
  items: RepeatableObjectItem[]
  onChange: (items: RepeatableObjectItem[]) => void
  disabled?: boolean
  required?: boolean
  className?: string
}

/**
 * Componente specializzato per contatti
 * Step 4: Array di oggetti contatto con nome, ruolo, telefono, email
 */
export function Contacts({
  items,
  onChange,
  disabled = false,
  required = false,
  className = ''
}: ContactsProps) {
  
  const contactFields: ObjectFieldDefinition[] = [
    {
      key: 'nome',
      label: 'Nome e Cognome',
      type: 'text',
      required: true,
      placeholder: 'Mario Rossi',
      description: 'Nome completo del contatto',
      maxLength: 100,
      validate: (value) => {
        const errors: string[] = []
        if (value.trim().length < 2) {
          errors.push('Nome troppo breve')
        }
        if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value) && value.trim()) {
          errors.push('Nome contiene caratteri non validi')
        }
        return errors.length > 0 ? errors : undefined
      }
    },
    {
      key: 'ruolo',
      label: 'Ruolo/Funzione',
      type: 'select',
      required: true,
      placeholder: 'Seleziona ruolo',
      description: 'Funzione o ruolo del contatto',
      options: [
        { value: 'referente_commerciale', label: 'Referente Commerciale' },
        { value: 'assistenza_clienti', label: 'Assistenza Clienti' },
        { value: 'supporto_tecnico', label: 'Supporto Tecnico' },
        { value: 'responsabile_vendite', label: 'Responsabile Vendite' },
        { value: 'customer_care', label: 'Customer Care' },
        { value: 'amministrazione', label: 'Amministrazione' },
        { value: 'altro', label: 'Altro' }
      ]
    },
    {
      key: 'telefono',
      label: 'Numero di Telefono',
      type: 'tel',
      required: true,
      placeholder: '+39 02 1234567',
      description: 'Numero di telefono diretto del contatto',
      maxLength: 20,
      pattern: '^[+]?[0-9\\s()-]+$',
      validate: (value) => {
        const errors: string[] = []
        if (value && !/^[+]?[0-9\s()-]{7,20}$/.test(value)) {
          errors.push('Formato telefono non valido')
        }
        return errors.length > 0 ? errors : undefined
      }
    },
    {
      key: 'email',
      label: 'Indirizzo Email',
      type: 'email',
      required: false,
      placeholder: 'mario.rossi@azienda.it',
      description: 'Indirizzo email del contatto (opzionale)',
      maxLength: 100
    },
    {
      key: 'orari',
      label: 'Orari di Disponibilità',
      type: 'text',
      required: false,
      placeholder: 'Lun-Ven 9:00-18:00',
      description: 'Orari in cui è possibile contattare (opzionale)',
      maxLength: 50,
      dependsOn: 'telefono'
    },
    {
      key: 'note',
      label: 'Note Aggiuntive',
      type: 'textarea',
      required: false,
      placeholder: 'Informazioni aggiuntive sul contatto...',
      description: 'Note e informazioni aggiuntive (opzionale)',
      maxLength: 200
    }
  ]
  
  const getContactTitle = (item: RepeatableObjectItem): string => {
    const nome = item.data.nome?.trim()
    const ruolo = item.data.ruolo?.trim()
    
    if (nome && ruolo) {
      const ruoloLabel = contactFields.find(f => f.key === 'ruolo')?.options?.find(o => o.value === ruolo)?.label || ruolo
      return `${nome} - ${ruoloLabel}`
    }
    if (nome) return nome
    if (ruolo) {
      const ruoloLabel = contactFields.find(f => f.key === 'ruolo')?.options?.find(o => o.value === ruolo)?.label || ruolo
      return ruoloLabel
    }
    return 'Nuovo Contatto'
  }
  
  const getContactSubtitle = (item: RepeatableObjectItem): string => {
    const parts: string[] = []
    if (item.data.telefono) parts.push(`📞 ${item.data.telefono}`)
    if (item.data.email) parts.push(`✉️ ${item.data.email}`)
    return parts.join(' • ') || 'Informazioni di contatto mancanti'
  }
  
  const getContactSummary = (item: RepeatableObjectItem) => {
    return (
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <Mail className="h-3 w-3 inline mr-1" />
          {item.data.email || 'Nessuna email'}
        </div>
        <div>
          <Phone className="h-3 w-3 inline mr-1" />
          {item.data.telefono || 'Nessun telefono'}
        </div>
      </div>
    )
  }
  
  return (
    <RepeatableObjectField
      label="Contatti di Riferimento"
      description="Persone di riferimento per l'offerta con informazioni di contatto complete"
      fields={contactFields}
      items={items}
      onChange={onChange}
      required={required}
      disabled={disabled}
      minItems={required ? 1 : 0}
      maxItems={5}
      allowDuplicates={false}
      getItemTitle={getContactTitle}
      getItemSubtitle={getContactSubtitle}
      getItemSummary={getContactSummary}
      addButtonText="Aggiungi Contatto"
      emptyStateMessage="Nessun contatto di riferimento specificato. Aggiungi almeno un contatto per facilitare la comunicazione con i clienti."
      collapsible={true}
      defaultCollapsed={true}
      className={className}
    />
  )
}

// =====================================================
// DISCOUNTS COMPONENT
// =====================================================

export interface DiscountsProps {
  items: RepeatableObjectItem[]
  onChange: (items: RepeatableObjectItem[]) => void
  disabled?: boolean
  required?: boolean
  className?: string
}

/**
 * Componente specializzato per sconti e promozioni
 * Step 17: Array di oggetti sconto con tipologia, valore, condizioni
 */
export function Discounts({
  items,
  onChange,
  disabled = false,
  required = false,
  className = ''
}: DiscountsProps) {
  
  const discountFields: ObjectFieldDefinition[] = [
    {
      key: 'tipo',
      label: 'Tipo di Sconto',
      type: 'select',
      required: true,
      placeholder: 'Seleziona tipo sconto',
      description: 'Tipologia di sconto o promozione offerta',
      options: [
        { value: 'percentuale', label: 'Sconto Percentuale' },
        { value: 'fisso', label: 'Sconto Fisso (€)' },
        { value: 'primo_anno', label: 'Sconto Primo Anno' },
        { value: 'cashback', label: 'Cashback' },
        { value: 'bonus_benvenuto', label: 'Bonus di Benvenuto' },
        { value: 'sconto_fedeltà', label: 'Sconto Fedeltà' },
        { value: 'promozione_stagionale', label: 'Promozione Stagionale' },
        { value: 'altro', label: 'Altro' }
      ]
    },
    {
      key: 'valore',
      label: 'Valore Sconto',
      type: 'number',
      required: true,
      placeholder: '10.00',
      description: 'Valore dello sconto (€ o % a seconda del tipo)',
      min: '0',
      max: '10000',
      step: '0.01',
      validate: (value, item) => {
        const errors: string[] = []
        const numValue = parseFloat(value)
        
        if (isNaN(numValue) || numValue < 0) {
          errors.push('Valore deve essere un numero positivo')
        }
        
        if (item.tipo === 'percentuale' && numValue > 100) {
          errors.push('Percentuale non può superare 100%')
        }
        
        if (item.tipo === 'fisso' && numValue > 1000) {
          errors.push('Sconto fisso molto elevato (>1000€)')
        }
        
        return errors.length > 0 ? errors : undefined
      }
    },
    {
      key: 'unita',
      label: 'Unità di Misura',
      type: 'select',
      required: true,
      placeholder: 'Seleziona unità',
      description: 'Unità di misura per il valore dello sconto',
      options: [
        { value: 'euro', label: '€ (Euro)' },
        { value: 'percentuale', label: '% (Percentuale)' },
        { value: 'euro_mese', label: '€/mese' },
        { value: 'euro_anno', label: '€/anno' },
        { value: 'euro_kwh', label: '€/kWh' }
      ],
      showWhen: (item) => item.tipo && item.tipo !== 'percentuale'
    },
    {
      key: 'durata',
      label: 'Durata (Mesi)',
      type: 'number',
      required: false,
      placeholder: '12',
      description: 'Durata dello sconto in mesi (vuoto = permanente)',
      min: '1',
      max: '60',
      step: '1'
    },
    {
      key: 'condizioni',
      label: 'Condizioni di Applicazione',
      type: 'textarea',
      required: true,
      placeholder: 'Condizioni per ottenere lo sconto...',
      description: 'Condizioni e requisiti per l\'applicazione dello sconto',
      maxLength: 300
    },
    {
      key: 'codice_promo',
      label: 'Codice Promozionale',
      type: 'text',
      required: false,
      placeholder: 'SCONTO2024',
      description: 'Codice promozionale da utilizzare (opzionale)',
      maxLength: 20,
      pattern: '^[A-Z0-9]+$',
      validate: (value) => {
        const errors: string[] = []
        if (value && !/^[A-Z0-9]+$/.test(value)) {
          errors.push('Codice deve contenere solo lettere maiuscole e numeri')
        }
        return errors.length > 0 ? errors : undefined
      }
    },
    {
      key: 'scadenza',
      label: 'Data di Scadenza',
      type: 'text',
      required: false,
      placeholder: '31/12/2024',
      description: 'Data di scadenza della promozione (gg/mm/aaaa)',
      pattern: '^[0-9]{2}/[0-9]{2}/[0-9]{4}$',
      validate: (value) => {
        const errors: string[] = []
        if (value && !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
          errors.push('Formato data non valido (gg/mm/aaaa)')
        }
        if (value) {
          const [day, month, year] = value.split('/').map(Number)
          const date = new Date(year, month - 1, day)
          if (date < new Date()) {
            errors.push('Data di scadenza non può essere nel passato')
          }
        }
        return errors.length > 0 ? errors : undefined
      }
    }
  ]
  
  const getDiscountTitle = (item: RepeatableObjectItem): string => {
    const tipo = item.data.tipo?.trim()
    const valore = item.data.valore?.trim()
    const unita = item.data.unita?.trim()
    
    if (tipo && valore) {
      const tipoLabel = discountFields.find(f => f.key === 'tipo')?.options?.find(o => o.value === tipo)?.label || tipo
      const unitaLabel = discountFields.find(f => f.key === 'unita')?.options?.find(o => o.value === unita)?.label || unita
      return `${tipoLabel}: ${valore} ${unitaLabel || (tipo === 'percentuale' ? '%' : '€')}`
    }
    if (tipo) {
      const tipoLabel = discountFields.find(f => f.key === 'tipo')?.options?.find(o => o.value === tipo)?.label || tipo
      return tipoLabel
    }
    return 'Nuovo Sconto'
  }
  
  const getDiscountSubtitle = (item: RepeatableObjectItem): string => {
    const parts: string[] = []
    if (item.data.durata) parts.push(`⏱️ ${item.data.durata} mesi`)
    if (item.data.codice_promo) parts.push(`🎫 ${item.data.codice_promo}`)
    if (item.data.scadenza) parts.push(`📅 Fino al ${item.data.scadenza}`)
    return parts.join(' • ') || 'Condizioni da specificare'
  }
  
  const getDiscountSummary = (item: RepeatableObjectItem) => {
    return (
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Percent className="h-3 w-3" />
          <span>
            {item.data.valore && item.data.unita 
              ? `${item.data.valore} ${discountFields.find(f => f.key === 'unita')?.options?.find(o => o.value === item.data.unita)?.label || item.data.unita}`
              : 'Valore da specificare'
            }
          </span>
        </div>
        {item.data.condizioni && (
          <div className="text-xs">
            {item.data.condizioni.length > 50 
              ? `${item.data.condizioni.substring(0, 50)}...`
              : item.data.condizioni
            }
          </div>
        )}
      </div>
    )
  }
  
  return (
    <RepeatableObjectField
      label="Sconti e Promozioni"
      description="Sconti, promozioni e offerte speciali disponibili per i clienti"
      fields={discountFields}
      items={items}
      onChange={onChange}
      required={required}
      disabled={disabled}
      minItems={0}
      maxItems={10}
      allowDuplicates={false}
      getItemTitle={getDiscountTitle}
      getItemSubtitle={getDiscountSubtitle}
      getItemSummary={getDiscountSummary}
      addButtonText="Aggiungi Sconto"
      emptyStateMessage="Nessuno sconto o promozione configurato. Aggiungi sconti per rendere l'offerta più attrattiva."
      collapsible={true}
      defaultCollapsed={true}
      className={className}
    />
  )
}

// =====================================================
// ADDITIONAL SERVICES COMPONENT
// =====================================================

export interface AdditionalServicesProps {
  items: RepeatableObjectItem[]
  onChange: (items: RepeatableObjectItem[]) => void
  disabled?: boolean
  required?: boolean
  className?: string
}

/**
 * Componente specializzato per servizi aggiuntivi
 * Step 18: Array di oggetti servizio con nome, descrizione, costo
 */
export function AdditionalServices({
  items,
  onChange,
  disabled = false,
  required = false,
  className = ''
}: AdditionalServicesProps) {
  
  const serviceFields: ObjectFieldDefinition[] = [
    {
      key: 'nome',
      label: 'Nome Servizio',
      type: 'text',
      required: true,
      placeholder: 'Servizio di assistenza premium',
      description: 'Nome del servizio aggiuntivo offerto',
      maxLength: 100
    },
    {
      key: 'categoria',
      label: 'Categoria Servizio',
      type: 'select',
      required: true,
      placeholder: 'Seleziona categoria',
      description: 'Categoria di appartenenza del servizio',
      options: [
        { value: 'assistenza', label: 'Assistenza Clienti' },
        { value: 'manutenzione', label: 'Manutenzione e Riparazione' },
        { value: 'installazione', label: 'Installazione e Setup' },
        { value: 'monitoraggio', label: 'Monitoraggio Consumi' },
        { value: 'consulenza', label: 'Consulenza Energetica' },
        { value: 'sicurezza', label: 'Sicurezza e Protezione' },
        { value: 'digitalizzazione', label: 'Servizi Digitali' },
        { value: 'altro', label: 'Altro' }
      ]
    },
    {
      key: 'descrizione',
      label: 'Descrizione Dettagliata',
      type: 'textarea',
      required: true,
      placeholder: 'Descrizione completa del servizio offerto...',
      description: 'Descrizione dettagliata del servizio e dei benefici',
      maxLength: 500
    },
    {
      key: 'costo_tipo',
      label: 'Tipo di Costo',
      type: 'select',
      required: true,
      placeholder: 'Seleziona tipo costo',
      description: 'Modalità di applicazione del costo del servizio',
      options: [
        { value: 'gratuito', label: 'Gratuito' },
        { value: 'fisso_mensile', label: 'Costo Fisso Mensile' },
        { value: 'fisso_annuale', label: 'Costo Fisso Annuale' },
        { value: 'una_tantum', label: 'Pagamento Una Tantum' },
        { value: 'su_richiesta', label: 'Su Richiesta/Preventivo' },
        { value: 'incluso', label: 'Incluso nell\'Offerta' }
      ]
    },
    {
      key: 'costo_valore',
      label: 'Valore del Costo',
      type: 'number',
      required: false,
      placeholder: '5.00',
      description: 'Importo del costo (se applicabile)',
      min: '0',
      max: '1000',
      step: '0.01',
      suffix: '€',
      showWhen: (item) => item.costo_tipo && !['gratuito', 'incluso', 'su_richiesta'].includes(item.costo_tipo)
    },
    {
      key: 'disponibilita',
      label: 'Disponibilità',
      type: 'select',
      required: false,
      placeholder: 'Seleziona disponibilità',
      description: 'Disponibilità temporale del servizio',
      options: [
        { value: '24_7', label: '24/7 - Sempre Disponibile' },
        { value: 'orario_ufficio', label: 'Orario Ufficio (9-18)' },
        { value: 'feriali', label: 'Solo Giorni Feriali' },
        { value: 'weekend', label: 'Weekend e Festivi' },
        { value: 'su_appuntamento', label: 'Su Appuntamento' },
        { value: 'emergenza', label: 'Solo Emergenze' }
      ]
    },
    {
      key: 'contatto',
      label: 'Contatto di Riferimento',
      type: 'text',
      required: false,
      placeholder: 'Numero verde o email per il servizio',
      description: 'Informazioni di contatto specifiche per questo servizio',
      maxLength: 100
    },
    {
      key: 'note',
      label: 'Note e Condizioni',
      type: 'textarea',
      required: false,
      placeholder: 'Condizioni particolari, limitazioni, note aggiuntive...',
      description: 'Note aggiuntive, condizioni di utilizzo, limitazioni',
      maxLength: 300
    }
  ]
  
  const getServiceTitle = (item: RepeatableObjectItem): string => {
    const nome = item.data.nome?.trim()
    const categoria = item.data.categoria?.trim()
    
    if (nome) return nome
    if (categoria) {
      const categoriaLabel = serviceFields.find(f => f.key === 'categoria')?.options?.find(o => o.value === categoria)?.label || categoria
      return `Servizio ${categoriaLabel}`
    }
    return 'Nuovo Servizio'
  }
  
  const getServiceSubtitle = (item: RepeatableObjectItem): string => {
    const parts: string[] = []
    
    if (item.data.categoria) {
      const categoriaLabel = serviceFields.find(f => f.key === 'categoria')?.options?.find(o => o.value === item.data.categoria)?.label
      if (categoriaLabel) parts.push(`📂 ${categoriaLabel}`)
    }
    
    if (item.data.costo_tipo) {
      const costoLabel = serviceFields.find(f => f.key === 'costo_tipo')?.options?.find(o => o.value === item.data.costo_tipo)?.label
      if (costoLabel) {
        if (item.data.costo_valore && !['gratuito', 'incluso', 'su_richiesta'].includes(item.data.costo_tipo)) {
          parts.push(`💰 ${costoLabel} €${item.data.costo_valore}`)
        } else {
          parts.push(`💰 ${costoLabel}`)
        }
      }
    }
    
    if (item.data.disponibilita) {
      const dispLabel = serviceFields.find(f => f.key === 'disponibilita')?.options?.find(o => o.value === item.data.disponibilita)?.label
      if (dispLabel) parts.push(`🕒 ${dispLabel}`)
    }
    
    return parts.join(' • ') || 'Dettagli da completare'
  }
  
  const getServiceSummary = (item: RepeatableObjectItem) => {
    return (
      <div className="space-y-2 text-xs text-muted-foreground">
        {item.data.descrizione && (
          <div className="flex items-start gap-2">
            <Cog className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>
              {item.data.descrizione.length > 80 
                ? `${item.data.descrizione.substring(0, 80)}...`
                : item.data.descrizione
              }
            </span>
          </div>
        )}
        {item.data.contatto && (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" />
            <span>{item.data.contatto}</span>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <RepeatableObjectField
      label="Servizi Aggiuntivi"
      description="Servizi e supporto aggiuntivi offerti ai clienti oltre alla fornitura di energia"
      fields={serviceFields}
      items={items}
      onChange={onChange}
      required={required}
      disabled={disabled}
      minItems={0}
      maxItems={15}
      allowDuplicates={false}
      getItemTitle={getServiceTitle}
      getItemSubtitle={getServiceSubtitle}
      getItemSummary={getServiceSummary}
      addButtonText="Aggiungi Servizio"
      emptyStateMessage="Nessun servizio aggiuntivo configurato. Aggiungi servizi per differenziare la tua offerta dalla concorrenza."
      collapsible={true}
      defaultCollapsed={true}
      className={className}
    />
  )
}

// =====================================================
// COMPOSITE COMPONENT EXPORTS
// =====================================================

export {
  ActivationMethods,
  Contacts,
  Discounts,
  AdditionalServices
}

export type {
  ActivationMethodsProps,
  ContactsProps,
  DiscountsProps,
  AdditionalServicesProps
} 