'use client'

import { useQueryState } from 'nuqs'
import { Suspense } from 'react'
import type { StepperVariant } from '@/components/stepper'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { currentStepParser } from '@/lib/xml-generator/nuqs-parsers'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'

function StepperProviderContent({
  children,
  variant,
  className,
}: {
  children: React.ReactNode
  variant: StepperVariant
  className?: string
}) {
  const { Stepper } = xmlFormStepper
  const [initialStep] = useQueryState('currentStep', currentStepParser)

  return (
    <Stepper.Provider
      className={className}
      initialStep={initialStep}
      variant={variant}
    >
      {children}
    </Stepper.Provider>
  )
}

function StepperProviderSkeleton({
  variant,
  className,
}: {
  variant: StepperVariant
  className?: string
}) {
  const isHorizontal = variant === 'horizontal'
  const isCircle = variant === 'circle'

  return (
    <div className={cn('w-full', className)}>
      {/* Navigation skeleton */}
      <nav aria-label="Loading stepper navigation">
        <ol
          className={cn(
            'flex gap-2',
            isHorizontal || isCircle
              ? 'flex-row items-center justify-between'
              : 'flex-col',
          )}
        >
          {Array.from({ length: 4 }, (_, i) => i).map((index) => (
            <li
              className={cn(
                'flex items-center gap-2',
                variant === 'vertical' && 'flex-row',
                variant === 'circle' && 'shrink-0 gap-4',
              )}
              key={index}
            >
              {/* Step indicator skeleton */}
              {isCircle ? (
                <Skeleton className="h-20 w-20 rounded-full" />
              ) : (
                <Skeleton className="h-10 w-10 rounded-full" />
              )}

              {/* Step content skeleton */}
              <div className="flex flex-col items-start gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>

              {/* Separator skeleton for horizontal variant */}
              {isHorizontal && index < 3 && (
                <Skeleton className="h-0.5 flex-1" />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Panel content skeleton */}
      <div className="mt-8">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>

      {/* Controls skeleton */}
      <div className="mt-6 flex justify-end gap-4">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  )
}

export function StepperProvider({
  children,
  variant,
  className,
}: {
  children: React.ReactNode
  variant: StepperVariant
  className?: string
}) {
  return (
    <Suspense
      fallback={
        <StepperProviderSkeleton className={className} variant={variant} />
      }
    >
      <StepperProviderContent className={className} variant={variant}>
        {children}
      </StepperProviderContent>
    </Suspense>
  )
}
