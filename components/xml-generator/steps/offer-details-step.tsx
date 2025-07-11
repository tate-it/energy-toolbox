'use client'

import { Suspense } from 'react'
import { useFormContext } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<OfferDetailsFormValues>()

  const marketType = watch('marketType')
  const clientType = watch('clientType')
  const contractActivationTypes = watch('contractActivationTypes') || []

  const handleContractActivationChange = (value: string, checked: boolean) => {
    const contractActivationType = value as '01' | '02' | '03' | '04' | '99'
    if (checked) {
      setValue('contractActivationTypes', [
        ...contractActivationTypes,
        contractActivationType,
      ])
    } else {
      setValue(
        'contractActivationTypes',
        contractActivationTypes.filter(
          (type) => type !== contractActivationType,
        ),
      )
    }
  }

  return (
    <div className="space-y-6 text-start">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Market Type */}
        <div className="space-y-2">
          <Label
            className="font-medium text-primary text-sm"
            htmlFor="marketType"
          >
            Tipo di Mercato *
          </Label>
          <Select
            onValueChange={(value) =>
              setValue('marketType', value as '01' | '02' | '03')
            }
            value={watch('marketType')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona tipo di mercato" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MARKET_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.marketType && (
            <span className="text-destructive text-sm">
              {errors.marketType.message}
            </span>
          )}
        </div>

        {/* Single Offer - only shown if not Dual Fuel */}
        {marketType && marketType !== '03' && (
          <div className="space-y-2">
            <Label
              className="font-medium text-primary text-sm"
              htmlFor="singleOffer"
            >
              Offerta Singola *
            </Label>
            <Select
              onValueChange={(value) =>
                setValue('singleOffer', value as 'SI' | 'NO')
              }
              value={watch('singleOffer')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona se l&apos;offerta può essere sottoscritta singolarmente" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SINGLE_OFFER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.singleOffer && (
              <span className="text-destructive text-sm">
                {errors.singleOffer.message}
              </span>
            )}
          </div>
        )}

        {/* Client Type */}
        <div className="space-y-2">
          <Label
            className="font-medium text-primary text-sm"
            htmlFor="clientType"
          >
            Tipo di Cliente *
          </Label>
          <Select
            onValueChange={(value) =>
              setValue('clientType', value as '01' | '02' | '03')
            }
            value={watch('clientType')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona tipo di cliente" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.clientType && (
            <span className="text-destructive text-sm">
              {errors.clientType.message}
            </span>
          )}
        </div>

        {/* Residential Status - only shown for Domestic clients */}
        {clientType === '01' && (
          <div className="space-y-2">
            <Label
              className="font-medium text-primary text-sm"
              htmlFor="residentialStatus"
            >
              Stato Residenziale
            </Label>
            <Select
              onValueChange={(value) =>
                setValue('residentialStatus', value as '01' | '02' | '03')
              }
              value={watch('residentialStatus')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona stato residenziale" />
              </SelectTrigger>
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
            {errors.residentialStatus && (
              <span className="text-destructive text-sm">
                {errors.residentialStatus.message}
              </span>
            )}
          </div>
        )}

        {/* Offer Type */}
        <div className="space-y-2">
          <Label
            className="font-medium text-primary text-sm"
            htmlFor="offerType"
          >
            Tipo di Offerta *
          </Label>
          <Select
            onValueChange={(value) =>
              setValue('offerType', value as '01' | '02' | '03')
            }
            value={watch('offerType')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona tipo di offerta" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(OFFER_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.offerType && (
            <span className="text-destructive text-sm">
              {errors.offerType.message}
            </span>
          )}
        </div>
      </div>

      {/* Contract Activation Types */}
      <div className="space-y-4">
        <Label className="font-medium text-primary text-sm">
          Tipologie di Attivazione Contratto *
        </Label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Object.entries(CONTRACT_ACTIVATION_LABELS).map(([value, label]) => (
            <div className="flex items-center space-x-2" key={value}>
              <Checkbox
                checked={contractActivationTypes.includes(
                  value as '01' | '02' | '03' | '04' | '99',
                )}
                id={`activation-${value}`}
                onCheckedChange={(checked) =>
                  handleContractActivationChange(value, !!checked)
                }
              />
              <Label
                className="cursor-pointer font-medium text-sm"
                htmlFor={`activation-${value}`}
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
        {errors.contractActivationTypes && (
          <span className="text-destructive text-sm">
            {errors.contractActivationTypes.message}
          </span>
        )}
      </div>

      {/* Offer Name */}
      <div className="space-y-2">
        <Label className="font-medium text-primary text-sm" htmlFor="offerName">
          Nome dell&apos;Offerta *
        </Label>
        <Input
          id="offerName"
          {...register('offerName')}
          className="w-full"
          placeholder="Inserisci il nome dell&apos;offerta"
        />
        {errors.offerName && (
          <span className="text-destructive text-sm">
            {errors.offerName.message}
          </span>
        )}
      </div>

      {/* Offer Description */}
      <div className="space-y-2">
        <Label
          className="font-medium text-primary text-sm"
          htmlFor="offerDescription"
        >
          Descrizione dell&apos;Offerta *
        </Label>
        <Textarea
          id="offerDescription"
          {...register('offerDescription')}
          className="min-h-[120px] w-full"
          placeholder="Inserisci una descrizione dettagliata dell&apos;offerta"
          rows={5}
        />
        {errors.offerDescription && (
          <span className="text-destructive text-sm">
            {errors.offerDescription.message}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Duration */}
        <div className="space-y-2">
          <Label
            className="font-medium text-primary text-sm"
            htmlFor="duration"
          >
            Durata (mesi) *
          </Label>
          <Input
            id="duration"
            type="number"
            {...register('duration', { valueAsNumber: true })}
            className="w-full"
            max={99}
            min={-1}
            placeholder="Inserisci -1 per durata indeterminata o 1-99 per durata in mesi"
          />
          <div className="text-muted-foreground text-xs">
            Inserisci -1 per durata indeterminata o un valore da 1 a 99 mesi
          </div>
          {errors.duration && (
            <span className="text-destructive text-sm">
              {errors.duration.message}
            </span>
          )}
        </div>
      </div>

      {/* Guarantees */}
      <div className="space-y-2">
        <Label
          className="font-medium text-primary text-sm"
          htmlFor="guarantees"
        >
          Garanzie *
        </Label>
        <Textarea
          id="guarantees"
          {...register('guarantees')}
          className="min-h-[100px] w-full"
          placeholder="Inserisci 'NO' se non sono richieste garanzie, altrimenti descrivi le garanzie richieste (es. cauzioni, domiciliazioni)"
          rows={4}
        />
        <div className="text-muted-foreground text-xs">
          Inserisci &quot;NO&quot; se non sono richieste garanzie, altrimenti
          descrivi le garanzie richieste come cauzioni o domiciliazioni
        </div>
        {errors.guarantees && (
          <span className="text-destructive text-sm">
            {errors.guarantees.message}
          </span>
        )}
      </div>
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
