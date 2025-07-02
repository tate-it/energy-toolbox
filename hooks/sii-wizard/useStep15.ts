'use client'

/**
 * Step 15: Contractual Conditions Hook (useStep15)
 * Demonstrates sophisticated array handling for multiple complex object arrays
 * 
 * Features:
 * - Multiple complex object arrays: clauses, penalties, guarantees
 * - Dynamic item addition with smart templates
 * - Inter-array validation and business rules
 * - Advanced array operations: reorder, duplicate, bulk edit
 * - Conditional field management within array items
 * - Array item templates and smart defaults
 * - Cross-array dependencies and validation
 * - Complex array filtering and sorting capabilities
 */

import { 
  Step15Schema, 
  Step15Data, 
  Step15Defaults,
  validateStep15,
  isStep15Complete,
  formatStep15ForXML,
  validateContractualDuration,
  calculateContractualCosts,
  getContractualComplexity,
  checkRegulatoryCompliance,
  getCustomerFriendlySummary,
  getClauseTypes
} from '../../lib/sii/schemas/step15'
import { 
  createStepHook,
  createFieldErrorFunction,
  createValidationFunction
} from './useStepFactory'
import { 
  TIPOLOGIA_CONDIZIONE, 
  LIMITANTE,
  IVA_SCONTO,
  CONDIZIONE_APPLICAZIONE_SCONTO
} from '../../lib/sii/constants'

/**
 * Step 15 hook using the standardized factory with complex array handling
 */
const useStep15Hook = createStepHook<Step15Data>({
  stepId: 'step15',
  stepNumber: 15,
  defaultValues: Step15Defaults,
  validationFn: createValidationFunction<Step15Data>(Step15Schema),
  fieldErrorFn: createFieldErrorFunction<Step15Data>(Step15Schema),
  completenessCheckFn: isStep15Complete,
  xmlFormatter: formatStep15ForXML,
  
  // Related field groups for complex array management
  relatedFieldGroups: [
    {
      name: 'clausesArray',
      fields: ['CLAUSOLE_AGGIUNTIVE'],
      updateStrategy: 'fast',
      description: 'Clausole aggiuntive - aggiornamento rapido per gestione array complessi'
    },
    {
      name: 'penaltiesArray',
      fields: ['PENALI'],
      updateStrategy: 'fast',
      description: 'Penali - aggiornamento rapido per validazione complessa'
    },
    {
      name: 'guaranteesArray',
      fields: ['GARANZIE_AGGIUNTIVE'],
      updateStrategy: 'fast',
      description: 'Garanzie aggiuntive - aggiornamento rapido per gestione array'
    },
    {
      name: 'contractualTerms',
      fields: ['DURATA_MINIMA_MESI', 'PREAVVISO_RECESSO_GIORNI', 'RINNOVO_AUTOMATICO', 'DURATA_RINNOVO_MESI'],
      updateStrategy: 'debounced',
      description: 'Termini contrattuali - aggiornamento posticipato per campi correlati'
    },
    {
      name: 'allArrays',
      fields: ['CLAUSOLE_AGGIUNTIVE', 'PENALI', 'GARANZIE_AGGIUNTIVE'],
      updateStrategy: 'fast',
      description: 'Tutti gli array - aggiornamento rapido per validazione incrociata'
    }
  ],
  
  // Field relationships for complex array validation
  fieldRelationships: {
    // Cross-validation for contractual terms
    crossValidation: [
      {
        fields: ['DURATA_MINIMA_MESI', 'PREAVVISO_RECESSO_GIORNI'],
        validator: (values) => {
          const { DURATA_MINIMA_MESI, PREAVVISO_RECESSO_GIORNI } = values
          
          if (DURATA_MINIMA_MESI && PREAVVISO_RECESSO_GIORNI) {
            const durataGiorni = DURATA_MINIMA_MESI * 30
            if (PREAVVISO_RECESSO_GIORNI > durataGiorni / 2) {
              return 'Il preavviso di recesso non dovrebbe superare metà della durata minima del contratto'
            }
          }
          
          return null
        }
      },
      {
        fields: ['RINNOVO_AUTOMATICO', 'DURATA_RINNOVO_MESI'],
        validator: (values) => {
          const { RINNOVO_AUTOMATICO, DURATA_RINNOVO_MESI } = values
          
          if (RINNOVO_AUTOMATICO && !DURATA_RINNOVO_MESI) {
            return 'La durata del rinnovo è obbligatoria se il rinnovo automatico è attivo'
          }
          
          return null
        }
      },
      {
        fields: ['CLAUSOLE_AGGIUNTIVE', 'PENALI', 'GARANZIE_AGGIUNTIVE'],
        validator: (values) => {
          const { CLAUSOLE_AGGIUNTIVE, PENALI, GARANZIE_AGGIUNTIVE } = values
          
          // Check total complexity
          const totalItems = (CLAUSOLE_AGGIUNTIVE?.length || 0) + 
                           (PENALI?.length || 0) + 
                           (GARANZIE_AGGIUNTIVE?.length || 0)
          
          if (totalItems > 25) {
            return 'Numero eccessivo di condizioni contrattuali (>25 elementi totali)'
          }
          
          return null
        }
      }
    ]
  }
})

/**
 * Default templates for new array items
 */
const defaultClauseTemplate = {
  TIPOLOGIA: TIPOLOGIA_CONDIZIONE.ALTRO,
  DESCRIZIONE: '',
  LIMITANTE: LIMITANTE.NO,
  VALORE: undefined,
  DURATA_GIORNI: undefined
}

const defaultPenaltyTemplate = {
  DESCRIZIONE: '',
  IMPORTO: 0,
  MODALITA_CALCOLO: 'FISSO' as const,
  CONDIZIONI_APPLICAZIONE: ''
}

const defaultGuaranteeTemplate = {
  TIPO_GARANZIA: 'ALTRO' as const,
  DESCRIZIONE: '',
  DURATA_MESI: 12,
  VALORE_MASSIMO: undefined,
  CONDIZIONI: undefined
}

/**
 * Step 15 hook with sophisticated array handling for contractual conditions
 * 
 * This hook provides advanced array management capabilities for multiple complex arrays:
 * - CLAUSES: addClause(), removeClause(), updateClause(), reorderClauses()
 * - PENALTIES: addPenalty(), removePenalty(), updatePenalty(), duplicatePenalty()
 * - GUARANTEES: addGuarantee(), removeGuarantee(), updateGuarantee(), bulkEditGuarantees()
 * - CROSS-ARRAY: validateAllArrays(), getComplexityAnalysis(), exportConfiguration()
 */
export function useStep15() {
  const hook = useStep15Hook()
  
  // CLAUSES ARRAY MANAGEMENT
  
  // Add new clause with template
  const addClause = (template?: Partial<typeof defaultClauseTemplate>) => {
    const currentClauses = hook.data.CLAUSOLE_AGGIUNTIVE || []
    const newClause = { ...defaultClauseTemplate, ...template }
    
    hook.updateField('CLAUSOLE_AGGIUNTIVE', [...currentClauses, newClause])
  }
  
  // Remove clause by index
  const removeClause = (index: number) => {
    const currentClauses = hook.data.CLAUSOLE_AGGIUNTIVE || []
    if (index >= 0 && index < currentClauses.length) {
      const newClauses = currentClauses.filter((_, i) => i !== index)
      hook.updateField('CLAUSOLE_AGGIUNTIVE', newClauses)
    }
  }
  
  // Update specific clause
  const updateClause = (index: number, updates: Partial<typeof defaultClauseTemplate>) => {
    const currentClauses = hook.data.CLAUSOLE_AGGIUNTIVE || []
    if (index >= 0 && index < currentClauses.length) {
      const newClauses = [...currentClauses]
      newClauses[index] = { ...newClauses[index], ...updates }
      hook.updateField('CLAUSOLE_AGGIUNTIVE', newClauses)
    }
  }
  
  // Reorder clauses
  const reorderClauses = (fromIndex: number, toIndex: number) => {
    const currentClauses = [...(hook.data.CLAUSOLE_AGGIUNTIVE || [])]
    if (fromIndex >= 0 && fromIndex < currentClauses.length && 
        toIndex >= 0 && toIndex < currentClauses.length) {
      const [removed] = currentClauses.splice(fromIndex, 1)
      currentClauses.splice(toIndex, 0, removed)
      hook.updateField('CLAUSOLE_AGGIUNTIVE', currentClauses)
    }
  }
  
  // Duplicate clause
  const duplicateClause = (index: number) => {
    const currentClauses = hook.data.CLAUSOLE_AGGIUNTIVE || []
    if (index >= 0 && index < currentClauses.length) {
      const clauseToDuplicate = { ...currentClauses[index] }
      clauseToDuplicate.DESCRIZIONE += ' (Copia)'
      const newClauses = [...currentClauses]
      newClauses.splice(index + 1, 0, clauseToDuplicate)
      hook.updateField('CLAUSOLE_AGGIUNTIVE', newClauses)
    }
  }
  
  // PENALTIES ARRAY MANAGEMENT
  
  // Add new penalty with template
  const addPenalty = (template?: Partial<typeof defaultPenaltyTemplate>) => {
    const currentPenalties = hook.data.PENALI || []
    const newPenalty = { ...defaultPenaltyTemplate, ...template }
    
    hook.updateField('PENALI', [...currentPenalties, newPenalty])
  }
  
  // Remove penalty by index
  const removePenalty = (index: number) => {
    const currentPenalties = hook.data.PENALI || []
    if (index >= 0 && index < currentPenalties.length) {
      const newPenalties = currentPenalties.filter((_, i) => i !== index)
      hook.updateField('PENALI', newPenalties)
    }
  }
  
  // Update specific penalty
  const updatePenalty = (index: number, updates: Partial<typeof defaultPenaltyTemplate>) => {
    const currentPenalties = hook.data.PENALI || []
    if (index >= 0 && index < currentPenalties.length) {
      const newPenalties = [...currentPenalties]
      newPenalties[index] = { ...newPenalties[index], ...updates }
      hook.updateField('PENALI', newPenalties)
    }
  }
  
  // Duplicate penalty
  const duplicatePenalty = (index: number) => {
    const currentPenalties = hook.data.PENALI || []
    if (index >= 0 && index < currentPenalties.length) {
      const penaltyToDuplicate = { ...currentPenalties[index] }
      penaltyToDuplicate.DESCRIZIONE += ' (Copia)'
      const newPenalties = [...currentPenalties]
      newPenalties.splice(index + 1, 0, penaltyToDuplicate)
      hook.updateField('PENALI', newPenalties)
    }
  }
  
  // GUARANTEES ARRAY MANAGEMENT
  
  // Add new guarantee with template
  const addGuarantee = (template?: Partial<typeof defaultGuaranteeTemplate>) => {
    const currentGuarantees = hook.data.GARANZIE_AGGIUNTIVE || []
    const newGuarantee = { ...defaultGuaranteeTemplate, ...template }
    
    hook.updateField('GARANZIE_AGGIUNTIVE', [...currentGuarantees, newGuarantee])
  }
  
  // Remove guarantee by index
  const removeGuarantee = (index: number) => {
    const currentGuarantees = hook.data.GARANZIE_AGGIUNTIVE || []
    if (index >= 0 && index < currentGuarantees.length) {
      const newGuarantees = currentGuarantees.filter((_, i) => i !== index)
      hook.updateField('GARANZIE_AGGIUNTIVE', newGuarantees)
    }
  }
  
  // Update specific guarantee
  const updateGuarantee = (index: number, updates: Partial<typeof defaultGuaranteeTemplate>) => {
    const currentGuarantees = hook.data.GARANZIE_AGGIUNTIVE || []
    if (index >= 0 && index < currentGuarantees.length) {
      const newGuarantees = [...currentGuarantees]
      newGuarantees[index] = { ...newGuarantees[index], ...updates }
      hook.updateField('GARANZIE_AGGIUNTIVE', newGuarantees)
    }
  }
  
  // Duplicate guarantee
  const duplicateGuarantee = (index: number) => {
    const currentGuarantees = hook.data.GARANZIE_AGGIUNTIVE || []
    if (index >= 0 && index < currentGuarantees.length) {
      const guaranteeToDuplicate = { ...currentGuarantees[index] }
      guaranteeToDuplicate.DESCRIZIONE += ' (Copia)'
      const newGuarantees = [...currentGuarantees]
      newGuarantees.splice(index + 1, 0, guaranteeToDuplicate)
      hook.updateField('GARANZIE_AGGIUNTIVE', newGuarantees)
    }
  }
  
  // BULK ARRAY OPERATIONS
  
  // Clear all arrays
  const clearAllArrays = () => {
    hook.updateRelatedFieldGroup('allArrays', {
      CLAUSOLE_AGGIUNTIVE: [],
      PENALI: [],
      GARANZIE_AGGIUNTIVE: []
    })
  }
  
  // Bulk add clauses
  const bulkAddClauses = (clauses: Partial<typeof defaultClauseTemplate>[]) => {
    const currentClauses = hook.data.CLAUSOLE_AGGIUNTIVE || []
    const newClauses = clauses.map(clause => ({ ...defaultClauseTemplate, ...clause }))
    hook.updateField('CLAUSOLE_AGGIUNTIVE', [...currentClauses, ...newClauses])
  }
  
  // Bulk edit guarantees duration
  const bulkEditGuaranteesDuration = (duration: number) => {
    const currentGuarantees = hook.data.GARANZIE_AGGIUNTIVE || []
    const updatedGuarantees = currentGuarantees.map(guarantee => ({
      ...guarantee,
      DURATA_MESI: duration
    }))
    hook.updateField('GARANZIE_AGGIUNTIVE', updatedGuarantees)
  }
  
  // ARRAY ANALYSIS AND VALIDATION
  
  // Get array statistics
  const getArraysStats = () => {
    const clauses = hook.data.CLAUSOLE_AGGIUNTIVE || []
    const penalties = hook.data.PENALI || []
    const guarantees = hook.data.GARANZIE_AGGIUNTIVE || []
    
    return {
      clauses: {
        count: clauses.length,
        limiting: clauses.filter(c => c.LIMITANTE === LIMITANTE.SI).length,
        withValues: clauses.filter(c => c.VALORE !== undefined).length
      },
      penalties: {
        count: penalties.length,
        totalMaxAmount: penalties.reduce((sum, p) => sum + (p.IMPORTO || 0), 0),
        fixedCount: penalties.filter(p => p.MODALITA_CALCOLO === 'FISSO').length
      },
      guarantees: {
        count: guarantees.length,
        totalValue: guarantees.reduce((sum, g) => sum + (g.VALORE_MASSIMO || 0), 0),
        averageDuration: guarantees.length > 0 
          ? guarantees.reduce((sum, g) => sum + g.DURATA_MESI, 0) / guarantees.length 
          : 0
      },
      total: clauses.length + penalties.length + guarantees.length
    }
  }
  
  // Validate all arrays for business rules
  const validateAllArrays = () => {
    return checkRegulatoryCompliance(hook.data as Step15Data)
  }
  
  // Get complexity analysis
  const getComplexityAnalysis = () => {
    return getContractualComplexity(hook.data as Step15Data)
  }
  
  // Calculate costs from all arrays
  const calculateAllCosts = () => {
    return calculateContractualCosts(hook.data as Step15Data)
  }
  
  // ARRAY FILTERING AND SORTING
  
  // Filter clauses by type
  const getClausesByType = (type: string) => {
    const clauses = hook.data.CLAUSOLE_AGGIUNTIVE || []
    return clauses.filter(clause => clause.TIPOLOGIA === type)
  }
  
  // Filter penalties by calculation method
  const getPenaltiesByCalculation = (method: string) => {
    const penalties = hook.data.PENALI || []
    return penalties.filter(penalty => penalty.MODALITA_CALCOLO === method)
  }
  
  // Filter guarantees by duration
  const getGuaranteesByDurationRange = (minMonths: number, maxMonths: number) => {
    const guarantees = hook.data.GARANZIE_AGGIUNTIVE || []
    return guarantees.filter(guarantee => 
      guarantee.DURATA_MESI >= minMonths && guarantee.DURATA_MESI <= maxMonths
    )
  }
  
  // Sort clauses by value (descending)
  const getSortedClausesByValue = () => {
    const clauses = hook.data.CLAUSOLE_AGGIUNTIVE || []
    return [...clauses].sort((a, b) => (b.VALORE || 0) - (a.VALORE || 0))
  }
  
  // SMART TEMPLATES AND PRESETS
  
  // Add common clause types
  const addCommonClause = (type: 'activation' | 'termination' | 'multi_year' | 'early_termination') => {
    const templates = {
      activation: {
        TIPOLOGIA: TIPOLOGIA_CONDIZIONE.ATTIVAZIONE,
        DESCRIZIONE: 'Condizioni per l\'attivazione del servizio',
        LIMITANTE: LIMITANTE.NO,
        VALORE: 25
      },
      termination: {
        TIPOLOGIA: TIPOLOGIA_CONDIZIONE.DISATTIVAZIONE,
        DESCRIZIONE: 'Modalità e tempistiche per la disattivazione',
        LIMITANTE: LIMITANTE.SI,
        DURATA_GIORNI: 30
      },
      multi_year: {
        TIPOLOGIA: TIPOLOGIA_CONDIZIONE.OFFERTA_PLURIENNALE,
        DESCRIZIONE: 'Condizioni specifiche per contratti pluriennali',
        LIMITANTE: LIMITANTE.SI,
        DURATA_GIORNI: 730
      },
      early_termination: {
        TIPOLOGIA: TIPOLOGIA_CONDIZIONE.ONERI_RECESSO_ANTICIPATO,
        DESCRIZIONE: 'Penale per recesso anticipato',
        LIMITANTE: LIMITANTE.SI,
        VALORE: 100
      }
    }
    
    addClause(templates[type])
  }
  
  // Add common penalty types
  const addCommonPenalty = (type: 'late_payment' | 'early_termination' | 'breach_contract') => {
    const templates = {
      late_payment: {
        DESCRIZIONE: 'Penale per ritardo nei pagamenti',
        IMPORTO: 25,
        MODALITA_CALCOLO: 'FISSO' as const,
        CONDIZIONI_APPLICAZIONE: 'Ritardo superiore a 15 giorni'
      },
      early_termination: {
        DESCRIZIONE: 'Penale per recesso anticipato',
        IMPORTO: 10,
        MODALITA_CALCOLO: 'PERCENTUALE' as const,
        CONDIZIONI_APPLICAZIONE: 'Recesso prima della scadenza naturale'
      },
      breach_contract: {
        DESCRIZIONE: 'Penale per violazione contrattuale',
        IMPORTO: 200,
        MODALITA_CALCOLO: 'FORFETTARIO' as const,
        CONDIZIONI_APPLICAZIONE: 'Violazione grave delle condizioni contrattuali'
      }
    }
    
    addPenalty(templates[type])
  }
  
  // Add common guarantee types
  const addCommonGuarantee = (type: 'price' | 'quality' | 'assistance' | 'refund') => {
    const templates = {
      price: {
        TIPO_GARANZIA: 'PREZZO' as const,
        DESCRIZIONE: 'Garanzia di stabilità del prezzo',
        DURATA_MESI: 24,
        VALORE_MASSIMO: 500
      },
      quality: {
        TIPO_GARANZIA: 'QUALITA' as const,
        DESCRIZIONE: 'Garanzia sulla qualità del servizio',
        DURATA_MESI: 12,
        VALORE_MASSIMO: 1000
      },
      assistance: {
        TIPO_GARANZIA: 'ASSISTENZA' as const,
        DESCRIZIONE: 'Garanzia di assistenza tecnica',
        DURATA_MESI: 36,
        VALORE_MASSIMO: 300
      },
      refund: {
        TIPO_GARANZIA: 'RIMBORSO' as const,
        DESCRIZIONE: 'Garanzia di rimborso per insoddisfazione',
        DURATA_MESI: 6,
        VALORE_MASSIMO: 200
      }
    }
    
    addGuarantee(templates[type])
  }
  
  // IMPORT/EXPORT FUNCTIONALITY
  
  // Export all arrays configuration
  const exportArraysConfiguration = () => {
    return {
      clauses: hook.data.CLAUSOLE_AGGIUNTIVE || [],
      penalties: hook.data.PENALI || [],
      guarantees: hook.data.GARANZIE_AGGIUNTIVE || [],
      contractualTerms: {
        minDuration: hook.data.DURATA_MINIMA_MESI,
        noticeRequired: hook.data.PREAVVISO_RECESSO_GIORNI,
        autoRenewal: hook.data.RINNOVO_AUTOMATICO,
        renewalDuration: hook.data.DURATA_RINNOVO_MESI
      },
      statistics: getArraysStats(),
      complexity: getComplexityAnalysis(),
      costs: calculateAllCosts(),
      compliance: validateAllArrays(),
      timestamp: new Date().toISOString()
    }
  }
  
  // Import arrays configuration
  const importArraysConfiguration = (config: {
    clauses?: any[]
    penalties?: any[]
    guarantees?: any[]
    contractualTerms?: any
  }) => {
    const updates: Partial<Step15Data> = {}
    
    if (config.clauses) updates.CLAUSOLE_AGGIUNTIVE = config.clauses
    if (config.penalties) updates.PENALI = config.penalties
    if (config.guarantees) updates.GARANZIE_AGGIUNTIVE = config.guarantees
    
    if (config.contractualTerms) {
      updates.DURATA_MINIMA_MESI = config.contractualTerms.minDuration
      updates.PREAVVISO_RECESSO_GIORNI = config.contractualTerms.noticeRequired
      updates.RINNOVO_AUTOMATICO = config.contractualTerms.autoRenewal
      updates.DURATA_RINNOVO_MESI = config.contractualTerms.renewalDuration
    }
    
    hook.batchUpdate(updates)
  }
  
  // CUSTOMER-FRIENDLY SUMMARIES
  
  // Get customer summary of all conditions
  const getCustomerSummary = () => {
    return getCustomerFriendlySummary(hook.data as Step15Data)
  }
  
  // Get arrays overview for UI
  const getArraysOverview = () => {
    const stats = getArraysStats()
    const costs = calculateAllCosts()
    const complexity = getComplexityAnalysis()
    
    return {
      hasContent: stats.total > 0,
      complexity: complexity.level,
      totalCosts: costs.activationCosts + costs.terminationCosts,
      recommendations: complexity.recommendations.slice(0, 3),
      summary: {
        clauses: `${stats.clauses.count} clausole${stats.clauses.limiting > 0 ? ` (${stats.clauses.limiting} limitanti)` : ''}`,
        penalties: `${stats.penalties.count} penali${stats.penalties.totalMaxAmount > 0 ? ` (max €${stats.penalties.totalMaxAmount})` : ''}`,
        guarantees: `${stats.guarantees.count} garanzie${stats.guarantees.totalValue > 0 ? ` (valore €${stats.guarantees.totalValue})` : ''}`
      }
    }
  }
  
  return {
    ...hook,
    
    // CLAUSES MANAGEMENT
    addClause,
    removeClause,
    updateClause,
    reorderClauses,
    duplicateClause,
    
    // PENALTIES MANAGEMENT  
    addPenalty,
    removePenalty,
    updatePenalty,
    duplicatePenalty,
    
    // GUARANTEES MANAGEMENT
    addGuarantee,
    removeGuarantee,
    updateGuarantee,
    duplicateGuarantee,
    
    // BULK OPERATIONS
    clearAllArrays,
    bulkAddClauses,
    bulkEditGuaranteesDuration,
    
    // ANALYSIS AND VALIDATION
    getArraysStats,
    validateAllArrays,
    getComplexityAnalysis,
    calculateAllCosts,
    
    // FILTERING AND SORTING
    getClausesByType,
    getPenaltiesByCalculation,
    getGuaranteesByDurationRange,
    getSortedClausesByValue,
    
    // SMART TEMPLATES
    addCommonClause,
    addCommonPenalty,
    addCommonGuarantee,
    
    // IMPORT/EXPORT
    exportArraysConfiguration,
    importArraysConfiguration,
    
    // UI HELPERS
    getCustomerSummary,
    getArraysOverview
  }
}

/**
 * Type export for hook return value
 */
export type UseStep15Return = ReturnType<typeof useStep15>

/**
 * Default export for convenient importing
 */
export default useStep15 