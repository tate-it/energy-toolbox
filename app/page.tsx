import { FileCode2, Zap } from 'lucide-react'
import Link from 'next/link'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const tools = [
  {
    id: 'xml-generator',
    title: 'Generatore XML SII',
    description: 'Crea file XML per offerte energetiche',
    icon: FileCode2,
    href: '/xml-generator',
    available: true,
  },
  // Add more tools here as they become available
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="font-bold text-3xl">Energy Toolbox</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              className={tool.available ? '' : 'pointer-events-none opacity-50'}
              href={tool.available ? tool.href : '#'}
              key={tool.id}
            >
              <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <tool.icon className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle>{tool.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground text-sm">
            Energy Toolbox - Strumenti per il mercato energetico
          </p>
        </div>
      </footer>
    </div>
  )
}
