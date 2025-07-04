'use client'

import { useQueryState, parseAsString } from 'nuqs'
import { useEffect, useCallback, useRef } from 'react'
import type { defineStepper, Step } from '@stepperize/react'

// More precise type for the stepper instance
type StepperInstance<T extends Step[]> = ReturnType<typeof defineStepper<T>>

export function useStepperWithUrl<T extends Step[]>(
  stepperInstance: StepperInstance<T>,
  options?: {
    queryKey?: string
    onStepChange?: (stepId: string) => void
    shallow?: boolean // Allow configuring NuQS shallow option
    scroll?: boolean // Allow configuring NuQS scroll option
  }
) {
  const queryKey = options?.queryKey ?? 'step'
  const isNavigatingRef = useRef(false)
  
  // Use nuqs to sync step state with URL
  const [urlStep, setUrlStep] = useQueryState(
    queryKey,
    parseAsString.withDefault(stepperInstance.steps[0].id).withOptions({
      shallow: options?.shallow ?? true,
      scroll: options?.scroll ?? false
    })
  )
  
  // Use the useStepper hook from the stepper instance
  const stepper = stepperInstance.useStepper()
  
  // Get utils from the stepper instance
  const { utils } = stepperInstance
  
  // Sync URL state to stepper when URL changes (e.g., browser back/forward)
  useEffect(() => {
    // Skip if we're already navigating programmatically
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false
      return
    }
    
    // Only navigate if the URL step is different from current step
    if (urlStep && urlStep !== stepper.current.id) {
      const targetStep = stepper.get(urlStep)
      if (targetStep) {
        // Use goTo directly without URL update to avoid loop
        stepper.goTo(urlStep)
        options?.onStepChange?.(urlStep)
      } else {
        // If URL has invalid step, reset to current step
        setUrlStep(stepper.current.id)
      }
    }
  }, [urlStep, stepper, setUrlStep, options])
  
  // Create navigation methods that update URL first, then navigate
  const next = useCallback(async () => {
    if (stepper.isLast) {
      return false
    }
    
    // Get the next step using utils
    const nextStep = utils.getNext(stepper.current.id)
    if (!nextStep) {
      return false
    }
    
    try {
      isNavigatingRef.current = true
      
      // Update URL first
      await setUrlStep(nextStep.id)
      
      // Then navigate
      stepper.next()
      
      // Call the callback after navigation
      options?.onStepChange?.(nextStep.id)
      
      return true
    } catch (error) {
      isNavigatingRef.current = false
      throw error
    }
  }, [stepper, utils, setUrlStep, options])
  
  const prev = useCallback(async () => {
    if (stepper.isFirst) {
      return false
    }
    
    // Get the previous step using utils
    const prevStep = utils.getPrev(stepper.current.id)
    if (!prevStep) {
      return false
    }
    
    try {
      isNavigatingRef.current = true
      
      // Update URL first
      await setUrlStep(prevStep.id)
      
      // Then navigate
      stepper.prev()
      
      // Call the callback after navigation
      options?.onStepChange?.(prevStep.id)
      
      return true
    } catch (error) {
      isNavigatingRef.current = false
      throw error
    }
  }, [stepper, utils, setUrlStep, options])
  
  const goTo = useCallback(async (stepId: string) => {
    const targetStep = stepper.get(stepId)
    if (!targetStep) {
      return false
    }
    
    // Don't navigate if already on this step
    if (stepper.current.id === stepId) {
      return true
    }
    
    try {
      isNavigatingRef.current = true
      
      // Update URL first
      await setUrlStep(stepId)
      
      // Then navigate
      stepper.goTo(stepId)
      
      // Call the callback after navigation
      options?.onStepChange?.(stepId)
      
      return true
    } catch (error) {
      isNavigatingRef.current = false
      throw error
    }
  }, [stepper, setUrlStep, options])
  
  const reset = useCallback(async () => {
    const firstStepId = stepperInstance.steps[0].id
    
    try {
      isNavigatingRef.current = true
      
      // Update URL first
      await setUrlStep(firstStepId)
      
      // Then reset stepper
      stepper.reset()
      
      // Call the callback
      options?.onStepChange?.(firstStepId)
    } catch (error) {
      isNavigatingRef.current = false
      throw error
    }
  }, [stepper, stepperInstance.steps, setUrlStep, options])
  
  // Return only the methods and properties we want to expose
  return {
    // Navigation methods (overridden to sync with URL)
    next,
    prev,
    goTo,
    reset,
    
    // State properties
    current: stepper.current,
    currentStep: stepper.current, // Alias for consistency
    isFirst: stepper.isFirst,
    isLast: stepper.isLast,
    
    // Utility methods from Stepperize
    get: stepper.get,
    
    // Conditional rendering methods
    when: stepper.when,
    switch: stepper.switch,
    match: stepper.match,
    
    // Metadata methods
    metadata: stepper.metadata,
    getMetadata: stepper.getMetadata,
    setMetadata: stepper.setMetadata,
    resetMetadata: stepper.resetMetadata,
    
    // Lifecycle hooks (these can still be used directly)
    beforeNext: stepper.beforeNext,
    afterNext: stepper.afterNext,
    beforePrev: stepper.beforePrev,
    afterPrev: stepper.afterPrev,
    beforeGoTo: stepper.beforeGoTo,
    afterGoTo: stepper.afterGoTo,
    
    // Additional properties
    steps: stepperInstance.steps,
    urlStep,
    
    // Utils (expose the entire utils object)
    utils: stepperInstance.utils
  }
} 