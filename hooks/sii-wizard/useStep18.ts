'use client'

/**
 * Step 18: Additional Services Hook (useStep18)
 * Demonstrates sophisticated array handling for service portfolios
 * 
 * Features:
 * - Multiple complex arrays: services and predefined packages
 * - Service portfolio management with categorization
 * - Package creation and service bundling logic
 * - Cost analysis and pricing strategy validation
 * - Geographic service availability management
 * - Service-package relationship validation
 * - Advanced service filtering and categorization
 * - Business impact assessment and recommendations
 */

import { 
  Step18Schema, 
  Step18Data, 
  Step18Defaults,
  validateStep18,
  isStep18Complete,
  formatStep18ForXML,
  calculateTotalServicesAnnualCost,
  validateServiceAvailability,
  getServicesPortfolioAssessment,
  generateServicesSummary,
  getServiceMacroAreas
} from '../../lib/sii/schemas/step18'
import { 
  createStepHook,
  createFieldErrorFunction,
  createValidationFunction
} from './useStepFactory'
import { 
  MACROAREA_SERVIZI,
  UNITA_MISURA
} from '../../lib/sii/constants'

/**
 * Step 18 hook using the standardized factory with services array handling
 */
const useStep18Hook = createStepHook<Step18Data>({
  stepId: 'step18',
  stepNumber: 18,
  defaultValues: Step18Defaults,
  validationFn: createValidationFunction<Step18Data>(Step18Schema),
  fieldErrorFn: createFieldErrorFunction<Step18Data>(Step18Schema),
  completenessCheckFn: isStep18Complete,
  xmlFormatter: formatStep18ForXML,
  
  // Related field groups for services management
  relatedFieldGroups: [
    {
      name: 'servicesArray',
      fields: ['SERVIZI'],
      updateStrategy: 'fast',
      description: 'Array servizi - aggiornamento rapido per gestione complessa'
    },
    {
      name: 'packagesArray',
      fields: ['PACCHETTI_PREDEFINITI'],
      updateStrategy: 'fast',
      description: 'Array pacchetti - aggiornamento rapido per gestione bundling'
    },
    {
      name: 'serviceNotes',
      fields: ['NOTE_SERVIZI'],
      updateStrategy: 'debounced',
      description: 'Note servizi - aggiornamento posticipato per campi testuali'
    },
    {
      name: 'allServices',
      fields: ['SERVIZI', 'PACCHETTI_PREDEFINITI', 'NOTE_SERVIZI'],
      updateStrategy: 'fast',
      description: 'Tutto il portfolio servizi - aggiornamento rapido per validazione completa'
    }
  ],
  
  // Field relationships for services validation
  fieldRelationships: {
    // Cross-validation for services and packages
    crossValidation: [
      {
        fields: ['SERVIZI'],
        validator: (values) => {
          const { SERVIZI } = values
          
          if (SERVIZI && Array.isArray(SERVIZI)) {
            if (SERVIZI.length > 20) {
              return 'Non è possibile aggiungere più di 20 servizi'
            }
            
            // Check for unique service names
            const serviceNames = SERVIZI.map(servizio => servizio.NOME_SERVIZIO)
            const uniqueNames = new Set(serviceNames)
            if (serviceNames.length !== uniqueNames.size) {
              return 'I nomi dei servizi devono essere unici'
            }
            
            // Check for excessive mandatory services
            const mandatoryServices = SERVIZI.filter(s => s.OBBLIGATORIO)
            if (mandatoryServices.length > 3) {
              return 'Troppi servizi obbligatori (>3) potrebbero scoraggiare i clienti'
            }
            
            // Calculate total mandatory cost
            const totalMandatoryCost = SERVIZI
              .filter(s => s.OBBLIGATORIO && !s.INCLUSO_PREZZO)
              .reduce((total, service) => {
                if (service.UNITA_MISURA_COSTO === UNITA_MISURA.EURO_ANNO) {
                  return total + service.COSTO_SERVIZIO
                } else if (service.UNITA_MISURA_COSTO === UNITA_MISURA.EURO) {
                  return total + service.COSTO_SERVIZIO
                }
                return total
              }, 0)
            
            if (totalMandatoryCost > 500) {
              return 'Costo totale servizi obbligatori eccessivo (>500€)'
            }
          }
          
          return null
        }
      },
      {
        fields: ['PACCHETTI_PREDEFINITI', 'SERVIZI'],
        validator: (values) => {
          const { PACCHETTI_PREDEFINITI, SERVIZI } = values
          
          if (PACCHETTI_PREDEFINITI && SERVIZI && Array.isArray(PACCHETTI_PREDEFINITI) && Array.isArray(SERVIZI)) {
            const availableServiceNames = SERVIZI.map(s => s.NOME_SERVIZIO)
            
            // Check that all package services exist
            for (const pacchetto of PACCHETTI_PREDEFINITI) {
              for (const nomeServizio of pacchetto.SERVIZI_INCLUSI) {
                if (!availableServiceNames.includes(nomeServizio)) {
                  return `Servizio "${nomeServizio}" non trovato nell'elenco servizi disponibili`
                }
              }
            }
          }
          
          return null
        }
      }
    ]
  }
})

/**
 * Default templates for new items
 */
const defaultServiceTemplate = {
  NOME_SERVIZIO: '',
  MACROAREA: MACROAREA_SERVIZI.ALTRO,
  DESCRIZIONE_SERVIZIO: '',
  COSTO_SERVIZIO: 0,
  UNITA_MISURA_COSTO: UNITA_MISURA.EURO_ANNO,
  MODALITA_FATTURAZIONE: 'ANNUALE' as const,
  OBBLIGATORIO: false,
  INCLUSO_PREZZO: false,
  CATEGORIA: undefined,
  PROVIDER_ESTERNO: undefined,
  DURATA_MESI: undefined,
  CONDIZIONI_ATTIVAZIONE: undefined,
  LIMITAZIONI_GEOGRAFICHE: false,
  ZONE_DISPONIBILITA: undefined,
  SOGGETTO_IVA: true,
  ALIQUOTA_IVA: undefined,
  DATA_INIZIO_DISPONIBILITA: undefined,
  DATA_FINE_DISPONIBILITA: undefined,
  URL_INFO: undefined,
  CONTATTO_SERVIZIO: undefined
}

const defaultPackageTemplate = {
  NOME_PACCHETTO: '',
  DESCRIZIONE_PACCHETTO: '',
  SERVIZI_INCLUSI: [],
  SCONTO_PACCHETTO: undefined
}

/**
 * Step 18 hook with sophisticated array handling for additional services
 * 
 * This hook provides advanced service portfolio management capabilities:
 * - SERVICES: addService(), removeService(), updateService(), duplicateService()
 * - PACKAGES: addPackage(), removePackage(), updatePackage(), createPackageFromServices()
 * - ANALYSIS: getPortfolioAssessment(), calculateServicesCosts(), getServicesByCategory()
 * - VALIDATION: validateServiceAvailability(), checkPackageIntegrity(), getBusinessImpact()
 */
export function useStep18() {
  const hook = useStep18Hook()
  
  // SERVICES ARRAY MANAGEMENT
  
  // Add new service with template
  const addService = (template?: Partial<typeof defaultServiceTemplate>) => {
    const currentServices = hook.data.SERVIZI || []
    const newService = { ...defaultServiceTemplate, ...template }
    
    hook.updateField('SERVIZI', [...currentServices, newService])
  }
  
  // Remove service by index
  const removeService = (index: number) => {
    const currentServices = hook.data.SERVIZI || []
    if (index >= 0 && index < currentServices.length) {
      const newServices = currentServices.filter((_, i) => i !== index)
      hook.updateField('SERVIZI', newServices)
      
      // Update packages that reference this service
      updatePackagesAfterServiceRemoval(currentServices[index].NOME_SERVIZIO)
    }
  }
  
  // Update specific service
  const updateService = (index: number, updates: Partial<typeof defaultServiceTemplate>) => {
    const currentServices = hook.data.SERVIZI || []
    if (index >= 0 && index < currentServices.length) {
      const oldServiceName = currentServices[index].NOME_SERVIZIO
      const newServices = [...currentServices]
      newServices[index] = { ...newServices[index], ...updates }
      hook.updateField('SERVIZI', newServices)
      
      // Update package references if service name changed
      if (updates.NOME_SERVIZIO && updates.NOME_SERVIZIO !== oldServiceName) {
        updatePackagesAfterServiceRename(oldServiceName, updates.NOME_SERVIZIO)
      }
    }
  }
  
  // Duplicate service
  const duplicateService = (index: number) => {
    const currentServices = hook.data.SERVIZI || []
    if (index >= 0 && index < currentServices.length) {
      const serviceToDuplicate = { ...currentServices[index] }
      serviceToDuplicate.NOME_SERVIZIO += ' (Copia)'
      serviceToDuplicate.DESCRIZIONE_SERVIZIO += ' (Copia)'
      const newServices = [...currentServices]
      newServices.splice(index + 1, 0, serviceToDuplicate)
      hook.updateField('SERVIZI', newServices)
    }
  }
  
  // Reorder services
  const reorderServices = (fromIndex: number, toIndex: number) => {
    const currentServices = [...(hook.data.SERVIZI || [])]
    if (fromIndex >= 0 && fromIndex < currentServices.length && 
        toIndex >= 0 && toIndex < currentServices.length) {
      const [removed] = currentServices.splice(fromIndex, 1)
      currentServices.splice(toIndex, 0, removed)
      hook.updateField('SERVIZI', currentServices)
    }
  }
  
  // PACKAGES ARRAY MANAGEMENT
  
  // Add new package with template
  const addPackage = (template?: Partial<typeof defaultPackageTemplate>) => {
    const currentPackages = hook.data.PACCHETTI_PREDEFINITI || []
    const newPackage = { ...defaultPackageTemplate, ...template }
    
    hook.updateField('PACCHETTI_PREDEFINITI', [...currentPackages, newPackage])
  }
  
  // Remove package by index
  const removePackage = (index: number) => {
    const currentPackages = hook.data.PACCHETTI_PREDEFINITI || []
    if (index >= 0 && index < currentPackages.length) {
      const newPackages = currentPackages.filter((_, i) => i !== index)
      hook.updateField('PACCHETTI_PREDEFINITI', newPackages)
    }
  }
  
  // Update specific package
  const updatePackage = (index: number, updates: Partial<typeof defaultPackageTemplate>) => {
    const currentPackages = hook.data.PACCHETTI_PREDEFINITI || []
    if (index >= 0 && index < currentPackages.length) {
      const newPackages = [...currentPackages]
      newPackages[index] = { ...newPackages[index], ...updates }
      hook.updateField('PACCHETTI_PREDEFINITI', newPackages)
    }
  }
  
  // Create package from selected services
  const createPackageFromServices = (serviceIndices: number[], packageName: string, description: string, discount?: number) => {
    const currentServices = hook.data.SERVIZI || []
    const selectedServices = serviceIndices
      .filter(index => index >= 0 && index < currentServices.length)
      .map(index => currentServices[index].NOME_SERVIZIO)
    
    if (selectedServices.length >= 2) {
      const newPackage = {
        NOME_PACCHETTO: packageName,
        DESCRIZIONE_PACCHETTO: description,
        SERVIZI_INCLUSI: selectedServices,
        SCONTO_PACCHETTO: discount
      }
      
      addPackage(newPackage)
    }
  }
  
  // BULK OPERATIONS
  
  // Clear all services and packages
  const clearAllServicesAndPackages = () => {
    hook.updateRelatedFieldGroup('allServices', {
      SERVIZI: [],
      PACCHETTI_PREDEFINITI: [],
      NOTE_SERVIZI: undefined
    })
  }
  
  // Bulk add services
  const bulkAddServices = (services: Partial<typeof defaultServiceTemplate>[]) => {
    const currentServices = hook.data.SERVIZI || []
    const newServices = services.map(service => ({ ...defaultServiceTemplate, ...service }))
    hook.updateField('SERVIZI', [...currentServices, ...newServices])
  }
  
  // Set all services as mandatory/optional
  const setAllServicesMandatory = (mandatory: boolean) => {
    const currentServices = hook.data.SERVIZI || []
    const updatedServices = currentServices.map(service => ({
      ...service,
      OBBLIGATORIO: mandatory
    }))
    hook.updateField('SERVIZI', updatedServices)
  }
  
  // Set all services as included/additional cost
  const setAllServicesIncluded = (included: boolean) => {
    const currentServices = hook.data.SERVIZI || []
    const updatedServices = currentServices.map(service => ({
      ...service,
      INCLUSO_PREZZO: included,
      COSTO_SERVIZIO: included ? 0 : service.COSTO_SERVIZIO
    }))
    hook.updateField('SERVIZI', updatedServices)
  }
  
  // HELPER FUNCTIONS FOR PACKAGE-SERVICE RELATIONSHIPS
  
  // Update packages after service removal
  const updatePackagesAfterServiceRemoval = (removedServiceName: string) => {
    const currentPackages = hook.data.PACCHETTI_PREDEFINITI || []
    const updatedPackages = currentPackages
      .map(package => ({
        ...package,
        SERVIZI_INCLUSI: package.SERVIZI_INCLUSI.filter(serviceName => serviceName !== removedServiceName)
      }))
      .filter(package => package.SERVIZI_INCLUSI.length >= 2) // Remove packages with less than 2 services
    
    hook.updateField('PACCHETTI_PREDEFINITI', updatedPackages)
  }
  
  // Update packages after service rename
  const updatePackagesAfterServiceRename = (oldName: string, newName: string) => {
    const currentPackages = hook.data.PACCHETTI_PREDEFINITI || []
    const updatedPackages = currentPackages.map(package => ({
      ...package,
      SERVIZI_INCLUSI: package.SERVIZI_INCLUSI.map(serviceName => 
        serviceName === oldName ? newName : serviceName
      )
    }))
    
    hook.updateField('PACCHETTI_PREDEFINITI', updatedPackages)
  }
  
  // ANALYSIS AND VALIDATION
  
  // Calculate total services costs
  const calculateServicesCosts = () => {
    const services = hook.data.SERVIZI || []
    return calculateTotalServicesAnnualCost(services)
  }
  
  // Get portfolio assessment
  const getPortfolioAssessment = () => {
    return getServicesPortfolioAssessment(hook.data as Step18Data)
  }
  
  // Get customer summary
  const getCustomerSummary = () => {
    return generateServicesSummary(hook.data as Step18Data)
  }
  
  // Check service availability for zone
  const checkServiceAvailability = (serviceIndex: number, customerZone: string) => {
    const services = hook.data.SERVIZI || []
    if (serviceIndex >= 0 && serviceIndex < services.length) {
      return validateServiceAvailability(services[serviceIndex], customerZone)
    }
    return false
  }
  
  // Get array statistics
  const getServicesStats = () => {
    const services = hook.data.SERVIZI || []
    const packages = hook.data.PACCHETTI_PREDEFINITI || []
    const costs = calculateServicesCosts()
    
    return {
      services: {
        total: services.length,
        mandatory: services.filter(s => s.OBBLIGATORIO).length,
        optional: services.filter(s => !s.OBBLIGATORIO).length,
        included: services.filter(s => s.INCLUSO_PREZZO).length,
        withGeographicLimits: services.filter(s => s.LIMITAZIONI_GEOGRAFICHE).length,
        byMacroArea: Object.values(MACROAREA_SERVIZI).reduce((acc, area) => {
          acc[area] = services.filter(s => s.MACROAREA === area).length
          return acc
        }, {} as Record<string, number>),
        averageCost: services.length > 0 
          ? services.reduce((sum, s) => sum + s.COSTO_SERVIZIO, 0) / services.length 
          : 0
      },
      packages: {
        total: packages.length,
        withDiscount: packages.filter(p => p.SCONTO_PACCHETTO !== undefined).length,
        averageServicesPerPackage: packages.length > 0
          ? packages.reduce((sum, p) => sum + p.SERVIZI_INCLUSI.length, 0) / packages.length
          : 0
      },
      costs: costs,
      businessImpact: costs.mandatory > 200 ? 'alto' : costs.total > 100 ? 'medio' : 'basso'
    }
  }
  
  // FILTERING AND CATEGORIZATION
  
  // Filter services by macro area
  const getServicesByMacroArea = (macroArea: string) => {
    const services = hook.data.SERVIZI || []
    return services.filter(service => service.MACROAREA === macroArea)
  }
  
  // Filter services by mandatory status
  const getMandatoryServices = () => {
    const services = hook.data.SERVIZI || []
    return services.filter(service => service.OBBLIGATORIO)
  }
  
  // Filter services by price inclusion
  const getIncludedServices = () => {
    const services = hook.data.SERVIZI || []
    return services.filter(service => service.INCLUSO_PREZZO)
  }
  
  // Filter services with geographic limitations
  const getGeographicallyLimitedServices = () => {
    const services = hook.data.SERVIZI || []
    return services.filter(service => service.LIMITAZIONI_GEOGRAFICHE)
  }
  
  // Get services by cost range
  const getServicesByCostRange = (minCost: number, maxCost: number) => {
    const services = hook.data.SERVIZI || []
    return services.filter(service => 
      service.COSTO_SERVIZIO >= minCost && service.COSTO_SERVIZIO <= maxCost
    )
  }
  
  // Sort services by cost (descending)
  const getSortedServicesByCost = () => {
    const services = hook.data.SERVIZI || []
    return [...services].sort((a, b) => b.COSTO_SERVIZIO - a.COSTO_SERVIZIO)
  }
  
  // SMART PRESETS AND TEMPLATES
  
  // Add common service types
  const addCommonService = (type: 'caldaia' | 'fotovoltaico' | 'assistenza' | 'assicurazione' | 'manutenzione') => {
    const templates = {
      caldaia: {
        NOME_SERVIZIO: 'Assistenza Caldaia',
        MACROAREA: MACROAREA_SERVIZI.CALDAIA,
        DESCRIZIONE_SERVIZIO: 'Servizio di assistenza e manutenzione caldaia',
        COSTO_SERVIZIO: 120,
        UNITA_MISURA_COSTO: UNITA_MISURA.EURO_ANNO,
        CATEGORIA: 'MANUTENZIONE' as const
      },
      fotovoltaico: {
        NOME_SERVIZIO: 'Impianto Fotovoltaico',
        MACROAREA: MACROAREA_SERVIZI.FOTOVOLTAICO,
        DESCRIZIONE_SERVIZIO: 'Installazione e gestione impianto fotovoltaico',
        COSTO_SERVIZIO: 5000,
        UNITA_MISURA_COSTO: UNITA_MISURA.EURO,
        MODALITA_FATTURAZIONE: 'UNA_TANTUM' as const,
        CATEGORIA: 'INSTALLAZIONE' as const
      },
      assistenza: {
        NOME_SERVIZIO: 'Assistenza 24/7',
        MACROAREA: MACROAREA_SERVIZI.ALTRO,
        DESCRIZIONE_SERVIZIO: 'Assistenza clienti disponibile 24 ore su 24',
        COSTO_SERVIZIO: 60,
        UNITA_MISURA_COSTO: UNITA_MISURA.EURO_ANNO,
        CATEGORIA: 'ASSISTENZA' as const
      },
      assicurazione: {
        NOME_SERVIZIO: 'Polizza Casa',
        MACROAREA: MACROAREA_SERVIZI.POLIZZA_ASSICURATIVA,
        DESCRIZIONE_SERVIZIO: 'Polizza assicurativa per la casa',
        COSTO_SERVIZIO: 200,
        UNITA_MISURA_COSTO: UNITA_MISURA.EURO_ANNO,
        CATEGORIA: 'ASSICURAZIONE' as const
      },
      manutenzione: {
        NOME_SERVIZIO: 'Manutenzione Impianti',
        MACROAREA: MACROAREA_SERVIZI.CLIMATIZZAZIONE,
        DESCRIZIONE_SERVIZIO: 'Manutenzione impianti di climatizzazione',
        COSTO_SERVIZIO: 80,
        UNITA_MISURA_COSTO: UNITA_MISURA.EURO_ANNO,
        CATEGORIA: 'MANUTENZIONE' as const
      }
    }
    
    addService(templates[type])
  }
  
  // Create service portfolio presets
  const createServicePortfolio = (portfolio: 'basic' | 'comfort' | 'premium' | 'enterprise') => {
    clearAllServicesAndPackages()
    
    switch (portfolio) {
      case 'basic':
        addCommonService('assistenza')
        break
      case 'comfort':
        addCommonService('assistenza')
        addCommonService('caldaia')
        addCommonService('assicurazione')
        createPackageFromServices([0, 1, 2], 'Pacchetto Comfort', 'Servizi essenziali per la casa', 10)
        break
      case 'premium':
        addCommonService('assistenza')
        addCommonService('caldaia')
        addCommonService('assicurazione')
        addCommonService('manutenzione')
        createPackageFromServices([0, 1, 2, 3], 'Pacchetto Premium', 'Servizi completi per la casa', 15)
        break
      case 'enterprise':
        addCommonService('assistenza')
        addCommonService('caldaia')
        addCommonService('fotovoltaico')
        addCommonService('assicurazione')
        addCommonService('manutenzione')
        createPackageFromServices([0, 1, 3, 4], 'Pacchetto Manutenzione', 'Servizi di manutenzione completi', 20)
        createPackageFromServices([2], 'Pacchetto Green', 'Soluzioni sostenibili', 5)
        break
    }
  }
  
  // VALIDATION HELPERS
  
  // Check if service can be added
  const canAddService = (): boolean => {
    const currentServices = hook.data.SERVIZI || []
    return currentServices.length < 20
  }
  
  // Check if package can be added
  const canAddPackage = (): boolean => {
    const currentPackages = hook.data.PACCHETTI_PREDEFINITI || []
    return currentPackages.length < 5
  }
  
  // Validate service configuration
  const validateServiceConfiguration = (serviceIndex: number) => {
    const services = hook.data.SERVIZI || []
    if (serviceIndex < 0 || serviceIndex >= services.length) return { isValid: false, errors: ['Indice servizio non valido'] }
    
    const service = services[serviceIndex]
    const errors: string[] = []
    
    if (!service.NOME_SERVIZIO || service.NOME_SERVIZIO.length < 2) {
      errors.push('Nome servizio troppo breve')
    }
    
    if (!service.DESCRIZIONE_SERVIZIO || service.DESCRIZIONE_SERVIZIO.length < 10) {
      errors.push('Descrizione servizio troppo breve')
    }
    
    if (service.MODALITA_FATTURAZIONE === 'UNA_TANTUM' && service.DURATA_MESI && service.DURATA_MESI > 12) {
      errors.push('Servizi con durata superiore a 12 mesi dovrebbero avere fatturazione ricorrente')
    }
    
    return { isValid: errors.length === 0, errors }
  }
  
  // Calculate service portfolio score (0-100)
  const getPortfolioScore = (): number => {
    const stats = getServicesStats()
    const assessment = getPortfolioAssessment()
    
    let score = 0
    
    // Base score for having services
    if (stats.services.total > 0) score += 20
    
    // Bonus for diversity
    if (stats.services.total >= 5) score += 15
    const macroAreasCount = Object.values(stats.services.byMacroArea).filter(count => count > 0).length
    if (macroAreasCount >= 3) score += 15
    
    // Assessment bonuses
    if (assessment.diversity === 'eccellente') score += 20
    else if (assessment.diversity === 'buona') score += 15
    else score += 5
    
    if (assessment.valueProposition === 'premium') score += 15
    else if (assessment.valueProposition === 'competitiva') score += 10
    else score += 5
    
    // Bonus for packages
    if (stats.packages.total > 0) score += 10
    
    // Penalty for high mandatory costs
    if (stats.costs.mandatory > 300) score -= 10
    
    return Math.min(100, Math.max(0, score))
  }
  
  // IMPORT/EXPORT FUNCTIONALITY
  
  // Export services configuration
  const exportServicesConfiguration = () => {
    return {
      services: hook.data.SERVIZI || [],
      packages: hook.data.PACCHETTI_PREDEFINITI || [],
      notes: hook.data.NOTE_SERVIZI,
      statistics: getServicesStats(),
      assessment: getPortfolioAssessment(),
      score: getPortfolioScore(),
      timestamp: new Date().toISOString()
    }
  }
  
  // Import services configuration
  const importServicesConfiguration = (config: {
    services?: any[]
    packages?: any[]
    notes?: string
  }) => {
    const updates: Partial<Step18Data> = {}
    
    if (config.services) updates.SERVIZI = config.services
    if (config.packages) updates.PACCHETTI_PREDEFINITI = config.packages
    if (config.notes) updates.NOTE_SERVIZI = config.notes
    
    hook.batchUpdate(updates)
  }
  
  // Get services overview for UI
  const getServicesOverview = () => {
    const stats = getServicesStats()
    const assessment = getPortfolioAssessment()
    
    return {
      hasServices: stats.services.total > 0,
      hasPackages: stats.packages.total > 0,
      diversity: assessment.diversity,
      valueProposition: assessment.valueProposition,
      customerImpact: assessment.customerImpact,
      totalCosts: stats.costs.total,
      mandatoryCosts: stats.costs.mandatory,
      recommendations: assessment.recommendations.slice(0, 3),
      summary: {
        services: `${stats.services.total} servizi (${stats.services.mandatory} obbligatori)`,
        packages: stats.packages.total > 0 ? `${stats.packages.total} pacchetti disponibili` : 'Nessun pacchetto',
        costs: `${stats.costs.mandatory > 0 ? `€${stats.costs.mandatory} obbligatori, ` : ''}€${stats.costs.optional} opzionali`
      }
    }
  }
  
  return {
    ...hook,
    
    // SERVICES MANAGEMENT
    addService,
    removeService,
    updateService,
    duplicateService,
    reorderServices,
    
    // PACKAGES MANAGEMENT
    addPackage,
    removePackage,
    updatePackage,
    createPackageFromServices,
    
    // BULK OPERATIONS
    clearAllServicesAndPackages,
    bulkAddServices,
    setAllServicesMandatory,
    setAllServicesIncluded,
    
    // ANALYSIS
    calculateServicesCosts,
    getPortfolioAssessment,
    getCustomerSummary,
    checkServiceAvailability,
    getServicesStats,
    
    // FILTERING
    getServicesByMacroArea,
    getMandatoryServices,
    getIncludedServices,
    getGeographicallyLimitedServices,
    getServicesByCostRange,
    getSortedServicesByCost,
    
    // PRESETS
    addCommonService,
    createServicePortfolio,
    
    // VALIDATION
    canAddService,
    canAddPackage,
    validateServiceConfiguration,
    getPortfolioScore,
    
    // IMPORT/EXPORT
    exportServicesConfiguration,
    importServicesConfiguration,
    
    // UI HELPERS
    getServicesOverview
  }
}

/**
 * Type export for hook return value
 */
export type UseStep18Return = ReturnType<typeof useStep18>

/**
 * Default export for convenient importing
 */
export default useStep18 