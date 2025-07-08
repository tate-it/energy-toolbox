'use client'

import { useFormContext } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { ActivationContactsFormValues } from '@/lib/xml-generator/schemas'

export function ActivationContactsStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ActivationContactsFormValues>()

  const activationMethods = watch('activationMethods') || []

  const handleActivationMethodChange = (method: string, checked: boolean) => {
    if (checked) {
      setValue('activationMethods', [...activationMethods, method])
    } else {
      setValue(
        'activationMethods',
        activationMethods.filter((m) => m !== method),
      )
    }
  }

  const activationMethodOptions = [
    { value: '01', label: 'Attivazione solo web' },
    { value: '02', label: 'Attivazione qualsiasi canale' },
    { value: '03', label: 'Punto vendita' },
    { value: '04', label: 'Teleselling' },
    { value: '05', label: 'Agenzia' },
    { value: '99', label: 'Altro' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl">Attivazione e Contatti</h2>
        <p className="text-muted-foreground">
          Configura i metodi di attivazione e le informazioni di contatto per
          l'offerta
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metodi di Attivazione</CardTitle>
          <CardDescription>
            Seleziona uno o più metodi attraverso i quali l'offerta può essere
            attivata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="font-medium text-base">
              Modalità di Attivazione{' '}
              <span className="text-destructive">*</span>
            </Label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activationMethodOptions.map((method) => (
                <div className="flex items-center space-x-2" key={method.value}>
                  <Checkbox
                    checked={activationMethods.includes(method.value)}
                    id={`activation-${method.value}`}
                    onCheckedChange={(checked) =>
                      handleActivationMethodChange(method.value, !!checked)
                    }
                  />
                  <Label
                    className="cursor-pointer font-normal text-sm"
                    htmlFor={`activation-${method.value}`}
                  >
                    {method.label}
                  </Label>
                </div>
              ))}
            </div>

            {errors.activationMethods && (
              <p className="text-destructive text-sm">
                {errors.activationMethods.message}
              </p>
            )}
          </div>

          {activationMethods.includes('99') && (
            <div className="space-y-2">
              <Label
                className="font-medium text-sm"
                htmlFor="activationDescription"
              >
                Descrizione Metodo Attivazione{' '}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="activationDescription"
                {...register('activationDescription')}
                className="min-h-[100px]"
                placeholder="Descrivi il metodo di attivazione alternativo..."
              />
              {errors.activationDescription && (
                <p className="text-destructive text-sm">
                  {errors.activationDescription.message}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informazioni di Contatto</CardTitle>
          <CardDescription>
            Fornisci le informazioni di contatto per l'offerta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="phone">
              Numero di Telefono <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="es. +39 02 1234567"
              type="tel"
            />
            {errors.phone && (
              <p className="text-destructive text-sm">{errors.phone.message}</p>
            )}
            <p className="text-muted-foreground text-xs">
              Numero di telefono per il supporto clienti (massimo 15 caratteri)
            </p>
          </div>

          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="vendorWebsite">
              Sito Web del Venditore
            </Label>
            <Input
              id="vendorWebsite"
              {...register('vendorWebsite')}
              placeholder="https://www.esempio.it"
              type="url"
            />
            {errors.vendorWebsite && (
              <p className="text-destructive text-sm">
                {errors.vendorWebsite.message}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              URL del sito web aziendale (opzionale, massimo 100 caratteri)
            </p>
          </div>

          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="offerUrl">
              URL dell'Offerta
            </Label>
            <Input
              id="offerUrl"
              {...register('offerUrl')}
              placeholder="https://www.esempio.it/offerta-speciale"
              type="url"
            />
            {errors.offerUrl && (
              <p className="text-destructive text-sm">
                {errors.offerUrl.message}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              URL specifico dell'offerta (opzionale, massimo 100 caratteri)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
