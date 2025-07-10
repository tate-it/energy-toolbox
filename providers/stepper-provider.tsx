'use client'

import type { StepperVariant } from '@/components/stepper'
import { currentStepParser } from '@/lib/xml-generator/nuqs-parsers'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'
import { useQueryState } from 'nuqs'

export function StepperProvider({
  children,
  variant,
  className,
}: {
  children: React.ReactNode
  variant: StepperVariant
  className?: string
}) {
  const { Stepper } = xmlFormStepper
  const [initialStep] = useQueryState('currentStep', currentStepParser)

  return (
    <Stepper.Provider
      className={className}
      initialStep={initialStep}
      variant={variant}
    >
      {children}
    </Stepper.Provider>
  )
}
