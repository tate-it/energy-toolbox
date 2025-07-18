'use client'

import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { useFormStates } from '@/hooks/use-form-states'
import { createContextualResolver } from '@/lib/xml-generator/resolver'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'

const { useStepper } = xmlFormStepper

const FormProviderSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

// Default values for each step to prevent uncontrolled to controlled input errors
const getDefaultValues = (stepId: string) => {
  switch (stepId) {
    case 'basicInfo':
      return {
        pivaUtente: '',
        codOfferta: '',
      }
    case 'offerDetails':
      return {
        marketType: '',
        singleOffer: '',
        clientType: '',
        residentialStatus: '',
        offerType: '',
        contractActivationTypes: [],
        offerName: '',
        offerDescription: '',
        duration: '',
        guarantees: '',
      }
    case 'activationContacts':
      return {
        activationMethods: [],
        activationDescription: '',
        phone: '',
        vendorWebsite: '',
        offerUrl: '',
      }
    case 'pricingConfig':
      return {
        energyPriceIndex: '',
        alternativeIndexDescription: '',
        timeBandConfiguration: '',
        weeklyTimeBands: {},
        dispatching: [],
      }
    case 'companyComponents':
      return {
        regulatedComponents: [],
        companyComponents: [],
      }
    case 'paymentConditions':
      return {
        paymentMethods: [],
        paymentDescription: '',
        directDebitDetails: '',
        additionalPaymentInfo: '',
      }
    case 'additionalFeatures':
      return {
        additionalServices: [],
        serviceDescription: '',
        promotionalOffers: [],
        offerDescription: '',
      }
    case 'validityReview':
      return {
        validityStartDate: '',
        validityEndDate: '',
        reviewNotes: '',
      }
    default:
      return {}
  }
}

export function FormProviderComponent({
  children,
}: {
  children: React.ReactNode
}) {
  const [formStates, setFormStates] = useFormStates()
  const methods = useStepper()

  const onSubmit = (values: z.infer<typeof methods.current.schema>) => {
    // Save form data to URL state for current step
    setFormStates({
      [methods.current.id]: values,
    })
  }

  // Convert formStates to the expected format, handling null values
  const cleanFormStates = Object.fromEntries(
    Object.entries(formStates).map(([key, value]) => [
      key,
      value === null ? undefined : value,
    ]),
  )

  const form = useForm({
    mode: 'onBlur',
    resolver: createContextualResolver(methods.current.schema, cleanFormStates),
    // Initialize form with data from URL state for current step, merged with proper defaults
    defaultValues: {
      ...getDefaultValues(methods.current.id),
      // ...(formStates[methods.current.id] || {}),
    },
  })

  console.log(
    'form',
    methods.current.id,
    'marketType',
    form.getFieldState('marketType'),
  )

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {children}
      </form>
    </Form>
  )
}

export function FormProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<FormProviderSkeleton />}>
      <FormProviderComponent>{children}</FormProviderComponent>
    </Suspense>
  )
}
