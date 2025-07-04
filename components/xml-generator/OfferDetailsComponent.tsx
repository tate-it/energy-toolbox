import { useFormContext } from 'react-hook-form'
import type { OfferDetailsFormValues } from '@/lib/xml-generator/schemas'

export function OfferDetailsComponent() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OfferDetailsFormValues>()

  return (
    <div className="space-y-4 text-start">
      <div className="space-y-2">
        <label
          htmlFor={register('marketType').name}
          className="block text-sm font-medium text-primary"
        >
          Market Type
        </label>
        <select
          id={register('marketType').name}
          {...register('marketType')}
          className="block w-full p-2 border rounded-md"
        >
          <option value="01">Electricity</option>
          <option value="02">Gas</option>
          <option value="03">Dual Fuel</option>
        </select>
        {errors.marketType && (
          <span className="text-sm text-destructive">
            {errors.marketType.message}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <label
          htmlFor={register('clientType').name}
          className="block text-sm font-medium text-primary"
        >
          Client Type
        </label>
        <select
          id={register('clientType').name}
          {...register('clientType')}
          className="block w-full p-2 border rounded-md"
        >
          <option value="domestic">Domestic</option>
          <option value="business">Business</option>
        </select>
        {errors.clientType && (
          <span className="text-sm text-destructive">
            {errors.clientType.message}
          </span>
        )}
      </div>
    </div>
  )
} 