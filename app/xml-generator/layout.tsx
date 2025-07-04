import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Generatore XML Offerte SII",
  description: "Crea e valida file XML per offerte del mercato energetico e gas conformi alle specifiche SII",
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
          <h1 className="text-2xl font-bold">Generatore XML Offerte SII</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea file XML conformi per offerte del mercato energetico e gas
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
} 