'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { defineStepper } from '@stepperize/react'
import { 
  ChevronLeft, 
  ChevronRight, 
  FileDown, 
  CheckCircle, 
  Circle,
  Clock,
  AlertCircle,
  AlertTriangle
} from 'lucide-react'
import { ReactNode, useState } from 'react'

// Definizione degli step del wizard SII con etichette italiane
const { Scoped, useStepper } = defineStepper(
  { id: 'anagrafica-ditta', label: 'Anagrafica Ditta' },
  { id: 'dettaglio-offerta', label: 'Dettaglio Offerta' },
  { id: 'modalita-attivazione', label: 'Modalità Attivazione' },
  { id: 'contatti', label: 'Contatti' },
  { id: 'dettaglio-tecnico', label: 'Dettaglio Tecnico' },
  { id: 'dettagli-anagrafici', label: 'Dettagli Anagrafici Avanzati' },
  { id: 'condizioni-economiche', label: 'Condizioni Economiche' },
  { id: 'documenti-allegati', label: 'Documenti e Allegati' },
  { id: 'autorizzazioni-consensi', label: 'Autorizzazioni e Consensi' },
  { id: 'configurazione-fatturazione', label: 'Configurazione Fatturazione' },
  { id: 'parametri-tecnici', label: 'Parametri Tecnici Avanzati' },
  { id: 'condizioni-particolari', label: 'Condizioni Particolari' },
  { id: 'utenze-multiple', label: 'Gestione Utenze Multiple' },
  { id: 'configurazione-notifiche', label: 'Configurazione Notifiche' },
  { id: 'riepilogo-validazione', label: 'Riepilogo e Validazione' },
  { id: 'anteprima-xml', label: 'Anteprima XML e Invio' },
  { id: 'sconti', label: 'Sconti' },
  { id: 'servizi-aggiuntivi', label: 'Servizi Aggiuntivi' },
)

// Lista degli step per la navigazione
const steps = [
  { id: 'anagrafica-ditta', label: 'Anagrafica Ditta', description: 'PIVA utente e codice offerta', required: true },
  { id: 'dettaglio-offerta', label: 'Dettaglio Offerta', description: 'Informazioni generali dell&apos;offerta', required: true },
  { id: 'modalita-attivazione', label: 'Modalità Attivazione', description: 'Metodi di attivazione disponibili', required: true },
  { id: 'contatti', label: 'Contatti', description: 'Informazioni di contatto', required: true },
  { id: 'dettaglio-tecnico', label: 'Dettaglio Tecnico', description: 'Configurazione tecnica dettagliata', required: true },
  { id: 'dettagli-anagrafici', label: 'Dettagli Anagrafici Avanzati', description: 'Informazioni societarie complete', required: false },
  { id: 'condizioni-economiche', label: 'Condizioni Economiche', description: 'Prezzi e condizioni economiche', required: true },
  { id: 'documenti-allegati', label: 'Documenti e Allegati', description: 'Caricamento documentazione', required: false },
  { id: 'autorizzazioni-consensi', label: 'Autorizzazioni e Consensi', description: 'Consensi privacy e autorizzazioni', required: true },
  { id: 'configurazione-fatturazione', label: 'Configurazione Fatturazione', description: 'Impostazioni fatturazione e pagamento', required: true },
  { id: 'parametri-tecnici', label: 'Parametri Tecnici Avanzati', description: 'Configurazione parametri tecnici', required: false },
  { id: 'condizioni-particolari', label: 'Condizioni Particolari', description: 'Clausole speciali e condizioni su misura', required: false },
  { id: 'utenze-multiple', label: 'Gestione Utenze Multiple', description: 'Configurazione utenze multiple', required: false },
  { id: 'configurazione-notifiche', label: 'Configurazione Notifiche', description: 'Preferenze di comunicazione', required: false },
  { id: 'riepilogo-validazione', label: 'Riepilogo e Validazione', description: 'Controllo finale e riepilogo dati', required: true },
  { id: 'anteprima-xml', label: 'Anteprima XML e Invio', description: 'Generazione XML e invio al SII', required: true },
  { id: 'sconti', label: 'Sconti', description: 'Sconti e promozioni disponibili', required: false },
  { id: 'servizi-aggiuntivi', label: 'Servizi Aggiuntivi', description: 'Servizi opzionali e aggiuntivi', required: false },
]

interface StepStatus {
  completed: boolean
  hasErrors: boolean
  isOptional: boolean
  validationErrors?: string[]
  canProceed?: boolean
}

interface ValidationDialogProps {
  isOpen: boolean
  onClose: () => void
  onForceNext: () => void
  currentStepLabel: string
  validationErrors: string[]
  isCurrentStepOptional: boolean
}

interface WizardStepperProps {
  children: ReactNode
  onExportXML?: () => void
  getStepStatus?: (stepId: string) => StepStatus
  onValidateCurrentStep?: () => { isValid: boolean; errors: string[]; canProceed: boolean }
  className?: string
}

function ValidationDialog({ 
  isOpen, 
  onClose, 
  onForceNext, 
  currentStepLabel, 
  validationErrors, 
  isCurrentStepOptional 
}: ValidationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {isCurrentStepOptional ? 'Avviso Validazione' : 'Errori di Validazione'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                {isCurrentStepOptional 
                  ? `Il passo "${currentStepLabel}" presenta alcuni problemi ma è opzionale. Puoi procedere o correggere i problemi prima di continuare.`
                  : `Il passo "${currentStepLabel}" presenta errori che devono essere corretti prima di procedere al passo successivo.`
                }
              </p>
              
              {validationErrors.length > 0 && (
                <div>
                  <p className="font-medium text-destructive mb-2">
                    {isCurrentStepOptional ? 'Problemi rilevati:' : 'Errori da correggere:'}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-muted-foreground">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {isCurrentStepOptional && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Suggerimento:</strong> Anche se questo passo è opzionale, 
                    completarlo correttamente migliorerà la qualità del file XML generato.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Correggi Errori
          </AlertDialogCancel>
          {isCurrentStepOptional && (
            <AlertDialogAction onClick={onForceNext} className="bg-warning hover:bg-warning/90">
              Procedi Comunque
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function StepIndicator() {
  const stepper = useStepper()
  const currentStepIndex = steps.findIndex(s => s.id === stepper.current.id)
  const currentStep = steps[currentStepIndex]
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-foreground">
              {currentStep?.label}
            </h2>
            {!currentStep?.required && (
              <Badge variant="outline" className="text-xs">
                Opzionale
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {currentStep?.description}
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Passo {currentStepIndex + 1} di {steps.length}
        </Badge>
      </div>
    </div>
  )
}

function ProgressBar({ getStepStatus }: { getStepStatus?: (stepId: string) => StepStatus }) {
  const stepper = useStepper()
  const currentStepIndex = steps.findIndex(s => s.id === stepper.current.id)
  
  // Calculate detailed step analytics
  let completedSteps = 0
  let completedRequired = 0
  let completedOptional = 0
  let stepsWithErrors = 0
  let requiredTotal = 0
  let optionalTotal = 0
  let pendingRequired = 0
  let pendingOptional = 0
  let currentStepRequired = false
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const stepStatus = getStepStatus?.(step.id)
    const isCurrent = i === currentStepIndex
    
    if (step.required) {
      requiredTotal++
      if (isCurrent) currentStepRequired = true
      
      if (stepStatus?.completed) {
        completedRequired++
        completedSteps++
      } else if (!isCurrent) {
        pendingRequired++
      }
    } else {
      optionalTotal++
      if (stepStatus?.completed) {
        completedOptional++
        completedSteps++
      } else if (!isCurrent) {
        pendingOptional++
      }
    }
    
    if (stepStatus?.hasErrors) {
      stepsWithErrors++
    }
  }
  
  // Calculate progress percentages
  const completionProgress = (completedSteps / steps.length) * 100
  const requiredProgress = requiredTotal > 0 ? (completedRequired / requiredTotal) * 100 : 100
  const optionalProgress = optionalTotal > 0 ? (completedOptional / optionalTotal) * 100 : 100
  
  return (
    <div className="mb-8 space-y-4">
      {/* Mobile Compact Progress - Visible only on mobile */}
      <div className="block lg:hidden">
        <div className="mb-4">
          {/* Completion Progress Only */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Progresso Completamento
              </span>
              <span className="font-medium">{Math.round(completionProgress)}%</span>
            </div>
            <Progress value={completionProgress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {completedSteps}/{steps.length} passi completati
            </div>
          </div>
        </div>
        
        {/* Mobile Status Summary */}
        <div className="flex items-center justify-between px-3 py-2 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              {completedSteps}
            </span>
            {stepsWithErrors > 0 && (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-destructive" />
                {stepsWithErrors}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Circle className="h-3 w-3 text-muted-foreground" />
              {steps.length - completedSteps}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {pendingRequired > 0 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                {pendingRequired}R
              </Badge>
            )}
            <Badge 
              variant={completionProgress >= 50 ? "secondary" : "outline"}
              className="text-xs px-2 py-0"
            >
              {completionProgress >= 75 ? "🔥" :
               completionProgress >= 50 ? "⚡" :
               completionProgress >= 25 ? "🚀" : "📝"}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Desktop Full Progress - Hidden on mobile */}
      <div className="hidden lg:block space-y-4">
        {/* Completion Progress */}
        <div>
          <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Progresso Completamento</span>
            </div>
            <span className="font-medium">{Math.round(completionProgress)}%</span>
          </div>
          <Progress 
            value={completionProgress} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{completedSteps}/{steps.length} passi completati</span>
            <span>Lavoro completato</span>
          </div>
        </div>
        
        {/* Detailed Progress Analytics */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
          {/* Required Steps Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Obbligatori</span>
              </div>
              <span className="font-medium">{completedRequired}/{requiredTotal}</span>
            </div>
            <Progress 
              value={requiredProgress} 
              className="h-1.5"
            />
            <div className="text-xs text-muted-foreground">
              {Math.round(requiredProgress)}% completati
            </div>
          </div>
          
          {/* Optional Steps Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                <span className="text-muted-foreground">Opzionali</span>
              </div>
              <span className="font-medium">{completedOptional}/{optionalTotal}</span>
            </div>
            <Progress 
              value={optionalProgress} 
              className="h-1.5"
            />
            <div className="text-xs text-muted-foreground">
              {Math.round(optionalProgress)}% completati
            </div>
          </div>
        </div>
        
        {/* Detailed Status Breakdown */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/30">
          {/* Current Status */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">Corrente</span>
            </div>
            <div className="text-sm font-bold text-primary">
              {steps[currentStepIndex]?.label.split(' ')[0]}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentStepRequired ? 'Obbligatorio' : 'Opzionale'}
            </div>
          </div>
          
          {/* Completed Status */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-700">Completati</span>
            </div>
            <div className="text-sm font-bold text-green-700">
              {completedSteps}
            </div>
            <div className="text-xs text-muted-foreground">
              {completedRequired}R + {completedOptional}O
            </div>
          </div>
          
          {/* Remaining Status */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Circle className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Rimanenti</span>
            </div>
            <div className="text-sm font-bold text-muted-foreground">
              {steps.length - completedSteps - 1}
            </div>
            <div className="text-xs text-muted-foreground">
              {pendingRequired}R + {pendingOptional}O
            </div>
          </div>
        </div>
        
        {/* Status Summary with Enhanced Metrics */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-muted-foreground">{completedSteps} Completati</span>
            </div>
            {stepsWithErrors > 0 && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-destructive" />
                <span className="text-muted-foreground">{stepsWithErrors} Con errori</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Circle className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{steps.length - completedSteps} Rimanenti</span>
            </div>
          </div>
          
          {/* Enhanced Status Badge with Progress Insight */}
          <div className="flex items-center gap-2">
            {/* Critical Steps Indicator */}
            {pendingRequired > 0 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                {pendingRequired}R mancanti
              </Badge>
            )}
            
            {/* Overall Status Badge */}
            <Badge 
              variant={completionProgress === 100 ? "default" : completionProgress >= 50 ? "secondary" : "outline"}
              className="text-xs"
            >
              {completionProgress === 100 ? "🎉 Completato" : 
               completionProgress >= 75 ? "🔥 Quasi finito" :
               completionProgress >= 50 ? "⚡ In corso" :
               completionProgress >= 25 ? "🚀 Avviato" : "📝 Iniziato"}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Tablet Progress - Medium screens only */}
      <div className="hidden md:block lg:hidden">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Completion Progress Only */}
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completamento
              </span>
              <span className="font-medium">{Math.round(completionProgress)}%</span>
            </div>
            <Progress value={completionProgress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {completedSteps}/{steps.length} passi completati
            </div>
          </div>
          
          {/* Status Summary */}
          <div className="flex flex-col justify-center">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-medium text-primary">{steps[currentStepIndex]?.label.split(' ')[0]}</div>
                <div className="text-muted-foreground">Corrente</div>
              </div>
              <div>
                <div className="font-medium text-green-700">{completedSteps}</div>
                <div className="text-muted-foreground">Completati</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">{steps.length - completedSteps}</div>
                <div className="text-muted-foreground">Rimanenti</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-3">
              {pendingRequired > 0 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {pendingRequired}R mancanti
                </Badge>
              )}
              <Badge 
                variant={completionProgress >= 50 ? "secondary" : "outline"}
                className="text-xs"
              >
                {completionProgress >= 75 ? "🔥 Quasi finito" :
                 completionProgress >= 50 ? "⚡ In corso" :
                 completionProgress >= 25 ? "🚀 Avviato" : "📝 Iniziato"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepNavigationList({ getStepStatus }: { getStepStatus?: (stepId: string) => StepStatus }) {
  const stepper = useStepper()
  const currentStepIndex = steps.findIndex(s => s.id === stepper.current.id)
  
  const handleStepClick = (stepId: string, targetIndex: number) => {
    // Allow navigation to previous steps or completed steps
    if (targetIndex <= currentStepIndex) {
      stepper.goTo(stepId)
      return
    }
    
    // For future steps, check if all previous required steps are completed
    const canNavigateToStep = () => {
      for (let i = currentStepIndex; i < targetIndex; i++) {
        const step = steps[i]
        if (step.required) {
          const status = getStepStatus?.(step.id)
          if (!status?.completed && !status?.canProceed) {
            return false
          }
        }
      }
      return true
    }
    
    if (canNavigateToStep()) {
      stepper.goTo(stepId)
    }
  }
  
  return (
    <div className="hidden lg:block">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Passi del Wizard
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {steps.map((step, index) => {
          const isCurrent = step.id === stepper.current.id
          const isPast = index < currentStepIndex
          const status = getStepStatus?.(step.id)
          const isAccessible = index <= currentStepIndex || status?.completed
          
          // Check if step can be accessed (all previous required steps completed)
          let canAccess = isAccessible
          if (index > currentStepIndex) {
            canAccess = true
            for (let i = currentStepIndex; i < index; i++) {
              const prevStep = steps[i]
              if (prevStep.required) {
                const prevStatus = getStepStatus?.(prevStep.id)
                if (!prevStatus?.completed && !prevStatus?.canProceed) {
                  canAccess = false
                  break
                }
              }
            }
          }
          
          return (
            <button
              key={step.id}
              onClick={() => canAccess ? handleStepClick(step.id, index) : undefined}
              disabled={!canAccess}
              className={`w-full text-left p-2 rounded-md text-xs transition-colors ${
                isCurrent 
                  ? 'bg-primary text-primary-foreground' 
                  : isPast 
                    ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                    : canAccess
                      ? 'text-muted-foreground hover:bg-muted'
                      : 'text-muted-foreground/50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                {status?.hasErrors ? (
                  <AlertCircle className="h-3 w-3 text-destructive" />
                ) : status?.completed ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : isCurrent ? (
                  <Clock className="h-3 w-3 text-primary" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="truncate">{step.label}</span>
                    {!step.required && (
                      <span className="text-[10px] opacity-60">(opz)</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function NavigationControls({ 
  onExportXML, 
  onValidateCurrentStep 
}: { 
  onExportXML?: () => void
  getStepStatus?: (stepId: string) => StepStatus
  onValidateCurrentStep?: () => { isValid: boolean; errors: string[]; canProceed: boolean }
}) {
  const stepper = useStepper()
  const currentStepIndex = steps.findIndex(s => s.id === stepper.current.id)
  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1
  
  const [showValidationDialog, setShowValidationDialog] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  const handleNext = () => {
    // Get current step validation status
    const validation = onValidateCurrentStep?.() || { isValid: true, errors: [], canProceed: true }
    
    // If step is valid or can proceed, go to next step
    if (validation.isValid || validation.canProceed) {
      stepper.next()
      return
    }
    
    // If step has errors, show validation dialog
    if (!validation.isValid && validation.errors.length > 0) {
      setValidationErrors(validation.errors)
      setShowValidationDialog(true)
      return
    }
    
    // Default: proceed (for steps without validation)
    stepper.next()
  }
  
  const handleForceNext = () => {
    setShowValidationDialog(false)
    stepper.next()
  }
  
  const canProceedToNext = () => {
    if (isLastStep) return false
    
    // Check if current step allows proceeding
    const validation = onValidateCurrentStep?.() || { isValid: true, errors: [], canProceed: true }
    return validation.canProceed || !currentStep.required
  }
  
  return (
    <>
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => stepper.prev()}
          disabled={isFirstStep}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Indietro
        </Button>
        
        <div className="flex items-center gap-4">
          {/* Indicatore progresso mobile */}
          <div className="lg:hidden">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {currentStepIndex + 1}/{steps.length}
            </Badge>
          </div>
          
          {/* Debug controls - solo in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="hidden md:flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => stepper.goTo('anagrafica-ditta')}
                className="text-xs"
              >
                Primo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => stepper.goTo('servizi-aggiuntivi')}
                className="text-xs"
              >
                Ultimo
              </Button>
            </div>
          )}
        </div>
        
        {isLastStep ? (
          <Button 
            onClick={onExportXML}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Genera e Scarica XML
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceedToNext()}
            className="flex items-center gap-2"
          >
            Avanti
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Validation Dialog */}
      <ValidationDialog
        isOpen={showValidationDialog}
        onClose={() => setShowValidationDialog(false)}
        onForceNext={handleForceNext}
        currentStepLabel={currentStep?.label || ''}
        validationErrors={validationErrors}
        isCurrentStepOptional={!currentStep?.required}
      />
    </>
  )
}

function WizardStepperContent({ 
  children, 
  onExportXML, 
  getStepStatus,
  onValidateCurrentStep 
}: Omit<WizardStepperProps, 'className'>) {
  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Sidebar con navigazione step */}
      <div className="lg:col-span-1">
        <StepNavigationList getStepStatus={getStepStatus} />
      </div>
      
      {/* Contenuto principale */}
      <div className="lg:col-span-3">
        <Card>
          <CardContent className="p-6">
            {/* Barra di progresso */}
            <ProgressBar getStepStatus={getStepStatus} />
            
            {/* Indicatore step corrente */}
            <StepIndicator />
            
            {/* Contenuto dello step */}
            <div className="min-h-[400px] py-4">
              {children}
            </div>
            
            {/* Controlli di navigazione */}
            <NavigationControls 
              onExportXML={onExportXML}
              onValidateCurrentStep={onValidateCurrentStep}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Componente Wizard Stepper per il generatore XML SII
 * 
 * Gestisce la navigazione tra i 18 step del wizard con:
 * - Etichette in italiano
 * - Barra di progresso con completamento reale
 * - Navigazione laterale con controlli di accesso
 * - Indicatori di stato per ogni step
 * - Controlli di navigazione con validazione
 * - Dialog di validazione per errori
 * - Pulsante esportazione XML nell'ultimo step
 * - Supporto per step opzionali
 */
export function WizardStepper({ 
  children, 
  onExportXML, 
  getStepStatus,
  onValidateCurrentStep,
  className 
}: WizardStepperProps) {
  return (
    <div className={className}>
      <Scoped initialStep="anagrafica-ditta">
        <WizardStepperContent 
          onExportXML={onExportXML}
          getStepStatus={getStepStatus}
          onValidateCurrentStep={onValidateCurrentStep}
        >
          {children}
        </WizardStepperContent>
      </Scoped>
    </div>
  )
}

// Export anche del hook per uso esterno
export { useStepper }

// Export della lista step per riferimento
export { steps as wizardSteps }

// Tipo per lo stato degli step
export type { StepStatus } 