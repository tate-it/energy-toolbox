"use client"

import { useFormContext } from "react-hook-form"
import { xmlFormStepper } from "@/lib/xml-generator/stepperize-config"
import { parseAsString, useQueryState, useQueryStates } from "nuqs"
import { createFormStateSchema } from "@/providers/form-provider"

const { Stepper, useStepper } = xmlFormStepper

export function StepperNavigation() {
    const [, setFormStates] = useQueryStates(createFormStateSchema())
    const [, setCurrentStep] = useQueryState(
        'currentStep', 
        parseAsString.withDefault('basicInfo')
      )
    const form = useFormContext()
    const { current, all, goTo } = useStepper()

    const handleStepChange = async (stepId: typeof current.id) => {
        const valid = await form.trigger();
        if (!valid) return;
        
        // Save current step data before navigating
        const currentValues = form.getValues();
        await setFormStates({
          [current.id]: currentValues,
        });
        
        // Update current step in URL
        setCurrentStep(stepId);
        goTo(stepId);
      }

  return <Stepper.Navigation>
  {all.map((step) => (
    <Stepper.Step
      key={step.id}
      of={step.id}
      type={step.id === current.id ? "submit" : "button"}
      onClick={() => handleStepChange(step.id)}
    >
      <Stepper.Title>{step.title}</Stepper.Title>
    </Stepper.Step>
  ))}
</Stepper.Navigation>
}