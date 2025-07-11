'use client'

import { parseAsString, useQueryState } from 'nuqs'
import { Suspense, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Skeleton } from '@/components/ui/skeleton'
import { useFormStates } from '@/hooks/use-form-states'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'

const { useStepper } = xmlFormStepper

function StepperWithFormContent() {
  const methods = useStepper()
  const [formStates] = useFormStates()
  const [currentStep, setCurrentStep] = useQueryState(
    'currentStep',
    parseAsString.withDefault('basicInfo'),
  )

  const form = useFormContext()

  // Update form values when step changes
  useEffect(() => {
    const currentStepData = formStates[methods.current.id] ?? {}
    form.reset(currentStepData)
  }, [methods, formStates, form])

  // Sync URL currentStep with stepper state
  useEffect(() => {
    if (methods.current.id !== currentStep) {
      setCurrentStep(methods.current.id)
    }
  }, [methods, currentStep, setCurrentStep])

  return (
    <>
      {methods.switch({
        basicInfo: ({ Component }) => <Component />,
        offerDetails: ({ Component }) => <Component />,
        activationContacts: ({ Component }) => <Component />,
        pricingConfig: ({ Component }) => <Component />,
        companyComponents: ({ Component }) => <Component />,
        paymentConditions: ({ Component }) => <Component />,
        additionalFeatures: ({ Component }) => <Component />,
        validityReview: ({ Component }) => <Component />,
      })}
    </>
  )
}

function StepperWithFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  )
}

export function StepperWithForm() {
  return (
    <Suspense fallback={<StepperWithFormSkeleton />}>
      <StepperWithFormContent />
    </Suspense>
  )
}
