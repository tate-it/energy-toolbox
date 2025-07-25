import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock useFormStates hook to avoid nuqs dependency in tests
vi.mock('@/hooks/use-form-states', () => ({
  useFormStates: vi.fn(() => [{}, vi.fn()])
}))

// Mock nuqs to avoid adapter errors in tests
vi.mock('nuqs', () => ({
  useQueryState: vi.fn(() => [null, vi.fn()]),
  parseAsString: vi.fn((defaultValue) => ({
    defaultValue,
    parse: (value) => value || defaultValue,
    serialize: (value) => value,
  })),
}))
