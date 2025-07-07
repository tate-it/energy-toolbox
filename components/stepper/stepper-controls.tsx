"use client"

import { Button } from "@/components/ui/button"
import { xmlFormStepper } from "@/lib/xml-generator/stepperize-config"
import { createFormStateSchema } from "@/providers/form-provider"
import { useQueryStates } from "nuqs"
import { useFormContext } from "react-hook-form"

const { Stepper, useStepper } = xmlFormStepper

export function StepperControls() {
  const { current, isFirst, isLast, reset, beforeNext, prev } = useStepper()
  const form = useFormContext()
  const [, setFormStates] = useQueryStates(createFormStateSchema())

  const handlePrevious = () => {
    // Just use the built-in prev method, the currentStep will be synced automatically
    prev();
  }

  const handleNext = async () => {
    const valid = await form.trigger();
    if (!valid) return false;
    
    // Save current step data
    const currentValues = form.getValues();
    await setFormStates({
      [current.id]: currentValues,
    });
    
    return true;
  }
    return <Stepper.Controls>
    {!isFirst && (
      <Button
        variant="secondary"
        onClick={handlePrevious}
        disabled={isFirst}
      >
        Previous
      </Button>
    )}
    <Button
      type="submit"
      onClick={() => {
        if (isLast) {
          return reset();
        }
        beforeNext(handleNext);
      }}
    >
      {isLast ? "Reset" : "Next"}
    </Button>
  </Stepper.Controls>
}