import { Skeleton } from '@/components/ui/skeleton'

export function OfferDetailsSkeleton() {
  return (
    <div className="space-y-6 text-start">
      {/* Grid of select fields */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Market Type Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Single Offer Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Client Type Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Offer Type Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Contract Activation Types Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div className="flex items-center space-x-2" key={i}>
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Offer Name Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Offer Description Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>

      {/* Duration and Guarantees Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Duration Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>

      {/* Guarantees Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-3 w-80" />
      </div>
    </div>
  )
}
