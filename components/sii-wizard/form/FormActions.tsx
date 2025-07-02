'use client'

import { Button } from '@/components/ui/button'
import { Trash2, FileText, RefreshCw, Save, Download } from 'lucide-react'

export interface FormActionsProps {
  onClear?: () => void
  onReset?: () => void
  onFillExample?: () => void
  onSave?: () => void
  onExport?: () => void
  canClear?: boolean
  canReset?: boolean
  canSave?: boolean
  canExport?: boolean
  isLoading?: boolean
  showDevelopmentActions?: boolean
  className?: string
}

/**
 * Componente azioni form riutilizzabile per il wizard SII
 * 
 * Caratteristiche:
 * - Pulsanti comuni (cancella, reset, salva, esporta)
 * - Azioni di sviluppo (riempi esempio)
 * - Stati abilitato/disabilitato automatici
 * - Etichette in italiano
 * - Layout responsive
 */
export function FormActions({
  onClear,
  onReset,
  onFillExample,
  onSave,
  onExport,
  canClear = false,
  canReset = false,
  canSave = false,
  canExport = false,
  isLoading = false,
  showDevelopmentActions = process.env.NODE_ENV === 'development',
  className = ''
}: FormActionsProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t ${className}`}>
      {/* Azioni principali */}
      <div className="flex flex-wrap gap-2">
        {/* Cancella campi */}
        {onClear && (
          <Button
            variant="outline"
            onClick={onClear}
            disabled={!canClear || isLoading}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Cancella Campi
          </Button>
        )}

        {/* Reset */}
        {onReset && (
          <Button
            variant="outline"
            onClick={onReset}
            disabled={!canReset || isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Ripristina
          </Button>
        )}

        {/* Salva */}
        {onSave && (
          <Button
            variant="secondary"
            onClick={onSave}
            disabled={!canSave || isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salva Bozza
          </Button>
        )}

        {/* Esporta */}
        {onExport && (
          <Button
            onClick={onExport}
            disabled={!canExport || isLoading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Esporta Dati
          </Button>
        )}
      </div>

      {/* Azioni di sviluppo */}
      {showDevelopmentActions && (
        <div className="flex gap-2 sm:ml-auto">
          {onFillExample && (
            <Button
              variant="ghost"
              onClick={onFillExample}
              disabled={isLoading}
              className="flex items-center gap-2 text-xs"
            >
              <FileText className="h-3 w-3" />
              Riempi Esempio
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default FormActions 