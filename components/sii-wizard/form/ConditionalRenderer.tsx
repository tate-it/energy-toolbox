'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/**
 * ConditionalRenderer - Flexible component for conditional form field rendering
 * 
 * Handles the complex conditional logic patterns found in SII wizard steps:
 * - Show/hide fields based on other field values
 * - Required/optional field changes based on context
 * - Cross-field validation dependencies
 * - Nested conditional structures
 */

// =====================================================
// CORE CONDITIONAL RENDERER
// =====================================================

export interface ConditionalRendererProps {
  // Condition function that determines if content should be rendered
  condition: boolean | (() => boolean)
  
  // Content to render when condition is true
  children: React.ReactNode
  
  // Optional content to render when condition is false (else clause)
  fallback?: React.ReactNode
  
  // Animation and styling
  className?: string
  animate?: boolean
  
  // Debug information for development
  debugLabel?: string
}

export function ConditionalRenderer({ 
  condition, 
  children, 
  fallback = null,
  className,
  animate = false,
  debugLabel
}: ConditionalRendererProps) {
  const shouldRender = typeof condition === 'function' ? condition() : condition
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development' && debugLabel) {
    console.log(`ConditionalRenderer [${debugLabel}]:`, shouldRender)
  }
  
  if (!shouldRender) {
    return fallback ? <>{fallback}</> : null
  }
  
  return (
    <div 
      className={cn(
        animate && "transition-all duration-300 ease-in-out",
        className
      )}
    >
      {children}
    </div>
  )
}

// =====================================================
// CONDITIONAL FIELD WRAPPER
// =====================================================

export interface ConditionalFieldProps {
  // Field visibility condition
  showWhen: boolean | (() => boolean)
  
  // Field requirement condition
  requiredWhen?: boolean | (() => boolean)
  
  // Content to render
  children: React.ReactNode
  
  // Field information for debugging
  fieldName?: string
  
  // Styling
  className?: string
}

export function ConditionalField({
  showWhen,
  requiredWhen,
  children,
  fieldName,
  className
}: ConditionalFieldProps) {
  const isVisible = typeof showWhen === 'function' ? showWhen() : showWhen
  const isRequired = requiredWhen ? (typeof requiredWhen === 'function' ? requiredWhen() : requiredWhen) : false
  
  if (!isVisible) {
    return null
  }
  
  return (
    <div 
      className={cn(
        "transition-all duration-200 ease-in-out",
        isRequired && "required-field",
        className
      )}
      data-field-name={fieldName}
      data-required={isRequired}
    >
      {children}
    </div>
  )
}

// =====================================================
// STEP-SPECIFIC CONDITIONAL LOGIC HELPERS
// =====================================================

/**
 * Step 5: Energy Price References Conditional Logic
 */
export interface Step5ConditionalProps {
  priceReferenceType?: string
  timeBands?: string
  children: (helpers: {
    showFixedPrice: boolean
    showVariableFormula: boolean
    showIndexation: boolean
    showTimeBandPrices: boolean
    requiresBandPrice: (band: 'F1' | 'F2' | 'F3') => boolean
  }) => React.ReactNode
}

export function Step5Conditional({ priceReferenceType, timeBands, children }: Step5ConditionalProps) {
  const helpers = {
    showFixedPrice: priceReferenceType === 'FISSO',
    showVariableFormula: priceReferenceType === 'VARIABILE',
    showIndexation: priceReferenceType === 'INDICIZZATO' || priceReferenceType === 'VARIABILE',
    showTimeBandPrices: !!timeBands,
    requiresBandPrice: (band: 'F1' | 'F2' | 'F3') => {
      if (!timeBands) return false
      switch (timeBands) {
        case 'MONORARIA': return band === 'F1'
        case 'BIORARIA': return band === 'F1' || band === 'F2'
        case 'MULTIORARIA': return true
        default: return false
      }
    }
  }
  
  return <>{children(helpers)}</>
}

/**
 * Step 7: Offer Characteristics Conditional Logic
 */
export interface Step7ConditionalProps {
  offerType?: string
  children: (helpers: {
    isFlat: boolean
    showFlatFields: boolean
    requiresFlatCharacteristics: boolean
    requiresFlatDuration: boolean
    shouldHavePriceComponent: boolean
  }) => React.ReactNode
}

export function Step7Conditional({ offerType, children }: Step7ConditionalProps) {
  const isFlat = offerType === 'FLAT'
  
  const helpers = {
    isFlat,
    showFlatFields: isFlat,
    requiresFlatCharacteristics: isFlat,
    requiresFlatDuration: isFlat,
    shouldHavePriceComponent: isFlat
  }
  
  return <>{children(helpers)}</>
}

/**
 * Step 8: Dual Offer Conditional Logic
 */
export interface Step8ConditionalProps {
  isDualOffer?: boolean
  hasDiscount?: boolean
  children: (helpers: {
    showDualFields: boolean
    requiresElectricityIncluded: boolean
    requiresGasIncluded: boolean
    shouldHaveAdvantagesOrConditions: boolean
    showActivationMethods: boolean
  }) => React.ReactNode
}

export function Step8Conditional({ isDualOffer, hasDiscount, children }: Step8ConditionalProps) {
  const helpers = {
    showDualFields: !!isDualOffer,
    requiresElectricityIncluded: !!isDualOffer,
    requiresGasIncluded: !!isDualOffer,
    shouldHaveAdvantagesOrConditions: !!(isDualOffer && hasDiscount),
    showActivationMethods: !!isDualOffer
  }
  
  return <>{children(helpers)}</>
}

/**
 * Step 12: Weekly Time Bands Conditional Logic
 */
export interface Step12ConditionalProps {
  configuration?: string
  children: (helpers: {
    requiresF1: boolean
    requiresF2: boolean
    requiresF3: boolean
    complexity: 'semplice' | 'intermedio' | 'complesso'
    bandCount: number
  }) => React.ReactNode
}

export function Step12Conditional({ configuration, children }: Step12ConditionalProps) {
  const getRequirements = (config?: string) => {
    if (!config) return { f1: false, f2: false, f3: false, complexity: 'semplice' as const, count: 0 }
    
    switch (config) {
      case '01': // MONORARIO
        return { f1: false, f2: false, f3: false, complexity: 'semplice' as const, count: 1 }
      case '02': // F1_F2
      case '07': // PEAK_OFFPEAK
        return { f1: true, f2: true, f3: false, complexity: 'intermedio' as const, count: 2 }
      case '03': // F1_F2_F3
        return { f1: true, f2: true, f3: true, complexity: 'intermedio' as const, count: 3 }
      case '04': // F1_F2_F3_F4
      case '05': // F1_F2_F3_F4_F5
      case '06': // F1_F2_F3_F4_F5_F6
        return { f1: true, f2: true, f3: true, complexity: 'complesso' as const, count: parseInt(config) }
      case '91': // BIORARIO_F1_F2F3
      case '92': // BIORARIO_F2_F1F3
      case '93': // BIORARIO_F3_F1F2
        return { f1: true, f2: true, f3: false, complexity: 'intermedio' as const, count: 2 }
      default:
        return { f1: false, f2: false, f3: false, complexity: 'semplice' as const, count: 1 }
    }
  }
  
  const requirements = getRequirements(configuration)
  
  const helpers = {
    requiresF1: requirements.f1,
    requiresF2: requirements.f2,
    requiresF3: requirements.f3,
    complexity: requirements.complexity,
    bandCount: requirements.count
  }
  
  return <>{children(helpers)}</>
}

/**
 * Step 13: Dispatching Conditional Logic
 */
export interface Step13ConditionalProps {
  calculationMethod?: string
  specificClients?: boolean
  dispatchingType?: string
  children: (helpers: {
    showFixedValue: boolean
    showPercentage: boolean
    showDescription: boolean
    requiresUnitOfMeasure: boolean
    requiresDetailedDescription: boolean
    showClientCategories: boolean
    isComplexType: boolean
  }) => React.ReactNode
}

export function Step13Conditional({ 
  calculationMethod, 
  specificClients, 
  dispatchingType,
  children 
}: Step13ConditionalProps) {
  const helpers = {
    showFixedValue: calculationMethod === 'FISSO',
    showPercentage: calculationMethod === 'PERCENTUALE',
    showDescription: calculationMethod === 'VARIABILE' || dispatchingType === 'ALTRO',
    requiresUnitOfMeasure: calculationMethod === 'FISSO',
    requiresDetailedDescription: calculationMethod === 'VARIABILE' || dispatchingType === 'ALTRO',
    showClientCategories: !!specificClients,
    isComplexType: dispatchingType === 'ALTRO' || calculationMethod === 'VARIABILE'
  }
  
  return <>{children(helpers)}</>
}

// =====================================================
// GENERIC CONDITIONAL HELPERS
// =====================================================

/**
 * Multi-condition renderer for complex conditional logic
 */
export interface MultiConditionalProps {
  conditions: Array<{
    condition: boolean | (() => boolean)
    content: React.ReactNode
    key?: string
  }>
  fallback?: React.ReactNode
  mode?: 'first-match' | 'all-matches'
}

export function MultiConditional({ 
  conditions, 
  fallback = null, 
  mode = 'first-match' 
}: MultiConditionalProps) {
  if (mode === 'first-match') {
    const matchingCondition = conditions.find(({ condition }) => 
      typeof condition === 'function' ? condition() : condition
    )
    
    return matchingCondition ? <>{matchingCondition.content}</> : <>{fallback}</>
  }
  
  // all-matches mode
  const matchingConditions = conditions.filter(({ condition }) => 
    typeof condition === 'function' ? condition() : condition
  )
  
  if (matchingConditions.length === 0) {
    return <>{fallback}</>
  }
  
  return (
    <>
      {matchingConditions.map(({ content, key }, index) => (
        <React.Fragment key={key || index}>{content}</React.Fragment>
      ))}
    </>
  )
}

/**
 * Validation-aware conditional renderer
 */
export interface ValidationConditionalProps {
  condition: boolean | (() => boolean)
  children: React.ReactNode
  validationError?: string | null
  showErrorWhenHidden?: boolean
}

export function ValidationConditional({ 
  condition, 
  children, 
  validationError,
  showErrorWhenHidden = false 
}: ValidationConditionalProps) {
  const shouldShow = typeof condition === 'function' ? condition() : condition
  
  if (!shouldShow) {
    if (showErrorWhenHidden && validationError) {
      return (
        <div className="text-red-500 text-sm mt-1">
          {validationError}
        </div>
      )
    }
    return null
  }
  
  return <>{children}</>
}

// =====================================================
// FIELD GROUP CONDITIONAL WRAPPER
// =====================================================

export interface ConditionalFieldGroupProps {
  title?: string
  condition: boolean | (() => boolean)
  children: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function ConditionalFieldGroup({
  title,
  condition,
  children,
  className,
  collapsible = false,
  defaultCollapsed = false
}: ConditionalFieldGroupProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const shouldShow = typeof condition === 'function' ? condition() : condition
  
  if (!shouldShow) {
    return null
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {title}
          </h3>
          {collapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isCollapsed ? 'Espandi' : 'Comprimi'}
            </button>
          )}
        </div>
      )}
      
      {!isCollapsed && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

export default ConditionalRenderer 