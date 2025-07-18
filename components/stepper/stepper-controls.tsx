'use client'

import { Suspense } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFormStates } from '@/hooks/use-form-states'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'

const { Stepper, useStepper } = xmlFormStepper

function StepperControlsContent() {
  const { current, isFirst, isLast, reset, beforeNext, prev } = useStepper()
  const form = useFormContext()
  const [, setFormStates] = useFormStates()

  const handlePrevious = () => {
    // Just use the built-in prev method, the currentStep will be synced automatically
    prev()
  }

  const handleNext = async () => {
    const valid = await form.trigger()
    console.log('stepper-controls', 'valid', valid, 'step', current.id)
    if (!valid) {
      return false
    }

    // Save current step data
    const currentValues = form.getValues()
    setFormStates({
      [current.id]: currentValues,
    })

    return true
  }
  return (
    <Stepper.Controls>
      {!isFirst && (
        <Button disabled={isFirst} onClick={handlePrevious} variant="secondary">
          Precedente
        </Button>
      )}
      <Button
        onClick={() => {
          if (isLast) {
            return reset()
          }
          beforeNext(handleNext)
        }}
        type="submit"
      >
        {isLast ? 'Reset' : 'Successivo'}
      </Button>
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
