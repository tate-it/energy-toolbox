"use client";

import { useEffect, Suspense } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryState, parseAsString } from "nuqs";
import { xmlFormStepper } from "@/lib/xml-generator/stepperize-config";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormStates } from "@/hooks/use-form-states";

const { useStepper } = xmlFormStepper

function StepperWithFormContent() {
  const methods = useStepper()
  const [formStates] = useFormStates()
  const [currentStep, setCurrentStep] = useQueryState(
    'currentStep', 
    parseAsString.withDefault('basicInfo')
  );

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(methods.current.schema),
    // Initialize form with data from URL state for current step
    defaultValues: formStates[methods.current.id] || {},
  });

  // Update form values when step changes
  useEffect(() => {
    const currentStepData = formStates[methods.current.id] || {};
    form.reset(currentStepData);
  }, [methods, formStates, form]);

  // Sync URL currentStep with stepper state
  useEffect(() => {
    if (methods.current.id !== currentStep) {
      setCurrentStep(methods.current.id);
    }
  }, [methods, currentStep, setCurrentStep]);


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
  );
}

function StepperWithFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  );
};
