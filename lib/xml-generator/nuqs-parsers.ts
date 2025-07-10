import { createLoader, createParser, parseAsStringLiteral } from 'nuqs/server'
import type { z } from 'zod'
import { schemaMap } from './schemas'
import { steps } from './stepperize/config'

// Simple base64 form data parser - now generic to preserve schema types
export const parseAsFormData = <T extends z.ZodSchema>(schema: T) =>
  createParser({
    parse: (value: string): z.infer<T> | Record<string, never> => {
      if (!value) {
        return {}
      }
      try {
        const parsed = JSON.parse(atob(value))
        const result = schema.safeParse(parsed)
        if (result.success) {
          return result.data
        }
        return {}
      } catch {
        return {}
      }
    },
    serialize: (value: unknown) => {
      if (!value || Object.keys(value).length === 0) {
        return ''
      }
      try {
        return btoa(JSON.stringify(value))
      } catch {
        return ''
      }
    },
  })

// Helper function to create parsers that preserves types
const createParsersFromSchemaMap = <T extends Record<string, z.ZodSchema>>(
  schemas: T,
) => {
  const result = {} as {
    [K in keyof T]: ReturnType<typeof parseAsFormData<T[K]>>
  }

  for (const key of Object.keys(schemas)) {
    result[key as keyof T] = parseAsFormData(schemas[key])
  }

  return result
}

// Create form state parsers dynamically from schemaMap
export const createFormStateParsers = () => {
  return createParsersFromSchemaMap(schemaMap)
}

export const formSearchParams = {
  currentStep: parseAsStringLiteral(steps).withDefault(steps[0]),
  ...createFormStateParsers(),
}

export const loadSearchParams = createLoader(formSearchParams)
