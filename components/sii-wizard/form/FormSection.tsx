'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Clock, LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

export interface FormSectionProps {
  title: string
  description?: string
  icon?: LucideIcon | string
  children: ReactNode
  isComplete?: boolean
  hasErrors?: boolean
  isOptional?: boolean
  className?: string
}

/**
 * Componente sezione form riutilizzabile per il wizard SII
 * 
 * Caratteristiche:
 * - Intestazione con titolo e descrizione
 * - Icona personalizzabile (Lucide icon o emoji)
 * - Badge di stato (completo/incompleto/errori)
 * - Wrapper card per contenuto
 * - Layout consistente
 */
export function FormSection({
  title,
  description,
  icon,
  children,
  isComplete = false,
  hasErrors = false,
  isOptional = false,
  className = ''
}: FormSectionProps) {
  // Determina lo stato della sezione
  const getStatusBadge = () => {
    if (hasErrors) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Errori
        </Badge>
      )
    }
    
    if (isComplete) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Completo
        </Badge>
      )
    }
    
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {isOptional ? 'Opzionale' : 'Incompleto'}
      </Badge>
    )
  }

  // Render icon - handle both Lucide components and emoji strings
  const renderIcon = () => {
    if (!icon) return null

    const iconStyles = `p-2 rounded-lg ${
      hasErrors 
        ? 'bg-destructive/10 text-destructive'
        : isComplete 
          ? 'bg-green-100 text-green-600'
          : 'bg-primary/10 text-primary'
    }`

    // If icon is a string (emoji), render as text
    if (typeof icon === 'string') {
      return (
        <div className={iconStyles}>
          <span className="text-lg">{icon}</span>
        </div>
      )
    }

    // If icon is a Lucide component, render as component
    const IconComponent = icon as LucideIcon
    return (
      <div className={iconStyles}>
        <IconComponent className="h-5 w-5" />
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icona */}
            {renderIcon()}
            
            {/* Titolo e descrizione */}
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          
          {/* Badge di stato */}
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      {/* Contenuto */}
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  )
}

export default FormSection 