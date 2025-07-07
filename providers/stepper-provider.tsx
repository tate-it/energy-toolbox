'use client'

import type { StepperVariant } from '@/components/stepper'
import type { Step } from '@/lib/xml-generator/stepperize/config'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'

export function StepperProvider({
  initialStep,
  children,
  variant,
  className,
}: {
  initialStep: Step
  children: React.ReactNode
  variant: StepperVariant
  className?: string
}) {
  const { Stepper } = xmlFormStepper
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
