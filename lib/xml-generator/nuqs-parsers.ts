import { createParser } from 'nuqs'

// Simple base64 form data parser
export const parseAsFormData = createParser({
  parse: (value: string) => {
    if (!value) return {}
    try {
      return JSON.parse(atob(value))
    } catch {
      return {}
    }
  },
  serialize: (value: unknown) => {
    if (!value || Object.keys(value).length === 0) return ''
    try {
      return btoa(JSON.stringify(value))
    } catch {
      return ''
    }
  },
}) 