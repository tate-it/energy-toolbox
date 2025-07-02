'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { ReactNode } from 'react'

export interface FormFieldProps {
  id?: string
  label: string
  value: string
  placeholder?: string
  description?: string
  error?: string | null
  required?: boolean
  optional?: boolean
  maxLength?: number
  type?: 'text' | 'email' | 'tel' | 'url' | 'password' | 'number' | 'textarea'
  disabled?: boolean
  onChange: (value: string) => void
  className?: string
  children?: ReactNode
  
  // Additional props for RepeatableField support
  hideLabel?: boolean
  showSuccessState?: boolean
  pattern?: string
  min?: string
  max?: string
  step?: string
  suffix?: string
  characterCounter?: {
    current: number
    max: number
  }
}

/**
 * Componente campo form riutilizzabile per il wizard SII
 * 
 * Caratteristiche:
 * - Etichetta con badge opzionale/obbligatorio
 * - Input con validazione visiva
 * - Descrizione/aiuto
 * - Messaggi di errore/successo
 * - Supporto per input personalizzati tramite children
 * - Supporto per utilizzo in RepeatableField
 */
export function FormField({
  id,
  label,
  value,
  placeholder,
  description,
  error,
  required = false,
  optional = false,
  maxLength,
  type = 'text',
  disabled = false,
  onChange,
  className = '',
  children,
  hideLabel = false,
  showSuccessState = true,
  pattern,
  min,
  max,
  step,
  suffix,
  characterCounter
}: FormFieldProps) {
  // Generate ID if not provided
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`
  
  const hasError = !!error
  const isValid = value && !hasError && showSuccessState

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label con badge */}
      {!hideLabel && (
        <div className="flex items-center gap-2">
          <Label 
            htmlFor={fieldId} 
            className="text-sm font-medium"
          >
            {label}
          </Label>
          
          {required && (
            <Badge variant="outline" className="text-xs">
              Obbligatorio
            </Badge>
          )}
          
          {optional && (
            <Badge variant="secondary" className="text-xs">
              Opzionale
            </Badge>
          )}
        </div>
      )}
      
      {/* Input o componente personalizzato */}
      {children ? (
        children
      ) : (
        <div className="relative">
          {type === 'textarea' ? (
            <Textarea
              id={fieldId}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              maxLength={maxLength}
              className={`transition-colors ${
                hasError 
                  ? 'border-destructive focus-visible:border-destructive' 
                  : isValid
                    ? 'border-green-500 focus-visible:border-green-500'
                    : ''
              }`}
            />
          ) : (
            <Input
              id={fieldId}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              maxLength={maxLength}
              pattern={pattern}
              min={min}
              max={max}
              step={step}
              className={`transition-colors ${
                hasError 
                  ? 'border-destructive focus-visible:border-destructive' 
                  : isValid
                    ? 'border-green-500 focus-visible:border-green-500'
                    : ''
              } ${suffix ? 'pr-12' : ''}`}
            />
          )}
          
          {/* Suffix */}
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
              {suffix}
            </div>
          )}
        </div>
      )}
      
      {/* Area descrizione e feedback */}
      <div className="space-y-1">
        {/* Descrizione */}
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        
        {/* Messaggio di errore */}
        {hasError && (
          <div className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
        
        {/* Messaggio di successo */}
        {isValid && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            Campo valido
          </div>
        )}
        
        {/* Contatore caratteri */}
        <div className="flex justify-between items-center">
          {/* Custom character counter (priority over maxLength) */}
          {characterCounter && (
            <span className={`text-xs ${
              characterCounter.current > characterCounter.max * 0.9 
                ? 'text-orange-500' 
                : 'text-muted-foreground'
            }`}>
              {characterCounter.current}/{characterCounter.max}
            </span>
          )}
          
          {/* Default character counter */}
          {!characterCounter && maxLength && value && (
            <span className={`text-xs ${
              value.length > maxLength * 0.9 
                ? 'text-orange-500' 
                : 'text-muted-foreground'
            }`}>
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default FormField 