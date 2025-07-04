import { describe, it, expect } from 'vitest'
import { xmlFormStepper } from './stepperize-config'

describe('xmlFormStepper', () => {
  it('should be a valid stepper instance', () => {
    expect(xmlFormStepper).toBeDefined()
    expect(xmlFormStepper.steps).toBeDefined()
  })

  it('should define all 8 form steps', () => {
    expect(xmlFormStepper.steps).toHaveLength(8)
  })

  it('should have correct step IDs in order', () => {
    const expectedIds = [
      'basic-info',
      'offer-details',
      'activation-contacts',
      'pricing-config',
      'company-components',
      'payment-conditions',
      'additional-features',
      'validity-review'
    ]
    
    const actualIds = xmlFormStepper.steps.map(step => step.id)
    expect(actualIds).toEqual(expectedIds)
  })

  it('should have titles for all steps', () => {
    xmlFormStepper.steps.forEach(step => {
      expect(step.title).toBeTruthy()
      expect(typeof step.title).toBe('string')
    })
  })

  it('should have descriptions for all steps', () => {
    xmlFormStepper.steps.forEach(step => {
      expect(step.description).toBeTruthy()
      expect(typeof step.description).toBe('string')
    })
  })

  it('should have correct first and last steps', () => {
    const firstStep = xmlFormStepper.steps[0]
    expect(firstStep.id).toBe('basic-info')
    expect(firstStep.title).toBe('Basic Information')
    
    const lastStep = xmlFormStepper.steps[7]
    expect(lastStep.id).toBe('validity-review')
    expect(lastStep.title).toBe('Validity & Review')
  })
}) 