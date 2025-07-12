'use client'

import { Suspense } from 'react'
import { useFormContext } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'

import {
  CLIENT_TYPE_LABELS,
  CONTRACT_ACTIVATION_LABELS,
  MARKET_TYPE_LABELS,
  OFFER_TYPE_LABELS,
  RESIDENTIAL_STATUS_LABELS,
  SINGLE_OFFER_LABELS,
} from '@/lib/xml-generator/constants'
import type { OfferDetailsFormValues } from '@/lib/xml-generator/schemas'
import { OfferDetailsSkeleton } from './skeletons/offer-details-skeleton'

export function OfferDetailsStepComponent() {
  const form = useFormContext<OfferDetailsFormValues>()

  const marketType = form.watch('marketType')
  const clientType = form.watch('clientType')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl">Dettagli dell'Offerta</h2>
        <p className="text-muted-foreground">
          Configura i dettagli principali dell'offerta commerciale
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informazioni Base</CardTitle>
          <CardDescription>
            Configura le informazioni principali dell'offerta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="marketType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tipo di Mercato <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona tipo di mercato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(MARKET_TYPE_LABELS).map(
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

            {/* Single Offer - only shown if not Dual Fuel */}
            {marketType && marketType !== '03' && (
              <FormField
                control={form.control}
                name="singleOffer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Offerta Singola{' '}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona se l'offerta può essere sottoscritta singolarmente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SINGLE_OFFER_LABELS).map(
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
            )}

            <FormField
              control={form.control}
              name="clientType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tipo di Cliente <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona tipo di cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CLIENT_TYPE_LABELS).map(
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

            {/* Residential Status - only shown for Domestic clients */}
            {clientType === '01' && (
              <FormField
                control={form.control}
                name="residentialStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stato Residenziale</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona stato residenziale" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(RESIDENTIAL_STATUS_LABELS).map(
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
            )}

            <FormField
              control={form.control}
              name="offerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tipo di Offerta <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona tipo di offerta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(OFFER_TYPE_LABELS).map(
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
            name="contractActivationTypes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tipologie di Attivazione Contratto{' '}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {Object.entries(CONTRACT_ACTIVATION_LABELS).map(
                    ([value, label]) => (
                      <FormItem
                        className="flex items-center space-x-2"
                        key={value}
                      >
                        <FormControl>
                          <Checkbox
                            checked={(field.value || []).includes(
                              value as '01' | '02' | '03' | '04' | '99',
                            )}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || []
                              const activationType = value as
                                | '01'
                                | '02'
                                | '03'
                                | '04'
                                | '99'
                              if (checked) {
                                field.onChange([
                                  ...currentValue,
                                  activationType,
                                ])
                              } else {
                                field.onChange(
                                  currentValue.filter(
                                    (type) => type !== activationType,
                                  ),
                                )
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer font-medium text-sm">
                          {label}
                        </FormLabel>
                      </FormItem>
                    ),
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dettagli dell'Offerta</CardTitle>
          <CardDescription>
            Definisci nome, descrizione e caratteristiche principali
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="offerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nome dell&apos;Offerta{' '}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    onChange={field.onChange}
                    placeholder="Inserisci il nome dell&apos;offerta"
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="offerDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Descrizione dell&apos;Offerta{' '}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[120px]"
                    onChange={field.onChange}
                    placeholder="Inserisci una descrizione dettagliata dell&apos;offerta"
                    rows={5}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Durata (mesi) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      max={99}
                      min={-1}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === '' ? '' : Number(e.target.value),
                        )
                      }
                      placeholder="Inserisci -1 per durata indeterminata o 1-99 per durata in mesi"
                      type="number"
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Inserisci -1 per durata indeterminata o un valore da 1 a 99
                    mesi
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="guarantees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Garanzie <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[100px]"
                    onChange={field.onChange}
                    placeholder="Inserisci 'NO' se non sono richieste garanzie, altrimenti descrivi le garanzie richieste (es. cauzioni, domiciliazioni)"
                    rows={4}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Inserisci &quot;NO&quot; se non sono richieste garanzie,
                  altrimenti descrivi le garanzie richieste come cauzioni o
                  domiciliazioni
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export const OfferDetailsStep = () => {
  return (
    <Suspense fallback={<OfferDetailsSkeleton />}>
      <OfferDetailsStepComponent />
    </Suspense>
  )
}
