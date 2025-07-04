import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SII XML Energy Offer Generator",
  description: "Create and validate XML files for energy and gas market offers compliant with SII specifications",
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
          <h1 className="text-2xl font-bold">SII XML Energy Offer Generator</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create compliant XML files for energy and gas market offers
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
} 