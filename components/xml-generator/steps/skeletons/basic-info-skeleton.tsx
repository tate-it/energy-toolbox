import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function BasicInfoSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-96" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PIVA_UTENTE Field Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-80" />
        </div>

        {/* COD_OFFERTA Field Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-80" />
        </div>

        {/* Information Box Skeleton */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Skeleton className="mb-2 h-4 w-40 bg-blue-100" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-full bg-blue-100" />
            <Skeleton className="h-3 w-full bg-blue-100" />
            <Skeleton className="h-3 w-3/4 bg-blue-100" />
            <Skeleton className="h-3 w-5/6 bg-blue-100" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
