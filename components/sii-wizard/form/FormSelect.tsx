'use client'

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface FormSelectProps {
  id: string
  label: string
  value: string
  placeholder?: string
  description?: string
  error?: string | null
  required?: boolean
  optional?: boolean
  disabled?: boolean
  options: SelectOption[]
  onChange: (value: string) => void
  className?: string
}

/**
 * Componente select riutilizzabile per il wizard SII
 * 
 * Caratteristiche:
 * - Dropdown con validazione visiva
 * - Etichette in italiano
 * - Opzioni configurabili
 * - Messaggi di errore/successo
 * - Badge opzionale/obbligatorio
 */
export function FormSelect({
  id,
  label,
  value,
  placeholder = "Seleziona un'opzione...",
  description,
  error,
  required = false,
  optional = false,
  disabled = false,
  options,
  onChange,
  className = ''
}: FormSelectProps) {
  const hasError = !!error
  const isValid = value && !hasError

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label con badge */}
      <div className="flex items-center gap-2">
        <Label 
          htmlFor={id} 
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
      
      {/* Select dropdown */}
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger 
          id={id}
          className={`transition-colors ${
            hasError 
              ? 'border-destructive focus-visible:border-destructive' 
              : isValid
                ? 'border-green-500 focus-visible:border-green-500'
                : ''
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
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
            Selezione valida
          </div>
        )}
        
        {/* Numero di opzioni disponibili */}
        {options.length > 0 && (
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">
              {options.filter(opt => !opt.disabled).length} opzioni disponibili
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default FormSelect 