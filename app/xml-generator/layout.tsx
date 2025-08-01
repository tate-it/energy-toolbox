import type { Metadata } from 'next'
import { StepperControls } from '@/components/stepper/stepper-controls'
import { StepperNavigation } from '@/components/stepper/stepper-navigation'
import { UrlStateDebugger } from '@/components/xml-generator/url-state-debugger'
import { FormProvider } from '@/providers/form-provider'
import { StepperProvider } from '@/providers/stepper-provider'

export const metadata: Metadata = {
  title: 'Generatore XML Offerte SII',
  description:
    'Crea e valida file XML per offerte del mercato energetico e gas conformi alle specifiche SII',
}

export default function XmlGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="font-bold text-2xl">Generatore XML Offerte SII</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Crea file XML conformi per offerte del mercato energetico e gas
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <StepperProvider className="flex flex-col gap-4" variant="vertical">
          <FormProvider>
            <div className="flex gap-6">
              <StepperNavigation />
              {children}
            </div>
            <StepperControls />
          </FormProvider>
        </StepperProvider>
      </main>
      {process.env.NODE_ENV === 'development' && <UrlStateDebugger />}
    </div>
  )
}
