export default function XmlGeneratorPage() {
  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold">Generate SII Compliant XML Offers</h2>
        <p className="text-muted-foreground">
          Use this tool to create XML files for energy and gas market offers that comply with 
          the SII (Sistema Informativo Integrato) specification version 4.5.
        </p>
      </div>
      
      {/* Multi-step form will be integrated here */}
      <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          Multi-step form component will be integrated here
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          (To be implemented with Stepperize)
        </p>
      </div>
    </div>
  )
} 