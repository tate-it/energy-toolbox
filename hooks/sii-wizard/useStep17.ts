'use client'

/**
 * Step 17: Discounts Hook (useStep17)
 * Demonstrates sophisticated array handling for discount structures
 * 
 * Features:
 * - Complex discount object arrays with multiple validation layers
 * - Cumulative discount calculation and validation
 * - Discount eligibility checking and business rules
 * - Smart discount templates and presets
 * - Cross-discount validation (cumulative vs non-cumulative)
 * - Discount strategy analysis and recommendations
 * - Advanced sorting and filtering capabilities
 * - Customer impact assessment and competitive analysis
 */

import { 
  Step17Schema, 
  Step17Data, 
  Step17Defaults,
  validateStep17,
  isStep17Complete,
  formatStep17ForXML,
  calculateTotalAnnualDiscount,
  validateDiscountEligibility,
  getDiscountAttractiveness,
  getDiscountStrategyRecommendations,
  generateDiscountSummary,
  getDiscountTypes
} from '../../lib/sii/schemas/step17'
import { 
  createStepHook,
  createFieldErrorFunction,
  createValidationFunction
} from './useStepFactory'
import { 
  TIPOLOGIA_SCONTO,
  VALIDITA_SCONTO,
  IVA_SCONTO,
  CONDIZIONE_APPLICAZIONE_SCONTO,
  UNITA_MISURA
} from '../../lib/sii/constants'

/**
 * Step 17 hook using the standardized factory with discount array handling
 */
const useStep17Hook = createStepHook<Step17Data>({
  stepId: 'step17',
  stepNumber: 17,
  defaultValues: Step17Defaults,
  validationFn: createValidationFunction<Step17Data>(Step17Schema),
  fieldErrorFn: createFieldErrorFunction<Step17Data>(Step17Schema),
  completenessCheckFn: isStep17Complete,
  xmlFormatter: formatStep17ForXML,
  
  // Related field groups for discount management
  relatedFieldGroups: [
    {
      name: 'discountsArray',
      fields: ['SCONTI'],
      updateStrategy: 'fast',
      description: 'Array sconti - aggiornamento rapido per gestione complessa'
    },
    {
      name: 'discountLimits',
      fields: ['SCONTO_MASSIMO_TOTALE', 'NOTE_SCONTI'],
      updateStrategy: 'debounced',
      description: 'Limiti e note sconti - aggiornamento posticipato per campi testuali'
    },
    {
      name: 'allDiscounts',
      fields: ['SCONTI', 'SCONTO_MASSIMO_TOTALE', 'NOTE_SCONTI'],
      updateStrategy: 'fast',
      description: 'Tutta la configurazione sconti - aggiornamento rapido per validazione completa'
    }
  ],
  
  // Field relationships for discount validation
  fieldRelationships: {
    // Cross-validation for discount rules
    crossValidation: [
      {
        fields: ['SCONTI'],
        validator: (values) => {
          const { SCONTI } = values
          
          if (!SCONTI || !Array.isArray(SCONTI) || SCONTI.length === 0) {
            return 'Specificare almeno uno sconto'
          }
          
          if (SCONTI.length > 10) {
            return 'Non è possibile aggiungere più di 10 sconti'
          }
          
          // Check for non-cumulative discounts
          const nonCumulableDiscounts = SCONTI.filter(sconto => !sconto.CUMULABILE)
          if (nonCumulableDiscounts.length > 1) {
            return 'Non è possibile avere più di uno sconto non cumulabile'
          }
          
          // Check for unique names
          const discountNames = SCONTI
            .map(sconto => sconto.NOME_SCONTO)
            .filter(nome => nome !== undefined)
          
          const uniqueNames = new Set(discountNames)
          if (discountNames.length !== uniqueNames.size) {
            return 'I nomi degli sconti devono essere unici'
          }
          
          return null
        }
      },
      {
        fields: ['SCONTI', 'SCONTO_MASSIMO_TOTALE'],
        validator: (values) => {
          const { SCONTI, SCONTO_MASSIMO_TOTALE } = values
          
          if (SCONTI && Array.isArray(SCONTI) && SCONTI.length > 0) {
            // Calculate total estimated annual discount
            let totalAnnualDiscount = 0
            SCONTI.forEach((sconto) => {
              if (sconto.UNITA_MISURA === UNITA_MISURA.EURO_ANNO) {
                totalAnnualDiscount += sconto.VALORE_SCONTO
              } else if (sconto.UNITA_MISURA === UNITA_MISURA.PERCENTUALE) {
                // Estimate based on typical bill (€675/year)
                totalAnnualDiscount += (675 * sconto.VALORE_SCONTO) / 100
              }
            })
            
            if (totalAnnualDiscount > 2000) {
              return 'Sconto totale stimato eccessivo (>2000€/anno)'
            }
          }
          
          return null
        }
      }
    ]
  }
})

/**
 * Default template for new discount
 */
const defaultDiscountTemplate = {
  TIPO_SCONTO: TIPOLOGIA_SCONTO.SCONTO_FISSO,
  VALORE_SCONTO: 0,
  UNITA_MISURA: UNITA_MISURA.EURO_ANNO,
  DURATA_SCONTO_MESI: 12,
  VALIDITA: VALIDITA_SCONTO.INGRESSO,
  CONDIZIONI_APPLICAZIONE: CONDIZIONE_APPLICAZIONE_SCONTO.NON_CONDIZIONATO,
  SOGGETTO_IVA: IVA_SCONTO.SI,
  DESCRIZIONE: '',
  NOME_SCONTO: undefined,
  CUMULABILE: true,
  CONDIZIONI_AGGIUNTIVE: undefined,
  CONSUMO_MINIMO_KWH: undefined,
  CONSUMO_MASSIMO_KWH: undefined,
  DATA_INIZIO: undefined,
  DATA_FINE: undefined
}

/**
 * Step 17 hook with sophisticated array handling for discounts
 * 
 * This hook provides advanced discount management capabilities:
 * - addDiscount(), removeDiscount(), updateDiscount(), duplicateDiscount()
 * - validateDiscountCombination(), calculateTotalSavings(), getEligibilityCheck()
 * - sortDiscountsByValue(), filterDiscountsByType(), getDiscountsByValidity()
 * - createDiscountPreset(), importDiscountConfiguration(), exportDiscountStrategy()
 */
export function useStep17() {
  const hook = useStep17Hook()
  
  // DISCOUNT ARRAY MANAGEMENT
  
  // Add new discount with template
  const addDiscount = (template?: Partial<typeof defaultDiscountTemplate>) => {
    const currentDiscounts = hook.data.SCONTI || []
    const newDiscount = { ...defaultDiscountTemplate, ...template }
    
    hook.updateField('SCONTI', [...currentDiscounts, newDiscount])
  }
  
  // Remove discount by index
  const removeDiscount = (index: number) => {
    const currentDiscounts = hook.data.SCONTI || []
    if (index >= 0 && index < currentDiscounts.length) {
      const newDiscounts = currentDiscounts.filter((_, i) => i !== index)
      hook.updateField('SCONTI', newDiscounts)
    }
  }
  
  // Update specific discount
  const updateDiscount = (index: number, updates: Partial<typeof defaultDiscountTemplate>) => {
    const currentDiscounts = hook.data.SCONTI || []
    if (index >= 0 && index < currentDiscounts.length) {
      const newDiscounts = [...currentDiscounts]
      newDiscounts[index] = { ...newDiscounts[index], ...updates }
      hook.updateField('SCONTI', newDiscounts)
    }
  }
  
  // Duplicate discount
  const duplicateDiscount = (index: number) => {
    const currentDiscounts = hook.data.SCONTI || []
    if (index >= 0 && index < currentDiscounts.length) {
      const discountToDuplicate = { ...currentDiscounts[index] }
      discountToDuplicate.DESCRIZIONE += ' (Copia)'
      if (discountToDuplicate.NOME_SCONTO) {
        discountToDuplicate.NOME_SCONTO += ' Copia'
      }
      const newDiscounts = [...currentDiscounts]
      newDiscounts.splice(index + 1, 0, discountToDuplicate)
      hook.updateField('SCONTI', newDiscounts)
    }
  }
  
  // Reorder discounts
  const reorderDiscounts = (fromIndex: number, toIndex: number) => {
    const currentDiscounts = [...(hook.data.SCONTI || [])]
    if (fromIndex >= 0 && fromIndex < currentDiscounts.length && 
        toIndex >= 0 && toIndex < currentDiscounts.length) {
      const [removed] = currentDiscounts.splice(fromIndex, 1)
      currentDiscounts.splice(toIndex, 0, removed)
      hook.updateField('SCONTI', currentDiscounts)
    }
  }
  
  // BULK OPERATIONS
  
  // Clear all discounts
  const clearAllDiscounts = () => {
    hook.updateRelatedFieldGroup('allDiscounts', {
      SCONTI: [],
      SCONTO_MASSIMO_TOTALE: undefined,
      NOTE_SCONTI: undefined
    })
  }
  
  // Bulk add discounts
  const bulkAddDiscounts = (discounts: Partial<typeof defaultDiscountTemplate>[]) => {
    const currentDiscounts = hook.data.SCONTI || []
    const newDiscounts = discounts.map(discount => ({ ...defaultDiscountTemplate, ...discount }))
    hook.updateField('SCONTI', [...currentDiscounts, ...newDiscounts])
  }
  
  // Bulk edit discount duration
  const bulkEditDiscountDuration = (duration: number) => {
    const currentDiscounts = hook.data.SCONTI || []
    const updatedDiscounts = currentDiscounts.map(discount => ({
      ...discount,
      DURATA_SCONTO_MESI: duration
    }))
    hook.updateField('SCONTI', updatedDiscounts)
  }
  
  // Set all discounts as cumulative/non-cumulative
  const setAllDiscountsCumulative = (cumulative: boolean) => {
    const currentDiscounts = hook.data.SCONTI || []
    const updatedDiscounts = currentDiscounts.map(discount => ({
      ...discount,
      CUMULABILE: cumulative
    }))
    hook.updateField('SCONTI', updatedDiscounts)
  }
  
  // DISCOUNT ANALYSIS AND VALIDATION
  
  // Calculate total annual savings
  const calculateTotalSavings = (averageConsumption = 2700, averagePower = 3.0) => {
    const discounts = hook.data.SCONTI || []
    return calculateTotalAnnualDiscount(discounts, averageConsumption, averagePower)
  }
  
  // Check discount eligibility for customer
  const checkDiscountEligibility = (customerConsumption: number) => {
    const discounts = hook.data.SCONTI || []
    return discounts.map((discount, index) => ({
      index,
      eligible: validateDiscountEligibility(discount, customerConsumption),
      discount
    }))
  }
  
  // Get discount attractiveness analysis
  const getAttractivenessAnalysis = () => {
    return getDiscountAttractiveness(hook.data as Step17Data)
  }
  
  // Get discount strategy recommendations
  const getStrategyRecommendations = () => {
    return getDiscountStrategyRecommendations(hook.data as Step17Data)
  }
  
  // Get customer-friendly summary
  const getCustomerSummary = () => {
    return generateDiscountSummary(hook.data as Step17Data)
  }
  
  // Get array statistics
  const getDiscountsStats = () => {
    const discounts = hook.data.SCONTI || []
    
    return {
      total: discounts.length,
      cumulative: discounts.filter(d => d.CUMULABILE).length,
      nonCumulative: discounts.filter(d => !d.CUMULABILE).length,
      withConditions: discounts.filter(d => d.CONDIZIONI_APPLICAZIONE !== CONDIZIONE_APPLICAZIONE_SCONTO.NON_CONDIZIONATO).length,
      withConsumptionLimits: discounts.filter(d => d.CONSUMO_MINIMO_KWH || d.CONSUMO_MASSIMO_KWH).length,
      byType: {
        fixed: discounts.filter(d => d.TIPO_SCONTO === TIPOLOGIA_SCONTO.SCONTO_FISSO).length,
        power: discounts.filter(d => d.TIPO_SCONTO === TIPOLOGIA_SCONTO.SCONTO_POTENZA).length,
        sales: discounts.filter(d => d.TIPO_SCONTO === TIPOLOGIA_SCONTO.SCONTO_VENDITA).length,
        regulated: discounts.filter(d => d.TIPO_SCONTO === TIPOLOGIA_SCONTO.SCONTO_PREZZO_REGOLATO).length
      },
      byValidity: {
        entry: discounts.filter(d => d.VALIDITA === VALIDITA_SCONTO.INGRESSO).length,
        within12: discounts.filter(d => d.VALIDITA === VALIDITA_SCONTO.ENTRO_12_MESI).length,
        beyond12: discounts.filter(d => d.VALIDITA === VALIDITA_SCONTO.OLTRE_12_MESI).length
      },
      averageDuration: discounts.length > 0 
        ? discounts.reduce((sum, d) => sum + d.DURATA_SCONTO_MESI, 0) / discounts.length 
        : 0
    }
  }
  
  // FILTERING AND SORTING
  
  // Filter discounts by type
  const getDiscountsByType = (type: string) => {
    const discounts = hook.data.SCONTI || []
    return discounts.filter(discount => discount.TIPO_SCONTO === type)
  }
  
  // Filter discounts by validity period
  const getDiscountsByValidity = (validity: string) => {
    const discounts = hook.data.SCONTI || []
    return discounts.filter(discount => discount.VALIDITA === validity)
  }
  
  // Filter discounts by cumulative status
  const getCumulativeDiscounts = () => {
    const discounts = hook.data.SCONTI || []
    return discounts.filter(discount => discount.CUMULABILE)
  }
  
  // Filter discounts by conditions
  const getUnconditionalDiscounts = () => {
    const discounts = hook.data.SCONTI || []
    return discounts.filter(discount => 
      discount.CONDIZIONI_APPLICAZIONE === CONDIZIONE_APPLICAZIONE_SCONTO.NON_CONDIZIONATO
    )
  }
  
  // Sort discounts by value (descending)
  const getSortedDiscountsByValue = () => {
    const discounts = hook.data.SCONTI || []
    return [...discounts].sort((a, b) => b.VALORE_SCONTO - a.VALORE_SCONTO)
  }
  
  // Sort discounts by duration (descending)
  const getSortedDiscountsByDuration = () => {
    const discounts = hook.data.SCONTI || []
    return [...discounts].sort((a, b) => b.DURATA_SCONTO_MESI - a.DURATA_SCONTO_MESI)
  }
  
  // SMART PRESETS AND TEMPLATES
  
  // Add common discount types
  const addCommonDiscount = (type: 'welcome' | 'loyalty' | 'volume' | 'green' | 'digital') => {
    const templates = {
      welcome: {
        TIPO_SCONTO: TIPOLOGIA_SCONTO.SCONTO_FISSO,
        VALORE_SCONTO: 50,
        UNITA_MISURA: UNITA_MISURA.EURO_ANNO,
        DURATA_SCONTO_MESI: 12,
        VALIDITA: VALIDITA_SCONTO.INGRESSO,
        DESCRIZIONE: 'Sconto di benvenuto per nuovi clienti',
        NOME_SCONTO: 'Sconto Benvenuto'
      },
      loyalty: {
        TIPO_SCONTO: TIPOLOGIA_SCONTO.SCONTO_VENDITA,
        VALORE_SCONTO: 5,
        UNITA_MISURA: UNITA_MISURA.PERCENTUALE,
        DURATA_SCONTO_MESI: 24,
        VALIDITA: VALIDITA_SCONTO.OLTRE_12_MESI,
        DESCRIZIONE: 'Sconto fedeltà per clienti di lunga data',
        NOME_SCONTO: 'Fedeltà Plus'
      },
      volume: {
        TIPO_SCONTO: TIPOLOGIA_SCONTO.SCONTO_VENDITA,
        VALORE_SCONTO: 3,
        UNITA_MISURA: UNITA_MISURA.PERCENTUALE,
        DURATA_SCONTO_MESI: 12,
        VALIDITA: VALIDITA_SCONTO.ENTRO_12_MESI,
        CONSUMO_MINIMO_KWH: 3000,
        DESCRIZIONE: 'Sconto per alti consumi energetici',
        NOME_SCONTO: 'Volume Plus'
      },
      green: {
        TIPO_SCONTO: TIPOLOGIA_SCONTO.SCONTO_FISSO,
        VALORE_SCONTO: 30,
        UNITA_MISURA: UNITA_MISURA.EURO_ANNO,
        DURATA_SCONTO_MESI: 12,
        VALIDITA: VALIDITA_SCONTO.INGRESSO,
        DESCRIZIONE: 'Sconto per energia verde e sostenibile',
        NOME_SCONTO: 'Green Energy'
      },
      digital: {
        TIPO_SCONTO: TIPOLOGIA_SCONTO.SCONTO_FISSO,
        VALORE_SCONTO: 20,
        UNITA_MISURA: UNITA_MISURA.EURO_ANNO,
        DURATA_SCONTO_MESI: 12,
        VALIDITA: VALIDITA_SCONTO.INGRESSO,
        CONDIZIONI_APPLICAZIONE: CONDIZIONE_APPLICAZIONE_SCONTO.GESTIONE_ONLINE,
        DESCRIZIONE: 'Sconto per gestione digitale del contratto',
        NOME_SCONTO: 'Digital First'
      }
    }
    
    addDiscount(templates[type])
  }
  
  // Create discount package presets
  const createDiscountPackage = (package: 'basic' | 'premium' | 'enterprise') => {
    clearAllDiscounts()
    
    switch (package) {
      case 'basic':
        addCommonDiscount('welcome')
        break
      case 'premium':
        addCommonDiscount('welcome')
        addCommonDiscount('digital')
        addCommonDiscount('loyalty')
        break
      case 'enterprise':
        addCommonDiscount('welcome')
        addCommonDiscount('volume')
        addCommonDiscount('loyalty')
        addCommonDiscount('green')
        break
    }
  }
  
  // VALIDATION HELPERS
  
  // Check if discount can be added
  const canAddDiscount = (): boolean => {
    const currentDiscounts = hook.data.SCONTI || []
    return currentDiscounts.length < 10
  }
  
  // Check if discount configuration is valid
  const validateDiscountConfiguration = () => {
    const discounts = hook.data.SCONTI || []
    const errors: string[] = []
    const warnings: string[] = []
    
    if (discounts.length === 0) {
      errors.push('Almeno uno sconto è obbligatorio')
    }
    
    const totalSavings = calculateTotalSavings()
    if (totalSavings > 1000) {
      warnings.push('Sconto totale molto elevato - verificare sostenibilità')
    }
    
    const nonCumulative = discounts.filter(d => !d.CUMULABILE)
    if (nonCumulative.length > 1) {
      errors.push('Più di uno sconto non cumulabile')
    }
    
    return { isValid: errors.length === 0, errors, warnings }
  }
  
  // Calculate discount score (0-100)
  const getDiscountScore = (): number => {
    const discounts = hook.data.SCONTI || []
    const stats = getDiscountsStats()
    const attractiveness = getAttractivenessAnalysis()
    
    let score = 0
    
    // Base score for having discounts
    if (discounts.length > 0) score += 20
    
    // Bonus for variety
    if (stats.total >= 3) score += 15
    if (Object.values(stats.byType).filter(count => count > 0).length >= 2) score += 15
    
    // Bonus for attractiveness
    if (attractiveness.level === 'alto') score += 25
    else if (attractiveness.level === 'medio') score += 15
    else score += 5
    
    // Bonus for unconditional discounts
    if (getUnconditionalDiscounts().length > 0) score += 10
    
    // Bonus for reasonable total savings
    const totalSavings = calculateTotalSavings()
    if (totalSavings >= 100 && totalSavings <= 500) score += 15
    
    return Math.min(100, Math.max(0, score))
  }
  
  // IMPORT/EXPORT FUNCTIONALITY
  
  // Export discount configuration
  const exportDiscountConfiguration = () => {
    return {
      discounts: hook.data.SCONTI || [],
      maxTotal: hook.data.SCONTO_MASSIMO_TOTALE,
      notes: hook.data.NOTE_SCONTI,
      statistics: getDiscountsStats(),
      analysis: {
        attractiveness: getAttractivenessAnalysis(),
        strategy: getStrategyRecommendations(),
        totalSavings: calculateTotalSavings()
      },
      score: getDiscountScore(),
      timestamp: new Date().toISOString()
    }
  }
  
  // Import discount configuration
  const importDiscountConfiguration = (config: {
    discounts?: any[]
    maxTotal?: number
    notes?: string
  }) => {
    const updates: Partial<Step17Data> = {}
    
    if (config.discounts) updates.SCONTI = config.discounts
    if (config.maxTotal !== undefined) updates.SCONTO_MASSIMO_TOTALE = config.maxTotal
    if (config.notes) updates.NOTE_SCONTI = config.notes
    
    hook.batchUpdate(updates)
  }
  
  // Get discount overview for UI
  const getDiscountsOverview = () => {
    const stats = getDiscountsStats()
    const attractiveness = getAttractivenessAnalysis()
    const totalSavings = calculateTotalSavings()
    
    return {
      hasDiscounts: stats.total > 0,
      totalDiscounts: stats.total,
      attractiveness: attractiveness.level,
      totalSavings: Math.round(totalSavings),
      mainFeatures: [
        stats.cumulative > 0 ? `${stats.cumulative} sconti cumulabili` : null,
        stats.withConditions === 0 ? 'Sconti senza condizioni' : `${stats.withConditions} con condizioni`,
        stats.averageDuration > 0 ? `Durata media ${Math.round(stats.averageDuration)} mesi` : null
      ].filter(Boolean),
      recommendations: attractiveness.level === 'basso' 
        ? ['Considerare incremento valore sconti', 'Aggiungere sconti senza condizioni']
        : attractiveness.level === 'medio'
        ? ['Ottimizzare combinazione sconti', 'Valutare sconti a lungo termine']
        : ['Configurazione sconti competitiva', 'Monitorare sostenibilità']
    }
  }
  
  return {
    ...hook,
    
    // ARRAY MANAGEMENT
    addDiscount,
    removeDiscount,
    updateDiscount,
    duplicateDiscount,
    reorderDiscounts,
    
    // BULK OPERATIONS
    clearAllDiscounts,
    bulkAddDiscounts,
    bulkEditDiscountDuration,
    setAllDiscountsCumulative,
    
    // ANALYSIS
    calculateTotalSavings,
    checkDiscountEligibility,
    getAttractivenessAnalysis,
    getStrategyRecommendations,
    getCustomerSummary,
    getDiscountsStats,
    
    // FILTERING AND SORTING
    getDiscountsByType,
    getDiscountsByValidity,
    getCumulativeDiscounts,
    getUnconditionalDiscounts,
    getSortedDiscountsByValue,
    getSortedDiscountsByDuration,
    
    // PRESETS
    addCommonDiscount,
    createDiscountPackage,
    
    // VALIDATION
    canAddDiscount,
    validateDiscountConfiguration,
    getDiscountScore,
    
    // IMPORT/EXPORT
    exportDiscountConfiguration,
    importDiscountConfiguration,
    
    // UI HELPERS
    getDiscountsOverview
  }
}

/**
 * Type export for hook return value
 */
export type UseStep17Return = ReturnType<typeof useStep17>

/**
 * Default export for convenient importing
 */
export default useStep17 