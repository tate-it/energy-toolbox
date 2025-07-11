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
    // Initialize form with data from URL state for current step
    defaultValues: formStates[methods.current.id] || {},
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
