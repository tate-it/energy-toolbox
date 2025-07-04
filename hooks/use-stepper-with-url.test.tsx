import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { defineStepper } from '@stepperize/react'
import { useStepperWithUrl } from './use-stepper-with-url'
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import type { ReactNode } from 'react'

// Mock stepper instance
const mockStepper = defineStepper(
  { id: 'step-1', title: 'Step 1', description: 'First step' },
  { id: 'step-2', title: 'Step 2', description: 'Second step' },
  { id: 'step-3', title: 'Step 3', description: 'Third step' }
)

describe('useStepperWithUrl', () => {
  function createWrapper(
    initialParams: Record<string, string> = { step: 'step-1' },
    onUrlUpdate?: (event: UrlUpdateEvent) => void
  ) {
    return ({ children }: { children: ReactNode }) => (
      <NuqsTestingAdapter 
        searchParams={initialParams}
        onUrlUpdate={onUrlUpdate}
      >
        <mockStepper.Scoped>
          {children}
        </mockStepper.Scoped>
      </NuqsTestingAdapter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with the first step by default', () => {
    const { result } = renderHook(() => useStepperWithUrl(mockStepper), {
      wrapper: createWrapper()
    })

    expect(result.current.current.id).toBe('step-1')
    expect(result.current.urlStep).toBe('step-1')
    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(false)
  })

  it('should sync with URL on initialization', () => {
    const { result } = renderHook(() => useStepperWithUrl(mockStepper), {
      wrapper: createWrapper({ step: 'step-2' })
    })

    expect(result.current.current.id).toBe('step-2')
    expect(result.current.urlStep).toBe('step-2')
  })

  it('should navigate to next step and update URL', async () => {
    const onStepChange = vi.fn()
    const onUrlUpdate = vi.fn<[UrlUpdateEvent]>()
    const { result } = renderHook(
      () => useStepperWithUrl(mockStepper, { onStepChange }),
      { wrapper: createWrapper({ step: 'step-1' }, onUrlUpdate) }
    )

    await act(async () => {
      const success = await result.current.next()
      expect(success).toBe(true)
    })

    expect(result.current.current.id).toBe('step-2')
    expect(result.current.urlStep).toBe('step-2')
    expect(onStepChange).toHaveBeenCalledWith('step-2')

    // Check URL update
    expect(onUrlUpdate).toHaveBeenCalled()
    const lastCall = onUrlUpdate.mock.calls[onUrlUpdate.mock.calls.length - 1]
    expect(lastCall[0].searchParams.get('step')).toBe('step-2')
  })

  it('should navigate to previous step and update URL', async () => {
    const onStepChange = vi.fn()
    const onUrlUpdate = vi.fn<[UrlUpdateEvent]>()
    const { result } = renderHook(
      () => useStepperWithUrl(mockStepper, { onStepChange }),
      { wrapper: createWrapper({ step: 'step-2' }, onUrlUpdate) }
    )

    await act(async () => {
      const success = await result.current.prev()
      expect(success).toBe(true)
    })

    expect(result.current.current.id).toBe('step-1')
    expect(result.current.urlStep).toBe('step-1')
    expect(onStepChange).toHaveBeenCalledWith('step-1')
  })

  it('should not navigate past the last step', async () => {
    const { result } = renderHook(() => useStepperWithUrl(mockStepper), {
      wrapper: createWrapper({ step: 'step-3' })
    })

    await act(async () => {
      const success = await result.current.next()
      expect(success).toBe(false)
    })

    expect(result.current.current.id).toBe('step-3')
    expect(result.current.isLast).toBe(true)
  })

  it('should not navigate before the first step', async () => {
    const { result } = renderHook(() => useStepperWithUrl(mockStepper), {
      wrapper: createWrapper()
    })

    await act(async () => {
      const success = await result.current.prev()
      expect(success).toBe(false)
    })

    expect(result.current.current.id).toBe('step-1')
    expect(result.current.isFirst).toBe(true)
  })

  it('should navigate to specific step using goTo', async () => {
    const onStepChange = vi.fn()
    const onUrlUpdate = vi.fn<[UrlUpdateEvent]>()
    const { result } = renderHook(
      () => useStepperWithUrl(mockStepper, { onStepChange }),
      { wrapper: createWrapper({ step: 'step-1' }, onUrlUpdate) }
    )

    await act(async () => {
      const success = await result.current.goTo('step-3')
      expect(success).toBe(true)
    })

    expect(result.current.current.id).toBe('step-3')
    expect(result.current.urlStep).toBe('step-3')
    expect(onStepChange).toHaveBeenCalledWith('step-3')
  })

  it('should return false when navigating to invalid step', async () => {
    const { result } = renderHook(() => useStepperWithUrl(mockStepper), {
      wrapper: createWrapper()
    })

    await act(async () => {
      const success = await result.current.goTo('invalid-step')
      expect(success).toBe(false)
    })

    expect(result.current.current.id).toBe('step-1')
  })

  it('should not navigate when already on target step', async () => {
    const onStepChange = vi.fn()
    const { result } = renderHook(
      () => useStepperWithUrl(mockStepper, { onStepChange }),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      const success = await result.current.goTo('step-1')
      expect(success).toBe(true)
    })

    expect(onStepChange).not.toHaveBeenCalled()
  })

  it('should reset to first step', async () => {
    const onStepChange = vi.fn()
    const onUrlUpdate = vi.fn<[UrlUpdateEvent]>()
    const { result } = renderHook(
      () => useStepperWithUrl(mockStepper, { onStepChange }),
      { wrapper: createWrapper({ step: 'step-3' }, onUrlUpdate) }
    )

    await act(async () => {
      await result.current.reset()
    })

    expect(result.current.current.id).toBe('step-1')
    expect(result.current.urlStep).toBe('step-1')
    expect(onStepChange).toHaveBeenCalledWith('step-1')
  })

  it('should use custom query key', () => {
    const { result } = renderHook(
      () => useStepperWithUrl(mockStepper, { queryKey: 'customStep' }),
      { wrapper: createWrapper({ customStep: 'step-2' }) }
    )

    expect(result.current.current.id).toBe('step-2')
  })

  it('should handle invalid URL step gracefully', async () => {
    const onUrlUpdate = vi.fn<[UrlUpdateEvent]>()
    const { result } = renderHook(() => useStepperWithUrl(mockStepper), {
      wrapper: createWrapper({ step: 'invalid-step' }, onUrlUpdate)
    })

    // The stepper should default to first step for invalid URLs
    expect(result.current.current.id).toBe('step-1')
    
    // Wait for the effect to correct the URL by clearing the invalid step
    await waitFor(() => {
      expect(onUrlUpdate).toHaveBeenCalled()
      const lastCall = onUrlUpdate.mock.calls[onUrlUpdate.mock.calls.length - 1]
      // When step is set to null (cleared), it won't be in the search params
      expect(lastCall[0].searchParams.has('step')).toBe(false)
      // The queryString should be empty or not contain step
      expect(lastCall[0].queryString).toBe('')
    })
  })

  it('should expose stepper utility methods', () => {
    const { result } = renderHook(() => useStepperWithUrl(mockStepper), {
      wrapper: createWrapper()
    })

    expect(typeof result.current.when).toBe('function')
    expect(typeof result.current.switch).toBe('function')
    expect(typeof result.current.match).toBe('function')
    expect(typeof result.current.get).toBe('function')
    expect(result.current.utils).toBeDefined()
  })

  it('should expose metadata methods', () => {
    const { result } = renderHook(() => useStepperWithUrl(mockStepper), {
      wrapper: createWrapper()
    })

    expect(result.current.metadata).toBeDefined()
    expect(typeof result.current.getMetadata).toBe('function')
    expect(typeof result.current.setMetadata).toBe('function')
    expect(typeof result.current.resetMetadata).toBe('function')
  })

  it('should expose lifecycle hooks', () => {
    const { result } = renderHook(() => useStepperWithUrl(mockStepper), {
      wrapper: createWrapper()
    })

    expect(typeof result.current.beforeNext).toBe('function')
    expect(typeof result.current.afterNext).toBe('function')
    expect(typeof result.current.beforePrev).toBe('function')
    expect(typeof result.current.afterPrev).toBe('function')
    expect(typeof result.current.beforeGoTo).toBe('function')
    expect(typeof result.current.afterGoTo).toBe('function')
  })

  it('should respect NuQS options', async () => {
    const onUrlUpdate = vi.fn<[UrlUpdateEvent]>()
    const { result } = renderHook(
      () => useStepperWithUrl(mockStepper, { 
        shallow: false,
        scroll: true 
      }),
      { wrapper: createWrapper({ step: 'step-1' }, onUrlUpdate) }
    )

    await act(async () => {
      await result.current.next()
    })

    // Check that URL was updated
    expect(onUrlUpdate).toHaveBeenCalled()
  })
}) 