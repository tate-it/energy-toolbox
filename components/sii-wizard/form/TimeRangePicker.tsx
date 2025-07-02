'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle,
  RotateCcw 
} from 'lucide-react'

// =====================================================
// TYPES & INTERFACES
// =====================================================

interface TimeRangePickerProps {
  label: string
  value?: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  description?: string
  bandType?: 'F1' | 'F2' | 'F3'
  placeholder?: string
  disabled?: boolean
  showSuggestions?: boolean
  className?: string
}

interface TimeRange {
  startTime: string
  endTime: string
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
  if (!time || !time.includes(':')) return 0
  const [hours, minutes] = time.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

/**
 * Validate time format (HH:MM)
 */
function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

/**
 * Parse time range string (HH:MM-HH:MM) to TimeRange object
 */
function parseTimeRange(value: string): TimeRange {
  if (!value || !value.includes('-')) {
    return { startTime: '', endTime: '' }
  }
  
  const [startTime, endTime] = value.split('-').map(part => part.trim())
  return {
    startTime: startTime || '',
    endTime: endTime || ''
  }
}

/**
 * Format TimeRange object to string (HH:MM-HH:MM)
 */
function formatTimeRange(range: TimeRange): string {
  if (!range.startTime || !range.endTime) return ''
  return `${range.startTime}-${range.endTime}`
}

/**
 * Validate time range for logical constraints
 */
function validateTimeRange(range: TimeRange): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Format validation
  if (range.startTime && !isValidTimeFormat(range.startTime)) {
    errors.push('Formato ora di inizio non valido (usa HH:MM)')
  }
  if (range.endTime && !isValidTimeFormat(range.endTime)) {
    errors.push('Formato ora di fine non valido (usa HH:MM)')
  }
  
  // Logical validation (if both times are valid)
  if (isValidTimeFormat(range.startTime) && isValidTimeFormat(range.endTime)) {
    const startMinutes = timeToMinutes(range.startTime)
    const endMinutes = timeToMinutes(range.endTime)
    
    if (startMinutes >= endMinutes) {
      errors.push("L'ora di fine deve essere successiva all'ora di inizio")
    }
    
    // Duration analysis
    const durationMinutes = endMinutes - startMinutes
    
    if (durationMinutes < 30) {
      warnings.push('Periodo molto breve (meno di 30 minuti)')
    } else if (durationMinutes > 720) { // 12 hours
      warnings.push('Periodo molto lungo (più di 12 ore)')
    }
    
    // Peak hours validation
    if (durationMinutes < 60) {
      warnings.push('Periodo inferiore a 1 ora potrebbe non essere ottimale')
    }
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
 * Get time suggestions based on band type
 */
function getTimeSuggestions(bandType?: string): Array<{ label: string; value: string }> {
  switch (bandType) {
    case 'F1':
      return [
        { label: 'Mattino punta', value: '08:00-12:00' },
        { label: 'Sera punta', value: '19:00-22:00' },
        { label: 'Punta centrale', value: '10:00-16:00' }
      ]
    case 'F2':
      return [
        { label: 'Intermedio mattino', value: '06:00-08:00' },
        { label: 'Intermedio pomeriggio', value: '14:00-19:00' },
        { label: 'Intermedio sera', value: '22:00-24:00' }
      ]
    case 'F3':
      return [
        { label: 'Notte', value: '22:00-06:00' },
        { label: 'Alba', value: '05:00-08:00' },
        { label: 'Fuori punta', value: '12:00-14:00' }
      ]
    default:
      return [
        { label: 'Mattino', value: '08:00-12:00' },
        { label: 'Pomeriggio', value: '14:00-18:00' },
        { label: 'Sera', value: '19:00-23:00' }
      ]
  }
}

/**
 * Get duration in hours and minutes
 */
function getDurationDisplay(range: TimeRange): string {
  if (!isValidTimeFormat(range.startTime) || !isValidTimeFormat(range.endTime)) {
    return ''
  }
  
  const startMinutes = timeToMinutes(range.startTime)
  const endMinutes = timeToMinutes(range.endTime)
  const duration = endMinutes - startMinutes
  
  if (duration <= 0) return ''
  
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function TimeRangePicker({
  label,
  value = '',
  onChange,
  error,
  required = false,
  description,
  bandType,
  placeholder = '08:00-18:00',
  disabled = false,
  showSuggestions = true,
  className = ''
}: TimeRangePickerProps) {
  // Parse initial range from value
  const [range, setRange] = useState<TimeRange>(() => parseTimeRange(value))
  
  // Validation state
  const validation = useMemo(() => validateTimeRange(range), [range])
  
  // Update parent when range changes
  const updateParent = useCallback((newRange: TimeRange) => {
    const formatted = formatTimeRange(newRange)
    onChange(formatted)
  }, [onChange])
  
  // Sync with external value changes
  useEffect(() => {
    const externalRange = parseTimeRange(value)
    const currentFormatted = formatTimeRange(range)
    
    if (value !== currentFormatted) {
      setRange(externalRange)
    }
  }, [value, range])
  
  // Update specific time
  const updateTime = useCallback((field: 'startTime' | 'endTime', time: string) => {
    const newRange = { ...range, [field]: time }
    setRange(newRange)
    updateParent(newRange)
  }, [range, updateParent])
  
  // Handle direct text input
  const handleDirectInput = useCallback((inputValue: string) => {
    const newRange = parseTimeRange(inputValue)
    setRange(newRange)
    onChange(inputValue)
  }, [onChange])
  
  // Apply suggestion
  const applySuggestion = useCallback((suggestionValue: string) => {
    const newRange = parseTimeRange(suggestionValue)
    setRange(newRange)
    updateParent(newRange)
  }, [updateParent])
  
  // Reset to empty
  const resetRange = useCallback(() => {
    const emptyRange = { startTime: '', endTime: '' }
    setRange(emptyRange)
    updateParent(emptyRange)
  }, [updateParent])
  
  const suggestions = getTimeSuggestions(bandType)
  const duration = getDurationDisplay(range)
  
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
          {bandType && (
            <Badge className={getBandColor(bandType)}>
              {bandType}
            </Badge>
          )}
          {duration && (
            <Badge variant="outline" className="text-xs">
              {duration}
            </Badge>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      
      {/* Visual Time Range Inputs */}
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
        <div className="flex items-center gap-2 flex-1">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Inizio</Label>
            <Input
              type="time"
              value={range.startTime}
              onChange={(e) => updateTime('startTime', e.target.value)}
              disabled={disabled}
              className="w-auto text-sm"
              placeholder="HH:MM"
            />
          </div>
          
          <ArrowRight className="h-4 w-4 text-muted-foreground mt-4" />
          
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Fine</Label>
            <Input
              type="time"
              value={range.endTime}
              onChange={(e) => updateTime('endTime', e.target.value)}
              disabled={disabled}
              className="w-auto text-sm"
              placeholder="HH:MM"
            />
          </div>
        </div>
        
        {(range.startTime || range.endTime) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetRange}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Cancella fascia oraria"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* Direct Text Input */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          Inserimento Diretto
        </Label>
        <Input
          type="text"
          value={value}
          onChange={(e) => handleDirectInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`text-sm ${error ? 'border-destructive' : ''}`}
        />
      </div>
      
      {/* Quick Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Configurazioni Rapide:</Label>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applySuggestion(suggestion.value)}
                disabled={disabled}
                className="h-7 px-2 text-xs"
              >
                {suggestion.label}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Validation Results */}
      {validation.errors.length > 0 && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {validation.errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}
      
      {validation.warnings.length > 0 && validation.errors.length === 0 && (
        <Alert className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {validation.warnings.map((warning, index) => (
              <div key={index}>{warning}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}
      
      {validation.isValid && range.startTime && range.endTime && (
        <Alert className="border-green-200 bg-green-50 py-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 text-sm">
            Fascia oraria valida{duration ? ` (${duration})` : ''}
          </AlertDescription>
        </Alert>
      )}
      
      {/* External Error Display */}
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
} 