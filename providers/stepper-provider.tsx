'use client'

import { xmlFormStepper } from "@/lib/xml-generator/stepperize-config"
import { Step } from "@/lib/xml-generator/stepperize/config"

export function StepperProvider({ initialStep, children }: { initialStep: Step, children: React.ReactNode }) {
  const { Stepper } = xmlFormStepper
  return <Stepper.Provider initialStep={initialStep}>
    {children}
  </Stepper.Provider>
}