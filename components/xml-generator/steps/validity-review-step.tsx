'use client'

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Database,
  FileText,
} from 'lucide-react'
import { type UseFormReturn, useFormContext } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useFormStates } from '@/hooks/use-form-states'
import {
  CLIENT_TYPE_LABELS,
  MARKET_TYPE_LABELS,
  OFFER_TYPE_LABELS,
} from '@/lib/xml-generator/constants'
import type { ValidityReviewFormValues } from '@/lib/xml-generator/schemas'

// Helper function to get label from labels object
const getLabelFromLabels = (
  value: string | undefined,
  labels: Record<string, string>,
): string => {
  return labels[value || ''] || value || ''
}

// Extract the form states type from useFormStates return type
type FormStates = ReturnType<typeof useFormStates>[0]

// Helper function to calculate completion status
const calculateCompletionStatus = (formData: FormStates) => {
  const basicInfo = formData.basicInfo || {}
  const offerDetails = formData.offerDetails || {}
  const activationContacts = formData.activationContacts || {}

  const completedSections = [
    basicInfo.pivaUtente && basicInfo.codOfferta ? 'basicInfo' : null,
    offerDetails.marketType && offerDetails.clientType && offerDetails.offerType
      ? 'offerDetails'
      : null,
    activationContacts.activationMethods?.length > 0 && activationContacts.phone
      ? 'activationContacts'
      : null,
    'pricingConfig', // This step is often optional based on offer type
    'companyComponents', // This step is often optional
    'paymentConditions', // This step has been completed
    'additionalFeatures', // This step has been completed
  ].filter(Boolean)

  const totalSections = 7
  const completionPercentage = Math.round(
    (completedSections.length / totalSections) * 100,
  )

  return { completedSections, totalSections, completionPercentage }
}

function CompletionStatusCard({ formStates }: { formStates: FormStates }) {
  const { completedSections, totalSections, completionPercentage } =
    calculateCompletionStatus(formStates)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Stato Completamento
        </CardTitle>
        <CardDescription>
          Riepilogo delle sezioni completate del modulo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="mb-2 flex justify-between text-sm">
              <span>Progresso completamento</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-green-600 transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <Badge
            variant={completionPercentage === 100 ? 'default' : 'secondary'}
          >
            {completedSections.length}/{totalSections} sezioni
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function ValidityPeriodCard({
  form,
}: {
  form: UseFormReturn<ValidityReviewFormValues>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Periodo di Validità
        </CardTitle>
        <CardDescription>
          Definisci le date di validità per l&apos;offerta commerciale
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="validityPeriod.startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data di Inizio *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="font-mono"
                    placeholder="gg/mm/aaaa"
                  />
                </FormControl>
                <FormDescription>
                  Data di inizio validità dell&apos;offerta (formato:
                  gg/mm/aaaa)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validityPeriod.endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data di Fine</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="font-mono"
                    placeholder="gg/mm/aaaa (opzionale)"
                  />
                </FormControl>
                <FormDescription>
                  Data di fine validità dell&apos;offerta (lasciare vuoto per
                  durata indeterminata)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function BasicInfoSection({
  basicInfo,
}: {
  basicInfo: FormStates['basicInfo']
}) {
  return (
    <div>
      <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
        <Database className="h-4 w-4" />
        Informazioni di Base
      </h4>
      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
        <div>
          <span className="font-medium text-gray-600">PIVA Utente:</span>
          <p className="font-mono">
            {basicInfo?.pivaUtente || 'Non specificata'}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-600">Codice Offerta:</span>
          <p className="font-mono">
            {basicInfo?.codOfferta || 'Non specificato'}
          </p>
        </div>
      </div>
    </div>
  )
}

function OfferDetailsSection({
  offerDetails,
}: {
  offerDetails: FormStates['offerDetails']
}) {
  return (
    <div>
      <h4 className="mb-3 font-semibold text-gray-900">Dettagli Offerta</h4>
      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
        <div>
          <span className="font-medium text-gray-600">Tipo Mercato:</span>
          <p>
            {getLabelFromLabels(offerDetails?.marketType, MARKET_TYPE_LABELS)}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-600">Tipo Cliente:</span>
          <p>
            {getLabelFromLabels(offerDetails?.clientType, CLIENT_TYPE_LABELS)}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-600">Tipo Offerta:</span>
          <p>
            {getLabelFromLabels(offerDetails?.offerType, OFFER_TYPE_LABELS)}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-600">Nome Offerta:</span>
          <p>{offerDetails?.offerName || 'Non specificato'}</p>
        </div>
        <div>
          <span className="font-medium text-gray-600">Durata:</span>
          <p>
            {offerDetails?.duration
              ? `${offerDetails?.duration} mesi`
              : 'Non specificata'}
          </p>
        </div>
      </div>
    </div>
  )
}

function ActivationContactsSection({
  activationContacts,
}: {
  activationContacts: FormStates['activationContacts']
}) {
  return (
    <div>
      <h4 className="mb-3 font-semibold text-gray-900">
        Attivazione e Contatti
      </h4>
      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
        <div>
          <span className="font-medium text-gray-600">
            Metodi di Attivazione:
          </span>
          <p>
            {activationContacts?.activationMethods &&
            activationContacts?.activationMethods?.length > 0
              ? `${activationContacts?.activationMethods?.length} metodi selezionati`
              : 'Nessuno'}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-600">Telefono:</span>
          <p className="font-mono">
            {activationContacts?.phone || 'Non specificato'}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-600">Sito Venditore:</span>
          <p>{activationContacts?.vendorWebsite || 'Non specificato'}</p>
        </div>
        <div>
          <span className="font-medium text-gray-600">URL Offerta:</span>
          <p>{activationContacts?.offerUrl || 'Non specificato'}</p>
        </div>
      </div>
    </div>
  )
}

function AdditionalSectionsGrid({
  pricingConfig,
  companyComponents,
  paymentConditions,
  additionalFeatures,
}: {
  pricingConfig: FormStates['pricingConfig']
  companyComponents: FormStates['companyComponents']
  paymentConditions: FormStates['paymentConditions']
  additionalFeatures: FormStates['additionalFeatures']
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg bg-gray-50 p-3 text-center">
        <h5 className="mb-1 font-medium text-gray-900">Prezzi</h5>
        <p className="text-gray-600 text-sm">
          {pricingConfig?.dispatching && pricingConfig?.dispatching?.length > 0
            ? `${pricingConfig?.dispatching?.length} componenti`
            : 'Configurato'}
        </p>
      </div>
      <div className="rounded-lg bg-gray-50 p-3 text-center">
        <h5 className="mb-1 font-medium text-gray-900">Componenti</h5>
        <p className="text-gray-600 text-sm">
          {companyComponents?.companyComponents &&
          companyComponents?.companyComponents?.length > 0
            ? `${companyComponents?.companyComponents?.length} componenti`
            : 'Configurato'}
        </p>
      </div>
      <div className="rounded-lg bg-gray-50 p-3 text-center">
        <h5 className="mb-1 font-medium text-gray-900">Pagamenti</h5>
        <p className="text-gray-600 text-sm">
          {paymentConditions?.paymentMethods &&
          paymentConditions?.paymentMethods?.length > 0
            ? `${paymentConditions?.paymentMethods?.length} metodi`
            : 'Configurato'}
        </p>
      </div>
      <div className="rounded-lg bg-gray-50 p-3 text-center">
        <h5 className="mb-1 font-medium text-gray-900">Funzionalità</h5>
        <p className="text-gray-600 text-sm">
          {additionalFeatures?.discounts &&
          additionalFeatures?.discounts?.length > 0
            ? `${additionalFeatures?.discounts?.length} sconti`
            : 'Configurato'}
        </p>
      </div>
    </div>
  )
}

function FormSummaryCard({ formStates }: { formStates: FormStates }) {
  const basicInfo = formStates.basicInfo || {}
  const offerDetails = formStates.offerDetails || {}
  const activationContacts = formStates.activationContacts || {}
  const pricingConfig = formStates.pricingConfig || {}
  const companyComponents = formStates.companyComponents || {}
  const paymentConditions = formStates.paymentConditions || {}
  const additionalFeatures = formStates.additionalFeatures || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Riepilogo Dati Inseriti
        </CardTitle>
        <CardDescription>
          Revisiona tutte le informazioni prima della generazione XML
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <BasicInfoSection basicInfo={basicInfo} />
        <Separator />
        <OfferDetailsSection offerDetails={offerDetails} />
        <Separator />
        <ActivationContactsSection activationContacts={activationContacts} />
        <Separator />
        <AdditionalSectionsGrid
          additionalFeatures={additionalFeatures}
          companyComponents={companyComponents}
          paymentConditions={paymentConditions}
          pricingConfig={pricingConfig}
        />
      </CardContent>
    </Card>
  )
}

function ReviewConfirmationCard({
  form,
}: {
  form: UseFormReturn<ValidityReviewFormValues>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          Conferma Revisione
        </CardTitle>
        <CardDescription>
          Conferma di aver revisionato tutti i dati prima di procedere
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="reviewConfirmed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-medium">
                  Confermo di aver revisionato tutti i dati inseriti *
                </FormLabel>
                <FormDescription>
                  È necessario confermare la revisione per procedere alla
                  generazione del file XML
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note Aggiuntive (Opzionale)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="min-h-[100px]"
                  placeholder="Inserisci eventuali note o commenti per uso interno..."
                />
              </FormControl>
              <FormDescription>
                Note interne che non saranno incluse nel file XML generato
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}

function XmlPreviewCard() {
  return (
    <Card className="border-gray-300 border-dashed">
      <CardContent className="py-8 text-center">
        <div className="mb-2 text-gray-400">
          <FileText className="mx-auto mb-3 h-12 w-12" />
        </div>
        <h4 className="mb-2 font-medium text-gray-600">Anteprima XML</h4>
        <p className="text-gray-500 text-sm">
          La funzionalità di anteprima e generazione XML sarà implementata nelle
          prossime versioni
        </p>
      </CardContent>
    </Card>
  )
}

export function ValidityReviewStep() {
  const form = useFormContext<ValidityReviewFormValues>()
  const [formStates] = useFormStates()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-2 font-bold text-2xl text-gray-900">
          Validità e Revisione Finale
        </h2>
        <p className="text-gray-600">
          Configura le date di validità dell&apos;offerta e rivedi tutte le
          informazioni inserite prima di generare il file XML.
        </p>
      </div>

      <CompletionStatusCard formStates={formStates} />
      <ValidityPeriodCard form={form} />
      <FormSummaryCard formStates={formStates} />
      <ReviewConfirmationCard form={form} />
      <XmlPreviewCard />
    </div>
  )
}
