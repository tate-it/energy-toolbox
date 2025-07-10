# Aggiunta di Nuovi Passi al Generatore XML

Questa guida spiega come aggiungere nuovi passi del modulo al Generatore XML SII. L'applicazione utilizza un'architettura modulare dove ogni passo consiste in una definizione di schema, un componente, e integrazione con lo stepper principale.

## Panoramica

Il generatore XML è costruito con la seguente struttura:
- **Schemi**: Definiscono regole di validazione e tipi (`lib/xml-generator/schemas.ts`)
- **Componenti**: Componenti di modulo individuali per ogni passo (`components/xml-generator/steps/`)
- **Configurazione Stepper**: Mappa i passi agli schemi (`lib/xml-generator/stepperize-config.ts`)
- **Costanti**: Etichette e opzioni centralizzate (`lib/xml-generator/constants.ts`)
- **Gestione Stato**: Stato cross-step tramite `useFormStates` (`hooks/use-form-states.ts`)

## Processo Passo-per-Passo

### 1. Definire lo Schema

Prima, aggiungi il tuo schema di validazione a `lib/xml-generator/schemas.ts`:

```typescript
// Aggiungi a lib/xml-generator/schemas.ts

// Esempio: Schema Attivazione & Contatti
export const activationContactsSchema = z
  .object({
    activationMethods: z
      .array(z.enum(['01', '02', '03', '04', '05', '99']))
      .min(1, 'Seleziona almeno un metodo di attivazione'),
    
    activationDescription: z
      .string()
      .max(2000, 'La descrizione non può superare i 2000 caratteri')
      .optional(),
    
    phone: z
      .string()
      .min(1, 'Il numero di telefono è obbligatorio')
      .max(15, 'Il numero di telefono non può superare i 15 caratteri')
      .regex(
        /^[\d\s\-+()]+$/,
        'Il numero di telefono può contenere solo numeri, spazi, trattini, più e parentesi'
      ),
    
    vendorWebsite: z
      .string()
      .max(100, "L'URL del sito venditore non può superare i 100 caratteri")
      .url('Inserisci un URL valido')
      .optional()
      .or(z.literal('')),
    
    offerUrl: z
      .string()
      .max(100, "L'URL dell'offerta non può superare i 100 caratteri")
      .url('Inserisci un URL valido')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      // Validazione personalizzata: activationDescription è obbligatoria quando "Altro" (99) è selezionato
      if (
        data.activationMethods.includes('99') &&
        (!data.activationDescription || data.activationDescription.trim() === '')
      ) {
        return false
      }
      return true
    },
    {
      message: 'La descrizione del metodo di attivazione è obbligatoria quando si seleziona "Altro"',
      path: ['activationDescription'],
    }
  )

// Aggiungi l'export del tipo corrispondente
export type ActivationContactsFormValues = z.infer<typeof activationContactsSchema>
```

**Linee Guida per gli Schemi:**
- Usa nomi di campo descrittivi che corrispondono alle specifiche SII
- Aggiungi regole di validazione appropriate (lunghezza min/max, campi obbligatori, ecc.)
- Includi messaggi di errore utili **in italiano**
- Esporta sia lo schema che il suo tipo TypeScript
- Usa `refine` per validazioni personalizzate complesse

### 2. Aggiungere Costanti

Aggiungi le costanti necessarie a `lib/xml-generator/constants.ts`:

```typescript
// lib/xml-generator/constants.ts

// Etichette per i metodi di attivazione
export const ACTIVATION_METHOD_LABELS: Record<string, string> = {
  '01': 'Attivazione solo web',
  '02': 'Attivazione qualsiasi canale', 
  '03': 'Punto vendita',
  '04': 'Teleselling',
  '05': 'Agenzia',
  '99': 'Altro',
} as const

// Valori enum per i metodi di attivazione
export const ACTIVATION_METHODS = {
  WEB_ONLY: '01',
  ANY_CHANNEL: '02', 
  POINT_OF_SALE: '03',
  TELESELLING: '04',
  AGENCY: '05',
  OTHER: '99',
} as const
```

**Linee Guida per le Costanti:**
- Crea sia etichette che valori enum
- Usa **italiano** per tutte le etichette utente
- Mantieni consistenza con il pattern esistente
- Aggiungi `as const` per type safety

### 3. Creare il Componente

Crea un nuovo file componente in `components/xml-generator/steps/`:

```typescript
// components/xml-generator/steps/activation-contacts-step.tsx

'use client'

import { useFormContext } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useFormStates } from '@/hooks/use-form-states'
import { ACTIVATION_METHOD_LABELS } from '@/lib/xml-generator/constants'
import type { ActivationContactsFormValues } from '@/lib/xml-generator/schemas'

export function ActivationContactsStep() {
  const form = useFormContext<ActivationContactsFormValues>()
  const [formStates] = useFormStates()
  
  // Accesso ai dati dei passi precedenti per logica condizionale
  const offerDetails = formStates.offerDetails
  const marketType = offerDetails?.marketType

  return (
    <div className="space-y-6">
      {/* Header del Passo */}
      <div>
        <h2 className="font-bold text-2xl">Attivazione e Contatti</h2>
        <p className="text-muted-foreground">
          Configura i metodi di attivazione e le informazioni di contatto per l'offerta
        </p>
      </div>

      {/* Sezione Metodi di Attivazione */}
      <Card>
        <CardHeader>
          <CardTitle>Metodi di Attivazione</CardTitle>
          <CardDescription>
            Seleziona uno o più metodi attraverso i quali l'offerta può essere attivata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="activationMethods"
            render={() => (
              <FormItem>
                <FormLabel className="font-medium text-base">
                  Modalità di Attivazione <span className="text-destructive">*</span>
                </FormLabel>
                
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Object.entries(ACTIVATION_METHOD_LABELS).map(([value, label]) => (
                    <FormField
                      key={value}
                      control={form.control}
                      name="activationMethods"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(value as any)}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), value]
                                  : field.value?.filter((item) => item !== value) || []
                                field.onChange(updatedValue)
                              }}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer font-normal text-sm">
                            {label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Condizionale: Descrizione per "Altro" */}
          {form.watch('activationMethods')?.includes('99') && (
            <FormField
              control={form.control}
              name="activationDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-sm">
                    Descrizione Metodo Attivazione <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[100px]"
                      placeholder="Descrivi il metodo di attivazione alternativo..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Obbligatorio quando si seleziona "Altro". Massimo 2000 caratteri.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Sezione Informazioni di Contatto */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni di Contatto</CardTitle>
          <CardDescription>
            Fornisci le informazioni di contatto per l'offerta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero di Telefono <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="es. +39 02 1234567"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Numero di telefono per il supporto clienti (massimo 15 caratteri)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vendorWebsite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sito Web del Venditore</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://www.esempio.it"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  URL del sito web aziendale (opzionale, massimo 100 caratteri)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="offerUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL dell'Offerta</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://www.esempio.it/offerta-speciale"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  URL specifico dell'offerta (opzionale, massimo 100 caratteri)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

**Linee Guida per i Componenti:**
- Usa `useFormContext` per accedere ai metodi del form
- Usa `useFormStates` per accedere ai dati dei passi precedenti
- Segui lo styling consistente con layout a Card
- Includi etichette appropriate e gestione degli errori
- Usa componenti UI appropriati dal design system
- Gestisci campi condizionali (mostra/nascondi basato su altri valori)
- Marca i campi obbligatori con asterischi (*)
- **Usa italiano** per tutto il testo utente

### 4. Aggiornare l'Index dei Componenti

Aggiungi il tuo nuovo componente a `components/xml-generator/index.ts`:

```typescript
// components/xml-generator/index.ts

// Export all XML generator form components
export { PlaceholderComponent } from './placeholder-component'
export { ActivationContactsStep } from './steps/activation-contacts-step' // Aggiungi questa riga
export { BasicInfoStep } from './steps/basic-info-step'
export { CompanyComponentsStep } from './steps/company-components-step'
export { OfferDetailsStep } from './steps/offer-details-step'
export { PricingConfigStep } from './steps/pricing-config-step'
// ... altri export
```

### 5. Aggiornare la Configurazione dello Stepper

Aggiungi il tuo passo a `lib/xml-generator/stepperize/config.ts`:

```typescript
// lib/xml-generator/stepperize/config.ts

export const baseConfig = [
  {
    id: 'basicInfo',
    title: 'Informazioni di Base',
    description: 'Partita IVA e Codice Offerta',
  },
  {
    id: 'offerDetails', 
    title: 'Dettagli Offerta',
    description: 'Tipo mercato, tipo cliente e configurazione offerta',
  },
  {
    id: 'activationContacts', // Aggiungi questo passo
    title: 'Attivazione e Contatti',
    description: 'Modalità di attivazione e informazioni di contatto',
  },
  // ... altri passi
] as const
```

### 6. Aggiornare la Configurazione dello Stepper Principale

Aggiorna `lib/xml-generator/stepperize-config.ts` per includere il tuo nuovo schema e componente:

```typescript
// lib/xml-generator/stepperize-config.ts

import { ActivationContactsStep } from '@/components/xml-generator/steps/activation-contacts-step' // Aggiungi import
import {
  activationContactsSchema, // Aggiungi import dello schema
  // ... altri schemi
} from './schemas'

const schemaMap = {
  basicInfo: basicInfoSchema,
  offerDetails: offerDetailsSchema,
  activationContacts: activationContactsSchema, // Aggiungi mapping dello schema
  // ... altri mapping
} as const

const componentMap = {
  basicInfo: BasicInfoStep,
  offerDetails: OfferDetailsStep,
  activationContacts: ActivationContactsStep, // Aggiungi mapping del componente
  // ... altri mapping
} as const

// Il resto della configurazione viene gestito automaticamente
```

### 7. Creare Test Completi

Crea test completi per il tuo componente:

```typescript
// components/xml-generator/steps/activation-contacts-step.test.tsx

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { describe, it, expect } from 'vitest'
import { ActivationContactsStep } from './activation-contacts-step'
import { activationContactsSchema, type ActivationContactsFormValues } from '@/lib/xml-generator/schemas'

// Pattern per test regex consistenti
const ACTIVATION_METHODS_REGEX = /Modalità di Attivazione/i
const PHONE_NUMBER_REGEX = /Numero di Telefono/i
const VENDOR_WEBSITE_REGEX = /Sito Web del Venditore/i

// Wrapper di test che fornisce il contesto del form
function TestWrapper({ 
  children, 
  defaultValues 
}: { 
  children: React.ReactNode
  defaultValues?: Partial<ActivationContactsFormValues> 
}) {
  const methods = useForm<ActivationContactsFormValues>({
    resolver: zodResolver(activationContactsSchema),
    defaultValues: {
      activationMethods: [],
      activationDescription: '',
      phone: '',
      vendorWebsite: '',
      offerUrl: '',
      ...defaultValues,
    },
  })

  return (
    <FormProvider {...methods}>
      {children}
    </FormProvider>
  )
}

describe('ActivationContactsStep', () => {
  it('renders il componente con etichette italiane corrette', () => {
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    expect(screen.getByText('Attivazione e Contatti')).toBeInTheDocument()
    expect(screen.getByText('Configura i metodi di attivazione e le informazioni di contatto per l\'offerta')).toBeInTheDocument()
    expect(screen.getByText('Metodi di Attivazione')).toBeInTheDocument()
    expect(screen.getByText('Informazioni di Contatto')).toBeInTheDocument()
  })

  it('mostra tutte le opzioni dei metodi di attivazione con etichette italiane', () => {
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    expect(screen.getByText('Attivazione solo web')).toBeInTheDocument()
    expect(screen.getByText('Attivazione qualsiasi canale')).toBeInTheDocument()
    expect(screen.getByText('Punto vendita')).toBeInTheDocument()
    expect(screen.getByText('Teleselling')).toBeInTheDocument()
    expect(screen.getByText('Agenzia')).toBeInTheDocument()
    expect(screen.getByText('Altro')).toBeInTheDocument()
  })

  it('permette la selezione di metodi di attivazione multipli', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    const webOnlyCheckbox = screen.getByRole('checkbox', { name: /attivazione solo web/i })
    const anyChannelCheckbox = screen.getByRole('checkbox', { name: /attivazione qualsiasi canale/i })

    await user.click(webOnlyCheckbox)
    await user.click(anyChannelCheckbox)

    expect(webOnlyCheckbox).toBeChecked()
    expect(anyChannelCheckbox).toBeChecked()
  })

  it('mostra il campo descrizione attivazione quando "Altro" è selezionato', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    const otherCheckbox = screen.getByRole('checkbox', { name: /altro/i })
    await user.click(otherCheckbox)

    expect(screen.getByText('Descrizione Metodo Attivazione')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Descrivi il metodo di attivazione alternativo...')).toBeInTheDocument()
  })

  it('accetta input validi per numero di telefono', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    const phoneInput = screen.getByLabelText(PHONE_NUMBER_REGEX)
    await user.type(phoneInput, '+39 02 1234567')

    expect(phoneInput).toHaveValue('+39 02 1234567')
  })

  it('mostra indicatori di campi obbligatori', () => {
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    // Controlla gli asterischi obbligatori
    const requiredFields = screen.getAllByText('*')
    expect(requiredFields.length).toBeGreaterThan(0)
  })

  it('ha attributi di accessibilità appropriati', () => {
    render(
      <TestWrapper>
        <ActivationContactsStep />
      </TestWrapper>
    )

    // Controlla che le checkbox abbiano etichette appropriate
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(checkbox => {
      expect(checkbox).toHaveAccessibleName()
    })

    // Controlla che gli input abbiano etichette appropriate
    const phoneInput = screen.getByLabelText(PHONE_NUMBER_REGEX)
    expect(phoneInput).toHaveAccessibleName()
  })

  it('gestisce dati precompilati correttamente', () => {
    const defaultValues: Partial<ActivationContactsFormValues> = {
      activationMethods: ['01', '03'],
      phone: '+39 02 1234567',
      vendorWebsite: 'https://www.esempio.it',
    }

    render(
      <TestWrapper defaultValues={defaultValues}>
        <ActivationContactsStep />
      </TestWrapper>
    )

    const webOnlyCheckbox = screen.getByRole('checkbox', { name: /attivazione solo web/i })
    const pointOfSaleCheckbox = screen.getByRole('checkbox', { name: /punto vendita/i })
    const phoneInput = screen.getByLabelText(PHONE_NUMBER_REGEX)

    expect(webOnlyCheckbox).toBeChecked()
    expect(pointOfSaleCheckbox).toBeChecked()
    expect(phoneInput).toHaveValue('+39 02 1234567')
  })
})
```

## Pattern Avanzati

### 1. Array Dinamici con Componenti Nidificati

Per passi complessi con array dinamici:

```typescript
export function ComplexStep() {
  const form = useFormContext<ComplexFormValues>()
  
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const addNewItem = () => {
    appendItem({
      name: '',
      description: '',
      priceIntervals: [
        {
          price: 0,
          unitOfMeasure: '01',
        },
      ],
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Passo Complesso</h2>
        <p className="text-muted-foreground text-sm">
          Gestisce elementi dinamici con componenti nidificati
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elementi Dinamici</CardTitle>
          <CardDescription>
            Aggiungi e configura elementi con intervalli di prezzo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {itemFields.map((field, index) => (
              <ItemCard
                key={field.id}
                index={index}
                onRemove={() => removeItem(index)}
                showRemove={itemFields.length > 1}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addNewItem}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi Elemento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 2. Logica Condizionale Basata su Passi Precedenti

```typescript
export function ConditionalStep() {
  const form = useFormContext<ConditionalFormValues>()
  const [formStates] = useFormStates()

  // Accesso ai dati dei passi precedenti
  const offerDetails = formStates.offerDetails
  const marketType = offerDetails?.marketType
  const offerType = offerDetails?.offerType

  // Logica condizionale per mostrare sezioni
  const showEnergyPriceReference = offerType === OFFER_TYPES.VARIABLE
  const showTimeBandConfiguration = marketType === MARKET_TYPES.ELECTRICITY && offerType !== OFFER_TYPES.FLAT

  return (
    <div className="space-y-6">
      {showEnergyPriceReference && (
        <Card>
          <CardHeader>
            <CardTitle>Riferimenti Prezzo Energia</CardTitle>
            <CardDescription>
              Visibile solo per offerte a prezzo variabile
            </CardDescription>
          </CardHeader>
          {/* Contenuto condizionale */}
        </Card>
      )}

      {showTimeBandConfiguration && (
        <Card>
          <CardHeader>
            <CardTitle>Configurazione Fasce Orarie</CardTitle>
            <CardDescription>
              Visibile solo per mercato elettrico non-FLAT
            </CardDescription>
          </CardHeader>
          {/* Contenuto condizionale */}
        </Card>
      )}
    </div>
  )
}
```

### 3. Validazione Personalizzata Complessa

```typescript
export const complexSchema = z
  .object({
    type: z.enum(['01', '02', '03']),
    minValue: z.number().min(0),
    maxValue: z.number().min(0),
    description: z.string().optional(),
    items: z.array(
      z.object({
        name: z.string().min(1),
        price: z.number().min(0),
      })
    ).min(1),
  })
  .refine(
    (data) => {
      // Validazione range
      if (data.minValue >= data.maxValue) {
        return false
      }
      return true
    },
    {
      message: 'Il valore minimo deve essere inferiore al valore massimo',
      path: ['maxValue'],
    }
  )
  .refine(
    (data) => {
      // Descrizione obbligatoria per tipo "Altro"
      if (data.type === '99' && !data.description) {
        return false
      }
      return true
    },
    {
      message: 'La descrizione è obbligatoria quando si seleziona "Altro"',
      path: ['description'],
    }
  )
```

## Best Practices

### 1. Convenzioni per Nomi di Campo
- Usa camelCase per i nomi dei campi del form
- Abbina i nomi dei campi delle specifiche SII dove possibile
- Usa nomi descrittivi che indicano lo scopo del campo

### 2. Regole di Validazione
- Valida sempre i campi obbligatori
- Usa tipi di dati appropriati (string, number, date, ecc.)
- Imposta limiti min/max ragionevoli basati sui requisiti SII
- Fornisci messaggi di errore chiari e user-friendly **in italiano**

### 3. Logica Condizionale
- Usa `watch()` per monitorare i cambiamenti dei campi
- Mostra/nascondi campi basati sui valori di altri campi
- Aggiorna le regole di validazione dinamicamente quando necessario
- Usa `useFormStates` per accedere ai dati dei passi precedenti

### 4. Linee Guida UI/UX
- Raggruppa campi correlati insieme
- Usa tipi di input appropriati (text, select, checkbox, ecc.)
- Includi testo di aiuto per campi complessi
- Marca chiaramente i campi obbligatori
- Fornisci spaziatura e layout consistenti
- **Usa sempre italiano** per il testo utente

### 5. Test
Dopo aver aggiunto un nuovo passo, testa quanto segue:
- La validazione del form funziona correttamente
- I dati persistono quando si naviga tra i passi
- L'URL si aggiorna correttamente
- Il componente viene renderizzato senza errori
- Tutta la logica condizionale funziona come previsto
- L'accessibilità è appropriata
- Le etichette italiane sono corrette

## Pattern Comuni

### Campi di Selezione Multipla
```typescript
const handleMultiSelect = (value: string, checked: boolean, fieldName: string) => {
  const currentValues = watch(fieldName) || []
  if (checked) {
    setValue(fieldName, [...currentValues, value])
  } else {
    setValue(fieldName, currentValues.filter(v => v !== value))
  }
}
```

### Campi Obbligatori Condizionali
```typescript
const schema = z.object({
  type: z.enum(['01', '02', '99']),
  description: z.string().optional(),
}).refine((data) => {
  if (data.type === '99' && !data.description) {
    return false
  }
  return true
}, {
  message: 'La descrizione è obbligatoria quando il tipo è "Altro"',
  path: ['description'],
})
```

### Array di Campi Dinamici
```typescript
const { fields, append, remove } = useFieldArray({
  control,
  name: 'items'
})

// Aggiunta di nuovo elemento
const addItem = () => {
  append({
    name: '',
    value: '',
    // ... altri campi di default
  })
}
```

### Componenti Nidificati per Array Complessi
```typescript
interface ItemCardProps {
  index: number
  onRemove: () => void
  showRemove: boolean
}

function ItemCard({ index, onRemove, showRemove }: ItemCardProps) {
  const form = useFormContext<FormValues>()
  
  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Elemento {index + 1}</CardTitle>
          {showRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Campi del form per questo elemento */}
      </CardContent>
    </Card>
  )
}
```

## Risoluzione dei Problemi

### Problemi Comuni

1. **Schema non aggiornato**: Assicurati di riavviare il server di sviluppo dopo le modifiche allo schema
2. **Componente non renderizzato**: Controlla le dichiarazioni import/export e lo switch dello stepper
3. **Validazione non funzionante**: Assicurati che lo schema sia associato correttamente al passo
4. **Dati non persistenti**: Verifica che i nomi dei campi corrispondano tra schema e componente
5. **Errori TypeScript**: Controlla che i tipi siano esportati e importati correttamente

### Suggerimenti per il Debug

1. Usa il pannello di debug in fondo alla pagina per ispezionare i dati del form
2. Controlla la console del browser per errori TypeScript
3. Usa React DevTools per ispezionare lo stato del componente
4. Testa la validazione del form inviando dati non validi
5. Usa `console.log` nel componente per tracciare i cambiamenti dei dati

### Gestione Errori Comuni

```typescript
// Gestione errori di validazione personalizzati
const handleValidationError = (errors: any) => {
  console.error('Errori di validazione:', errors)
  // Logica personalizzata per gestire errori specifici
}

// Debugging stato del form
const debugFormState = () => {
  const formData = watch()
  console.log('Dati correnti del form:', formData)
  console.log('Errori del form:', errors)
}
```

## Riferimento alle Specifiche SII

Quando implementi nuovi passi, fai sempre riferimento al documento delle specifiche SII:
- **File**: `documentation/functional-requirements-sii-xml.md`
- **Schema**: `documentation/xml-schema.xsd`

Ogni passo dovrebbe implementare la sezione corrispondente delle specifiche SII con validazione e formattazione appropriate dei campi.

## Esempio: Implementazione Completa

Per un esempio completo, consulta l'implementazione esistente di `ActivationContactsStep` e `CompanyComponentsStep`, che dimostrano tutti i pattern descritti in questa guida, inclusi:

- Pattern FormField moderni con validazione italiana
- Uso delle costanti per etichette e opzioni
- Gestione di array dinamici con componenti nidificati
- Logica condizionale basata sui valori dei campi
- Test completi con pattern di accessibilità
- Layout a Card consistente
- Gestione stato cross-step con useFormStates

L'implementazione attuale è significativamente più avanzata di quanto suggerito nelle versioni precedenti di questa guida, con pattern migliori per manutenibilità, internazionalizzazione e esperienza utente. 