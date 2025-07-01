/**
 * Shared TypeScript types and interfaces for SII XML Generator
 * Enhanced with strict TypeScript configuration for optimal type safety
 */

// Re-export all schema types for convenience
export * from '@/lib/schemas'

/**
 * Application-wide utility types
 * Uses exactOptionalPropertyTypes for strict optional handling
 */

/**
 * Makes all properties optional and nullable
 * Enhanced with noUncheckedIndexedAccess compatibility
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Extracts the keys of T where the value is of type U
 * Uses strict type checking for precise key extraction
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

/**
 * Makes specific properties required
 * Enhanced with exactOptionalPropertyTypes
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Makes specific properties optional
 * Uses strict optional property handling
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Wizard step configuration type
 * Enhanced with noImplicitReturns for comprehensive step definitions
 */
export interface WizardStepConfig {
  readonly id: string
  readonly title: string
  readonly description?: string
  readonly isOptional?: boolean
  readonly dependencies?: readonly string[]
  readonly validationSchema?: any // Will be properly typed with Zod schemas
}

/**
 * Form field configuration type
 * Uses strict type checking for form field definitions
 */
export interface FormFieldConfig {
  readonly name: string
  readonly label: string
  readonly type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date'
  readonly placeholder?: string
  readonly helpText?: string
  readonly isRequired?: boolean
  readonly options?: readonly { value: string; label: string }[]
  readonly validation?: any // Will be properly typed with Zod schemas
}

/**
 * API response wrapper type
 * Enhanced with strict error handling
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: Record<string, any>
  }
  metadata?: {
    timestamp: string
    requestId?: string
    version?: string
  }
}

/**
 * Pagination configuration type
 * Uses noUncheckedIndexedAccess for safe pagination handling
 */
export interface PaginationConfig {
  readonly page: number
  readonly limit: number
  readonly total?: number
  readonly hasNext?: boolean
  readonly hasPrev?: boolean
}

/**
 * File upload configuration type
 * Enhanced with strict file type checking
 */
export interface FileUploadConfig {
  readonly maxSize: number // in bytes
  readonly allowedTypes: readonly string[]
  readonly maxFiles?: number
  readonly quality?: number // for images
}

/**
 * Error boundary error info type
 * Uses strict error handling patterns
 */
export interface ErrorInfo {
  componentStack: string
  errorBoundary?: string
  eventId?: string
}

/**
 * Theme configuration type
 * Enhanced with exactOptionalPropertyTypes for theme options
 */
export interface ThemeConfig {
  readonly primary: string
  readonly secondary: string
  readonly accent?: string
  readonly background: string
  readonly foreground: string
  readonly muted?: string
  readonly border?: string
  readonly radius?: string
}

/**
 * User session type
 * Uses strict type checking for session management
 */
export interface UserSession {
  readonly id: string
  readonly email?: string
  readonly name?: string
  readonly role: 'admin' | 'user' | 'guest'
  readonly permissions: readonly string[]
  readonly expiresAt: Date
  readonly createdAt: Date
}

/**
 * Application configuration type
 * Enhanced with noImplicitReturns for comprehensive config validation
 */
export interface AppConfig {
  readonly env: 'development' | 'staging' | 'production'
  readonly apiBaseUrl: string
  readonly features: {
    readonly enableDebugMode: boolean
    readonly enableAnalytics: boolean
    readonly enableA11y: boolean
  }
  readonly limits: {
    readonly maxFileSize: number
    readonly maxSteps: number
    readonly sessionTimeout: number
  }
}

/**
 * Event handler types
 * Uses strict function type definitions
 */
export type EventHandler<T = any> = (event: T) => void
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>

/**
 * Component props utility types
 * Enhanced with strict prop type checking
 */
export type ComponentProps<T extends React.ComponentType<any>> = 
  T extends React.ComponentType<infer P> ? P : never

export type ComponentRef<T extends React.ComponentType<any>> = 
  T extends React.ForwardRefExoticComponent<any> 
    ? React.ComponentRef<T> 
    : never

/**
 * Async operation state type
 * Uses exactOptionalPropertyTypes for loading states
 */
export interface AsyncState<T = any, E = Error> {
  readonly data?: T | undefined
  readonly error?: E | undefined
  readonly isLoading: boolean
  readonly isSuccess: boolean
  readonly isError: boolean
}

/**
 * Create async state helper
 * Enhanced with strict state initialization
 */
export function createAsyncState<T = any, E = Error>(): AsyncState<T, E> {
  return {
    data: undefined as T | undefined,
    error: undefined as E | undefined,
    isLoading: false,
    isSuccess: false,
    isError: false
  }
} 