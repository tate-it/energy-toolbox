'use client'

import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { useFormStates } from '@/hooks/use-form-states'
import { dynamicResolver } from '@/lib/utils'
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
        marketType: undefined,
        singleOffer: undefined,
        clientType: undefined,
        residentialStatus: undefined,
        offerType: undefined,
        contractActivationTypes: [],
        offerName: '',
        offerDescription: '',
        duration: undefined,
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
        energyPriceIndex: undefined,
        alternativeIndexDescription: '',
        timeBandConfiguration: undefined,
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

  const form = useForm({
    mode: 'onTouched',
    resolver: dynamicResolver(methods.current.schema),
    // Initialize form with data from URL state for current step, with proper defaults
    defaultValues:
      formStates[methods.current.id] || getDefaultValues(methods.current.id),
  })

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
