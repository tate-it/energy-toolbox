'use client'

/**
 * Step 16: Offer Zones Hook (useStep16)
 * Demonstrates sophisticated array handling for geographic coverage
 * 
 * Features:
 * - Multiple array types: zones, regions, provinces, municipalities, ISTAT codes
 * - Geographic validation and ISTAT code verification
 * - Smart geographic selection helpers
 * - Coverage estimation and population calculations  
 * - Bulk geographic operations (import/export regions)
 * - Geographic conflict detection and resolution
 * - Coverage complexity analysis and recommendations
 */

import { 
  Step16Schema, 
  Step16Data, 
  Step16Defaults,
  validateStep16,
  isStep16Complete,
  formatStep16ForXML,
  validateISTATCode,
  validateCAP,
  validateProvinceCode,
  calculateCoverageEstimate,
  getGeographicComplexity,
  generateCoverageSummary,
  getGeographicZones
} from '../../lib/sii/schemas/step16'
import { 
  createStepHook,
  createFieldErrorFunction,
  createValidationFunction
} from './useStepFactory'

/**
 * Step 16 hook using the standardized factory with geographic array handling
 */
const useStep16Hook = createStepHook<Step16Data>({
  stepId: 'step16',
  stepNumber: 16,
  defaultValues: Step16Defaults,
  validationFn: createValidationFunction<Step16Data>(Step16Schema),
  fieldErrorFn: createFieldErrorFunction<Step16Data>(Step16Schema),
  completenessCheckFn: isStep16Complete,
  xmlFormatter: formatStep16ForXML,
  
  // Related field groups for geographic management
  relatedFieldGroups: [
    {
      name: 'mainZones',
      fields: ['ZONE_GEOGRAFICHE'],
      updateStrategy: 'immediate',
      description: 'Zone geografiche principali - aggiornamento immediato per UX'
    },
    {
      name: 'specificLocations',
      fields: ['REGIONI', 'PROVINCE', 'COMUNI', 'CODICI_ISTAT'],
      updateStrategy: 'fast',
      description: 'Località specifiche - aggiornamento rapido per gestione complessa'
    },
    {
      name: 'coverageDetails',
      fields: ['TIPO_COPERTURA', 'NOTE_COPERTURA', 'ZONE_ESCLUSE'],
      updateStrategy: 'debounced',
      description: 'Dettagli copertura - aggiornamento posticipato per campi testuali'
    },
    {
      name: 'coverageDates',
      fields: ['DATA_INIZIO_COPERTURA', 'DATA_FINE_COPERTURA'],
      updateStrategy: 'fast',
      description: 'Date copertura - aggiornamento rapido per validazione date'
    },
    {
      name: 'allGeographic',
      fields: ['ZONE_GEOGRAFICHE', 'REGIONI', 'PROVINCE', 'COMUNI', 'CODICI_ISTAT', 'ZONE_ESCLUSE'],
      updateStrategy: 'fast',
      description: 'Tutti i campi geografici - aggiornamento rapido per validazione completa'
    }
  ],
  
  // Field relationships for geographic validation
  fieldRelationships: {
    // Clear specific locations when national coverage is selected
    clearOnChange: [
      {
        trigger: 'ZONE_GEOGRAFICHE',
        targets: ['REGIONI', 'PROVINCE', 'COMUNI', 'CODICI_ISTAT'],
        condition: (triggerValue: string[]) => {
          return triggerValue.includes('TUTTO_TERRITORIO_NAZIONALE')
        }
      }
    ],
    
    // Cross-validation for geographic consistency
    crossValidation: [
      {
        fields: ['ZONE_GEOGRAFICHE', 'REGIONI', 'PROVINCE', 'COMUNI', 'CODICI_ISTAT'],
        validator: (values) => {
          const { ZONE_GEOGRAFICHE, REGIONI, PROVINCE, COMUNI, CODICI_ISTAT } = values
          
          // Check national vs specific zones conflict
          if (ZONE_GEOGRAFICHE?.includes('TUTTO_TERRITORIO_NAZIONALE')) {
            const hasOtherZones = ZONE_GEOGRAFICHE.some(zone => zone !== 'TUTTO_TERRITORIO_NAZIONALE')
            if (hasOtherZones) {
              return 'Non è possibile selezionare "Tutto territorio nazionale" insieme ad altre zone specifiche'
            }
          }
          
          // Check if specific zones require specific data
          if (ZONE_GEOGRAFICHE?.includes('ZONE_SPECIFICHE')) {
            const hasSpecificData = (REGIONI?.length || 0) > 0 || 
                                  (PROVINCE?.length || 0) > 0 || 
                                  (COMUNI?.length || 0) > 0 || 
                                  (CODICI_ISTAT?.length || 0) > 0
            if (!hasSpecificData) {
              return 'Per "Zone specifiche" è necessario specificare regioni, province, comuni o codici ISTAT'
            }
          }
          
          return null
        }
      },
      {
        fields: ['DATA_INIZIO_COPERTURA', 'DATA_FINE_COPERTURA'],
        validator: (values) => {
          const { DATA_INIZIO_COPERTURA, DATA_FINE_COPERTURA } = values
          
          if (DATA_INIZIO_COPERTURA && DATA_FINE_COPERTURA) {
            const startDate = new Date(DATA_INIZIO_COPERTURA)
            const endDate = new Date(DATA_FINE_COPERTURA)
            
            if (endDate <= startDate) {
              return 'La data di fine copertura deve essere successiva alla data di inizio'
            }
          }
          
          return null
        }
      },
      {
        fields: ['TIPO_COPERTURA', 'NOTE_COPERTURA'],
        validator: (values) => {
          const { TIPO_COPERTURA, NOTE_COPERTURA } = values
          
          if (TIPO_COPERTURA === 'PARZIALE' && (!NOTE_COPERTURA || NOTE_COPERTURA.trim().length === 0)) {
            return 'La copertura parziale richiede note esplicative'
          }
          
          if (TIPO_COPERTURA === 'SU_RICHIESTA' && (!NOTE_COPERTURA || NOTE_COPERTURA.trim().length === 0)) {
            return 'La copertura su richiesta richiede note esplicative'
          }
          
          return null
        }
      }
    ]
  }
})

/**
 * Default templates for new geographic items
 */
const defaultMunicipalityTemplate = {
  NOME: '',
  PROVINCIA: '',
  CODICE_ISTAT: undefined,
  CAP: undefined
}

/**
 * Step 16 hook with sophisticated array handling for geographic zones
 * 
 * This hook provides advanced geographic management capabilities:
 * - ZONES: addZone(), removeZone(), toggleZone(), setNationalCoverage()
 * - REGIONS: addRegion(), removeRegion(), bulkAddRegions(), clearRegions()  
 * - PROVINCES: addProvince(), removeProvince(), validateProvince(), getProvincesByRegion()
 * - MUNICIPALITIES: addMunicipality(), removeMunicipality(), updateMunicipality(), validateMunicipality()
 * - ISTAT: addISTATCode(), removeISTATCode(), validateISTATCode(), bulkImportISTAT()
 * - ANALYSIS: getCoverageEstimate(), getComplexityAnalysis(), generateCoverageSummary()
 */
export function useStep16() {
  const hook = useStep16Hook()
  
  // GEOGRAPHIC ZONES MANAGEMENT
  
  // Add geographic zone
  const addZone = (zone: string) => {
    const currentZones = hook.data.ZONE_GEOGRAFICHE || []
    if (!currentZones.includes(zone)) {
      hook.updateField('ZONE_GEOGRAFICHE', [...currentZones, zone])
    }
  }
  
  // Remove geographic zone
  const removeZone = (zone: string) => {
    const currentZones = hook.data.ZONE_GEOGRAFICHE || []
    hook.updateField('ZONE_GEOGRAFICHE', currentZones.filter(z => z !== zone))
  }
  
  // Toggle geographic zone
  const toggleZone = (zone: string) => {
    const currentZones = hook.data.ZONE_GEOGRAFICHE || []
    if (currentZones.includes(zone)) {
      removeZone(zone)
    } else {
      addZone(zone)
    }
  }
  
  // Set national coverage (clears other zones)
  const setNationalCoverage = () => {
    hook.updateRelatedFieldGroup('allGeographic', {
      ZONE_GEOGRAFICHE: ['TUTTO_TERRITORIO_NAZIONALE'],
      REGIONI: [],
      PROVINCE: [],
      COMUNI: [],
      CODICI_ISTAT: [],
      ZONE_ESCLUSE: []
    })
  }
  
  // Set specific zones mode
  const setSpecificZones = () => {
    const currentZones = hook.data.ZONE_GEOGRAFICHE || []
    const filteredZones = currentZones.filter(z => z !== 'TUTTO_TERRITORIO_NAZIONALE')
    
    if (!filteredZones.includes('ZONE_SPECIFICHE')) {
      filteredZones.push('ZONE_SPECIFICHE')
    }
    
    hook.updateField('ZONE_GEOGRAFICHE', filteredZones)
  }
  
  // REGIONS MANAGEMENT
  
  // Add region
  const addRegion = (region: string) => {
    const currentRegions = hook.data.REGIONI || []
    if (!currentRegions.includes(region)) {
      hook.updateField('REGIONI', [...currentRegions, region])
    }
  }
  
  // Remove region
  const removeRegion = (region: string) => {
    const currentRegions = hook.data.REGIONI || []
    hook.updateField('REGIONI', currentRegions.filter(r => r !== region))
  }
  
  // Bulk add regions
  const bulkAddRegions = (regions: string[]) => {
    const currentRegions = hook.data.REGIONI || []
    const newRegions = regions.filter(region => !currentRegions.includes(region))
    
    if (newRegions.length > 0) {
      hook.updateField('REGIONI', [...currentRegions, ...newRegions])
    }
  }
  
  // Clear all regions
  const clearRegions = () => {
    hook.updateField('REGIONI', [])
  }
  
  // Set northern Italy regions
  const setNorthernRegions = () => {
    const northernRegions = [
      'PIEMONTE', 'VALLE_AOSTA', 'LOMBARDIA', 'TRENTINO_ALTO_ADIGE',
      'VENETO', 'FRIULI_VENEZIA_GIULIA', 'LIGURIA', 'EMILIA_ROMAGNA'
    ]
    bulkAddRegions(northernRegions)
  }
  
  // Set central Italy regions  
  const setCentralRegions = () => {
    const centralRegions = ['TOSCANA', 'UMBRIA', 'MARCHE', 'LAZIO']
    bulkAddRegions(centralRegions)
  }
  
  // Set southern Italy regions
  const setSouthernRegions = () => {
    const southernRegions = [
      'ABRUZZO', 'MOLISE', 'CAMPANIA', 'PUGLIA', 'BASILICATA', 'CALABRIA'
    ]
    bulkAddRegions(southernRegions)
  }
  
  // Set islands regions
  const setIslandsRegions = () => {
    const islandsRegions = ['SICILIA', 'SARDEGNA']
    bulkAddRegions(islandsRegions)
  }
  
  // PROVINCES MANAGEMENT
  
  // Add province
  const addProvince = (province: string) => {
    if (validateProvinceCode(province)) {
      const currentProvinces = hook.data.PROVINCE || []
      if (!currentProvinces.includes(province.toUpperCase())) {
        hook.updateField('PROVINCE', [...currentProvinces, province.toUpperCase()])
      }
    }
  }
  
  // Remove province
  const removeProvince = (province: string) => {
    const currentProvinces = hook.data.PROVINCE || []
    hook.updateField('PROVINCE', currentProvinces.filter(p => p !== province.toUpperCase()))
  }
  
  // Validate province code
  const isValidProvince = (province: string): boolean => {
    return validateProvinceCode(province)
  }
  
  // Bulk add provinces
  const bulkAddProvinces = (provinces: string[]) => {
    const currentProvinces = hook.data.PROVINCE || []
    const validProvinces = provinces
      .filter(p => validateProvinceCode(p))
      .map(p => p.toUpperCase())
      .filter(p => !currentProvinces.includes(p))
    
    if (validProvinces.length > 0) {
      hook.updateField('PROVINCE', [...currentProvinces, ...validProvinces])
    }
  }
  
  // MUNICIPALITIES MANAGEMENT
  
  // Add municipality
  const addMunicipality = (municipality: Partial<typeof defaultMunicipalityTemplate>) => {
    const currentMunicipalities = hook.data.COMUNI || []
    const newMunicipality = { ...defaultMunicipalityTemplate, ...municipality }
    
    // Basic validation
    if (newMunicipality.NOME && newMunicipality.PROVINCIA) {
      hook.updateField('COMUNI', [...currentMunicipalities, newMunicipality])
    }
  }
  
  // Remove municipality by index
  const removeMunicipality = (index: number) => {
    const currentMunicipalities = hook.data.COMUNI || []
    if (index >= 0 && index < currentMunicipalities.length) {
      const newMunicipalities = currentMunicipalities.filter((_, i) => i !== index)
      hook.updateField('COMUNI', newMunicipalities)
    }
  }
  
  // Update municipality
  const updateMunicipality = (index: number, updates: Partial<typeof defaultMunicipalityTemplate>) => {
    const currentMunicipalities = hook.data.COMUNI || []
    if (index >= 0 && index < currentMunicipalities.length) {
      const newMunicipalities = [...currentMunicipalities]
      newMunicipalities[index] = { ...newMunicipalities[index], ...updates }
      hook.updateField('COMUNI', newMunicipalities)
    }
  }
  
  // Validate municipality data
  const validateMunicipality = (municipality: typeof defaultMunicipalityTemplate): string[] => {
    const errors: string[] = []
    
    if (!municipality.NOME || municipality.NOME.length < 2) {
      errors.push('Nome comune troppo breve')
    }
    
    if (!municipality.PROVINCIA || !validateProvinceCode(municipality.PROVINCIA)) {
      errors.push('Codice provincia non valido')
    }
    
    if (municipality.CODICE_ISTAT && !validateISTATCode(municipality.CODICE_ISTAT)) {
      errors.push('Codice ISTAT non valido')
    }
    
    if (municipality.CAP && !validateCAP(municipality.CAP)) {
      errors.push('CAP non valido')
    }
    
    return errors
  }
  
  // ISTAT CODES MANAGEMENT
  
  // Add ISTAT code
  const addISTATCode = (code: string) => {
    if (validateISTATCode(code)) {
      const currentCodes = hook.data.CODICI_ISTAT || []
      if (!currentCodes.includes(code)) {
        hook.updateField('CODICI_ISTAT', [...currentCodes, code])
      }
    }
  }
  
  // Remove ISTAT code
  const removeISTATCode = (code: string) => {
    const currentCodes = hook.data.CODICI_ISTAT || []
    hook.updateField('CODICI_ISTAT', currentCodes.filter(c => c !== code))
  }
  
  // Bulk import ISTAT codes
  const bulkImportISTATCodes = (codes: string[]) => {
    const currentCodes = hook.data.CODICI_ISTAT || []
    const validCodes = codes.filter(code => validateISTATCode(code))
    const newCodes = validCodes.filter(code => !currentCodes.includes(code))
    
    if (newCodes.length > 0) {
      hook.updateField('CODICI_ISTAT', [...currentCodes, ...newCodes])
    }
    
    return {
      imported: newCodes.length,
      skipped: codes.length - validCodes.length,
      duplicates: validCodes.length - newCodes.length
    }
  }
  
  // Validate ISTAT code
  const isValidISTATCode = (code: string): boolean => {
    return validateISTATCode(code)
  }
  
  // EXCLUSIONS MANAGEMENT
  
  // Add excluded zone
  const addExcludedZone = (zone: string) => {
    const currentExclusions = hook.data.ZONE_ESCLUSE || []
    if (!currentExclusions.includes(zone)) {
      hook.updateField('ZONE_ESCLUSE', [...currentExclusions, zone])
    }
  }
  
  // Remove excluded zone
  const removeExcludedZone = (zone: string) => {
    const currentExclusions = hook.data.ZONE_ESCLUSE || []
    hook.updateField('ZONE_ESCLUSE', currentExclusions.filter(z => z !== zone))
  }
  
  // Clear all exclusions
  const clearExcludedZones = () => {
    hook.updateField('ZONE_ESCLUSE', [])
  }
  
  // COVERAGE ANALYSIS
  
  // Get coverage estimate
  const getCoverageEstimate = () => {
    return calculateCoverageEstimate(hook.data as Step16Data)
  }
  
  // Get geographic complexity analysis
  const getComplexityAnalysis = () => {
    return getGeographicComplexity(hook.data as Step16Data)
  }
  
  // Generate coverage summary
  const getCoverageSummary = () => {
    return generateCoverageSummary(hook.data as Step16Data)
  }
  
  // Get array statistics
  const getGeographicStats = () => {
    return {
      zones: (hook.data.ZONE_GEOGRAFICHE || []).length,
      regions: (hook.data.REGIONI || []).length,
      provinces: (hook.data.PROVINCE || []).length,
      municipalities: (hook.data.COMUNI || []).length,
      istatCodes: (hook.data.CODICI_ISTAT || []).length,
      exclusions: (hook.data.ZONE_ESCLUSE || []).length,
      hasNationalCoverage: (hook.data.ZONE_GEOGRAFICHE || []).includes('TUTTO_TERRITORIO_NAZIONALE'),
      hasSpecificZones: (hook.data.ZONE_GEOGRAFICHE || []).includes('ZONE_SPECIFICHE'),
      totalSpecificLocations: (hook.data.REGIONI || []).length + 
                             (hook.data.PROVINCE || []).length + 
                             (hook.data.COMUNI || []).length + 
                             (hook.data.CODICI_ISTAT || []).length
    }
  }
  
  // Calculate coverage score (0-100)
  const getCoverageScore = (): number => {
    const stats = getGeographicStats()
    const estimate = getCoverageEstimate()
    
    let score = 0
    
    // Base score from population coverage
    score += Math.min(50, (estimate.percentage / 100) * 50)
    
    // Bonus for clear coverage type
    if (hook.data.TIPO_COPERTURA) {
      score += 10
    }
    
    // Bonus for reasonable complexity
    const complexity = getComplexityAnalysis()
    if (complexity.level === 'semplice') score += 20
    else if (complexity.level === 'medio') score += 15
    else score += 5
    
    // Bonus for good documentation
    if (hook.data.NOTE_COPERTURA && hook.data.NOTE_COPERTURA.length > 20) {
      score += 10
    }
    
    // Penalty for excessive complexity
    if (stats.totalSpecificLocations > 100) {
      score -= 10
    }
    
    return Math.min(100, Math.max(0, score))
  }
  
  // GEOGRAPHIC HELPERS
  
  // Check if zone is selected
  const hasZone = (zone: string): boolean => {
    const zones = hook.data.ZONE_GEOGRAFICHE || []
    return zones.includes(zone)
  }
  
  // Check if region is selected
  const hasRegion = (region: string): boolean => {
    const regions = hook.data.REGIONI || []
    return regions.includes(region)
  }
  
  // Check if province is selected
  const hasProvince = (province: string): boolean => {
    const provinces = hook.data.PROVINCE || []
    return provinces.includes(province.toUpperCase())
  }
  
  // Get available zones
  const getAvailableZones = () => {
    const selectedZones = hook.data.ZONE_GEOGRAFICHE || []
    const allZones = getGeographicZones()
    
    return allZones.filter(zone => !selectedZones.includes(zone.value))
  }
  
  // IMPORT/EXPORT FUNCTIONALITY
  
  // Export geographic configuration
  const exportGeographicConfig = () => {
    return {
      zones: hook.data.ZONE_GEOGRAFICHE || [],
      regions: hook.data.REGIONI || [],
      provinces: hook.data.PROVINCE || [],
      municipalities: hook.data.COMUNI || [],
      istatCodes: hook.data.CODICI_ISTAT || [],
      exclusions: hook.data.ZONE_ESCLUSE || [],
      coverageType: hook.data.TIPO_COPERTURA,
      notes: hook.data.NOTE_COPERTURA,
      startDate: hook.data.DATA_INIZIO_COPERTURA,
      endDate: hook.data.DATA_FINE_COPERTURA,
      estimate: getCoverageEstimate(),
      complexity: getComplexityAnalysis(),
      score: getCoverageScore(),
      timestamp: new Date().toISOString()
    }
  }
  
  // Import geographic configuration
  const importGeographicConfig = (config: {
    zones?: string[]
    regions?: string[]
    provinces?: string[]
    municipalities?: any[]
    istatCodes?: string[]
    exclusions?: string[]
    coverageType?: string
    notes?: string
  }) => {
    const updates: Partial<Step16Data> = {}
    
    if (config.zones) updates.ZONE_GEOGRAFICHE = config.zones
    if (config.regions) updates.REGIONI = config.regions
    if (config.provinces) updates.PROVINCE = config.provinces
    if (config.municipalities) updates.COMUNI = config.municipalities
    if (config.istatCodes) updates.CODICI_ISTAT = config.istatCodes
    if (config.exclusions) updates.ZONE_ESCLUSE = config.exclusions
    if (config.coverageType) updates.TIPO_COPERTURA = config.coverageType as any
    if (config.notes) updates.NOTE_COPERTURA = config.notes
    
    hook.batchUpdate(updates)
  }
  
  return {
    ...hook,
    
    // ZONES MANAGEMENT
    addZone,
    removeZone,
    toggleZone,
    setNationalCoverage,
    setSpecificZones,
    
    // REGIONS MANAGEMENT
    addRegion,
    removeRegion,
    bulkAddRegions,
    clearRegions,
    setNorthernRegions,
    setCentralRegions,
    setSouthernRegions,
    setIslandsRegions,
    
    // PROVINCES MANAGEMENT
    addProvince,
    removeProvince,
    isValidProvince,
    bulkAddProvinces,
    
    // MUNICIPALITIES MANAGEMENT
    addMunicipality,
    removeMunicipality,
    updateMunicipality,
    validateMunicipality,
    
    // ISTAT MANAGEMENT
    addISTATCode,
    removeISTATCode,
    bulkImportISTATCodes,
    isValidISTATCode,
    
    // EXCLUSIONS MANAGEMENT
    addExcludedZone,
    removeExcludedZone,
    clearExcludedZones,
    
    // ANALYSIS
    getCoverageEstimate,
    getComplexityAnalysis,
    getCoverageSummary,
    getGeographicStats,
    getCoverageScore,
    
    // HELPERS
    hasZone,
    hasRegion,
    hasProvince,
    getAvailableZones,
    
    // IMPORT/EXPORT
    exportGeographicConfig,
    importGeographicConfig
  }
}

/**
 * Type export for hook return value
 */
export type UseStep16Return = ReturnType<typeof useStep16>

/**
 * Default export for convenient importing
 */
export default useStep16 