'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Copy, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react'
import { FormField } from './FormField'
import { FormSelect } from './FormSelect'
import { InfoAlert } from './InfoAlert'
import { cn } from '@/lib/utils'

export interface ObjectFieldDefinition {
  key: string
  label: string
  type?: 'text' | 'email' | 'url' | 'tel' | 'number' | 'textarea' | 'select'
  placeholder?: string
  description?: string
  required?: boolean
  maxLength?: number
  pattern?: string
  min?: string
  max?: string
  step?: string
  suffix?: string
  options?: { value: string; label: string }[]
  validate?: (value: string, item: Record<string, string>, items: Record<string, string>[]) => string[] | undefined
  dependsOn?: string // Show this field only when another field has a value
  showWhen?: (item: Record<string, string>) => boolean
}

export interface RepeatableObjectItem {
  id: string
  data: Record<string, string>
  errors: Record<string, string[]>
  isValid: boolean
  isCollapsed?: boolean
  isDirty?: boolean
}

export interface RepeatableObjectFieldProps {
  // Field configuration
  label: string
  description?: string
  required?: boolean
  disabled?: boolean
  
  // Object structure
  fields: ObjectFieldDefinition[]
  items: RepeatableObjectItem[]
  onChange: (items: RepeatableObjectItem[]) => void
  onValidate?: (items: RepeatableObjectItem[]) => RepeatableObjectItem[]
  
  // Limits and validation
  minItems?: number
  maxItems?: number
  allowDuplicates?: boolean
  
  // UI configuration
  allowReorder?: boolean
  showItemNumbers?: boolean
  showValidationStatus?: boolean
  animateChanges?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
  
  // Item display
  getItemTitle?: (item: RepeatableObjectItem, index: number) => string
  getItemSubtitle?: (item: RepeatableObjectItem, index: number) => string
  getItemSummary?: (item: RepeatableObjectItem) => React.ReactNode
  
  // Customization
  addButtonText?: string
  emptyStateMessage?: string
  className?: string
}

/**
 * RepeatableObjectField - Componente per gestire array di oggetti complessi
 * 
 * Caratteristiche:
 * - Aggiunta/rimozione dinamica di oggetti strutturati
 * - Campi multipli per oggetto con validazione nidificata
 * - Campi condizionali basati su altri valori
 * - Visualizzazione compatta con espansione/collasso
 * - Riordinamento drag & drop (opzionale)
 * - Validazione cross-field complessa
 * - Riassunti configurabili per oggetto
 * - Localizzazione italiana completa
 */
export function RepeatableObjectField({
  label,
  description,
  required = false,
  disabled = false,
  
  fields,
  items = [],
  onChange,
  onValidate,
  
  minItems = 0,
  maxItems = 20,
  allowDuplicates = true,
  
  allowReorder = false,
  showItemNumbers = true,
  showValidationStatus = true,
  animateChanges = true,
  collapsible = true,
  defaultCollapsed = false,
  
  getItemTitle,
  getItemSubtitle,
  getItemSummary,
  
  addButtonText = 'Aggiungi elemento',
  emptyStateMessage = 'Nessun elemento aggiunto. Clicca per aggiungere il primo.',
  className = ''
}: RepeatableObjectFieldProps) {
  
  // Generate unique ID for new items
  const generateId = () => `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  // Create empty object based on field definitions
  const createEmptyObject = (): Record<string, string> => {
    const obj: Record<string, string> = {}
    fields.forEach(field => {
      obj[field.key] = ''
    })
    return obj
  }
  
  // Validation state
  const arrayErrors = React.useMemo(() => {
    const errors: string[] = []
    
    // Check minimum items
    if (required && items.length === 0) {
      errors.push('Almeno un elemento è obbligatorio')
    }
    if (minItems > 0 && items.length < minItems) {
      errors.push(`Minimo ${minItems} ${minItems === 1 ? 'elemento richiesto' : 'elementi richiesti'}`)
    }
    
    // Check maximum items
    if (items.length > maxItems) {
      errors.push(`Massimo ${maxItems} ${maxItems === 1 ? 'elemento consentito' : 'elementi consentiti'}`)
    }
    
    // Check duplicates (if applicable)
    if (!allowDuplicates && items.length > 1) {
      const signatures = items.map(item => JSON.stringify(item.data))
      const duplicates = signatures.filter((sig, index) => signatures.indexOf(sig) !== index)
      if (duplicates.length > 0) {
        errors.push('Elementi duplicati non consentiti')
      }
    }
    
    return errors
  }, [items, required, minItems, maxItems, allowDuplicates])
  
  const hasItems = items.length > 0
  const canAddMore = items.length < maxItems
  
  // Validate a single item
  const validateItem = (item: RepeatableObjectItem): RepeatableObjectItem => {
    const newErrors: Record<string, string[]> = {}
    let hasAnyErrors = false
    
    fields.forEach(field => {
      const value = item.data[field.key] || ''
      const errors: string[] = []
      
      // Required field validation
      if (field.required && !value.trim()) {
        errors.push('Campo obbligatorio')
      }
      
      // Length validation
      if (value && field.maxLength && value.length > field.maxLength) {
        errors.push(`Massimo ${field.maxLength} caratteri consentiti`)
      }
      
      // Pattern validation
      if (value && field.pattern && !new RegExp(field.pattern).test(value)) {
        errors.push('Formato non valido')
      }
      
      // Type-specific validation
      if (value) {
        switch (field.type) {
          case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors.push('Indirizzo email non valido')
            }
            break
          case 'url':
            try {
              new URL(value)
            } catch {
              errors.push('URL non valido')
            }
            break
          case 'number':
            if (!/^[+-]?([0-9]*[.])?[0-9]+$/.test(value)) {
              errors.push('Numero non valido')
            }
            break
        }
      }
      
      // Custom validation
      if (field.validate) {
        const customErrors = field.validate(value, item.data, items.map(i => i.data)) || []
        errors.push(...customErrors)
      }
      
      if (errors.length > 0) {
        newErrors[field.key] = errors
        hasAnyErrors = true
      }
    })
    
    return {
      ...item,
      errors: newErrors,
      isValid: !hasAnyErrors && Object.keys(item.data).some(key => item.data[key].trim() !== ''),
      isDirty: Object.keys(item.data).some(key => item.data[key].trim() !== '')
    }
  }
  
  // Item operations
  const addItem = () => {
    if (!canAddMore || disabled) return
    
    const newItem: RepeatableObjectItem = {
      id: generateId(),
      data: createEmptyObject(),
      errors: {},
      isValid: false,
      isCollapsed: defaultCollapsed,
      isDirty: false
    }
    
    onChange([...items, newItem])
  }
  
  const removeItem = (itemId: string) => {
    if (disabled) return
    onChange(items.filter(item => item.id !== itemId))
  }
  
  const updateItem = (itemId: string, fieldKey: string, value: string) => {
    if (disabled) return
    
    const itemIndex = items.findIndex(item => item.id === itemId)
    if (itemIndex === -1) return
    
    const updatedItems = [...items]
    const item = { ...updatedItems[itemIndex] }
    
    // Update data
    item.data = { ...item.data, [fieldKey]: value }
    
    // Validate item
    const validatedItem = validateItem(item)
    updatedItems[itemIndex] = validatedItem
    
    // Apply global validation if provided
    const finalItems = onValidate ? onValidate(updatedItems) : updatedItems
    onChange(finalItems)
  }
  
  const duplicateItem = (itemId: string) => {
    if (!canAddMore || disabled) return
    
    const originalItem = items.find(item => item.id === itemId)
    if (!originalItem) return
    
    const newItem: RepeatableObjectItem = {
      id: generateId(),
      data: { ...originalItem.data },
      errors: {},
      isValid: false,
      isCollapsed: defaultCollapsed,
      isDirty: true
    }
    
    const itemIndex = items.findIndex(item => item.id === itemId)
    const updatedItems = [...items]
    updatedItems.splice(itemIndex + 1, 0, newItem)
    
    onChange(updatedItems)
  }
  
  const toggleItemCollapse = (itemId: string) => {
    const updatedItems = items.map(item => 
      item.id === itemId 
        ? { ...item, isCollapsed: !item.isCollapsed }
        : item
    )
    onChange(updatedItems)
  }
  
  const clearAll = () => {
    if (disabled) return
    onChange([])
  }
  
  // Default item title generator
  const defaultGetItemTitle = (item: RepeatableObjectItem, index: number): string => {
    if (getItemTitle) return getItemTitle(item, index)
    
    // Try to use first non-empty field as title
    const firstValueField = fields.find(field => item.data[field.key]?.trim())
    if (firstValueField) {
      const value = item.data[firstValueField.key]
      return value.length > 30 ? `${value.substring(0, 30)}...` : value
    }
    
    return `Elemento ${index + 1}`
  }
  
  // Default item subtitle generator
  const defaultGetItemSubtitle = (item: RepeatableObjectItem, index: number): string => {
    if (getItemSubtitle) return getItemSubtitle(item, index)
    
    const filledFields = fields.filter(field => item.data[field.key]?.trim()).length
    return `${filledFields}/${fields.length} campi completati`
  }
  
  // Statistics
  const validItemsCount = items.filter(item => item.isValid).length
  const invalidItemsCount = items.filter(item => Object.keys(item.errors).length > 0).length
  const dirtyItemsCount = items.filter(item => item.isDirty).length
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
            
            {/* Item count and status */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {items.length} {items.length === 1 ? 'elemento' : 'elementi'}
              </Badge>
              
              {showValidationStatus && hasItems && (
                <>
                  {validItemsCount > 0 && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {validItemsCount} validi
                    </Badge>
                  )}
                  {invalidItemsCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {invalidItemsCount} errori
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Bulk actions */}
          {hasItems && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAll}
                disabled={disabled}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Cancella tutto
              </Button>
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      
      {/* Array validation errors */}
      {arrayErrors.length > 0 && (
        <InfoAlert
          type="error"
          title="Errori di validazione"
        >
          <ul className="list-disc list-inside space-y-1">
            {arrayErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </InfoAlert>
      )}
      
      {/* Items list */}
      <div className="space-y-3">
        {hasItems ? (
          <div className="space-y-3">
            {items.map((item, index) => (
              <Card 
                key={item.id}
                className={cn(
                  'border transition-all duration-200',
                  animateChanges && 'animate-in slide-in-from-top-2 duration-300',
                  item.isValid && 'border-green-200 bg-green-50/20',
                  Object.keys(item.errors).length > 0 && 'border-red-200 bg-red-50/20'
                )}
              >
                {collapsible ? (
                  <Collapsible 
                    open={!item.isCollapsed} 
                    onOpenChange={() => toggleItemCollapse(item.id)}
                  >
                    {/* Collapsible Header */}
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center gap-3 cursor-pointer flex-1">
                            {/* Drag handle (if reordering enabled) */}
                            {allowReorder && (
                              <div className="cursor-move text-muted-foreground hover:text-foreground">
                                <GripVertical className="h-4 w-4" />
                              </div>
                            )}
                            
                            {/* Item number */}
                            {showItemNumbers && (
                              <Badge variant="secondary" className="text-xs">
                                {index + 1}
                              </Badge>
                            )}
                            
                            {/* Chevron */}
                            <div className="text-muted-foreground">
                              {item.isCollapsed ? (
                                <ChevronRight className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                            
                            {/* Title and subtitle */}
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm font-medium truncate">
                                {defaultGetItemTitle(item, index)}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground mt-1">
                                {defaultGetItemSubtitle(item, index)}
                              </p>
                            </div>
                            
                            {/* Status indicators */}
                            <div className="flex items-center gap-2">
                              {item.isValid && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                              {Object.keys(item.errors).length > 0 && (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                              {item.isCollapsed ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        {/* Item actions */}
                        <div className="flex items-center gap-1 ml-2">
                          {/* Duplicate button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateItem(item.id)}
                            disabled={disabled || !canAddMore}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="Duplica elemento"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          
                          {/* Remove button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={disabled}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            title="Rimuovi elemento"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Item summary (when collapsed) */}
                      {item.isCollapsed && getItemSummary && (
                        <div className="mt-3 pt-3 border-t border-muted">
                          {getItemSummary(item)}
                        </div>
                      )}
                    </CardHeader>
                    
                    {/* Collapsible Content */}
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {fields.map(field => {
                            // Check if field should be shown
                            if (field.showWhen && !field.showWhen(item.data)) return null
                            if (field.dependsOn && !item.data[field.dependsOn]) return null
                            
                            const fieldErrors = item.errors[field.key] || []
                            const hasFieldError = fieldErrors.length > 0
                            
                            return (
                              <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                {field.type === 'select' ? (
                                  <FormSelect
                                    id={`object-field-${item.id}-${field.key}`}
                                    label={field.label}
                                    value={item.data[field.key] || ''}
                                    onChange={(value) => updateItem(item.id, field.key, value)}
                                    options={field.options || []}
                                    error={hasFieldError ? fieldErrors[0] : undefined}
                                    placeholder={field.placeholder}
                                    description={field.description}
                                    required={field.required}
                                    disabled={disabled}
                                  />
                                ) : (
                                  <FormField
                                    label={field.label}
                                    type={field.type || 'text'}
                                    value={item.data[field.key] || ''}
                                    onChange={(value) => updateItem(item.id, field.key, value)}
                                    error={hasFieldError ? fieldErrors[0] : undefined}
                                    placeholder={field.placeholder}
                                    description={field.description}
                                    required={field.required}
                                    disabled={disabled}
                                    maxLength={field.maxLength}
                                    pattern={field.pattern}
                                    min={field.min}
                                    max={field.max}
                                    step={field.step}
                                    suffix={field.suffix}
                                  />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  /* Non-collapsible version */
                  <>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Drag handle (if reordering enabled) */}
                          {allowReorder && (
                            <div className="cursor-move text-muted-foreground hover:text-foreground">
                              <GripVertical className="h-4 w-4" />
                            </div>
                          )}
                          
                          {/* Item number */}
                          {showItemNumbers && (
                            <Badge variant="secondary" className="text-xs">
                              {index + 1}
                            </Badge>
                          )}
                          
                          {/* Title and subtitle */}
                          <div className="flex-1">
                            <CardTitle className="text-sm font-medium">
                              {defaultGetItemTitle(item, index)}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {defaultGetItemSubtitle(item, index)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Item actions */}
                        <div className="flex items-center gap-1">
                          {/* Status indicator */}
                          {item.isValid && (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          )}
                          {Object.keys(item.errors).length > 0 && (
                            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                          )}
                          
                          {/* Duplicate button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateItem(item.id)}
                            disabled={disabled || !canAddMore}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="Duplica elemento"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          
                          {/* Remove button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={disabled}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            title="Rimuovi elemento"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map(field => {
                          // Check if field should be shown
                          if (field.showWhen && !field.showWhen(item.data)) return null
                          if (field.dependsOn && !item.data[field.dependsOn]) return null
                          
                          const fieldErrors = item.errors[field.key] || []
                          const hasFieldError = fieldErrors.length > 0
                          
                          return (
                            <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                              {field.type === 'select' ? (
                                <FormSelect
                                  id={`object-field-${item.id}-${field.key}`}
                                  label={field.label}
                                  value={item.data[field.key] || ''}
                                  onChange={(value) => updateItem(item.id, field.key, value)}
                                  options={field.options || []}
                                  error={hasFieldError ? fieldErrors[0] : undefined}
                                  placeholder={field.placeholder}
                                  description={field.description}
                                  required={field.required}
                                  disabled={disabled}
                                />
                              ) : (
                                <FormField
                                  label={field.label}
                                  type={field.type || 'text'}
                                  value={item.data[field.key] || ''}
                                  onChange={(value) => updateItem(item.id, field.key, value)}
                                  error={hasFieldError ? fieldErrors[0] : undefined}
                                  placeholder={field.placeholder}
                                  description={field.description}
                                  required={field.required}
                                  disabled={disabled}
                                  maxLength={field.maxLength}
                                  pattern={field.pattern}
                                  min={field.min}
                                  max={field.max}
                                  step={field.step}
                                  suffix={field.suffix}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        ) : (
          /* Empty state */
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{emptyStateMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Add button */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          disabled={disabled || !canAddMore}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {addButtonText}
        </Button>
        
        {/* Capacity indicator */}
        <div className="text-xs text-muted-foreground">
          {items.length}/{maxItems} {maxItems === 1 ? 'elemento' : 'elementi'}
          {minItems > 0 && ` (min: ${minItems})`}
        </div>
      </div>
      
      {/* Summary statistics */}
      {hasItems && showValidationStatus && (
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-foreground">Totale</div>
              <div className="text-muted-foreground">{items.length}</div>
            </div>
            <div>
              <div className="font-medium text-green-600">Validi</div>
              <div className="text-muted-foreground">{validItemsCount}</div>
            </div>
            {invalidItemsCount > 0 && (
              <div>
                <div className="font-medium text-red-600">Errori</div>
                <div className="text-muted-foreground">{invalidItemsCount}</div>
              </div>
            )}
            {dirtyItemsCount > 0 && (
              <div>
                <div className="font-medium text-blue-600">Modificati</div>
                <div className="text-muted-foreground">{dirtyItemsCount}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RepeatableObjectField 