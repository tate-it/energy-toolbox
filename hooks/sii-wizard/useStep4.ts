'use client'

/**
 * Step 4: Contact Information Hook (useStep4)
 * Using the standardized step hook factory for contact information management
 * 
 * Features:
 * - Smart batch updates for contact information fields
 * - Phone number format validation and normalization
 * - URL validation with HTTPS recommendations
 * - Related field groups for different contact method types
 */

import { 
  Step4Schema, 
  Step4Data, 
  Step4Defaults,
  validateStep4,
  isStep4Complete,
  formatStep4ForXML,
  formatPhoneNumberDisplay,
  isValidPhoneNumber,
  isValidURL,
  getContactMethodSummary,
  validateContactCompleteness
} from '../../lib/sii/schemas/step4'
import { 
  createStepHook,
  createFieldErrorFunction,
  createValidationFunction
} from './useStepFactory'

/**
 * Step 4 hook using the standardized factory with contact information batch updates
 */
const useStep4Hook = createStepHook<Step4Data>({
  stepId: 'step4',
  stepNumber: 4,
  defaultValues: Step4Defaults,
  validationFn: createValidationFunction<Step4Data>(Step4Schema),
  fieldErrorFn: createFieldErrorFunction<Step4Data>(Step4Schema),
  completenessCheckFn: isStep4Complete,
  xmlFormatter: formatStep4ForXML,
  
  // Related field groups for smart batch updates
  relatedFieldGroups: [
    {
      name: 'essentialContact',
      fields: ['tel'],
      updateStrategy: 'debounced',
      description: 'Contatto essenziale - telefono obbligatorio con validazione formato'
    },
    {
      name: 'webContact',
      fields: ['url_sito', 'url_off'],
      updateStrategy: 'debounced',
      description: 'Contatti web - URLs opzionali con validazione formato'
    },
    {
      name: 'allContacts',
      fields: ['tel', 'url_sito', 'url_off'],
      updateStrategy: 'fast',
      description: 'Tutti i contatti - aggiornamento rapido per validazione completa'
    }
  ],
  
  // Field relationships for Step 4
  fieldRelationships: {
    // Cross-validation for contact information quality
    crossValidation: [
      {
        fields: ['tel'],
        validator: (values) => {
          const { tel } = values
          if (tel && typeof tel === 'string') {
            // Phone number format validation
            if (!isValidPhoneNumber(tel)) {
              return 'Formato numero di telefono non valido (es: +39 02 12345678)'
            }
            
            // Recommend international format
            if (!tel.startsWith('+39') && tel.length >= 8) {
              return 'Considera l\'aggiunta del prefisso internazionale +39'
            }
          }
          return null
        }
      },
      {
        fields: ['url_sito'],
        validator: (values) => {
          const { url_sito } = values
          if (url_sito && typeof url_sito === 'string' && url_sito.trim()) {
            if (!isValidURL(url_sito)) {
              return 'URL sito venditore non valido (deve iniziare con http:// o https://)'
            }
            
            // Recommend HTTPS
            if (url_sito.startsWith('http://')) {
              return 'Raccomandato utilizzare HTTPS per maggiore sicurezza'
            }
            
            // Check URL length
            if (url_sito.length > 100) {
              return 'URL sito venditore non può superare 100 caratteri'
            }
          }
          return null
        }
      },
      {
        fields: ['url_off'],
        validator: (values) => {
          const { url_off } = values
          if (url_off && typeof url_off === 'string' && url_off.trim()) {
            if (!isValidURL(url_off)) {
              return 'URL offerta non valido (deve iniziare con http:// o https://)'
            }
            
            // Recommend HTTPS
            if (url_off.startsWith('http://')) {
              return 'Raccomandato utilizzare HTTPS per maggiore sicurezza'
            }
            
            // Check URL length
            if (url_off.length > 100) {
              return 'URL offerta non può superare 100 caratteri'
            }
          }
          return null
        }
      },
      {
        fields: ['tel', 'url_sito', 'url_off'],
        validator: (values) => {
          const { tel, url_sito, url_off } = values
          
          // Business logic: ensure minimum contact information
          if (!tel || (typeof tel === 'string' && tel.trim().length === 0)) {
            return 'Numero di telefono è obbligatorio'
          }
          
          // Quality check: recommend multiple contact methods
          const contactMethods = [tel, url_sito, url_off].filter(
            contact => contact && typeof contact === 'string' && contact.trim().length > 0
          ).length
          
          if (contactMethods === 1) {
            return 'Raccomandato fornire almeno un contatto web aggiuntivo per maggiore accessibilità'
          }
          
          return null
        }
      }
    ]
  }
})

/**
 * Step 4 hook with specialized batch update functions for contact information
 * 
 * This hook provides enhanced capabilities for managing contact information:
 * - updatePhone(phone) - Update phone with format validation and normalization
 * - updateWebContacts(siteUrl, offerUrl) - Update both URL fields together
 * - setEssentialContact(phone) - Set minimum required contact info
 * - setComprehensiveContacts() - Set all contact methods together
 * - formatPhoneDisplay() - Get formatted phone number for display
 * - validateContactQuality() - Get contact completeness assessment
 */
export function useStep4() {
  const hook = useStep4Hook()
  
  // Convenience methods for Step 4 specific contact management
  
  // Update phone number with format validation
  const updatePhone = (phone: string) => {
    hook.updateRelatedFieldGroup('essentialContact', { tel: phone })
  }
  
  // Update both web contact URLs together
  const updateWebContacts = (siteUrl?: string, offerUrl?: string) => {
    const updates: Partial<Step4Data> = {}
    if (siteUrl !== undefined) updates.url_sito = siteUrl
    if (offerUrl !== undefined) updates.url_off = offerUrl
    
    hook.updateRelatedFieldGroup('webContact', updates)
  }
  
  // Set essential contact information (phone only)
  const setEssentialContact = (phone: string) => {
    hook.updateRelatedFieldGroup('essentialContact', { tel: phone })
  }
  
  // Set comprehensive contact information
  const setComprehensiveContacts = (
    phone: string,
    siteUrl?: string,
    offerUrl?: string
  ) => {
    const updates: Partial<Step4Data> = { tel: phone }
    if (siteUrl) updates.url_sito = siteUrl
    if (offerUrl) updates.url_off = offerUrl
    
    hook.updateRelatedFieldGroup('allContacts', updates)
  }
  
  // Auto-format phone number for Italian format
  const autoFormatPhone = (phone: string) => {
    let formatted = phone.trim()
    
    // Add +39 prefix if looks like Italian number without prefix
    if (/^[0-9]{8,10}$/.test(formatted) && !formatted.startsWith('+')) {
      formatted = `+39${formatted}`
    }
    
    hook.updateField('tel', formatted)
  }
  
  // Ensure URLs have HTTPS
  const ensureHTTPS = () => {
    const updates: Partial<Step4Data> = {}
    
    if (hook.data.url_sito && hook.data.url_sito.startsWith('http://')) {
      updates.url_sito = hook.data.url_sito.replace('http://', 'https://')
    }
    
    if (hook.data.url_off && hook.data.url_off.startsWith('http://')) {
      updates.url_off = hook.data.url_off.replace('http://', 'https://')
    }
    
    if (Object.keys(updates).length > 0) {
      hook.updateRelatedFieldGroup('webContact', updates)
    }
  }
  
  // Clear all web contacts but keep phone
  const clearWebContacts = () => {
    hook.updateRelatedFieldGroup('webContact', {
      url_sito: '',
      url_off: ''
    })
  }
  
  // Get formatted phone number for display
  const getFormattedPhone = () => {
    return hook.data.tel ? formatPhoneNumberDisplay(hook.data.tel) : ''
  }
  
  // Get contact method summary and statistics
  const getContactSummary = () => {
    return getContactMethodSummary(hook.data as Step4Data)
  }
  
  // Validate contact information completeness and quality
  const validateContactQuality = () => {
    return validateContactCompleteness(hook.data as Step4Data)
  }
  
  // Check if contact information is comprehensive
  const isContactComprehensive = () => {
    const summary = getContactSummary()
    return summary.isComprehensive
  }
  
  // Get contact accessibility score (0-100)
  const getAccessibilityScore = () => {
    const summary = getContactSummary()
    let score = 0
    
    // Phone is mandatory (40 points)
    if (summary.hasPhone) score += 40
    
    // Website adds credibility (30 points)
    if (summary.hasWebsite) score += 30
    
    // Dedicated offer page (30 points)
    if (summary.hasOfferPage) score += 30
    
    return score
  }
  
  return {
    ...hook,
    
    // Step 4 specific contact management
    updatePhone,
    updateWebContacts,
    setEssentialContact,
    setComprehensiveContacts,
    autoFormatPhone,
    ensureHTTPS,
    clearWebContacts,
    
    // Helper functions
    getFormattedPhone,
    getContactSummary,
    validateContactQuality,
    isContactComprehensive,
    getAccessibilityScore
  }
}

/**
 * Type export for hook return value
 */
export type UseStep4Return = ReturnType<typeof useStep4>

/**
 * Default export for convenient importing
 */
export default useStep4 