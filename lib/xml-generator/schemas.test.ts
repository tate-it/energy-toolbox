import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { companyComponentsSchema, paymentConditionsSchema } from './schemas'

// Mock context type for testing superRefine validation
interface MockRefinementContext {
  context?: {
    formStates?: {
      offerDetails?: {
        marketType?: string
      }
    }
  }
  addIssue: ReturnType<typeof vi.fn>
}

describe('companyComponentsSchema cross-step validation', () => {
  describe('gas market validation', () => {
    it('should pass validation when market type is not gas', () => {
      const data = {
        companyComponents: [
          {
            name: 'Test Component',
            description: 'Test Description',
            componentType: '01',
            macroArea: '01',
            priceIntervals: [], // Empty price intervals should be OK for non-gas markets
          },
        ],
      }

      // Create a mock context
      const mockCtx: MockRefinementContext = {
        context: {
          formStates: {
            offerDetails: { marketType: '01' }, // Electricity market
          },
        },
        addIssue: vi.fn(),
      }

      // Run the superRefine validation
      const schema = companyComponentsSchema._def
      if (schema.effects && schema.effects.length > 0) {
        const superRefineEffect = schema.effects[0]
        if (superRefineEffect.type === 'refinement') {
          superRefineEffect.refinement(data, mockCtx)
        }
      }

      expect(mockCtx.addIssue).not.toHaveBeenCalled()
    })

    it('should fail validation when market type is gas and component has no price intervals', () => {
      const data = {
        companyComponents: [
          {
            name: 'Gas Component',
            description: 'Gas Description',
            componentType: '01',
            macroArea: '01',
            priceIntervals: [], // Empty price intervals
          },
        ],
      }

      // Create a mock context with gas market
      const mockCtx = {
        context: {
          formStates: {
            offerDetails: { marketType: '02' }, // Gas market
          },
        },
        addIssue: vi.fn(),
      } as MockRefinementContext

      // Run the superRefine validation
      const schema = companyComponentsSchema._def
      if (schema.effects && schema.effects.length > 0) {
        const superRefineEffect = schema.effects[0]
        if (superRefineEffect.type === 'refinement') {
          superRefineEffect.refinement(data, mockCtx)
        }
      }

      expect(mockCtx.addIssue).toHaveBeenCalledWith({
        code: z.ZodIssueCode.custom,
        message:
          'Per il mercato gas, ogni componente aziendale deve avere almeno un intervallo di prezzo',
        path: ['companyComponents', 0, 'priceIntervals'],
      })
    })

    it('should pass validation when market type is gas and all components have price intervals', () => {
      const data = {
        companyComponents: [
          {
            name: 'Gas Component 1',
            description: 'Gas Description 1',
            componentType: '01',
            macroArea: '01',
            priceIntervals: [
              {
                price: 10,
                unitOfMeasure: '01',
              },
            ],
          },
          {
            name: 'Gas Component 2',
            description: 'Gas Description 2',
            componentType: '02',
            macroArea: '02',
            priceIntervals: [
              {
                price: 20,
                unitOfMeasure: '02',
              },
            ],
          },
        ],
      }

      // Create a mock context with gas market
      const mockCtx = {
        context: {
          formStates: {
            offerDetails: { marketType: '02' }, // Gas market
          },
        },
        addIssue: vi.fn(),
      } as MockRefinementContext

      // Run the superRefine validation
      const schema = companyComponentsSchema._def
      if (schema.effects && schema.effects.length > 0) {
        const superRefineEffect = schema.effects[0]
        if (superRefineEffect.type === 'refinement') {
          superRefineEffect.refinement(data, mockCtx)
        }
      }

      expect(mockCtx.addIssue).not.toHaveBeenCalled()
    })

    it('should skip validation when context is not available', () => {
      const data = {
        companyComponents: [
          {
            name: 'Test Component',
            description: 'Test Description',
            componentType: '01',
            macroArea: '01',
            priceIntervals: [],
          },
        ],
      }

      // Create a mock context without formStates
      const mockCtx = {
        addIssue: vi.fn(),
      } as MockRefinementContext

      // Run the superRefine validation
      const schema = companyComponentsSchema._def
      if (schema.effects && schema.effects.length > 0) {
        const superRefineEffect = schema.effects[0]
        if (superRefineEffect.type === 'refinement') {
          superRefineEffect.refinement(data, mockCtx)
        }
      }

      // Should not add any issues when context is missing
      expect(mockCtx.addIssue).not.toHaveBeenCalled()
    })

    it('should validate multiple components with mixed price intervals', () => {
      const data = {
        companyComponents: [
          {
            name: 'Component 1',
            description: 'Description 1',
            componentType: '01',
            macroArea: '01',
            priceIntervals: [{ price: 10, unitOfMeasure: '01' }],
          },
          {
            name: 'Component 2',
            description: 'Description 2',
            componentType: '02',
            macroArea: '02',
            priceIntervals: [], // No price intervals
          },
          {
            name: 'Component 3',
            description: 'Description 3',
            componentType: '01',
            macroArea: '01',
            priceIntervals: [{ price: 30, unitOfMeasure: '03' }],
          },
        ],
      }

      // Create a mock context with gas market
      const mockCtx = {
        context: {
          formStates: {
            offerDetails: { marketType: '02' }, // Gas market
          },
        },
        addIssue: vi.fn(),
      } as MockRefinementContext

      // Run the superRefine validation
      const schema = companyComponentsSchema._def
      if (schema.effects && schema.effects.length > 0) {
        const superRefineEffect = schema.effects[0]
        if (superRefineEffect.type === 'refinement') {
          superRefineEffect.refinement(data, mockCtx)
        }
      }

      // Should only have issue for component at index 1
      expect(mockCtx.addIssue).toHaveBeenCalledTimes(1)
      expect(mockCtx.addIssue).toHaveBeenCalledWith({
        code: z.ZodIssueCode.custom,
        message:
          'Per il mercato gas, ogni componente aziendale deve avere almeno un intervallo di prezzo',
        path: ['companyComponents', 1, 'priceIntervals'],
      })
    })
  })
})

describe('paymentConditionsSchema', () => {
  it('validates correct payment conditions data', () => {
    const validData = {
      paymentMethods: [
        {
          paymentMethodType: '01',
        },
      ],
      contractualConditions: [
        {
          conditionType: '01',
          description: 'Test condition',
          isLimiting: '01',
        },
      ],
    }

    const result = paymentConditionsSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('requires at least one payment method', () => {
    const invalidData = {
      paymentMethods: [],
    }

    const result = paymentConditionsSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(
      'È richiesto almeno un metodo di pagamento',
    )
  })

  it('validates conditionType 05 date restriction with valid date', () => {
    // Mock the form context with a valid date
    const mockContext = {
      context: {
        formStates: {
          validityReview: {
            validityPeriod: {
              startDate: '01/02/2024', // February 1, 2024
            },
          },
        },
      },
    }

    const validData = {
      paymentMethods: [
        {
          paymentMethodType: '01',
        },
      ],
      contractualConditions: [
        {
          conditionType: '05', // Early Withdrawal Charges
          description: 'Oneri di recesso anticipato',
          isLimiting: '01',
        },
      ],
    }

    // Parse with context
    const parseResult = paymentConditionsSchema._parse({
      data: validData,
      path: [],
      parent: null,
      config: { context: mockContext.context },
    })

    expect(parseResult.status).toBe('valid')
  })

  it('rejects conditionType 05 with date before 2024', () => {
    // Mock the form context with an invalid date
    const mockContext = {
      context: {
        formStates: {
          validityReview: {
            validityPeriod: {
              startDate: '15/12/2023', // December 15, 2023
            },
          },
        },
      },
    }

    const invalidData = {
      paymentMethods: [
        {
          paymentMethodType: '01',
        },
      ],
      contractualConditions: [
        {
          conditionType: '05', // Early Withdrawal Charges
          description: 'Oneri di recesso anticipato',
          isLimiting: '01',
        },
      ],
    }

    // Parse with context
    const result = paymentConditionsSchema._parse({
      data: invalidData,
      path: [],
      parent: null,
      config: { context: mockContext.context },
    })

    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      const issue = result.error.issues.find(
        (err) => err.path[0] === 'contractualConditions',
      )
      expect(issue?.message).toBe(
        'Gli Oneri di Recesso Anticipato (condizione 05) possono essere utilizzati solo per offerte con validità dal 1 gennaio 2024 in poi',
      )
    }
  })

  it('shows warning for conditionType 05 when validity date is not set', () => {
    // Mock the form context without validity date
    const mockContext = {
      context: {
        formStates: {},
      },
    }

    const data = {
      paymentMethods: [
        {
          paymentMethodType: '01',
        },
      ],
      contractualConditions: [
        {
          conditionType: '05', // Early Withdrawal Charges
          description: 'Oneri di recesso anticipato',
          isLimiting: '01',
        },
      ],
    }

    // Parse with context
    const result = paymentConditionsSchema._parse({
      data,
      path: [],
      parent: null,
      config: { context: mockContext.context },
    })

    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      const issue = result.error.issues.find(
        (err) => err.path[0] === 'contractualConditions',
      )
      expect(issue?.message).toBe(
        'Per utilizzare gli Oneri di Recesso Anticipato (condizione 05), è necessario prima impostare una data di validità dal 1 gennaio 2024 in poi nel passo "Validità e Revisione"',
      )
    }
  })
})
