'use client'

import { parseAsString, useQueryState } from 'nuqs'
import { Suspense } from 'react'
import { useFormContext } from 'react-hook-form'
import { Skeleton } from '@/components/ui/skeleton'
import { useFormStates } from '@/hooks/use-form-states'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'

const { Stepper, useStepper } = xmlFormStepper

function StepperNavigationContent() {
  const [, setFormStates] = useFormStates()
  const [, setCurrentStep] = useQueryState(
    'currentStep',
    parseAsString.withDefault('basicInfo'),
  )
  const form = useFormContext()
  const { current, all, goTo } = useStepper()

  const handleStepChange = async (stepId: typeof current.id) => {
    const valid = await form.trigger()
    if (!valid) {
      return
    }

    // Save current step data before navigating
    const currentValues = form.getValues()
    await setFormStates({
      [current.id]: currentValues,
    })

    // Update current step in URL
    setCurrentStep(stepId)
    goTo(stepId)
  }

  return (
    <Stepper.Navigation>
      {all.map((step) => (
        <Stepper.Step
          key={step.id}
          of={step.id}
          onClick={() => handleStepChange(step.id)}
          type={step.id === current.id ? 'submit' : 'button'}
        >
          <Stepper.Title>{step.title}</Stepper.Title>
        </Stepper.Step>
      ))}
    </Stepper.Navigation>
  )
}

function StepperNavigationSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="flex items-center gap-3 p-2" key={i}>
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

export function StepperNavigation() {
  return (
    <Suspense fallback={<StepperNavigationSkeleton />}>
      <StepperNavigationContent />
    </Suspense>
  )
}
