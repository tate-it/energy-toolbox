import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { parseAsFormData, createFormStateParsers, formSearchParams } from './nuqs-parsers'
import { basicInfoSchema, offerDetailsSchema } from './schemas'

describe('parseAsFormData', () => {
  // Test schema for basic validation
  const testSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    age: z.number().optional(),
  })

  describe('parse', () => {
    it('should parse valid base64 encoded JSON that matches schema', () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 }
      const encoded = btoa(JSON.stringify(data))
      const parser = parseAsFormData(testSchema)

      const result = parser.parse(encoded)

      expect(result).toEqual(data)
    })

    it('should return empty object for empty string', () => {
      const parser = parseAsFormData(testSchema)

      const result = parser.parse('')

      expect(result).toEqual({})
    })

    it('should return empty object for invalid base64', () => {
      const parser = parseAsFormData(testSchema)

      const result = parser.parse('invalid-base64!')

      expect(result).toEqual({})
    })

    it('should return empty object for valid base64 but invalid JSON', () => {
      const invalidJson = btoa('invalid json {')
      const parser = parseAsFormData(testSchema)

      const result = parser.parse(invalidJson)

      expect(result).toEqual({})
    })

    it('should return empty object for valid JSON that does not match schema', () => {
      const invalidData = { name: 'John', email: 'invalid-email' }
      const encoded = btoa(JSON.stringify(invalidData))
      const parser = parseAsFormData(testSchema)

      const result = parser.parse(encoded)

      expect(result).toEqual({})
    })

    it('should handle schema validation with optional fields', () => {
      const data = { name: 'John', email: 'john@example.com' } // age is optional
      const encoded = btoa(JSON.stringify(data))
      const parser = parseAsFormData(testSchema)

      const result = parser.parse(encoded)

      expect(result).toEqual(data)
    })

    it('should work with real schema from schemas file', () => {
      const validBasicInfo = {
        pivaUtente: 'IT12345678901',
        codOfferta: 'OFFER2024',
      }
      const encoded = btoa(JSON.stringify(validBasicInfo))
      const parser = parseAsFormData(basicInfoSchema)

      const result = parser.parse(encoded)

      expect(result).toEqual(validBasicInfo)
    })

    it('should reject invalid data against real schema', () => {
      const invalidBasicInfo = {
        pivaUtente: 'invalid', // too short
        codOfferta: 'OFFER2024',
      }
      const encoded = btoa(JSON.stringify(invalidBasicInfo))
      const parser = parseAsFormData(basicInfoSchema)

      const result = parser.parse(encoded)

      expect(result).toEqual({})
    })
  })

  describe('serialize', () => {
    it('should serialize object to base64 encoded JSON', () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 }
      const parser = parseAsFormData(testSchema)

      const result = parser.serialize(data)

      const decoded = JSON.parse(atob(result))
      expect(decoded).toEqual(data)
    })

    it('should return empty string for empty object', () => {
      const parser = parseAsFormData(testSchema)

      const result = parser.serialize({})

      expect(result).toBe('')
    })

    it('should return empty string for null', () => {
      const parser = parseAsFormData(testSchema)

      const result = parser.serialize(null)

      expect(result).toBe('')
    })

    it('should return empty string for undefined', () => {
      const parser = parseAsFormData(testSchema)

      const result = parser.serialize(undefined)

      expect(result).toBe('')
    })

    it('should handle complex nested objects', () => {
      const complexSchema = z.object({
        user: z.object({
          name: z.string(),
          preferences: z.object({
            theme: z.string(),
            notifications: z.boolean(),
          }),
        }),
        items: z.array(z.string()),
      })

      const complexData = {
        user: {
          name: 'John',
          preferences: {
            theme: 'dark',
            notifications: true,
          },
        },
        items: ['item1', 'item2'],
      }

      const parser = parseAsFormData(complexSchema)

      const result = parser.serialize(complexData)

      const decoded = JSON.parse(atob(result))
      expect(decoded).toEqual(complexData)
    })

    it('should return empty string for objects that cannot be serialized', () => {
      const circularRef: Record<string, unknown> = {}
      circularRef.self = circularRef
      const parser = parseAsFormData(testSchema)

      const result = parser.serialize(circularRef)

      expect(result).toBe('')
    })
  })

  describe('round-trip serialization', () => {
    it('should maintain data integrity through parse/serialize cycle', () => {
      const offerData = {
        marketType: '01' as const,
        clientType: '01' as const,
        offerType: '01' as const,
        contractActivationTypes: ['01' as const],
        offerName: 'Test Offer',
        offerDescription: 'Test Description',
        duration: 12,
        guarantees: 'Test Guarantees',
        singleOffer: 'SI' as const,
      }

      const parser = parseAsFormData(offerDetailsSchema)
      const serialized = parser.serialize(offerData)
      const parsed = parser.parse(serialized)

      expect(parsed).toEqual(offerData)
    })

    it('should handle schema with validation rules', () => {
      const basicData = {
        pivaUtente: 'IT12345678901',
        codOfferta: 'OFFER2024',
      }

      const parser = parseAsFormData(basicInfoSchema)
      const serialized = parser.serialize(basicData)
      const parsed = parser.parse(serialized)

      expect(parsed).toEqual(basicData)
    })
  })
})

describe('createFormStateParsers', () => {
  it('should create parsers for all schemas in schemaMap', () => {
    const parsers = createFormStateParsers()

    expect(parsers).toBeDefined()
    expect(typeof parsers).toBe('object')
    
    // Check that parsers have the expected structure
    for (const [key, parser] of Object.entries(parsers)) {
      expect(parser).toBeDefined()
      expect(typeof parser.parse).toBe('function')
      expect(typeof parser.serialize).toBe('function')
    }
  })
})

describe('formSearchParams', () => {
  it('should include currentStep parser and form state parsers', () => {
    expect(formSearchParams).toBeDefined()
    expect(formSearchParams.currentStep).toBeDefined()
    
    // Check that it includes parsers for different steps
    expect(typeof formSearchParams).toBe('object')
    
    // Verify currentStep parser functionality
    expect(typeof formSearchParams.currentStep.parse).toBe('function')
    expect(typeof formSearchParams.currentStep.serialize).toBe('function')
  })
})
