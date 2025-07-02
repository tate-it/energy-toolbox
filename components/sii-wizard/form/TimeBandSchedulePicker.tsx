'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  ArrowRight 
} from 'lucide-react'

// =====================================================
// TYPES & INTERFACES
// =====================================================

interface TimeRange {
  id: string
  startTime: string
  endTime: string
}

interface TimeBandSchedulePickerProps {
  label: string
  value?: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  description?: string
  bandType?: 'F1' | 'F2' | 'F3'
  placeholder?: string
  disabled?: boolean
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Parse time string to minutes for comparison
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}



/**
 * Generate a unique ID for time ranges
 */
function generateRangeId(): string {
  return `range_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Parse time range string to TimeRange objects
 */
function parseTimeRanges(value: string): TimeRange[] {
  if (!value.trim()) return []
  
  const ranges = value.split(',').map(range => range.trim())
  return ranges.map(range => {
    const [timeRange] = range.split(/\s+/) // Remove any extra whitespace
    const [startTime, endTime] = timeRange.split('-')
    
    return {
      id: generateRangeId(),
      startTime: startTime?.trim() || '',
      endTime: endTime?.trim() || ''
    }
  }).filter(range => range.startTime && range.endTime)
}

/**
 * Convert TimeRange objects back to string
 */
function formatTimeRanges(ranges: TimeRange[]): string {
  return ranges
    .filter(range => range.startTime && range.endTime)
    .map(range => `${range.startTime}-${range.endTime}`)
    .join(', ')
}

/**
 * Validate time format (HH:MM)
 */
function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

/**
 * Validate time ranges for overlaps and logical constraints
 */
function validateTimeRanges(ranges: TimeRange[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validate individual ranges
  ranges.forEach((range, index) => {
    // Format validation
    if (!isValidTimeFormat(range.startTime)) {
      errors.push(`Fascia ${index + 1}: formato ora di inizio non valido (usa HH:MM)`)
    }
    if (!isValidTimeFormat(range.endTime)) {
      errors.push(`Fascia ${index + 1}: formato ora di fine non valido (usa HH:MM)`)
    }
    
    // Logical validation
    if (isValidTimeFormat(range.startTime) && isValidTimeFormat(range.endTime)) {
      const startMinutes = timeToMinutes(range.startTime)
      const endMinutes = timeToMinutes(range.endTime)
      
      if (startMinutes >= endMinutes) {
        errors.push(`Fascia ${index + 1}: l'ora di fine deve essere successiva all'ora di inizio`)
      }
      
      // Warn about very short periods
      if (endMinutes - startMinutes < 30) {
        warnings.push(`Fascia ${index + 1}: periodo molto breve (meno di 30 minuti)`)
      }
      
      // Warn about very long periods
      if (endMinutes - startMinutes > 720) { // 12 hours
        warnings.push(`Fascia ${index + 1}: periodo molto lungo (più di 12 ore)`)
      }
    }
  })
  
  // Check for overlaps
  const validRanges = ranges.filter(range => 
    isValidTimeFormat(range.startTime) && isValidTimeFormat(range.endTime)
  )
  
  for (let i = 0; i < validRanges.length; i++) {
    for (let j = i + 1; j < validRanges.length; j++) {
      const range1 = validRanges[i]
      const range2 = validRanges[j]
      
      const start1 = timeToMinutes(range1.startTime)
      const end1 = timeToMinutes(range1.endTime)
      const start2 = timeToMinutes(range2.startTime)
      const end2 = timeToMinutes(range2.endTime)
      
      // Check for overlap
      if ((start1 < end2 && end1 > start2)) {
        errors.push(`Sovrapposizione tra fascia ${i + 1} e fascia ${j + 1}`)
      }
    }
  }
  
  // Coverage analysis
  const totalMinutes = validRanges.reduce((total, range) => {
    const start = timeToMinutes(range.startTime)
    const end = timeToMinutes(range.endTime)
    return total + (end - start)
  }, 0)
  
  if (totalMinutes > 720) { // More than 12 hours
    warnings.push('Copertura molto estesa: oltre 12 ore totali')
  } else if (totalMinutes < 120) { // Less than 2 hours
    warnings.push('Copertura limitata: meno di 2 ore totali')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Get band color for visual distinction
 */
function getBandColor(bandType?: string): string {
  switch (bandType) {
    case 'F1': return 'bg-red-100 border-red-300 text-red-800'
    case 'F2': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    case 'F3': return 'bg-green-100 border-green-300 text-green-800'
    default: return 'bg-blue-100 border-blue-300 text-blue-800'
  }
}

/**
 * Get band description
 */
function getBandDescription(bandType?: string): string {
  switch (bandType) {
    case 'F1': return 'Fascia di punta - ore di maggior consumo'
    case 'F2': return 'Fascia intermedia - ore di consumo moderato'
    case 'F3': return 'Fascia fuori punta - ore di minor consumo'
    default: return 'Configurazione orari per fascia energetica'
  }
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function TimeBandSchedulePicker({
  label,
  value = '',
  onChange,
  error,
  required = false,
  description,
  bandType,
  placeholder = '08:00-19:00, 20:00-22:00',
  disabled = false
}: TimeBandSchedulePickerProps) {
  // Parse initial ranges from value
  const [ranges, setRanges] = useState<TimeRange[]>(() => parseTimeRanges(value))
  
  // Validation state
  const validation = useMemo(() => validateTimeRanges(ranges), [ranges])
  
  // Update parent when ranges change
  const updateParent = useCallback((newRanges: TimeRange[]) => {
    const formatted = formatTimeRanges(newRanges)
    onChange(formatted)
  }, [onChange])
  
  // Add new time range
  const addRange = useCallback(() => {
    const newRange: TimeRange = {
      id: generateRangeId(),
      startTime: '08:00',
      endTime: '18:00'
    }
    
    const newRanges = [...ranges, newRange]
    setRanges(newRanges)
    updateParent(newRanges)
  }, [ranges, updateParent])
  
  // Remove time range
  const removeRange = useCallback((id: string) => {
    const newRanges = ranges.filter(range => range.id !== id)
    setRanges(newRanges)
    updateParent(newRanges)
  }, [ranges, updateParent])
  
  // Update specific range
  const updateRange = useCallback((id: string, field: 'startTime' | 'endTime', value: string) => {
    const newRanges = ranges.map(range =>
      range.id === id ? { ...range, [field]: value } : range
    )
    setRanges(newRanges)
    updateParent(newRanges)
  }, [ranges, updateParent])
  
  // Handle direct text input
  const handleDirectInput = useCallback((inputValue: string) => {
    const newRanges = parseTimeRanges(inputValue)
    setRanges(newRanges)
    onChange(inputValue)
  }, [onChange])
  
  // Get time suggestions for common periods
  const getTimeSuggestions = useCallback(() => {
    const suggestions = {
      'F1': [
        { label: 'Mattino (08:00-12:00)', value: '08:00-12:00' },
        { label: 'Sera (19:00-22:00)', value: '19:00-22:00' },
        { label: 'Punta completa (08:00-12:00, 19:00-22:00)', value: '08:00-12:00, 19:00-22:00' }
      ],
      'F2': [
        { label: 'Primo pomeriggio (12:00-15:00)', value: '12:00-15:00' },
        { label: 'Tardo pomeriggio (15:00-19:00)', value: '15:00-19:00' },
        { label: 'Intermedia estesa (12:00-19:00)', value: '12:00-19:00' }
      ],
      'F3': [
        { label: 'Notte (22:00-06:00)', value: '22:00-06:00' },
        { label: 'Prima mattina (06:00-08:00)', value: '06:00-08:00' },
        { label: 'Fuori punta completa (22:00-08:00)', value: '22:00-08:00' }
      ]
    }
    
    return suggestions[bandType as keyof typeof suggestions] || []
  }, [bandType])
  
  const suggestions = getTimeSuggestions()
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
          {bandType && (
            <Badge className={getBandColor(bandType)}>
              {bandType}
            </Badge>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground">
            {description || getBandDescription(bandType)}
          </p>
        )}
      </div>
      
      {/* Visual Range Editor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Configurazione Fasce Orarie</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRange}
              disabled={disabled || ranges.length >= 6}
              className="h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Aggiungi Fascia
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {ranges.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessuna fascia oraria configurata</p>
              <p className="text-xs">Clicca &quot;Aggiungi Fascia&quot; per iniziare</p>
            </div>
          ) : (
            ranges.map((range, index) => (
              <div
                key={range.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
              >
                <Badge variant="outline" className="shrink-0">
                  {index + 1}
                </Badge>
                
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={range.startTime}
                    onChange={(e) => updateRange(range.id, 'startTime', e.target.value)}
                    disabled={disabled}
                    className="w-auto"
                  />
                  
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  
                  <Input
                    type="time"
                    value={range.endTime}
                    onChange={(e) => updateRange(range.id, 'endTime', e.target.value)}
                    disabled={disabled}
                    className="w-auto"
                  />
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeRange(range.id)}
                  disabled={disabled}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      
      {/* Quick Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Configurazioni Rapide:</Label>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDirectInput(suggestion.value)}
                disabled={disabled}
                className="h-8 text-xs"
              >
                {suggestion.label}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Direct Text Input */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          Modifica Diretta (formato: HH:MM-HH:MM, HH:MM-HH:MM)
        </Label>
        <Input
          type="text"
          value={value}
          onChange={(e) => handleDirectInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={error ? 'border-destructive' : ''}
        />
      </div>
      
      {/* Validation Results */}
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index} className="text-sm">{error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {validation.warnings.length > 0 && validation.errors.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <div key={index} className="text-sm">{warning}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {validation.isValid && ranges.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Configurazione valida: {ranges.length} fascia{ranges.length !== 1 ? 'e' : ''} oraria{ranges.length !== 1 ? 'e' : ''} configurata{ranges.length !== 1 ? 'e' : ''}
          </AlertDescription>
        </Alert>
      )}
      
      {/* External Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
} 