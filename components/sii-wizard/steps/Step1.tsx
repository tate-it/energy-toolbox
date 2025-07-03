'use client'

import { useStep1 } from '@/hooks/sii-wizard/useStep1'
import { 
  Step1Labels, 
  Step1Descriptions,
  isStep1Complete 
} from '@/lib/sii/schemas/step1'
import { 
  FormField,
  FormSection,
  FormActions,
  InfoAlert
} from '@/components/sii-wizard/form'
import { Building2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Step1() {
  const step1 = useStep1()
  const [validationState, setValidationState] = useState<Record<string, string>>({})
  
  // Get current form data
  const { piva, cod } = step1.data
  
  // Check if step is complete
  const isComplete = isStep1Complete(step1.data)
  
  // Real-time validation check
  useEffect(() => {
    const validation = step1.validate()
    if (!validation.success) {
      setValidationState((validation as { errors: Record<string, string> }).errors)
    } else {
      setValidationState(prev => Object.keys(prev).length > 0 ? {} : prev)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step1.data])

  // Handle field changes with debounced updates
  const handlePivaChange = (value: string) => {
    step1.updateField('piva', value)
  }

  const handleCodiceChange = (value: string) => {
    step1.updateField('cod', value)
  }

  // Handle clear fields
  const handleClearAll = () => {
    step1.clearFields(['piva', 'cod'])
  }

  // Handle preset example values for testing
  const handleFillExample = () => {
    step1.batchUpdate({
      piva: '12345678901',
      cod: 'OFFERTA2024001'
    })
  }

  // Check if we have any data for clear action
  const hasData = Boolean(piva) || Boolean(cod)

  return (
    <div className="space-y-6">
      {/* Sezione principale */}
      <FormSection
        title="Identificativi Offerta"
        description="Inserire la PIVA del venditore e il codice univoco dell&apos;offerta"
        icon={Building2}
        isComplete={isComplete}
        hasErrors={Object.keys(validationState).length > 0}
      >
        {/* Campo PIVA */}
        <FormField
          id="piva"
          label={Step1Labels.piva}
          value={piva ?? ''}
          placeholder="Es. 12345678901"
          description={Step1Descriptions.piva}
          error={validationState.piva}
          required
          maxLength={11}
          onChange={handlePivaChange}
        />

        {/* Campo Codice Offerta */}
        <FormField
          id="cod"
          label={Step1Labels.cod}
          value={cod ?? ''}
          placeholder="Es. OFFERTA2024001"
          description={Step1Descriptions.cod}
          error={validationState.cod}
          required
          maxLength={32}
          onChange={handleCodiceChange}
        />

        {/* Azioni del form */}
        <FormActions
          onClear={handleClearAll}
          onFillExample={handleFillExample}
          canClear={hasData}
        />
      </FormSection>

      {/* Pannello informativo */}
      <InfoAlert title="Informazioni importanti">
        <ul className="space-y-1 list-disc list-inside">
          <li>
            La <strong>PIVA</strong> deve essere quella del venditore dell&apos;energia elettrica o gas
          </li>
          <li>
            Il <strong>Codice Offerta</strong> sarà utilizzato come codice contratto durante l&apos;attivazione
          </li>
          <li>
            Entrambi i campi sono obbligatori per procedere con la configurazione
          </li>
        </ul>
      </InfoAlert>

      {/* Alert di completamento */}
      {isComplete && (
        <InfoAlert type="success" title="Step completato!">
          Gli identificativi sono stati inseriti correttamente. 
          Puoi procedere al passo successivo.
        </InfoAlert>
      )}
    </div>
  )
}

export default Step1 