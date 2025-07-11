'use client'

import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Form } from '@/components/ui/form'
import { useFormStates } from '@/hooks/use-form-states'
import { dynamicResolver } from '@/lib/utils'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'

const { useStepper } = xmlFormStepper

export function FormProvider({ children }: { children: React.ReactNode }) {
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
