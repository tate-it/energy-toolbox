/**
 * XML generation and validation schemas for SII XML Generator
 * Enhanced with strict TypeScript configuration for XML compliance
 */

import { z } from 'zod'

// XML element validation schema with proper typing
export type XMLElement = {
  name: string
  attributes?: Record<string, string> | undefined
  content?: string | any[] | undefined
  children?: XMLElement[] | undefined
}

export const XMLElementSchema: z.ZodType<XMLElement> = z.object({
  name: z.string().min(1, 'Nome elemento XML richiesto'),
  attributes: z.record(z.string()).optional(),
  content: z.union([z.string(), z.array(z.any())]).optional(),
  children: z.array(z.lazy(() => XMLElementSchema)).optional()
}) as z.ZodType<XMLElement>

// SII XML root structure schema (placeholder)
export const SIIXMLSchema = z.object({
  // Will be implemented with actual SII XML structure
  version: z.literal('4.5').default('4.5'),
  encoding: z.literal('UTF-8').default('UTF-8'),
  placeholder: z.literal('TODO: Implement SII XML structure')
})

export type SIIXML = z.infer<typeof SIIXMLSchema>

// XML validation result
export const XMLValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([])
})

export type XMLValidationResult = z.infer<typeof XMLValidationResultSchema> 