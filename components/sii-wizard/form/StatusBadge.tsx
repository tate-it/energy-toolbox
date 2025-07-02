'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Clock, AlertTriangle, Info } from 'lucide-react'

export type StatusType = 'complete' | 'incomplete' | 'error' | 'warning' | 'info' | 'optional'

export interface StatusBadgeProps {
  status: StatusType
  text?: string
  className?: string
}

/**
 * Componente badge di stato riutilizzabile per il wizard SII
 * 
 * Caratteristiche:
 * - Stati predefiniti con icone e colori
 * - Testo personalizzabile
 * - Etichette italiane di default
 * - Varianti visuali appropriate
 */
export function StatusBadge({
  status,
  text,
  className = ''
}: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'complete':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          defaultText: 'Completo',
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      
      case 'incomplete':
        return {
          variant: 'secondary' as const,
          icon: Clock,
          defaultText: 'Incompleto',
          className: ''
        }
      
      case 'error':
        return {
          variant: 'destructive' as const,
          icon: AlertCircle,
          defaultText: 'Errore',
          className: ''
        }
      
      case 'warning':
        return {
          variant: 'outline' as const,
          icon: AlertTriangle,
          defaultText: 'Attenzione',
          className: 'bg-orange-50 text-orange-800 border-orange-200'
        }
      
      case 'info':
        return {
          variant: 'outline' as const,
          icon: Info,
          defaultText: 'Informazione',
          className: 'bg-blue-50 text-blue-800 border-blue-200'
        }
      
      case 'optional':
        return {
          variant: 'secondary' as const,
          icon: Info,
          defaultText: 'Opzionale',
          className: 'bg-gray-50 text-gray-600 border-gray-200'
        }
      
      default:
        return {
          variant: 'secondary' as const,
          icon: Clock,
          defaultText: 'Sconosciuto',
          className: ''
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon
  const displayText = text || config.defaultText

  return (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-1 ${config.className} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {displayText}
    </Badge>
  )
}

export default StatusBadge 