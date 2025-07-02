'use client'

import React from 'react'
import { 
  FormSection, 
  FormSelect,
  FormField,
  StatusBadge, 
  InfoAlert,
  TimeBandSchedulePicker,
  TimeRangePicker,
  ConditionalRenderer
} from '../form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Clock, 
  Zap, 
  Calendar,
  Settings,
  RotateCcw,
  Lightbulb
} from 'lucide-react'

// Import schema types and helpers
import { 
  type Step12Data,
  getTimeBandConfigurations,
  getRequiredTimeBands,
  getConfigurationRecommendations,
  generateStandardSchedule,
  validateTimeBandConfiguration
} from '@/lib/sii/schemas/step12'

// Temporary mock hook until useStep12 is implemented
function useMockStep12() {
  const [data, setData] = React.useState<Step12Data>({
    CONFIGURAZIONE_FASCE: '03' // F1_F2_F3 default
  })
  
  const validation = validateTimeBandConfiguration(data)
  const isValid = validation.isValid
  const isComplete = !!(data.CONFIGURAZIONE_FASCE && data.FASCIA_F1)
  
  return {
    data,
    errors: {},
    isValid,
    isComplete,
    hasUnsavedChanges: false,
    updateData: (newData: Partial<Step12Data>) => setData((prev: Step12Data) => ({ ...prev, ...newData })),
    clearData: () => setData({ CONFIGURAZIONE_FASCE: '03' }),
    resetData: () => setData({ CONFIGURAZIONE_FASCE: '03' }),
    saveData: () => console.log('Save Step12 data', data),
    fillExampleData: () => {
      const exampleSchedule = generateStandardSchedule('03') // F1_F2_F3
      setData({
        CONFIGURAZIONE_FASCE: '03',
        ...exampleSchedule,
        GIORNI_SETTIMANA: 'lunedì, martedì, mercoledì, giovedì, venerdì',
        ORE_GIORNO: 'Configurazione standard ARERA con fasce F1, F2, F3'
      })
    },
    validation
  }
}

/**
 * Step 12: Weekly Time Bands (Fasce Orarie Settimanali)
 * 
 * Questo step gestisce la configurazione delle fasce orarie settimanali
 * per la tariffazione energetica, incluse le configurazioni F1, F2, F3.
 * 
 * Caratteristiche:
 * - Selezione tipologia fasce orarie (monoraria, bioraria, F1-F2-F3, ecc.)
 * - Configurazione orari per ogni fascia con TimeBandSchedulePicker
 * - Gestione giorni della settimana
 * - Validazione sovrapposizioni orarie
 * - Suggerimenti configurazioni standard
 */
export default function Step12() {
  const step12 = useMockStep12()
  const { data, updateData, fillExampleData, validation } = step12
  
  // Get configuration metadata
  const configurations = getTimeBandConfigurations()
  const currentConfig = configurations.find(c => c.value === data.CONFIGURAZIONE_FASCE)
  const requiredBands = getRequiredTimeBands(data.CONFIGURAZIONE_FASCE)
  const recommendations = getConfigurationRecommendations(data.CONFIGURAZIONE_FASCE)
  
  // Apply standard schedule
  const applyStandardSchedule = () => {
    const standardSchedule = generateStandardSchedule(data.CONFIGURAZIONE_FASCE)
    updateData(standardSchedule)
  }
  
  // Get complexity color
  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'semplice': return 'bg-green-100 text-green-800 border-green-300'
      case 'intermedio': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'complesso': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }
  
  // Check if band is required
  const isBandRequired = (band: string) => requiredBands.includes(band)
  
  return (
    <div className="space-y-6">
      <FormSection
        title="Fasce Orarie Settimanali"
        description="Configurazione delle fasce orarie per la tariffazione energetica"
        icon="🕐"
        status={<StatusBadge status={step12.isComplete ? "completo" : "incompleto"} />}
      />
      
      {/* Configuration Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tipologia Configurazione Fasce
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormSelect
            label="Configurazione Fasce Orarie"
            value={data.CONFIGURAZIONE_FASCE}
            onChange={(value) => updateData({ CONFIGURAZIONE_FASCE: value })}
            options={configurations.map(config => ({
              value: config.value,
              label: config.label,
              description: `${config.complexity} - ${config.category}`
            }))}
            required
            description="Seleziona la tipologia di fasce orarie da configurare"
          />
          
          {currentConfig && (
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className={getComplexityColor(currentConfig.complexity)}>
                {currentConfig.complexity}
              </Badge>
              <Badge variant="outline">
                {currentConfig.category}
              </Badge>
              <Badge variant="outline">
                {requiredBands.length} fasce richieste
              </Badge>
            </div>
          )}
          
          {/* Configuration Info */}
          {data.CONFIGURAZIONE_FASCE && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                {recommendations.description}
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-blue-800 mb-1">Vantaggi:</h5>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                    {recommendations.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-blue-800 mb-1">Considerazioni:</h5>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                    {recommendations.considerations.map((consideration, index) => (
                      <li key={index}>{consideration}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-blue-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyStandardSchedule}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Applica Configurazione Standard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Time Band Configuration */}
      {data.CONFIGURAZIONE_FASCE && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Configurazione Orari Fasce
              <Badge variant="outline" className="ml-auto">
                {requiredBands.join(', ')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* F1 Configuration */}
            <ConditionalRenderer
              showWhen={isBandRequired('F1')}
              requiredWhen={isBandRequired('F1')}
            >
              <TimeBandSchedulePicker
                label="Fascia F1 - Ore di Punta"
                value={data.FASCIA_F1 || ''}
                onChange={(value) => updateData({ FASCIA_F1: value })}
                bandType="F1"
                required={isBandRequired('F1')}
                description="Configurazione orari per la fascia F1 (ore di punta - maggior costo)"
                placeholder="08:00-12:00, 19:00-22:00"
              />
            </ConditionalRenderer>
            
            {/* F2 Configuration */}
            <ConditionalRenderer
              showWhen={isBandRequired('F2')}
              requiredWhen={isBandRequired('F2')}
            >
              <TimeBandSchedulePicker
                label="Fascia F2 - Ore Intermedie"
                value={data.FASCIA_F2 || ''}
                onChange={(value) => updateData({ FASCIA_F2: value })}
                bandType="F2"
                required={isBandRequired('F2')}
                description="Configurazione orari per la fascia F2 (ore intermedie - costo medio)"
                placeholder="07:00-08:00, 12:00-19:00, 22:00-23:00"
              />
            </ConditionalRenderer>
            
            {/* F3 Configuration */}
            <ConditionalRenderer
              showWhen={isBandRequired('F3')}
              requiredWhen={isBandRequired('F3')}
            >
              <TimeBandSchedulePicker
                label="Fascia F3 - Ore Fuori Punta"
                value={data.FASCIA_F3 || ''}
                onChange={(value) => updateData({ FASCIA_F3: value })}
                bandType="F3"
                required={isBandRequired('F3')}
                description="Configurazione orari per la fascia F3 (ore fuori punta - minor costo)"
                placeholder="23:00-07:00"
              />
            </ConditionalRenderer>
            
            {/* Alternative: Simple Time Range Pickers for single ranges */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Configurazione Alternativa - Fasce Singole
              </h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isBandRequired('F1') && (
                  <TimeRangePicker
                    label="F1 Principale"
                    value={data.FASCIA_F1?.split(',')[0]?.trim() || ''}
                    onChange={(value) => updateData({ FASCIA_F1: value })}
                    bandType="F1"
                    placeholder="08:00-19:00"
                    showSuggestions={true}
                    className="text-sm"
                  />
                )}
                
                {isBandRequired('F2') && (
                  <TimeRangePicker
                    label="F2 Principale"
                    value={data.FASCIA_F2?.split(',')[0]?.trim() || ''}
                    onChange={(value) => updateData({ FASCIA_F2: value })}
                    bandType="F2"
                    placeholder="07:00-08:00"
                    showSuggestions={true}
                    className="text-sm"
                  />
                )}
                
                {isBandRequired('F3') && (
                  <TimeRangePicker
                    label="F3 Principale"
                    value={data.FASCIA_F3?.split(',')[0]?.trim() || ''}
                    onChange={(value) => updateData({ FASCIA_F3: value })}
                    bandType="F3"
                    placeholder="23:00-07:00"
                    showSuggestions={true}
                    className="text-sm"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Weekly Schedule Configuration */}
      {data.CONFIGURAZIONE_FASCE && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configurazione Settimanale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Giorni della Settimana"
              type="text"
              value={data.GIORNI_SETTIMANA || ''}
              onChange={(value) => updateData({ GIORNI_SETTIMANA: value })}
              placeholder="lunedì, martedì, mercoledì, giovedì, venerdì"
              description="Specifica i giorni per cui si applicano le fasce orarie"
            />
            
            <FormField
              label="Configurazione Ore per Giorno"
              type="textarea"
              value={data.ORE_GIORNO || ''}
              onChange={(value) => updateData({ ORE_GIORNO: value })}
              placeholder="Dettagli aggiuntivi sulla configurazione oraria giornaliera..."
              description="Specifiche aggiuntive per la configurazione oraria dettagliata"
            />
          </CardContent>
        </Card>
      )}
      
      {/* Validation Results */}
      {validation.errors.length > 0 && (
        <InfoAlert
          type="error"
          title="Errori di Configurazione"
          message={
            <ul className="list-disc list-inside space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          }
        />
      )}
      
      {validation.warnings.length > 0 && (
        <InfoAlert
          type="warning"
          title="Avvisi di Configurazione"
          message={
            <ul className="list-disc list-inside space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          }
        />
      )}
      
      {/* Summary */}
      {step12.isComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Zap className="h-5 w-5" />
              Riepilogo Configurazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-700">
              <p className="font-medium mb-2">
                Configurazione: {currentConfig?.label}
              </p>
              <div className="space-y-1">
                {data.FASCIA_F1 && <p>F1: {data.FASCIA_F1}</p>}
                {data.FASCIA_F2 && <p>F2: {data.FASCIA_F2}</p>}
                {data.FASCIA_F3 && <p>F3: {data.FASCIA_F3}</p>}
                {data.GIORNI_SETTIMANA && <p>Giorni: {data.GIORNI_SETTIMANA}</p>}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-green-200 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillExampleData}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Ricarica Esempio
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 