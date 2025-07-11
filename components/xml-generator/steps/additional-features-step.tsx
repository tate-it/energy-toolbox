'use client'

import { Plus, Trash2 } from 'lucide-react'
import {
  type FieldArrayPath,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useFormStates } from '@/hooks/use-form-states'
import {
  ADDITIONAL_PRODUCT_MACRO_AREA_LABELS,
  DISCOUNT_CONDITION_LABELS,
  DISCOUNT_TYPE_LABELS,
  MARKET_TYPES,
  OFFER_TYPES,
  UNIT_OF_MEASURE_LABELS,
  VAT_APPLICABILITY_LABELS,
} from '@/lib/xml-generator/constants'
import type { AdditionalFeaturesFormValues } from '@/lib/xml-generator/schemas'

// Helper to bypass strict type checking for nested field arrays
function useNestedFieldArray<T extends Record<string, unknown>>(
  control: Parameters<typeof useFieldArray>[0]['control'],
  name: string,
) {
  return useFieldArray({
    control,
    name: name as FieldArrayPath<T>,
  }) as ReturnType<typeof useFieldArray>
}

export function AdditionalFeaturesStep() {
  const [formStates] = useFormStates()

  // Get form state to determine conditional requirements
  const marketType = formStates.offerDetails?.marketType ?? ''
  const offerType = formStates.offerDetails?.offerType ?? ''

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Funzionalità Aggiuntive</h2>
        <p className="text-muted-foreground text-sm">
          Configura caratteristiche dell&apos;offerta, sconti, zone geografiche
          e prodotti aggiuntivi
        </p>
      </div>

      {/* Offer Characteristics Section */}
      {(offerType === OFFER_TYPES.FLAT ||
        marketType === MARKET_TYPES.ELECTRICITY) && (
        <OfferCharacteristicsSection
          marketType={marketType}
          offerType={offerType}
        />
      )}

      {/* Dual Offer Section */}
      {marketType === MARKET_TYPES.DUAL_FUEL && <DualOfferSection />}

      {/* Zone Offers Section */}
      <ZoneOffersSection />

      {/* Discounts Section */}
      <DiscountsSection />

      {/* Additional Products/Services Section */}
      <AdditionalProductsSection />
    </div>
  )
}

interface OfferCharacteristicsSectionProps {
  marketType: string
  offerType: string
}

function OfferCharacteristicsSection({
  marketType,
  offerType,
}: OfferCharacteristicsSectionProps) {
  const form = useFormContext<AdditionalFeaturesFormValues>()
  const isFlatOffer = offerType === OFFER_TYPES.FLAT
  const isElectricityOffer = marketType === MARKET_TYPES.ELECTRICITY

  return (
    <Card>
      <CardHeader>
        <CardTitle>Caratteristiche dell&apos;Offerta</CardTitle>
        <CardDescription>
          {isFlatOffer && (
            <span>Limiti di consumo obbligatori per offerte FLAT. </span>
          )}
          {isElectricityOffer && (
            <span>Limiti di potenza opzionali per offerte elettriche.</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {isFlatOffer && (
            <>
              <FormField
                control={form.control}
                name="offerCharacteristics.consumptionMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Consumo Minimo * (kWh/anno o Sm³/anno)
                    </FormLabel>
                    <FormControl>
                      <Input
                        min="0"
                        placeholder="0"
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            Number.parseInt(e.target.value, 10) || undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Obbligatorio per offerte FLAT
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offerCharacteristics.consumptionMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Consumo Massimo * (kWh/anno o Sm³/anno)
                    </FormLabel>
                    <FormControl>
                      <Input
                        min="0"
                        placeholder="0"
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            Number.parseInt(e.target.value, 10) || undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Obbligatorio per offerte FLAT
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {isElectricityOffer && (
            <>
              <FormField
                control={form.control}
                name="offerCharacteristics.powerMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potenza Minima (kW)</FormLabel>
                    <FormControl>
                      <Input
                        min="0"
                        placeholder="0.00"
                        step="0.01"
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            Number.parseFloat(e.target.value) || undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Opzionale per offerte elettriche
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offerCharacteristics.powerMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potenza Massima (kW)</FormLabel>
                    <FormControl>
                      <Input
                        min="0"
                        placeholder="0.00"
                        step="0.01"
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            Number.parseFloat(e.target.value) || undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Opzionale per offerte elettriche
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function DualOfferSection() {
  const form = useFormContext<AdditionalFeaturesFormValues>()

  const {
    fields: electricityOffersFields,
    append: appendElectricityOffer,
    remove: removeElectricityOffer,
  } = useNestedFieldArray<AdditionalFeaturesFormValues>(
    form.control,
    'dualOffer.electricityJointOffers',
  )

  const {
    fields: gasOffersFields,
    append: appendGasOffer,
    remove: removeGasOffer,
  } = useNestedFieldArray<AdditionalFeaturesFormValues>(
    form.control,
    'dualOffer.gasJointOffers',
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Offerte Congiunte (Dual Fuel)</CardTitle>
        <CardDescription>
          Codici delle offerte congiunte elettriche e gas (obbligatorio per
          mercato Dual Fuel)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Electricity Joint Offers */}
        <div>
          <h4 className="mb-3 font-medium">Offerte Elettriche Congiunte *</h4>
          <div className="space-y-3">
            {electricityOffersFields.map((arrayItem, index) => (
              <div className="flex items-center space-x-3" key={arrayItem.id}>
                <FormField
                  control={form.control}
                  name={`dualOffer.electricityJointOffers.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Codice offerta elettrica"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {electricityOffersFields.length > 1 && (
                  <Button
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeElectricityOffer(index)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              onClick={() => appendElectricityOffer('')}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi Offerta Elettrica
            </Button>
          </div>
        </div>

        {/* Gas Joint Offers */}
        <div>
          <h4 className="mb-3 font-medium">Offerte Gas Congiunte *</h4>
          <div className="space-y-3">
            {gasOffersFields.map((arrayItem, index) => (
              <div className="flex items-center space-x-3" key={arrayItem.id}>
                <FormField
                  control={form.control}
                  name={`dualOffer.gasJointOffers.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Codice offerta gas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {gasOffersFields.length > 1 && (
                  <Button
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeGasOffer(index)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              onClick={() => appendGasOffer('')}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi Offerta Gas
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ZoneOffersSection() {
  const form = useFormContext<AdditionalFeaturesFormValues>()

  const {
    fields: regionsFields,
    append: appendRegion,
    remove: removeRegion,
  } = useNestedFieldArray<AdditionalFeaturesFormValues>(
    form.control,
    'zoneOffers.regions',
  )

  const {
    fields: provincesFields,
    append: appendProvince,
    remove: removeProvince,
  } = useNestedFieldArray<AdditionalFeaturesFormValues>(
    form.control,
    'zoneOffers.provinces',
  )

  const {
    fields: municipalitiesFields,
    append: appendMunicipality,
    remove: removeMunicipality,
  } = useNestedFieldArray<AdditionalFeaturesFormValues>(
    form.control,
    'zoneOffers.municipalities',
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zone dell&apos;Offerta</CardTitle>
        <CardDescription>
          Limitazioni geografiche dell&apos;offerta (opzionale). Inserire i
          codici numerici delle zone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Regions */}
        <div>
          <h4 className="mb-3 font-medium">Regioni</h4>
          <div className="space-y-3">
            {regionsFields.map((arrayItem, index) => (
              <div className="flex items-center space-x-3" key={arrayItem.id}>
                <FormField
                  control={form.control}
                  name={`zoneOffers.regions.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          maxLength={2}
                          placeholder="Codice regione (2 cifre)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeRegion(index)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={() => appendRegion('')}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi Regione
            </Button>
          </div>
        </div>

        {/* Provinces */}
        <div>
          <h4 className="mb-3 font-medium">Province</h4>
          <div className="space-y-3">
            {provincesFields.map((arrayItem, index) => (
              <div className="flex items-center space-x-3" key={arrayItem.id}>
                <FormField
                  control={form.control}
                  name={`zoneOffers.provinces.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          maxLength={3}
                          placeholder="Codice provincia (3 cifre)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeProvince(index)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={() => appendProvince('')}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi Provincia
            </Button>
          </div>
        </div>

        {/* Municipalities */}
        <div>
          <h4 className="mb-3 font-medium">Comuni</h4>
          <div className="space-y-3">
            {municipalitiesFields.map((arrayItem, index) => (
              <div className="flex items-center space-x-3" key={arrayItem.id}>
                <FormField
                  control={form.control}
                  name={`zoneOffers.municipalities.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          maxLength={6}
                          placeholder="Codice comune (6 cifre)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeMunicipality(index)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={() => appendMunicipality('')}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi Comune
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DiscountsSection() {
  const form = useFormContext<AdditionalFeaturesFormValues>()

  const {
    fields: discountFields,
    append: appendDiscount,
    remove: removeDiscount,
  } = useFieldArray({
    control: form.control,
    name: 'discounts',
  })

  const addNewDiscount = () => {
    appendDiscount({
      name: '',
      description: '',
      vatApplicability: '02',
      condition: {
        applicationCondition: '00',
        conditionDescription: '',
      },
      discountPrices: [
        {
          discountType: '01',
          unitOfMeasure: '01',
          price: 0,
        },
      ],
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sconti</CardTitle>
        <CardDescription>
          Configura gli sconti applicabili all&apos;offerta (opzionale)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {discountFields.map((arrayItem, index) => (
            <DiscountCard
              index={index}
              key={arrayItem.id}
              onRemove={() => removeDiscount(index)}
              showRemove={discountFields.length > 1}
            />
          ))}

          <Button
            className="w-full"
            onClick={addNewDiscount}
            type="button"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Sconto
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface DiscountCardProps {
  index: number
  onRemove: () => void
  showRemove: boolean
}

function DiscountCard({ index, onRemove, showRemove }: DiscountCardProps) {
  const form = useFormContext<AdditionalFeaturesFormValues>()
  const selectedApplicationCondition = form.watch(
    `discounts.${index}.condition.applicationCondition`,
  )

  const {
    fields: priceFields,
    append: appendPrice,
    remove: removePrice,
  } = useFieldArray({
    control: form.control,
    name: `discounts.${index}.discountPrices`,
  })

  const addNewPrice = () => {
    appendPrice({
      discountType: '01',
      unitOfMeasure: '01',
      price: 0,
    })
  }

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Sconto {index + 1}</CardTitle>
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
        {/* Basic Discount Info */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`discounts.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Sconto *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome dello sconto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`discounts.${index}.vatApplicability`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Applicabilità IVA *</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona applicabilità IVA" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(VAT_APPLICABILITY_LABELS).map(
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
          name={`discounts.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrizione Sconto *</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[80px]"
                  placeholder="Descrizione dettagliata dello sconto"
                  {...field}
                />
              </FormControl>
              <FormDescription>Massimo 3000 caratteri</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Discount Condition */}
        <div className="space-y-3">
          <h5 className="font-medium">Condizione di Applicazione</h5>
          <div className="grid grid-cols-1 gap-3">
            <FormField
              control={form.control}
              name={`discounts.${index}.condition.applicationCondition`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condizione *</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona condizione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(DISCOUNT_CONDITION_LABELS).map(
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

            {selectedApplicationCondition === '99' && (
              <FormField
                control={form.control}
                name={`discounts.${index}.condition.conditionDescription`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrizione Condizione *</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[60px]"
                        placeholder="Descrivi la condizione personalizzata"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Obbligatorio quando si seleziona &quot;Altro&quot;.
                      Massimo 3000 caratteri.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        <Separator />

        {/* Discount Prices */}
        <div>
          <h5 className="mb-3 font-medium">Prezzi di Sconto</h5>
          <div className="space-y-4">
            {priceFields.map((priceArrayItem, priceIndex) => (
              <DiscountPriceCard
                discountIndex={index}
                key={priceArrayItem.id}
                onRemove={() => removePrice(priceIndex)}
                priceIndex={priceIndex}
                showRemove={priceFields.length > 1}
              />
            ))}

            <Button
              className="w-full"
              onClick={addNewPrice}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi Prezzo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DiscountPriceCardProps {
  discountIndex: number
  priceIndex: number
  onRemove: () => void
  showRemove: boolean
}

function DiscountPriceCard({
  discountIndex,
  priceIndex,
  onRemove,
  showRemove,
}: DiscountPriceCardProps) {
  const form = useFormContext<AdditionalFeaturesFormValues>()

  return (
    <Card className="bg-background/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Prezzo {priceIndex + 1}</CardTitle>
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
            name={`discounts.${discountIndex}.discountPrices.${priceIndex}.discountType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo Sconto *</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(DISCOUNT_TYPE_LABELS).map(
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

          <FormField
            control={form.control}
            name={`discounts.${discountIndex}.discountPrices.${priceIndex}.unitOfMeasure`}
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

        <FormField
          control={form.control}
          name={`discounts.${discountIndex}.discountPrices.${priceIndex}.price`}
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

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name={`discounts.${discountIndex}.discountPrices.${priceIndex}.validFrom`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valido Da</FormLabel>
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
            name={`discounts.${discountIndex}.discountPrices.${priceIndex}.validTo`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valido Fino</FormLabel>
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
      </CardContent>
    </Card>
  )
}

function AdditionalProductsSection() {
  const form = useFormContext<AdditionalFeaturesFormValues>()

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control: form.control,
    name: 'additionalProducts',
  })

  const addNewProduct = () => {
    appendProduct({
      name: '',
      details: '',
      macroArea: undefined,
      macroAreaDetails: '',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prodotti e Servizi Aggiuntivi</CardTitle>
        <CardDescription>
          Prodotti o servizi aggiuntivi offerti insieme all&apos;offerta
          principale (opzionale)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {productFields.map((arrayItem, index) => (
            <AdditionalProductCard
              index={index}
              key={arrayItem.id}
              onRemove={() => removeProduct(index)}
              showRemove={true}
            />
          ))}

          <Button
            className="w-full"
            onClick={addNewProduct}
            type="button"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Prodotto/Servizio
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface AdditionalProductCardProps {
  index: number
  onRemove: () => void
  showRemove: boolean
}

function AdditionalProductCard({
  index,
  onRemove,
  showRemove,
}: AdditionalProductCardProps) {
  const form = useFormContext<AdditionalFeaturesFormValues>()
  const selectedMacroArea = form.watch(`additionalProducts.${index}.macroArea`)

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Prodotto/Servizio {index + 1}
          </CardTitle>
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`additionalProducts.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Prodotto/Servizio *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome del prodotto o servizio"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`additionalProducts.${index}.macroArea`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Macroarea</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona macroarea" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(ADDITIONAL_PRODUCT_MACRO_AREA_LABELS).map(
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
          name={`additionalProducts.${index}.details`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dettagli Prodotto/Servizio *</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[100px]"
                  placeholder="Descrizione dettagliata del prodotto o servizio"
                  {...field}
                />
              </FormControl>
              <FormDescription>Massimo 3000 caratteri</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedMacroArea === '99' && (
          <FormField
            control={form.control}
            name={`additionalProducts.${index}.macroAreaDetails`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dettagli Macroarea *</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[80px]"
                    placeholder="Descrivi la macroarea personalizzata"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Obbligatorio quando si seleziona &quot;Altro&quot;. Massimo
                  3000 caratteri.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  )
}
