import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import type { BasicInfoFormValues } from '@/lib/xml-generator/schemas'

export function BasicInfoComponent() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BasicInfoFormValues>()

  return (
    <div className="space-y-4 text-start">
      <div className="space-y-2">
        <label
          htmlFor={register('vatNumber').name}
          className="block text-sm font-medium text-primary"
        >
          VAT Number
        </label>
        <Input
          id={register('vatNumber').name}
          {...register('vatNumber')}
          placeholder="IT12345678901"
          className="block w-full"
        />
        {errors.vatNumber && (
          <span className="text-sm text-destructive">
            {errors.vatNumber.message}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <label
          htmlFor={register('offerCode').name}
          className="block text-sm font-medium text-primary"
        >
          Offer Code
        </label>
        <Input
          id={register('offerCode').name}
          {...register('offerCode')}
          placeholder="OFFER2024"
          className="block w-full"
        />
        {errors.offerCode && (
          <span className="text-sm text-destructive">
            {errors.offerCode.message}
          </span>
        )}
      </div>
    </div>
  )
} 