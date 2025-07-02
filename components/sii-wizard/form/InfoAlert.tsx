'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, CheckCircle, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react'
import { ReactNode } from 'react'

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'help'

export interface InfoAlertProps {
  type?: AlertType
  title?: string
  children: ReactNode
  className?: string
}

/**
 * Componente alert informativo riutilizzabile per il wizard SII
 * 
 * Caratteristiche:
 * - Diversi tipi di alert (info, successo, warning, errore, aiuto)
 * - Icone appropriate per ogni tipo
 * - Supporto per contenuto HTML/JSX
 * - Stili appropriati per ogni tipo
 * - Layout consistente
 */
export function InfoAlert({
  type = 'info',
  title,
  children,
  className = ''
}: InfoAlertProps) {
  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          className: 'border-green-200 bg-green-50',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          textColor: 'text-green-700'
        }
      
      case 'warning':
        return {
          icon: AlertTriangle,
          className: 'border-orange-200 bg-orange-50',
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-800',
          textColor: 'text-orange-700'
        }
      
      case 'error':
        return {
          icon: AlertCircle,
          className: 'border-red-200 bg-red-50',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          textColor: 'text-red-700'
        }
      
      case 'help':
        return {
          icon: HelpCircle,
          className: 'border-blue-200 bg-blue-50',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700'
        }
      
      case 'info':
      default:
        return {
          icon: Info,
          className: 'border-blue-200 bg-blue-50',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700'
        }
    }
  }

  const config = getAlertConfig()
  const Icon = config.icon

  return (
    <Alert className={`${config.className} ${className}`}>
      <Icon className={`h-4 w-4 ${config.iconColor}`} />
      <AlertDescription className={config.textColor}>
        {title && (
          <div className={`font-semibold mb-2 ${config.titleColor}`}>
            {title}
          </div>
        )}
        <div className="space-y-2">
          {children}
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default InfoAlert 