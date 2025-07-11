'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Suspense } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { useFormStates } from '@/hooks/use-form-states'
import {
  DISPATCHING_TYPE_LABELS,
  DISPATCHING_TYPES,
  ENERGY_PRICE_INDEX_LABELS,
  ENERGY_PRICE_INDICES,
  MARKET_TYPES,
  OFFER_TYPES,
  requiresEnergyPriceReference,
  requiresWeeklyTimeBands,
  TIME_BAND_CONFIGURATION_LABELS,
  TIME_BAND_CONFIGURATIONS,
} from '@/lib/xml-generator/constants'
import { PricingConfigSkeleton } from './skeletons/pricing-config-skeleton'

interface PricingConfigStepProps {
  className?: string
}

export function PricingConfigStepComponent({
  className,
}: PricingConfigStepProps) {
  const { control, watch } = useFormContext()
  const [formStates] = useFormStates()

  // Get form values from URL state (from previous steps)
  const offerDetails = formStates.offerDetails as Record<string, unknown>
  const pricingConfig = formStates.pricingConfig as Record<string, unknown>

  const marketType = offerDetails?.marketType as string
  const offerType = offerDetails?.offerType as string
  const energyPriceIndex = pricingConfig?.energyPriceIndex as string
  const timeBandConfiguration = pricingConfig?.timeBandConfiguration as string

  const {
    fields: dispatchingFields,
    append: appendDispatching,
    remove: removeDispatching,
  } = useFieldArray({
    control,
    name: 'dispatching',
  })

  // Check if energy price reference is required
  const showEnergyPriceReference = requiresEnergyPriceReference(offerType)

  // Check if time band configuration is required (electricity market and not FLAT)
  const showTimeBandConfiguration =
    marketType === MARKET_TYPES.ELECTRICITY && offerType !== OFFER_TYPES.FLAT

  // Check if weekly time bands are required
  const showWeeklyTimeBands =
    showTimeBandConfiguration &&
    timeBandConfiguration &&
    requiresWeeklyTimeBands(timeBandConfiguration)

  // Check if dispatching is required (electricity market)
  const showDispatching = marketType === MARKET_TYPES.ELECTRICITY

  const addDispatchingComponent = () => {
    appendDispatching({
      dispatchingType: '',
      dispatchingValue: undefined,
      componentName: '',
      componentDescription: '',
    })
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        <div>
          <h2 className="font-semibold text-lg">Configurazione Prezzi</h2>
          <p className="text-muted-foreground text-sm">
            Configura i prezzi dell&apos;energia, le fasce orarie e i componenti
            di dispacciamento
          </p>
        </div>

        {/* Energy Price References */}
        {showEnergyPriceReference && (
          <Card>
            <CardHeader>
              <CardTitle>Riferimenti Prezzo Energia</CardTitle>
              <CardDescription>
                Indice di prezzo per le offerte a prezzo variabile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                name="energyPriceIndex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indice Prezzo Energia</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona un indice" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ENERGY_PRICE_INDICES).map(
                          ([key, value]) => (
                            <SelectItem key={key} value={value}>
                              {ENERGY_PRICE_INDEX_LABELS[value]}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Seleziona l&apos;indice di prezzo per l&apos;energia
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {energyPriceIndex === ENERGY_PRICE_INDICES.OTHER && (
                <FormField
                  control={control}
                  name="alternativeIndexDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrizione Indice Alternativo</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrivi l&apos;indice alternativo..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Descrizione dell&apos;indice alternativo (max 3000
                        caratteri)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Time Band Configuration */}
        {showTimeBandConfiguration && (
          <Card>
            <CardHeader>
              <CardTitle>Configurazione Fasce Orarie</CardTitle>
              <CardDescription>
                Tipo di configurazione delle fasce orarie per le offerte
                elettriche
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                name="timeBandConfiguration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipologia Fasce</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona una configurazione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(TIME_BAND_CONFIGURATIONS).map(
                          ([key, value]) => (
                            <SelectItem key={key} value={value}>
                              {TIME_BAND_CONFIGURATION_LABELS[value]}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Seleziona il tipo di configurazione delle fasce orarie
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Weekly Time Bands */}
              {showWeeklyTimeBands && (
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-medium text-sm">
                      Fasce Orarie Settimanali
                    </h3>
                    <p className="mb-4 text-muted-foreground text-xs">
                      Formato: XXI-YI,XXII-YII,...,XXN-YN dove XXi (1-96) è
                      l&apos;ultimo quarto d&apos;ora di applicazione della
                      fascia e Yi (1-8) è il numero della fascia applicata
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      { name: 'monday', label: 'Lunedì' },
                      { name: 'tuesday', label: 'Martedì' },
                      { name: 'wednesday', label: 'Mercoledì' },
                      { name: 'thursday', label: 'Giovedì' },
                      { name: 'friday', label: 'Venerdì' },
                      { name: 'saturday', label: 'Sabato' },
                      { name: 'sunday', label: 'Domenica' },
                      { name: 'holidays', label: 'Festività' },
                    ].map((day) => (
                      <FormField
                        control={control}
                        key={day.name}
                        name={`weeklyTimeBands.${day.name}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{day.label}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="es. 28-3,32-2,76-1,92-2,96-3"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dispatching */}
        {showDispatching && (
          <Card>
            <CardHeader>
              <CardTitle>Dispacciamento</CardTitle>
              <CardDescription>
                Componenti di dispacciamento per le offerte elettriche
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dispatchingFields.map((dispatchingField, index) => (
                <div
                  className="space-y-4 rounded-lg border p-4"
                  key={dispatchingField.id}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      Componente Dispacciamento {index + 1}
                    </h4>
                    <Button
                      onClick={() => removeDispatching(index)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={control}
                      name={`dispatching.${index}.dispatchingType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo Dispacciamento</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona un tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(DISPATCHING_TYPES).map(
                                ([key, value]) => (
                                  <SelectItem key={key} value={value}>
                                    {DISPATCHING_TYPE_LABELS[value]}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`dispatching.${index}.componentName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Componente</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome del componente..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watch(`dispatching.${index}.dispatchingType`) ===
                    DISPATCHING_TYPES.OTHER && (
                    <FormField
                      control={control}
                      name={`dispatching.${index}.dispatchingValue`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valore Dispacciamento</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="0.000000"
                              step="0.000001"
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number.parseFloat(e.target.value)
                                    : undefined,
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Valore numerico con separatore decimale
                            &apos;.&apos;
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={control}
                    name={`dispatching.${index}.componentDescription`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Descrizione Componente (Opzionale)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descrizione del componente..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Descrizione opzionale del componente (max 255
                          caratteri)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button
                className="w-full"
                onClick={addDispatchingComponent}
                type="button"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi Componente Dispacciamento
              </Button>

              {dispatchingFields.length === 0 && (
                <p className="py-4 text-center text-muted-foreground text-sm">
                  Nessun componente di dispacciamento aggiunto.{' '}
                  <Button
                    className="h-auto p-0"
                    onClick={addDispatchingComponent}
                    type="button"
                    variant="link"
                  >
                    Aggiungi il primo componente
                  </Button>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni di Aiuto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>
                <strong>Riferimenti Prezzo Energia:</strong> Obbligatorio solo
                per offerte a prezzo variabile (TIPO_OFFERTA = 02).
              </p>
              <p>
                <strong>Fasce Orarie:</strong> Obbligatorio per il mercato
                elettrico quando l&apos;offerta non è FLAT.
              </p>
              <p>
                <strong>Fasce Orarie Settimanali:</strong> Obbligatorio quando
                la configurazione è F1,F2 o F1,F2,F3,F4 o F1,F2,F3,F4,F5 o
                F1,F2,F3,F4,F5,F6.
              </p>
              <p>
                <strong>Dispacciamento:</strong> Obbligatorio per il mercato
                elettrico. È possibile aggiungere più componenti.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const PricingConfigStep = () => {
  return (
    <Suspense fallback={<PricingConfigSkeleton />}>
      <PricingConfigStepComponent />
    </Suspense>
  )
}
