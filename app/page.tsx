import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-center sm:text-left">
          Energy Toolbox
        </h1>
        
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generatore XML Offerte SII
            </CardTitle>
            <CardDescription>
              Crea file XML conformi alle specifiche del Sistema Informativo Integrato (SII) 
              per le offerte del mercato elettrico e gas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/sii-wizard">
                Inizia la creazione dell&apos;offerta
              </Link>
            </Button>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
