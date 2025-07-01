'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { defineStepper } from '@stepperize/react'
import { ChevronLeft, ChevronRight, FileDown, Home } from 'lucide-react'
import Link from 'next/link'

// Definizione degli step del wizard
const { Scoped, useStepper } = defineStepper(
  { id: 'identificativi', label: 'Identificativi Offerta' },
  { id: 'dettaglio', label: 'Dettaglio Offerta' },
  { id: 'modalita-attivazione', label: 'Modalità Attivazione' },
  { id: 'contatti', label: 'Contatti' },
  { id: 'riferimenti-prezzo', label: 'Riferimenti Prezzo Energia' },
  { id: 'validita', label: 'Validità Offerta' },
  { id: 'caratteristiche', label: 'Caratteristiche Offerta' },
  { id: 'offerta-dual', label: 'Offerta DUAL' },
  { id: 'metodi-pagamento', label: 'Metodi di Pagamento' },
  { id: 'componenti-regolate', label: 'Componenti Regolate' },
  { id: 'tipo-prezzo', label: 'Tipo Prezzo' },
  { id: 'fasce-orarie', label: 'Fasce Orarie Settimanali' },
  { id: 'dispacciamento', label: 'Dispacciamento' },
  { id: 'componente-impresa', label: 'Componente Impresa' },
  { id: 'condizioni-contrattuali', label: 'Condizioni Contrattuali' },
  { id: 'zone-offerta', label: 'Zone Offerta' },
  { id: 'sconti', label: 'Sconti' },
  { id: 'servizi-aggiuntivi', label: 'Servizi Aggiuntivi' },
)

const steps = [
  { id: 'identificativi', label: 'Identificativi Offerta' },
  { id: 'dettaglio', label: 'Dettaglio Offerta' },
  { id: 'modalita-attivazione', label: 'Modalità Attivazione' },
  { id: 'contatti', label: 'Contatti' },
  { id: 'riferimenti-prezzo', label: 'Riferimenti Prezzo Energia' },
  { id: 'validita', label: 'Validità Offerta' },
  { id: 'caratteristiche', label: 'Caratteristiche Offerta' },
  { id: 'offerta-dual', label: 'Offerta DUAL' },
  { id: 'metodi-pagamento', label: 'Metodi di Pagamento' },
  { id: 'componenti-regolate', label: 'Componenti Regolate' },
  { id: 'tipo-prezzo', label: 'Tipo Prezzo' },
  { id: 'fasce-orarie', label: 'Fasce Orarie Settimanali' },
  { id: 'dispacciamento', label: 'Dispacciamento' },
  { id: 'componente-impresa', label: 'Componente Impresa' },
  { id: 'condizioni-contrattuali', label: 'Condizioni Contrattuali' },
  { id: 'zone-offerta', label: 'Zone Offerta' },
  { id: 'sconti', label: 'Sconti' },
  { id: 'servizi-aggiuntivi', label: 'Servizi Aggiuntivi' },
]

function StepperControls() {
  const stepper = useStepper()
  const currentStepIndex = steps.findIndex(s => s.id === stepper.current.id)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1
  
  return (
    <div className="flex justify-between items-center mt-8">
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
        <span className="text-sm text-muted-foreground">
          Passo {currentStepIndex + 1} di {steps.length}
        </span>
        
        {/* Debug buttons - rimuovere in produzione */}
        {process.env.NODE_ENV === 'development' && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => stepper.goTo('identificativi')}
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
        <Button className="flex items-center gap-2">
          <FileDown className="h-4 w-4" />
          Scarica XML
        </Button>
      ) : (
        <Button
          onClick={() => stepper.next()}
          className="flex items-center gap-2"
        >
          Avanti
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

function StepContent() {
  const stepper = useStepper()
  const currentStep = steps.find(s => s.id === stepper.current.id)
  
  return (
    <div className="min-h-[400px] py-8">
      {/* Contenuto temporaneo per ogni step */}
      <div className="text-center text-muted-foreground">
        <p className="text-lg mb-4">{currentStep?.label}</p>
        <p className="text-sm">Il contenuto di questo step verrà implementato nelle prossime attività.</p>
      </div>
    </div>
  )
}

function WizardContent() {
  const stepper = useStepper()
  const currentStepIndex = steps.findIndex(s => s.id === stepper.current.id)
  const currentStep = steps[currentStepIndex]
  
  return (
    <>
      {/* Progress bar */}
      <div className="mb-8">
        <Progress 
          value={((currentStepIndex + 1) / steps.length) * 100} 
          className="h-2"
        />
      </div>
      
      {/* Indicatore dello step corrente */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {currentStep?.label}
        </h2>
      </div>
      
      {/* Contenuto dello step */}
      <StepContent />
      
      {/* Controlli di navigazione */}
      <StepperControls />
    </>
  )
}

export default function SIIWizardPage() {
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
        
        {/* Wizard principale */}
        <Card>
          <CardContent className="pt-6">
            <Scoped initialStep="identificativi">
              <WizardContent />
            </Scoped>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 