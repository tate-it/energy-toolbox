'use client'

import { Bug, Copy, X } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFormStates } from '@/hooks/use-form-states'
import { cn } from '@/lib/utils'
import { currentStepParser } from '@/lib/xml-generator/nuqs-parsers'

export function UrlStateDebugger() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [formStates] = useFormStates()
  const [currentStep] = useQueryState('currentStep', currentStepParser)

  // Copy state to clipboard
  const copyToClipboard = () => {
    const urlState = {
      currentStep,
      ...formStates,
    }
    navigator.clipboard.writeText(JSON.stringify(urlState, null, 2))
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'd') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) {
    return (
      <Button
        className="fixed right-4 bottom-4 z-50 shadow-lg"
        onClick={() => setIsOpen(true)}
        size="icon"
        title="URL State Debugger (Cmd+Shift+D)"
        variant="outline"
      >
        <Bug className="h-5 w-5" />
      </Button>
    )
  }

  const urlState = {
    currentStep,
    ...formStates,
  }

  return (
    <Card className="fixed right-4 bottom-4 z-50 max-h-[80vh] w-[600px] overflow-hidden shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bug className="h-4 w-4" />
          URL State Debugger
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            className={cn(isCopied && 'text-green-600')}
            onClick={copyToClipboard}
            size="icon"
            title="Copy State"
            variant="ghost"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setIsOpen(false)}
            size="icon"
            title="Close (Cmd+Shift+D)"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="max-h-[calc(80vh-80px)] overflow-auto p-4">
        <pre className="whitespace-pre-wrap break-words font-mono text-xs">
          <code className="language-json">
            {JSON.stringify(urlState, null, 2)}
          </code>
        </pre>
      </CardContent>
    </Card>
  )
}
