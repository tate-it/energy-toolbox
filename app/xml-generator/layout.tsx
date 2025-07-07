import type { Metadata } from "next"
import { loadSearchParams } from "@/lib/xml-generator/nuqs-parsers"
import { StepperProvider } from "@/providers/stepper-provider"

export const metadata: Metadata = {
  title: "Generatore XML Offerte SII",
  description: "Crea e valida file XML per offerte del mercato energetico e gas conformi alle specifiche SII",
}

export default async function XmlGeneratorLayout({
  children,
  searchParams,
}: {
  children: React.ReactNode
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { currentStep } = await loadSearchParams(searchParams)
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Generatore XML Offerte SII</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea file XML conformi per offerte del mercato energetico e gas
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <StepperProvider initialStep={currentStep}>
          {children}
        </StepperProvider>
      </main>
    </div>
  )
} 