'use client'

import { Plus, PlusCircle, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useFormStates } from '@/hooks/use-form-states'
import {
  COMPONENT_TIME_BAND_LABELS,
  COMPONENT_TYPE_LABELS,
  getRegulatedComponentsByMarket,
  MACRO_AREA_LABELS,
  MARKET_TYPES,
  REGULATED_COMPONENT_LABELS,
  UNIT_OF_MEASURE_LABELS,
} from '@/lib/xml-generator/constants'
import type { CompanyComponentsFormValues } from '@/lib/xml-generator/schemas'

export function CompanyComponentsStep() {
  const form = useFormContext<CompanyComponentsFormValues>()
  const [formStates] = useFormStates()

  const marketType = formStates.offerDetails?.marketType ?? ''

  // Get available regulated components based on market type
  const availableRegulatedComponents =
    getRegulatedComponentsByMarket(marketType)

  // Field arrays for dynamic components
  const {
    fields: companyComponentFields,
    append: appendCompanyComponent,
    remove: removeCompanyComponent,
  } = useFieldArray({
    control: form.control,
    name: 'companyComponents',
  })

  const addNewCompanyComponent = () => {
    appendCompanyComponent({
      name: '',
      description: '',
      componentType: '01',
      macroArea: '01',
      priceIntervals: [
        {
          price: 0,
          unitOfMeasure: '01',
        },
      ],
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Componenti Impresa</h2>
        <p className="text-muted-foreground text-sm">
          Definisci i componenti regolati e i componenti aziendali con relativi
          intervalli di prezzo
        </p>
      </div>

      {/* Regulated Components Section */}
      <Card>
        <CardHeader>
          <CardTitle>Componenti Regolate</CardTitle>
          <CardDescription>
            Seleziona i componenti regolati in base al tipo di mercato (
            {marketType === MARKET_TYPES.ELECTRICITY ? 'Elettricità' : 'Gas'})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="regulatedComponents"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-2 gap-4">
                  {availableRegulatedComponents.map((componentCode) => (
                    <FormField
                      control={form.control}
                      key={componentCode}
                      name="regulatedComponents"
                      render={({ field }) => (
                        <FormItem
                          className="flex flex-row items-start space-x-3 space-y-0"
                          key={componentCode}
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(
                                componentCode as
                                  | '01'
                                  | '02'
                                  | '03'
                                  | '04'
                                  | '05'
                                  | '06'
                                  | '07'
                                  | '09'
                                  | '10',
                              )}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), componentCode]
                                  : field.value?.filter(
                                      (value) => value !== componentCode,
                                    ) || []
                                field.onChange(updatedValue)
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            {REGULATED_COMPONENT_LABELS[componentCode]} (
                            {componentCode})
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Company Components Section */}
      <Card>
        <CardHeader>
          <CardTitle>Componenti Aziendali</CardTitle>
          <CardDescription>
            Aggiungi i componenti aziendali con i relativi intervalli di prezzo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {companyComponentFields.map((field, index) => (
              <CompanyComponentCard
                index={index}
                key={field.id}
                onRemove={() => removeCompanyComponent(index)}
                showRemove={companyComponentFields.length > 1}
              />
            ))}

            <Button
              className="w-full"
              onClick={addNewCompanyComponent}
              type="button"
              variant="outline"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Aggiungi Componente Aziendale
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface CompanyComponentCardProps {
  index: number
  onRemove: () => void
  showRemove: boolean
}

function CompanyComponentCard({
  index,
  onRemove,
  showRemove,
}: CompanyComponentCardProps) {
  const form = useFormContext<CompanyComponentsFormValues>()

  // Field array for price intervals
  const {
    fields: priceIntervalFields,
    append: appendPriceInterval,
    remove: removePriceInterval,
  } = useFieldArray({
    control: form.control,
    name: `companyComponents.${index}.priceIntervals`,
  })

  const addNewPriceInterval = () => {
    appendPriceInterval({
      price: 0,
      unitOfMeasure: '01',
    })
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Componente {index + 1}</CardTitle>
            <CardDescription>
              Configura il componente aziendale e i suoi intervalli di prezzo
            </CardDescription>
          </div>
          {showRemove && (
            <Button
              className="text-destructive hover:text-destructive"
              onClick={onRemove}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Component Info */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`companyComponents.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Componente *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Inserisci il nome del componente"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`companyComponents.${index}.componentType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo Componente *</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo componente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(COMPONENT_TYPE_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name={`companyComponents.${index}.macroArea`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Macroarea *</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona macroarea" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(MACRO_AREA_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`companyComponents.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrizione *</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[100px]"
                  placeholder="Inserisci la descrizione del componente"
                  {...field}
                />
              </FormControl>
              <FormDescription>Massimo 3000 caratteri</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Price Intervals */}
        <div>
          <h4 className="mb-3 font-medium">Intervalli di Prezzo</h4>
          <div className="space-y-4">
            {priceIntervalFields.map((intervalField, intervalIndex) => (
              <PriceIntervalCard
                componentIndex={index}
                intervalIndex={intervalIndex}
                key={intervalField.id}
                onRemove={() => removePriceInterval(intervalIndex)}
                showRemove={priceIntervalFields.length > 1}
              />
            ))}

            <Button
              className="w-full"
              onClick={addNewPriceInterval}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi Intervallo di Prezzo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface PriceIntervalCardProps {
  componentIndex: number
  intervalIndex: number
  onRemove: () => void
  showRemove: boolean
}

function PriceIntervalCard({
  componentIndex,
  intervalIndex,
  onRemove,
  showRemove,
}: PriceIntervalCardProps) {
  const form = useFormContext<CompanyComponentsFormValues>()

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            Intervallo {intervalIndex + 1}
          </CardTitle>
          {showRemove && (
            <Button
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={onRemove}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name={`companyComponents.${componentIndex}.priceIntervals.${intervalIndex}.price`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prezzo *</FormLabel>
                <FormControl>
                  <Input
                    min="0"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`companyComponents.${componentIndex}.priceIntervals.${intervalIndex}.unitOfMeasure`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unità di Misura *</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona unità" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(UNIT_OF_MEASURE_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name={`companyComponents.${componentIndex}.priceIntervals.${intervalIndex}.consumptionFrom`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consumo Da</FormLabel>
                <FormControl>
                  <Input
                    min="0"
                    placeholder="Opzionale"
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          ? Number.parseInt(e.target.value, 10)
                          : undefined,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`companyComponents.${componentIndex}.priceIntervals.${intervalIndex}.consumptionTo`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consumo A</FormLabel>
                <FormControl>
                  <Input
                    min="0"
                    placeholder="Opzionale"
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          ? Number.parseInt(e.target.value, 10)
                          : undefined,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name={`companyComponents.${componentIndex}.priceIntervals.${intervalIndex}.componentTimeBand`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fascia Componente</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona fascia (opzionale)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(COMPONENT_TIME_BAND_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name={`companyComponents.${componentIndex}.priceIntervals.${intervalIndex}.validityPeriod.fromDate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Inizio Validità</FormLabel>
                <FormControl>
                  <Input placeholder="gg/mm/aaaa" type="text" {...field} />
                </FormControl>
                <FormDescription>Formato: gg/mm/aaaa</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`companyComponents.${componentIndex}.priceIntervals.${intervalIndex}.validityPeriod.toDate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Fine Validità</FormLabel>
                <FormControl>
                  <Input placeholder="gg/mm/aaaa" type="text" {...field} />
                </FormControl>
                <FormDescription>Formato: gg/mm/aaaa</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
