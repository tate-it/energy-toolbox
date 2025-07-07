"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryStates, useQueryState, parseAsString } from "nuqs";
import { parseAsFormData } from "@/lib/xml-generator/nuqs-parsers";
import { xmlFormStepper } from "@/lib/xml-generator/stepperize-config";

const { useStepper } = xmlFormStepper;

// Create a schema for managing form state for all steps
const createFormStateSchema = () => {
  const schema: Record<string, typeof parseAsFormData> = {};
  
  // Add a query state for each step
  xmlFormStepper.steps.forEach((step) => {
    schema[step.id] = parseAsFormData.withDefault({});
  });
  
  return schema;
}

export function StepperWithForm() {
  const methods = useStepper();
  
  // Use nuqs to manage form state for all steps
  const [formStates] = useQueryStates(createFormStateSchema())
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
};
