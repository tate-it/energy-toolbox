import { createLoader, createParser, parseAsStringLiteral } from 'nuqs/server'
import { steps } from './stepperize/config'

// Simple base64 form data parser
export const parseAsFormData = createParser({
  parse: (value: string) => {
    if (!value) {
      return {}
    }
    try {
      return JSON.parse(atob(value))
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

export const formSearchParams = {
  currentStep: parseAsStringLiteral(steps).withDefault(steps[0]),
  formData: parseAsFormData.withDefault({}),
}

export const loadSearchParams = createLoader(formSearchParams)
