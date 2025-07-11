import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ValidityReviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Completion Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-2 flex justify-between text-sm">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <Badge variant="secondary">
              <Skeleton className="h-4 w-20" />
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Validity Period Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-80" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-80" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-72" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Multiple sections with skeleton content */}
          {[1, 2, 3].map((section) => (
            <div key={section}>
              <Skeleton className="mb-3 h-5 w-32" />
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <Skeleton className="mb-1 h-3 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div>
                  <Skeleton className="mb-1 h-3 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              {section < 3 && <div className="my-4 border-t" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Review Confirmation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-80" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-row items-start space-x-3 space-y-0">
            <Skeleton className="mt-0.5 h-4 w-4" />
            <div className="space-y-1 leading-none">
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-3 w-96" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-3 w-64" />
          </div>
        </CardContent>
      </Card>

      {/* XML Preview Card */}
      <Card className="border-gray-300 border-dashed">
        <CardContent className="py-8 text-center">
          <Skeleton className="mx-auto mb-3 h-12 w-12 rounded" />
          <Skeleton className="mx-auto mb-2 h-5 w-32" />
          <Skeleton className="mx-auto h-4 w-80" />
        </CardContent>
      </Card>
    </div>
  )
}
