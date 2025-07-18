'use client'

import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'

const { Stepper, useStepper } = xmlFormStepper

function StepperNavigationContent() {
  const { all } = useStepper()

  return (
    <Stepper.Navigation>
      {all.map((step) => (
        <Stepper.Step key={step.id} of={step.id}>
          <Stepper.Title>{step.title}</Stepper.Title>
        </Stepper.Step>
      ))}
    </Stepper.Navigation>
  )
}

function StepperNavigationSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }, (_, i) => `skeleton-step-${i}`).map((key) => (
        <div className="flex items-center gap-3 p-2" key={key}>
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
