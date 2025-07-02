'use client'

import React from 'react'
// import { useStep7 } from '@/hooks/sii-wizard/useStep7'
import { 
  FormField, 
  FormSelect, 
  FormSection, 
  FormActions, 
  StatusBadge, 
  InfoAlert 
} from '../form'
import { 
  Step7Conditional, 
  ConditionalField, 
  ConditionalFieldGroup 
} from '../form/ConditionalRenderer'
import { TIPO_OFFERTA } from '@/lib/sii/constants'

// Temporary mock data type until useStep7 is implemented
interface MockStep7Data {
  tipo_offerta?: string
  caratteristiche_flat?: string
  durata_flat?: number
  descrizione_offerta?: string
}

// Temporary mock hook until useStep7 is implemented
function useMockStep7() {
  const [data, setData] = React.useState<MockStep7Data>({})
  
  return {
    data,
    errors: {},
    isValid: false,
    isComplete: false,
    hasUnsavedChanges: false,
    updateData: (newData: Partial<MockStep7Data>) => setData((prev: MockStep7Data) => ({ ...prev, ...newData })),
    clearData: () => setData({}),
    resetData: () => setData({}),
    saveData: () => console.log('Save Step7 data'),
    fillExampleData: () => setData({
      tipo_offerta: 'FLAT',
      caratteristiche_flat: 'Offerta flat per piccoli consumatori',
      durata_flat: 12,
      descrizione_offerta: 'Offerta competitiva con prezzo bloccato'
    })
  }
}

/**
 * Step 7: Offer Characteristics (Caratteristiche Offerta)
 * 
 * Complex conditional form with:
 * - Offer type determines FLAT-specific fields
 * - FLAT offers require additional characteristics and duration
 * - FLAT offers should have at least one price component
 * - Cross-field validation for FLAT business rules
 */
export default function Step7() {
  // TODO: Replace with actual useStep7 hook when implemented
  const step7 = useMockStep7()
  
  // Extract current values for conditional logic
  const currentData = step7.data || {}
  const offerType = currentData.tipo_offerta
  const isFlatOffer = offerType === 'FLAT'
  
  // Form validation state
  const hasErrors = Object.keys(step7.errors || {}).length > 0
  const isComplete = step7.isValid && step7.isComplete
  
  // Status for the step
  const getStepStatus = () => {
    if (hasErrors) return 'errori'
    if (isComplete) return 'completo'
    if (Object.keys(currentData).some(key => currentData[key as keyof MockStep7Data] !== undefined)) {
      return 'in_corso'
    }
    return 'incompleto'
  }
  
  // Offer type options
  const offerTypeOptions = Object.entries(TIPO_OFFERTA).map(([key, value]) => ({
    value,
    label: key === 'FLAT' ? 'Offerta FLAT' : 
           key === 'STANDARD' ? 'Offerta Standard' : 
           key === 'DUAL' ? 'Offerta Dual Fuel' : value
  }))

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <FormSection
        title="Caratteristiche Offerta"
        description="Tipologia e caratteristiche specifiche dell'offerta commerciale"
        icon="⚡"
        status={<StatusBadge status={getStepStatus()} />}
      />

      {/* Offer Type - Always Required */}
      <FormSelect
        label="Tipo di Offerta"
        value={currentData.tipo_offerta || ''}
        onChange={(value) => step7.updateData({ tipo_offerta: value })}
        options={offerTypeOptions}
        error={step7.errors?.tipo_offerta}
        required
        description="Seleziona la tipologia di offerta commerciale"
      />

      {/* General Offer Description */}
      <FormField
        label="Descrizione Offerta"
        type="textarea"
        value={currentData.descrizione_offerta || ''}
        onChange={(value) => step7.updateData({ descrizione_offerta: value || undefined })}
        error={step7.errors?.descrizione_offerta}
        placeholder="Descrizione generale dell'offerta..."
        maxLength={1000}
        description="Descrizione generale delle caratteristiche dell'offerta (massimo 1000 caratteri)"
        characterCounter={{
          current: currentData.descrizione_offerta?.length || 0,
          max: 1000
        }}
      />

      {/* Conditional Fields Based on Offer Type */}
      <Step7Conditional 
        offerType={offerType}
      >
        {({
          showFlatFields,
          requiresFlatCharacteristics,
          requiresFlatDuration
        }) => (
          <>
            {/* FLAT Offer Specific Fields */}
            <ConditionalField
              showWhen={showFlatFields}
              fieldName="flat_fields"
            >
              <ConditionalFieldGroup
                title="Caratteristiche FLAT"
                condition={showFlatFields}
                className="bg-orange-50 p-4 rounded-lg border border-orange-200"
              >
                {/* FLAT Characteristics */}
                <ConditionalField
                  showWhen={showFlatFields}
                  requiredWhen={requiresFlatCharacteristics}
                  fieldName="caratteristiche_flat"
                >
                  <FormField
                    label="Caratteristiche FLAT"
                    type="textarea"
                    value={currentData.caratteristiche_flat || ''}
                    onChange={(value) => step7.updateData({ caratteristiche_flat: value || undefined })}
                    error={step7.errors?.caratteristiche_flat}
                    required={requiresFlatCharacteristics}
                    placeholder="Descrizione delle caratteristiche specifiche dell'offerta FLAT..."
                    maxLength={500}
                    description="Caratteristiche specifiche per offerte FLAT (massimo 500 caratteri)"
                    characterCounter={{
                      current: currentData.caratteristiche_flat?.length || 0,
                      max: 500
                    }}
                  />
                </ConditionalField>

                {/* FLAT Duration */}
                <ConditionalField
                  showWhen={showFlatFields}
                  requiredWhen={requiresFlatDuration}
                  fieldName="durata_flat"
                >
                  <FormField
                    label="Durata FLAT (Mesi)"
                    type="number"
                    value={currentData.durata_flat || ''}
                    onChange={(value) => step7.updateData({ durata_flat: parseInt(value) || undefined })}
                    error={step7.errors?.durata_flat}
                    required={requiresFlatDuration}
                    placeholder="12"
                    min="1"
                    max="60"
                    suffix="mesi"
                    description="Durata del periodo FLAT in mesi (da 1 a 60 mesi)"
                    characterCounter={{
                      current: currentData.durata_flat?.toString().length || 0,
                      max: 2
                    }}
                  />
                </ConditionalField>

                {/* FLAT Offer Information */}
                {isFlatOffer && (
                  <InfoAlert
                    type="info"
                    title="Offerta FLAT"
                    message={
                      <div className="space-y-2">
                        <p>Le offerte FLAT prevedono un prezzo fisso per un periodo determinato.</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Specificare le caratteristiche che rendono l&apos;offerta competitiva</li>
                          <li>Indicare la durata del periodo a prezzo fisso</li>
                          <li>Assicurarsi che ci sia almeno una componente prezzo configurata</li>
                        </ul>
                      </div>
                    }
                  />
                )}
              </ConditionalFieldGroup>
            </ConditionalField>

            {/* Validation Warnings */}
            {hasErrors && (
              <InfoAlert
                type="error"
                title="Errori di Validazione"
                message={
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(step7.errors || {}).map(([field, error]) => (
                      <li key={field}><strong>{field}:</strong> {error}</li>
                    ))}
                  </ul>
                }
              />
            )}

            {/* Offer Configuration Help */}
            {!isComplete && (
              <InfoAlert
                type="info"
                title="Configurazione Offerta"
                message={
                  <div className="space-y-2">
                    <p>Definisci le caratteristiche principali della tua offerta:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Standard:</strong> Offerta con condizioni regolari</li>
                      <li><strong>FLAT:</strong> Prezzo fisso per periodo determinato</li>
                      <li><strong>Dual:</strong> Combinazione elettricità e gas</li>
                    </ul>
                    <p className="text-sm">La descrizione aiuta i clienti a comprendere i vantaggi dell&apos;offerta.</p>
                  </div>
                }
              />
            )}
          </>
        )}
      </Step7Conditional>

      {/* Action Buttons */}
      <FormActions
        onClear={() => step7.clearData()}
        onReset={() => step7.resetData()}
        onSave={() => step7.saveData()}
        onFillExample={() => step7.fillExampleData()}
        canClear={Object.keys(currentData).length > 0}
        canReset={step7.hasUnsavedChanges}
        canSave={step7.isValid}
        showFillExample={process.env.NODE_ENV === 'development'}
      />
    </div>
  )
} 