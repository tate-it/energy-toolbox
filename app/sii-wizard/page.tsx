'use client'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { WizardStepper, useStepper, wizardSteps, type StepStatus } from '@/components/sii-wizard/wizard-stepper'
import Step1 from '@/components/sii-wizard/steps/Step1'
import Step2 from '@/components/sii-wizard/steps/Step2'
import Step3 from '@/components/sii-wizard/steps/Step3'
import Step4 from '@/components/sii-wizard/steps/Step4'
import Step5 from '@/components/sii-wizard/steps/Step5'
import Step6 from '@/components/sii-wizard/steps/Step6'
import Step7 from '@/components/sii-wizard/steps/Step7'
import Step8 from '@/components/sii-wizard/steps/Step8'
import Step9 from '@/components/sii-wizard/steps/Step9'
import Step10 from '@/components/sii-wizard/steps/Step10'
import Step11 from '@/components/sii-wizard/steps/Step11'
import Step12 from '@/components/sii-wizard/steps/Step12'
import Step13 from '@/components/sii-wizard/steps/Step13'
import Step14 from '@/components/sii-wizard/steps/Step14'
import Step15 from '@/components/sii-wizard/steps/Step15'
import Step16 from '@/components/sii-wizard/steps/Step16'
import Step17 from '@/components/sii-wizard/steps/Step17'
import Step18 from '@/components/sii-wizard/steps/Step18'
import { Home } from 'lucide-react'
import Link from 'next/link'
import { useState, useCallback } from 'react'

// Mock validation state for demonstration
interface StepValidationState {
  completed: boolean
  hasErrors: boolean
  validationErrors: string[]
  canProceed: boolean
}

// Mock step states for demonstration
const initialStepStates: Record<string, StepValidationState> = {
  'anagrafica-ditta': { completed: false, hasErrors: true, validationErrors: ['PIVA non valida'], canProceed: false },
  'dettaglio-offerta': { completed: false, hasErrors: false, validationErrors: [], canProceed: true },
  'modalita-attivazione': { completed: true, hasErrors: false, validationErrors: [], canProceed: true },
  'contatti': { completed: true, hasErrors: false, validationErrors: [], canProceed: true },
  'dettaglio-tecnico': { completed: false, hasErrors: true, validationErrors: ['Configurazione incompleta'], canProceed: false },
  'dettagli-anagrafici': { completed: false, hasErrors: false, validationErrors: [], canProceed: true },
  'condizioni-economiche': { completed: false, hasErrors: false, validationErrors: [], canProceed: true },
  'documenti-allegati': { completed: false, hasErrors: false, validationErrors: [], canProceed: true },
  'autorizzazioni-consensi': { completed: false, hasErrors: false, validationErrors: [], canProceed: true },
  'configurazione-fatturazione': { completed: false, hasErrors: false, validationErrors: [], canProceed: true },
  'parametri-tecnici': { completed: false, hasErrors: false, validationErrors: [], canProceed: true },
  'condizioni-particolari': { completed: false, hasErrors: false, validationErrors: [], canProceed: true },
  'utenze-multiple': { completed: false, hasErrors: false, validationErrors: [], canProceed: true },
  'configurazione-notifiche': { completed: false, hasErrors: false, validationErrors: [], canProceed: true },
  'riepilogo-validazione': { completed: false, hasErrors: false, validationErrors: [], canProceed: true },
  'anteprima-xml': { completed: false, hasErrors: false, validationErrors: [], canProceed: true },
  'sconti': { completed: false, hasErrors: false, validationErrors: [], canProceed: true },
  'servizi-aggiuntivi': { completed: true, hasErrors: false, validationErrors: [], canProceed: true },
}

function StepContent() {
  const stepper = useStepper()
  const currentStep = wizardSteps.find(s => s.id === stepper.current.id)
  
  // Render appropriate step component based on current step
  switch (stepper.current.id) {
    case 'anagrafica-ditta':
      return <Step1 />
    
    case 'dettaglio-offerta':
      return <Step2 />
    
    case 'modalita-attivazione':
      return <Step3 />
    
    case 'contatti':
      return <Step4 />
    
    case 'dettaglio-tecnico':
      return <Step5 />
    
    case 'dettagli-anagrafici':
      return <Step6 />
    
    case 'condizioni-economiche':
      return <Step7 />
    
    case 'documenti-allegati':
      return <Step8 />
    
    case 'autorizzazioni-consensi':
      return <Step9 />
    
    case 'configurazione-fatturazione':
      return <Step10 />
    
    case 'parametri-tecnici':
      return <Step11 />
    
    case 'condizioni-particolari':
      return <Step12 />
    
    case 'utenze-multiple':
      return <Step13 />
    
    case 'configurazione-notifiche':
      return <Step14 />
    
    case 'riepilogo-validazione':
      return <Step15 />
    
    case 'anteprima-xml':
      return <Step16 />
    
    case 'sconti':
      return <Step17 />
    
    case 'servizi-aggiuntivi':
      return <Step18 />
    
    default:
      return (
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 {currentStep?.label}
            </CardTitle>
            <CardDescription>
              Questo step è in fase di sviluppo.
            </CardDescription>
          </CardHeader>
          <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
            <p>Componente step in arrivo...</p>
            <p className="text-sm mt-2">Step ID: {stepper.current.id}</p>
            <div className="text-xs mt-4 text-muted-foreground">
              Step disponibili: anagrafica-ditta, dettaglio-offerta, modalita-attivazione, contatti, dettaglio-tecnico, dettagli-anagrafici, condizioni-economiche, documenti-allegati, autorizzazioni-consensi, configurazione-fatturazione, parametri-tecnici, condizioni-particolari, utenze-multiple, configurazione-notifiche, riepilogo-validazione, anteprima-xml, sconti, servizi-aggiuntivi
            </div>
          </div>
        </Card>
      )
  }
}

export default function SIIWizardPage() {
  // State for tracking step validation
  const [stepStates, setStepStates] = useState(initialStepStates)
  
  // Funzione per gestire l'esportazione XML
  const handleExportXML = () => {
    // TODO: Implementare la generazione e download del file XML
    console.log('Generazione XML da implementare...')
    alert('Funzionalità di esportazione XML da implementare nelle prossime attività')
  }

  // Funzione per ottenere lo stato di ogni step
  const getStepStatus = useCallback((stepId: string): StepStatus => {
    const stepState = stepStates[stepId]
    if (!stepState) {
      return {
        completed: false,
        hasErrors: false,
        isOptional: !wizardSteps.find(s => s.id === stepId)?.required,
        validationErrors: [],
        canProceed: true
      }
    }
    
    const stepInfo = wizardSteps.find(s => s.id === stepId)
    
    return {
      completed: stepState.completed,
      hasErrors: stepState.hasErrors,
      isOptional: !stepInfo?.required,
      validationErrors: stepState.validationErrors,
      canProceed: stepState.canProceed
    }
  }, [stepStates])

  // Funzione per aggiornare lo stato di un step (per demo)
  const updateStepState = useCallback((stepId: string, newState: Partial<StepValidationState>) => {
    setStepStates(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], ...newState }
    }))
  }, [])

  // Component wrapper to access stepper context
  function WizardContent() {
    const stepper = useStepper()
    
    // Funzione per validare lo step corrente
    const validateCurrentStep = useCallback(() => {
      const currentStepId = stepper.current.id
      const stepState = stepStates[currentStepId]
      
      if (!stepState) {
        return { isValid: true, errors: [], canProceed: true }
      }
      
      return {
        isValid: !stepState.hasErrors,
        errors: stepState.validationErrors,
        canProceed: stepState.canProceed
      }
    }, [stepper])

    return (
      <WizardStepper 
        onExportXML={handleExportXML}
        getStepStatus={getStepStatus}
        onValidateCurrentStep={validateCurrentStep}
      >
        <StepContent />
      </WizardStepper>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb di navigazione */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Generatore XML SII</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Intestazione principale */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">Generatore XML Offerte SII</CardTitle>
            <CardDescription className="text-base">
              Crea file XML conformi alle specifiche del Sistema Informativo Integrato (SII) versione 4.5 
              per le offerte del mercato elettrico e gas.
            </CardDescription>
          </CardHeader>
        </Card>
        
        {/* Development Tools Panel */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-8 border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="text-lg text-orange-800">🔧 Strumenti di Sviluppo - Validazione</CardTitle>
              <CardDescription className="text-orange-700">
                Pannello per testare la validazione dei passi (solo in development)
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {Object.entries(stepStates).slice(0, 8).map(([stepId, state]) => {
                  const stepInfo = wizardSteps.find(s => s.id === stepId)
                  return (
                    <div key={stepId} className="p-2 border rounded">
                      <div className="font-medium truncate" title={stepInfo?.label}>
                        {stepInfo?.label}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => updateStepState(stepId, { completed: !state.completed })}
                          className={`px-1 py-0.5 rounded text-[10px] ${
                            state.completed ? 'bg-green-500 text-white' : 'bg-gray-300'
                          }`}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => updateStepState(stepId, { 
                            hasErrors: !state.hasErrors,
                            validationErrors: !state.hasErrors ? ['Errore di test'] : []
                          })}
                          className={`px-1 py-0.5 rounded text-[10px] ${
                            state.hasErrors ? 'bg-red-500 text-white' : 'bg-gray-300'
                          }`}
                        >
                          ⚠
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        )}
        
        {/* Wizard principale con controlli di validazione */}
        <WizardContent />
      </div>
    </div>
  )
} 