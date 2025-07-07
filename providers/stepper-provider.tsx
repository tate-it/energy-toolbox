'use client'

import { StepperVariant } from "@/components/stepper"
import { xmlFormStepper } from "@/lib/xml-generator/stepperize-config"
import { Step } from "@/lib/xml-generator/stepperize/config"

export function StepperProvider({ initialStep, children, variant, className }: { initialStep: Step, children: React.ReactNode, variant: StepperVariant, className?: string }) {
  const { Stepper } = xmlFormStepper
  return <Stepper.Provider initialStep={initialStep} variant={variant} className={className}>
    {children}
  </Stepper.Provider>
}