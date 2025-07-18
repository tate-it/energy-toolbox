'use client'

import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'

const { Stepper, useStepper } = xmlFormStepper

function StepperControlsContent() {
  const { isFirst, isLast, prev } = useStepper()

  const handlePrevious = () => {
    // Just use the built-in prev method, the currentStep will be synced automatically
    prev()
  }

  return (
    <Stepper.Controls>
      {!isFirst && (
        <Button disabled={isFirst} onClick={handlePrevious} variant="secondary">
          Precedente
        </Button>
      )}
      <Button type="submit">{isLast ? 'Reset' : 'Successivo'}</Button>
    </Stepper.Controls>
  )
}

function StepperControlsSkeleton() {
  return (
    <div className="flex justify-between gap-2">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  )
}

export function StepperControls() {
  return (
    <Suspense fallback={<StepperControlsSkeleton />}>
      <StepperControlsContent />
    </Suspense>
  )
}
