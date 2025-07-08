'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryStates } from 'nuqs'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Form } from '@/components/ui/form'
import { parseAsFormData } from '@/lib/xml-generator/nuqs-parsers'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'

const { useStepper } = xmlFormStepper

export const createFormStateSchema = () => {
  const schema: Record<string, typeof parseAsFormData> = {}

  // Add a query state for each step
  for (const step of xmlFormStepper.steps) {
    schema[step.id] = parseAsFormData.withDefault({})
  }

  return schema
}

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [formStates, setFormStates] = useQueryStates(createFormStateSchema())
  const methods = useStepper()

  const onSubmit = (values: z.infer<typeof methods.current.schema>) => {
    // Save form data to URL state for current step
    setFormStates({
      [methods.current.id]: values,
    })

    alert(
      `Form values for step ${methods.current.id}: ${JSON.stringify(values)}`,
    )
  }
  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(methods.current.schema),
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
