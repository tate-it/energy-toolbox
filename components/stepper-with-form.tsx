"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryStates, useQueryState, parseAsString } from "nuqs";
import { parseAsFormData } from "@/lib/xml-generator/nuqs-parsers";
import { xmlFormStepper } from "@/lib/xml-generator/stepperize-config";

const { Stepper, useStepper } = xmlFormStepper;

// Create a schema for managing form state for all steps
const createFormStateSchema = () => {
  const schema: Record<string, typeof parseAsFormData> = {};
  
  // Add a query state for each step
  xmlFormStepper.steps.forEach((step) => {
    schema[step.id] = parseAsFormData.withDefault({});
  });
  
  return schema;
};

export function StepperWithForm() {
  // Track current step in URL for better link sharing
  const [currentStep, setCurrentStep] = useQueryState(
    'currentStep', 
    parseAsString.withDefault('basicInfo')
  );

  return <FormStepperComponent currentStep={currentStep} setCurrentStep={setCurrentStep} /> 
}

const FormStepperComponent = ({ 
  currentStep, 
  setCurrentStep 
}: { 
  currentStep: string; 
  setCurrentStep: (step: string) => void; 
}) => {
  const methods = useStepper();
  
  // Use nuqs to manage form state for all steps
  const [formStates, setFormStates] = useQueryStates(createFormStateSchema());

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

  const onSubmit = (values: z.infer<typeof methods.current.schema>) => {
    // Save form data to URL state for current step
    setFormStates({
      [methods.current.id]: values,
    });
    
    alert(
      `Form values for step ${methods.current.id}: ${JSON.stringify(values)}`
    );
  };

  // Save form data when navigating between steps
  const handleStepChange = async (stepId: typeof methods.current.id) => {
    const valid = await form.trigger();
    if (!valid) return;
    
    // Save current step data before navigating
    const currentValues = form.getValues();
    await setFormStates({
      [methods.current.id]: currentValues,
    });
    
    // Update current step in URL
    setCurrentStep(stepId);
    methods.goTo(stepId);
  };

  const handleNext = async () => {
    const valid = await form.trigger();
    if (!valid) return false;
    
    // Save current step data
    const currentValues = form.getValues();
    await setFormStates({
      [methods.current.id]: currentValues,
    });
    
    return true;
  };

  const handlePrevious = () => {
    // Just use the built-in prev method, the currentStep will be synced automatically
    methods.prev();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Stepper.Navigation>
          {methods.all.map((step) => (
            <Stepper.Step
              key={step.id}
              of={step.id}
              type={step.id === methods.current.id ? "submit" : "button"}
              onClick={() => handleStepChange(step.id)}
            >
              <Stepper.Title>{step.title}</Stepper.Title>
            </Stepper.Step>
          ))}
        </Stepper.Navigation>
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
        <Stepper.Controls>
          {!methods.isFirst && (
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={methods.isFirst}
            >
              Previous
            </Button>
          )}
          <Button
            type="submit"
            onClick={() => {
              if (methods.isLast) {
                return methods.reset();
              }
              methods.beforeNext(handleNext);
            }}
          >
            {methods.isLast ? "Reset" : "Next"}
          </Button>
        </Stepper.Controls>
      </form>
    </Form>
  );
};
