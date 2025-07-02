'use client'

import React from 'react'
// import { useStep5 } from '@/hooks/sii-wizard/useStep5'
import { 
  FormField, 
  FormSelect, 
  FormSection, 
  FormActions, 
  StatusBadge, 
  InfoAlert 
} from '../form'
import { 
  Step5Conditional, 
  ConditionalField, 
  ConditionalFieldGroup 
} from '../form/ConditionalRenderer'
import { PREZZO_RIFERIMENTO, FASCE_ORARIE, IDX_PREZZO_ENERGIA } from '@/lib/sii/constants'

// Temporary mock data type until useStep5 is implemented
interface MockStep5Data {
  prezzo_rif?: string
  prezzo_fisso?: number
  prezzo_var_formula?: string
  indicizzazione?: string
  spread?: number
  fasce_orarie?: string
  prezzo_f1?: number
  prezzo_f2?: number
  prezzo_f3?: number
}

// Temporary mock hook until useStep5 is implemented
function useMockStep5() {
  const [data, setData] = React.useState<MockStep5Data>({})
  
  return {
    data,
    errors: {},
    isValid: false,
    isComplete: false,
    hasUnsavedChanges: false,
    updateData: (newData: Partial<MockStep5Data>) => setData((prev: MockStep5Data) => ({ ...prev, ...newData })),
    clearData: () => setData({}),
    resetData: () => setData({}),
    saveData: () => console.log('Save Step5 data'),
    fillExampleData: () => setData({
      prezzo_rif: 'FISSO',
      prezzo_fisso: 0.120000,
      fasce_orarie: 'MULTIORARIA',
      prezzo_f1: 0.150000,
      prezzo_f2: 0.130000,
      prezzo_f3: 0.110000
    })
  }
}

/**
 * Step 5: Energy Price References (Riferimenti Prezzi Energia)
 * 
 * Complex conditional form with:
 * - Price reference type determines required fields
 * - Time bands configuration affects band prices
 * - Cross-field validation and dependencies
 * - Real-time price calculation and validation
 */
export default function Step5() {
  // TODO: Replace with actual useStep5 hook when implemented
  const step5 = useMockStep5()
  
  // Extract current values for conditional logic
  const currentData = step5.data || {}
  const priceRefType = currentData.prezzo_rif
  const timeBands = currentData.fasce_orarie
  const hasDiscount = currentData.spread !== undefined && currentData.spread !== 0
  
  // Form validation state
  const hasErrors = Object.keys(step5.errors || {}).length > 0
  const isComplete = step5.isValid && step5.isComplete
  
  // Status for the step
  const getStepStatus = () => {
    if (hasErrors) return 'errori'
    if (isComplete) return 'completo'
    if (Object.keys(currentData).some(key => currentData[key as keyof MockStep5Data] !== undefined)) {
      return 'in_corso'
    }
    return 'incompleto'
  }
  
  // Price reference options
  const priceRefOptions = Object.entries(PREZZO_RIFERIMENTO).map(([key, value]) => ({
    value,
    label: key === 'FISSO' ? 'Prezzo Fisso' : 
           key === 'VARIABILE' ? 'Prezzo Variabile' : 
           key === 'INDICIZZATO' ? 'Prezzo Indicizzato' : value
  }))
  
  // Time bands options
  const timeBandOptions = Object.entries(FASCE_ORARIE).map(([key, value]) => ({
    value,
    label: key === 'MONORARIA' ? 'Monoraria (F1)' :
           key === 'BIORARIA' ? 'Bioraria (F1-F2)' :
           key === 'MULTIORARIA' ? 'Multioraria (F1-F2-F3)' : value
  }))
  
  // Indexation options
  const indexationOptions = Object.entries(IDX_PREZZO_ENERGIA).map(([key, value]) => ({
    value,
    label: key.replace(/_/g, ' ')
  }))

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <FormSection
        title="Riferimenti Prezzi Energia"
        description="Configura la struttura dei prezzi e le modalità di applicazione"
        icon="💰"
        status={<StatusBadge status={getStepStatus()} />}
      />

      {/* Price Reference Type - Always Required */}
      <FormSelect
        label="Tipo di Prezzo di Riferimento"
        value={currentData.prezzo_rif || ''}
        onChange={(value) => step5.updateData({ prezzo_rif: value })}
        options={priceRefOptions}
        error={step5.errors?.prezzo_rif}
        required
        description="Seleziona il tipo di riferimento per il calcolo del prezzo dell'energia"
      />

      {/* Conditional Fields Based on Price Reference Type */}
      <Step5Conditional 
        priceReferenceType={priceRefType}
        timeBands={timeBands}
      >
        {({
          showFixedPrice,
          showVariableFormula,
          showIndexation,
          showTimeBandPrices,
          requiresBandPrice
        }) => (
          <>
            {/* Fixed Price Section */}
            <ConditionalField
              showWhen={showFixedPrice}
              requiredWhen={showFixedPrice}
              fieldName="prezzo_fisso"
            >
              <ConditionalFieldGroup
                title="Prezzo Fisso"
                condition={showFixedPrice}
                className="bg-green-50 p-4 rounded-lg border border-green-200"
              >
                <FormField
                  label="Prezzo Fisso"
                  type="number"
                  value={currentData.prezzo_fisso || ''}
                  onChange={(value) => step5.updateData({ prezzo_fisso: parseFloat(value) || undefined })}
                  error={step5.errors?.prezzo_fisso}
                  required={showFixedPrice}
                  placeholder="0.120000"
                  step="0.000001"
                  min="0"
                  max="9999.999999"
                  suffix="€/kWh"
                  description="Prezzo fisso applicato per tutta la durata del contratto"
                  characterCounter={{
                    current: currentData.prezzo_fisso?.toString().length || 0,
                    max: 12
                  }}
                />
                
                {showFixedPrice && (
                  <InfoAlert
                    type="info"
                    title="Prezzo Fisso"
                    message="Il prezzo rimarrà invariato per tutta la durata del contratto, garantendo prevedibilità dei costi."
                  />
                )}
              </ConditionalFieldGroup>
            </ConditionalField>

            {/* Variable Price Section */}
            <ConditionalField
              showWhen={showVariableFormula}
              requiredWhen={showVariableFormula}
              fieldName="prezzo_var_formula"
            >
              <ConditionalFieldGroup
                title="Prezzo Variabile"
                condition={showVariableFormula}
                className="bg-blue-50 p-4 rounded-lg border border-blue-200"
              >
                <FormField
                  label="Formula Prezzo Variabile"
                  type="textarea"
                  value={currentData.prezzo_var_formula || ''}
                  onChange={(value) => step5.updateData({ prezzo_var_formula: value || undefined })}
                  error={step5.errors?.prezzo_var_formula}
                  required={showVariableFormula}
                  placeholder="Prezzo determinato secondo parametri di mercato PUN + spread fisso..."
                  maxLength={500}
                  description="Formula per il calcolo del prezzo variabile (massimo 500 caratteri)"
                  characterCounter={{
                    current: currentData.prezzo_var_formula?.length || 0,
                    max: 500
                  }}
                />
              </ConditionalFieldGroup>
            </ConditionalField>

            {/* Indexation Section */}
            <ConditionalField
              showWhen={showIndexation}
              fieldName="indicizzazione"
            >
              <ConditionalFieldGroup
                title="Indicizzazione"
                condition={showIndexation}
                className="bg-orange-50 p-4 rounded-lg border border-orange-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    label="Tipo Indicizzazione"
                    value={currentData.indicizzazione || ''}
                    onChange={(value) => step5.updateData({ indicizzazione: value })}
                    options={indexationOptions}
                    error={step5.errors?.indicizzazione}
                    required={priceRefType === 'INDICIZZATO'}
                    description="Tipo di indicizzazione per prezzi variabili"
                  />
                  
                  <FormField
                    label="Spread"
                    type="number"
                    value={currentData.spread || ''}
                    onChange={(value) => step5.updateData({ spread: parseFloat(value) || undefined })}
                    error={step5.errors?.spread}
                    placeholder="0.005000"
                    step="0.000001"
                    min="-999.999999"
                    max="999.999999"
                    suffix="€/kWh"
                    description="Spread applicato al prezzo indicizzato"
                    characterCounter={{
                      current: currentData.spread?.toString().length || 0,
                      max: 12
                    }}
                  />
                </div>

                {hasDiscount && (
                  <InfoAlert
                    type="success"
                    title="Spread Applicato"
                    message={`Spread di ${currentData.spread} €/kWh ${currentData.spread! > 0 ? 'aggiunto' : 'scontato'} dal prezzo base.`}
                  />
                )}
              </ConditionalFieldGroup>
            </ConditionalField>

            {/* Time Bands Configuration */}
            <ConditionalFieldGroup
              title="Fasce Orarie"
              condition={true}
              collapsible
              className="bg-purple-50 p-4 rounded-lg border border-purple-200"
            >
              <FormSelect
                label="Configurazione Fasce Orarie"
                value={currentData.fasce_orarie || ''}
                onChange={(value) => step5.updateData({ fasce_orarie: value })}
                options={timeBandOptions}
                error={step5.errors?.fasce_orarie}
                description="Configurazione delle fasce orarie per prezzi differenziati (opzionale)"
              />

              {/* Band-Specific Prices */}
              <ConditionalField
                showWhen={showTimeBandPrices}
                fieldName="band_prices"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* F1 Price */}
                  <ConditionalField
                    showWhen={showTimeBandPrices}
                    requiredWhen={requiresBandPrice('F1')}
                    fieldName="prezzo_f1"
                  >
                    <FormField
                      label="Prezzo F1 (Punta)"
                      type="number"
                      value={currentData.prezzo_f1 || ''}
                      onChange={(value) => step5.updateData({ prezzo_f1: parseFloat(value) || undefined })}
                      error={step5.errors?.prezzo_f1}
                      required={requiresBandPrice('F1')}
                      placeholder="0.150000"
                      step="0.000001"
                      min="0"
                      max="9999.999999"
                      suffix="€/kWh"
                      description="Prezzo per fascia F1 (ore di punta)"
                    />
                  </ConditionalField>

                  {/* F2 Price */}
                  <ConditionalField
                    showWhen={showTimeBandPrices}
                    requiredWhen={requiresBandPrice('F2')}
                    fieldName="prezzo_f2"
                  >
                    <FormField
                      label="Prezzo F2 (Intermedia)"
                      type="number"
                      value={currentData.prezzo_f2 || ''}
                      onChange={(value) => step5.updateData({ prezzo_f2: parseFloat(value) || undefined })}
                      error={step5.errors?.prezzo_f2}
                      required={requiresBandPrice('F2')}
                      placeholder="0.130000"
                      step="0.000001"
                      min="0"
                      max="9999.999999"
                      suffix="€/kWh"
                      description="Prezzo per fascia F2 (ore intermedie)"
                    />
                  </ConditionalField>

                  {/* F3 Price */}
                  <ConditionalField
                    showWhen={showTimeBandPrices}
                    requiredWhen={requiresBandPrice('F3')}
                    fieldName="prezzo_f3"
                  >
                    <FormField
                      label="Prezzo F3 (Fuori Punta)"
                      type="number"
                      value={currentData.prezzo_f3 || ''}
                      onChange={(value) => step5.updateData({ prezzo_f3: parseFloat(value) || undefined })}
                      error={step5.errors?.prezzo_f3}
                      required={requiresBandPrice('F3')}
                      placeholder="0.110000"
                      step="0.000001"
                      min="0"
                      max="9999.999999"
                      suffix="€/kWh"
                      description="Prezzo per fascia F3 (ore fuori punta)"
                    />
                  </ConditionalField>
                </div>

                {/* Pricing Summary */}
                {showTimeBandPrices && (currentData.prezzo_f1 || currentData.prezzo_f2 || currentData.prezzo_f3) && (
                  <InfoAlert
                    type="info"
                    title="Riepilogo Prezzi per Fascia"
                    message={
                      <div className="space-y-1">
                        {currentData.prezzo_f1 && <div>F1 (Punta): €{currentData.prezzo_f1.toFixed(6)}/kWh</div>}
                        {currentData.prezzo_f2 && <div>F2 (Intermedia): €{currentData.prezzo_f2.toFixed(6)}/kWh</div>}
                        {currentData.prezzo_f3 && <div>F3 (Fuori Punta): €{currentData.prezzo_f3.toFixed(6)}/kWh</div>}
                        {currentData.prezzo_f1 && currentData.prezzo_f3 && (
                          <div className="mt-2 font-medium">
                            Differenza F1-F3: €{(currentData.prezzo_f1 - currentData.prezzo_f3).toFixed(6)}/kWh 
                            ({(((currentData.prezzo_f1 - currentData.prezzo_f3) / currentData.prezzo_f3) * 100).toFixed(1)}%)
                          </div>
                        )}
                      </div>
                    }
                  />
                )}
              </ConditionalField>
            </ConditionalFieldGroup>

            {/* Validation Warnings */}
            {hasErrors && (
              <InfoAlert
                type="error"
                title="Errori di Validazione"
                message={
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(step5.errors || {}).map(([field, error]) => (
                      <li key={field}><strong>{field}:</strong> {error}</li>
                    ))}
                  </ul>
                }
              />
            )}

            {/* Pricing Configuration Help */}
            {!isComplete && (
              <InfoAlert
                type="info"
                title="Configurazione Prezzi"
                message={
                  <div className="space-y-2">
                    <p>Seleziona il tipo di prezzo di riferimento per procedere:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Fisso:</strong> Prezzo costante per tutta la durata</li>
                      <li><strong>Variabile:</strong> Prezzo che varia secondo formula</li>
                      <li><strong>Indicizzato:</strong> Prezzo legato a indici di mercato</li>
                    </ul>
                    <p className="text-sm">Le fasce orarie sono opzionali e permettono prezzi differenziati per ora del giorno.</p>
                  </div>
                }
              />
            )}
          </>
        )}
      </Step5Conditional>

      {/* Action Buttons */}
      <FormActions
        onClear={() => step5.clearData()}
        onReset={() => step5.resetData()}
        onSave={() => step5.saveData()}
        onFillExample={() => step5.fillExampleData()}
        canClear={Object.keys(currentData).length > 0}
        canReset={step5.hasUnsavedChanges}
        canSave={step5.isValid}
        showFillExample={process.env.NODE_ENV === 'development'}
      />
    </div>
  )
} 