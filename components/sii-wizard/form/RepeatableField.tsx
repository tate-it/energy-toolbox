'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Copy, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { FormField } from './FormField'
import { InfoAlert } from './InfoAlert'
import { cn } from '@/lib/utils'

export interface RepeatableFieldItem {
  id: string
  value: string
  errors?: string[]
  isValid?: boolean
}

export interface RepeatableFieldProps {
  // Field configuration
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  
  // Array configuration
  items: RepeatableFieldItem[]
  onChange: (items: RepeatableFieldItem[]) => void
  onValidate?: (value: string, index: number) => string[] | undefined
  
  // Limits and validation
  minItems?: number
  maxItems?: number
  allowDuplicates?: boolean
  maxItemLength?: number
  
  // Field type and constraints
  inputType?: 'text' | 'email' | 'url' | 'tel' | 'number'
  pattern?: string
  
  // UI configuration
  allowReorder?: boolean
  showItemNumbers?: boolean
  showValidationStatus?: boolean
  animateChanges?: boolean
  
  // Customization
  addButtonText?: string
  emptyStateMessage?: string
  className?: string
}

/**
 * RepeatableField - Componente per gestire array di valori semplici
 * 
 * Caratteristiche:
 * - Aggiunta/rimozione dinamica di elementi
 * - Validazione per singolo elemento e array
 * - Riordinamento drag & drop (opzionale)
 * - Controlli di duplicazione
 * - Limiti min/max configurabili
 * - Animazioni fluide
 * - Localizzazione italiana
 * - Stato di validazione visuale
 */
export function RepeatableField({
  label,
  description,
  placeholder = '',
  required = false,
  disabled = false,
  
  items = [],
  onChange,
  onValidate,
  
  minItems = 0,
  maxItems = 50,
  allowDuplicates = true,
  maxItemLength = 255,
  
  inputType = 'text',
  pattern,
  
  allowReorder = false,
  showItemNumbers = true,
  showValidationStatus = true,
  animateChanges = true,
  
  addButtonText = 'Aggiungi elemento',
  emptyStateMessage = 'Nessun elemento aggiunto. Clicca per aggiungere il primo.',
  className = ''
}: RepeatableFieldProps) {
  
  // Generate unique ID for new items
  const generateId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
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
    
    // Check duplicates
    if (!allowDuplicates && items.length > 0) {
      const values = items.map(item => item.value.toLowerCase().trim())
      const duplicates = values.filter((value, index) => values.indexOf(value) !== index)
      if (duplicates.length > 0) {
        errors.push('Elementi duplicati non consentiti')
      }
    }
    
    return errors
  }, [items, required, minItems, maxItems, allowDuplicates])
  
  const hasItems = items.length > 0
  const canAddMore = items.length < maxItems
  
  // Item operations
  const addItem = () => {
    if (!canAddMore || disabled) return
    
    const newItem: RepeatableFieldItem = {
      id: generateId(),
      value: '',
      errors: [],
      isValid: false
    }
    
    onChange([...items, newItem])
  }
  
  const removeItem = (itemId: string) => {
    if (disabled) return
    onChange(items.filter(item => item.id !== itemId))
  }
  
  const updateItem = (itemId: string, value: string) => {
    if (disabled) return
    
    const itemIndex = items.findIndex(item => item.id === itemId)
    if (itemIndex === -1) return
    
    const updatedItems = [...items]
    const item = { ...updatedItems[itemIndex] }
    
    // Update value
    item.value = value
    
    // Validate item
    let errors: string[] = []
    
    // Length validation
    if (value.length > maxItemLength) {
      errors.push(`Massimo ${maxItemLength} caratteri consentiti`)
    }
    
    // Pattern validation
    if (pattern && value && !new RegExp(pattern).test(value)) {
      errors.push('Formato non valido')
    }
    
    // Email validation
    if (inputType === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push('Indirizzo email non valido')
    }
    
    // URL validation
    if (inputType === 'url' && value) {
      try {
        new URL(value)
      } catch {
        errors.push('URL non valido')
      }
    }
    
    // Custom validation
    if (onValidate) {
      const customErrors = onValidate(value, itemIndex) || []
      errors = [...errors, ...customErrors]
    }
    
    // Duplicate validation
    if (!allowDuplicates && value.trim()) {
      const duplicateIndex = items.findIndex((otherItem, index) => 
        index !== itemIndex && 
        otherItem.value.toLowerCase().trim() === value.toLowerCase().trim()
      )
      if (duplicateIndex !== -1) {
        errors.push('Elemento duplicato')
      }
    }
    
    item.errors = errors
    item.isValid = errors.length === 0 && value.trim().length > 0
    
    updatedItems[itemIndex] = item
    onChange(updatedItems)
  }
  
  const duplicateItem = (itemId: string) => {
    if (!canAddMore || disabled) return
    
    const originalItem = items.find(item => item.id === itemId)
    if (!originalItem) return
    
    const newItem: RepeatableFieldItem = {
      id: generateId(),
      value: originalItem.value,
      errors: [],
      isValid: false
    }
    
    const itemIndex = items.findIndex(item => item.id === itemId)
    const updatedItems = [...items]
    updatedItems.splice(itemIndex + 1, 0, newItem)
    
    onChange(updatedItems)
  }
  
  const clearAll = () => {
    if (disabled) return
    onChange([])
  }
  
  // Statistics
  const validItemsCount = items.filter(item => item.isValid).length
  const invalidItemsCount = items.filter(item => (item.errors?.length || 0) > 0).length
  const emptyItemsCount = items.filter(item => !item.value.trim()).length
  
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
          <div className="space-y-2">
            {items.map((item, index) => (
              <Card 
                key={item.id}
                className={cn(
                  'border transition-all duration-200',
                  animateChanges && 'animate-in slide-in-from-top-2 duration-300',
                  item.isValid && 'border-green-200 bg-green-50/50',
                  item.errors && item.errors.length > 0 && 'border-red-200 bg-red-50/50'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Drag handle (if reordering enabled) */}
                    {allowReorder && (
                      <div className="mt-2 cursor-move text-muted-foreground hover:text-foreground">
                        <GripVertical className="h-4 w-4" />
                      </div>
                    )}
                    
                    {/* Item number */}
                    {showItemNumbers && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Input field */}
                    <div className="flex-1">
                      <FormField
                        label=""
                        type={inputType}
                        value={item.value}
                        onChange={(value) => updateItem(item.id, value)}
                        error={item.errors && item.errors.length > 0 ? item.errors[0] : undefined}
                        placeholder={placeholder || `${label} ${index + 1}`}
                        disabled={disabled}
                        maxLength={maxItemLength}
                        pattern={pattern}
                        showSuccessState={item.isValid}
                        hideLabel
                        className="mb-0"
                      />
                    </div>
                    
                    {/* Item actions */}
                    <div className="flex items-center gap-1 mt-1">
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
                </CardContent>
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
            {emptyItemsCount > 0 && (
              <div>
                <div className="font-medium text-yellow-600">Vuoti</div>
                <div className="text-muted-foreground">{emptyItemsCount}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RepeatableField 