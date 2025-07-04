'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Fragment, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryState, parseAsString } from 'nuqs'
import { parseAsFormData } from '@/lib/xml-generator/nuqs-parsers'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'
import { 
  BasicInfoComponent, 
  OfferDetailsComponent, 
  PlaceholderComponent 
} from '@/components/xml-generator'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'

const { useStepper, steps, utils } = xmlFormStepper

export default function XmlGeneratorPage() {
  const stepper = useStepper()
  
  // URL state management
  const [urlStep, setUrlStep] = useQueryState('step', parseAsString.withDefault('basic-info'))
  const [formData, setFormData] = useQueryState('data', parseAsFormData.withDefault({}))

  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
    defaultValues: formData,
  })

  // Sync URL step with stepper
  useEffect(() => {
    if (urlStep !== stepper.current.id) {
      const targetStep = steps.find(step => step.id === urlStep)
      if (targetStep) {
        stepper.goTo(targetStep.id)
      } else {
        setUrlStep(stepper.current.id)
      }
    }
  }, [urlStep, stepper, setUrlStep])

  // Load form data when step changes
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      form.reset(formData)
    }
  }, [stepper.current.id, formData, form])

  const onSubmit = async (values: z.infer<typeof stepper.current.schema>) => {
    console.log(`Form values for step ${stepper.current.id}:`, values)
    
    // Save form data to URL
    const updatedData = { ...formData, ...values }
    await setFormData(updatedData)
    
    if (stepper.isLast) {
      console.log('All form data:', updatedData)
      // Generate XML here
    } else {
      // Move to next step
      const nextStep = utils.getNext(stepper.current.id)
      if (nextStep) {
        await setUrlStep(nextStep.id)
        stepper.next()
      }
    }
  }

  const currentIndex = utils.getIndex(stepper.current.id)

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 p-6 border rounded-lg"
        >
          <div className="flex justify-between">
            <h2 className="text-lg font-medium">SII XML Offer Generator</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Step {currentIndex + 1} of {steps.length}
              </span>
            </div>
          </div>
          
          <nav aria-label="Form Steps" className="group my-4">
            <ol
              className="flex items-center justify-between gap-2"
            >
              {stepper.all.map((step, index, array) => (
                <Fragment key={step.id}>
                  <li className="flex items-center gap-4 flex-shrink-0">
                    <Button
                      type="button"
                      role="tab"
                      variant={index <= currentIndex ? 'default' : 'secondary'}
                      aria-current={
                        stepper.current.id === step.id ? 'step' : undefined
                      }
                      aria-posinset={index + 1}
                      aria-setsize={steps.length}
                      aria-selected={stepper.current.id === step.id}
                      className="flex size-10 items-center justify-center rounded-full"
                      onClick={async () => {
                        const valid = await form.trigger()
                        // Must be validated
                        if (!valid) return
                        // Can't skip steps forwards but can go back anywhere if validated
                        if (index - currentIndex > 1) return
                        
                        // Save current form data before navigating
                        const currentValues = form.getValues()
                        const updatedData = { ...formData, ...currentValues }
                        await setFormData(updatedData)
                        await setUrlStep(step.id)
                        stepper.goTo(step.id)
                      }}
                    >
                      {index + 1}
                    </Button>
                    <span className="text-sm font-medium">{step.title}</span>
                  </li>
                  {index < array.length - 1 && (
                    <Separator
                      className={`flex-1 ${
                        index < currentIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </Fragment>
              ))}
            </ol>
          </nav>
          
          <div className="space-y-4">
            {stepper.switch({
              'basic-info': () => <BasicInfoComponent />,
              'offer-details': () => <OfferDetailsComponent />,
              'activation-contacts': () => <PlaceholderComponent title="Activation & Contacts" />,
              'pricing-config': () => <PlaceholderComponent title="Pricing Configuration" />,
              'company-components': () => <PlaceholderComponent title="Company Components" />,
              'payment-conditions': () => <PlaceholderComponent title="Payment & Conditions" />,
              'additional-features': () => <PlaceholderComponent title="Additional Features" />,
              'validity-review': () => <PlaceholderComponent title="Validity & Review" />,
            })}
            
            {!stepper.isLast ? (
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    const prevStep = utils.getPrev(stepper.current.id)
                    if (prevStep) {
                      await setUrlStep(prevStep.id)
                      stepper.prev()
                    }
                  }}
                  disabled={stepper.isFirst}
                >
                  Back
                </Button>
                <Button type="submit">
                  {stepper.isLast ? 'Generate XML' : 'Next'}
                </Button>
              </div>
            ) : (
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  onClick={async () => {
                    await setFormData({})
                    await setUrlStep('basic-info')
                    stepper.reset()
                    form.reset()
                  }}
                >
                  Reset
                </Button>
                <Button type="submit">Generate XML</Button>
              </div>
            )}
          </div>
        </form>
      </Form>
      
      {/* Debug Information */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-sm font-medium mb-2">Debug Info</h3>
        <div className="text-xs font-mono space-y-1">
          <div>Current Step: {stepper.current.id}</div>
          <div>URL Step: {urlStep}</div>
          <div>Form Data: {JSON.stringify(formData, null, 2)}</div>
        </div>
      </div>
    </div>
  )
}

 