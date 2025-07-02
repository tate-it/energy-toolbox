'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Download,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { InfoAlert } from './InfoAlert'
import { cn } from '@/lib/utils'

export interface RepeatableFieldGroupSection {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  isCollapsed?: boolean
  isOptional?: boolean
  content: React.ReactNode
  
  // Statistics
  itemCount?: number
  validItemCount?: number
  invalidItemCount?: number
  
  // Operations
  onClear?: () => void
  onReset?: () => void
  onExport?: () => void
}

export interface RepeatableFieldGroupProps {
  // Group configuration
  title: string
  description?: string
  icon?: React.ReactNode
  className?: string
  
  // Layout and behavior
  layout?: 'stack' | 'tabs' | 'accordion'
  collapsible?: boolean
  defaultCollapsed?: boolean
  allowFullscreen?: boolean
  showStatistics?: boolean
  
  // Sections
  sections: RepeatableFieldGroupSection[]
  onSectionToggle?: (sectionId: string, isCollapsed: boolean) => void
  
  // Group operations
  onClearAll?: () => void
  onExportAll?: () => void
  
  // Validation and status
  showValidationSummary?: boolean
  validationMessage?: string
  validationType?: 'info' | 'warning' | 'error' | 'success'
  
  // Advanced features
  enableBulkOperations?: boolean
  enableSectionManagement?: boolean
  compactMode?: boolean
}

/**
 * RepeatableFieldGroup - Wrapper per gestire gruppi di campi ripetibili
 * 
 * Caratteristiche:
 * - Gestione di sezioni multiple con campi ripetibili
 * - Layout flessibile (stack, tabs, accordion)
 * - Operazioni di gruppo (clear all, reset all, import/export)
 * - Statistiche aggregate per gruppo
 * - Modalità fullscreen per editing esteso
 * - Gestione stato di collasso per sezioni
 * - Validazione e feedback a livello di gruppo
 * - Modalità compatta per spazi limitati
 * - Localizzazione italiana completa
 */
export function RepeatableFieldGroup({
  title,
  description,
  icon,
  className = '',
  
  layout = 'stack',
  collapsible = true,
  defaultCollapsed = false,
  allowFullscreen = false,
  showStatistics = true,
  
  sections,
  onSectionToggle,
  
  onClearAll,
  onExportAll,
  
  showValidationSummary = true,
  validationMessage,
  validationType = 'info',
  
  enableBulkOperations = true,
  enableSectionManagement = true,
  compactMode = false
}: RepeatableFieldGroupProps) {
  
  const [isGroupCollapsed, setIsGroupCollapsed] = React.useState(defaultCollapsed)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState(sections[0]?.id || '')
  
  // Calculate aggregate statistics
  const totalItems = sections.reduce((sum, section) => sum + (section.itemCount || 0), 0)
  const totalValidItems = sections.reduce((sum, section) => sum + (section.validItemCount || 0), 0)
  const totalInvalidItems = sections.reduce((sum, section) => sum + (section.invalidItemCount || 0), 0)
  const completedSections = sections.filter(section => (section.validItemCount || 0) > 0).length
  
  // Section management
  const toggleSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (section && onSectionToggle) {
      onSectionToggle(sectionId, !section.isCollapsed)
    }
  }
  
  const expandAllSections = () => {
    sections.forEach(section => {
      if (section.isCollapsed && onSectionToggle) {
        onSectionToggle(section.id, false)
      }
    })
  }
  
  const collapseAllSections = () => {
    sections.forEach(section => {
      if (!section.isCollapsed && onSectionToggle) {
        onSectionToggle(section.id, true)
      }
    })
  }
  
  // Validation summary
  const getValidationSummary = () => {
    if (!showValidationSummary) return null
    
    if (validationMessage) {
      return (
        <InfoAlert
          type={validationType}
          title="Stato Validazione Gruppo"
          message={validationMessage}
        />
      )
    }
    
    // Auto-generated validation summary
    if (totalInvalidItems > 0) {
      return (
        <InfoAlert
          type="error"
          title="Errori di Validazione"
          message={`${totalInvalidItems} ${totalInvalidItems === 1 ? 'elemento ha' : 'elementi hanno'} errori di validazione in ${sections.filter(s => (s.invalidItemCount || 0) > 0).length} ${sections.filter(s => (s.invalidItemCount || 0) > 0).length === 1 ? 'sezione' : 'sezioni'}.`}
        />
      )
    }
    
    if (totalValidItems > 0) {
      return (
        <InfoAlert
          type="success"
          title="Validazione Completata"
          message={`Tutti i ${totalValidItems} ${totalValidItems === 1 ? 'elemento è valido' : 'elementi sono validi'} in ${completedSections} ${completedSections === 1 ? 'sezione' : 'sezioni'}.`}
        />
      )
    }
    
    return null
  }
  
  // Render section based on layout
  const renderSection = (section: RepeatableFieldGroupSection) => {
    return (
      <div key={section.id} className="space-y-4">
        {/* Section header (for stack and accordion layouts) */}
        {(layout === 'stack' || layout === 'accordion') && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {section.icon && (
                <div className="text-muted-foreground">
                  {section.icon}
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-foreground">
                  {section.title}
                  {section.isOptional && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Opzionale
                    </Badge>
                  )}
                </h4>
                {section.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {section.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Section statistics and controls */}
            <div className="flex items-center gap-2">
              {/* Statistics */}
              {showStatistics && section.itemCount !== undefined && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {section.itemCount} {section.itemCount === 1 ? 'elemento' : 'elementi'}
                  </Badge>
                  {(section.validItemCount || 0) > 0 && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {section.validItemCount} validi
                    </Badge>
                  )}
                  {(section.invalidItemCount || 0) > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {section.invalidItemCount} errori
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Section operations */}
              {enableSectionManagement && (
                <div className="flex items-center gap-1">
                  {section.onClear && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={section.onClear}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      title="Cancella sezione"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {section.onExport && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={section.onExport}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Esporta sezione"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {layout === 'accordion' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection(section.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title={section.isCollapsed ? "Espandi sezione" : "Comprimi sezione"}
                    >
                      {section.isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Section content */}
        {layout === 'accordion' ? (
          <Collapsible 
            open={!section.isCollapsed}
            onOpenChange={(open) => onSectionToggle?.(section.id, !open)}
          >
            <CollapsibleContent>
              <div className="pl-6 border-l-2 border-muted">
                {section.content}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className={layout === 'stack' ? 'pl-6 border-l-2 border-muted' : ''}>
            {section.content}
          </div>
        )}
      </div>
    )
  }
  
  // Main content based on layout
  const renderContent = () => {
    switch (layout) {
      case 'tabs':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-auto">
              {sections.map(section => (
                <TabsTrigger 
                  key={section.id} 
                  value={section.id}
                  className="relative"
                >
                  <div className="flex items-center gap-2">
                    {section.icon && (
                      <div className="text-muted-foreground">
                        {section.icon}
                      </div>
                    )}
                    <span>{section.title}</span>
                    {section.itemCount !== undefined && section.itemCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {section.itemCount}
                      </Badge>
                    )}
                    {(section.invalidItemCount || 0) > 0 && (
                      <div className="absolute -top-1 -right-1">
                        <div className="h-2 w-2 bg-red-500 rounded-full" />
                      </div>
                    )}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {sections.map(section => (
              <TabsContent key={section.id} value={section.id} className="mt-4">
                <div className="space-y-4">
                  {section.description && (
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  )}
                  {section.content}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )
      
      case 'accordion':
      case 'stack':
      default:
        return (
          <div className="space-y-6">
            {sections.map(renderSection)}
          </div>
        )
    }
  }
  
  const content = (
    <div className="space-y-6">
      {/* Group validation summary */}
      {getValidationSummary()}
      
      {/* Group statistics (compact mode) */}
      {showStatistics && compactMode && (
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-foreground">Sezioni</div>
              <div className="text-muted-foreground">{sections.length}</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Elementi Totali</div>
              <div className="text-muted-foreground">{totalItems}</div>
            </div>
            <div>
              <div className="font-medium text-green-600">Validi</div>
              <div className="text-muted-foreground">{totalValidItems}</div>
            </div>
            {totalInvalidItems > 0 && (
              <div>
                <div className="font-medium text-red-600">Errori</div>
                <div className="text-muted-foreground">{totalInvalidItems}</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main content */}
      {renderContent()}
    </div>
  )
  
  // Fullscreen wrapper
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="container mx-auto p-4">
          <Card className="min-h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {icon && <div className="text-muted-foreground">{icon}</div>}
                  <div>
                    <CardTitle className="text-xl">{title}</CardTitle>
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Group statistics */}
                  {showStatistics && !compactMode && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {sections.length} {sections.length === 1 ? 'sezione' : 'sezioni'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {totalItems} {totalItems === 1 ? 'elemento' : 'elementi'}
                      </Badge>
                      {totalValidItems > 0 && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {totalValidItems} validi
                        </Badge>
                      )}
                      {totalInvalidItems > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {totalInvalidItems} errori
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Group operations */}
                  {enableBulkOperations && (
                    <div className="flex items-center gap-1">
                      {layout === 'accordion' && (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={expandAllSections}
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Espandi Tutto
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={collapseAllSections}
                            className="text-xs"
                          >
                            <EyeOff className="h-3 w-3 mr-1" />
                            Comprimi Tutto
                          </Button>
                        </>
                      )}
                      
                      {onClearAll && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={onClearAll}
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Cancella Tutto
                        </Button>
                      )}
                      
                      {onExportAll && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={onExportAll}
                          className="text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Esporta Tutto
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Exit fullscreen */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullscreen(false)}
                    className="text-xs"
                  >
                    <Minimize2 className="h-3 w-3 mr-1" />
                    Esci da Fullscreen
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {content}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  // Regular view
  return (
    <Card className={cn('w-full', className)}>
      {collapsible ? (
        <Collapsible open={!isGroupCollapsed} onOpenChange={setIsGroupCollapsed}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="text-muted-foreground">
                    {isGroupCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                  
                  {icon && <div className="text-muted-foreground">{icon}</div>}
                  
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              
              {/* Header controls */}
              <div className="flex items-center gap-2">
                {/* Group statistics */}
                {showStatistics && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {sections.length} {sections.length === 1 ? 'sezione' : 'sezioni'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {totalItems} {totalItems === 1 ? 'elemento' : 'elementi'}
                    </Badge>
                    {totalValidItems > 0 && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {totalValidItems} validi
                      </Badge>
                    )}
                    {totalInvalidItems > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {totalInvalidItems} errori
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Control buttons */}
                <div className="flex items-center gap-1">
                  {allowFullscreen && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreen(true)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Modalità fullscreen"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {enableBulkOperations && onClearAll && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onClearAll}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      title="Cancella tutto"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent>
              {content}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon && <div className="text-muted-foreground">{icon}</div>}
                <div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  {description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Header controls */}
              <div className="flex items-center gap-2">
                {/* Group statistics */}
                {showStatistics && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {sections.length} {sections.length === 1 ? 'sezione' : 'sezioni'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {totalItems} {totalItems === 1 ? 'elemento' : 'elementi'}
                    </Badge>
                    {totalValidItems > 0 && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {totalValidItems} validi
                      </Badge>
                    )}
                    {totalInvalidItems > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {totalInvalidItems} errori
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Control buttons */}
                <div className="flex items-center gap-1">
                  {allowFullscreen && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreen(true)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Modalità fullscreen"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {enableBulkOperations && onClearAll && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onClearAll}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      title="Cancella tutto"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {content}
          </CardContent>
        </>
      )}
    </Card>
  )
}

export default RepeatableFieldGroup 