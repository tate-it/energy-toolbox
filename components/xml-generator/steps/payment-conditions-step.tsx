'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  CONTRACTUAL_CONDITION_LABELS,
  LIMITING_CONDITION_LABELS,
  PAYMENT_METHOD_LABELS,
} from '@/lib/xml-generator/constants'
import type { PaymentConditionsFormValues } from '@/lib/xml-generator/schemas'

export function PaymentConditionsStep() {
  const form = useFormContext<PaymentConditionsFormValues>()

  // Field arrays for dynamic sections
  const {
    fields: paymentMethodFields,
    append: appendPaymentMethod,
    remove: removePaymentMethod,
  } = useFieldArray({
    control: form.control,
    name: 'paymentMethods',
  })

  const {
    fields: contractualConditionFields,
    append: appendContractualCondition,
    remove: removeContractualCondition,
  } = useFieldArray({
    control: form.control,
    name: 'contractualConditions',
  })

  const addNewPaymentMethod = () => {
    appendPaymentMethod({
      paymentMethodType: '01',
      description: '',
    })
  }

  const addNewContractualCondition = () => {
    appendContractualCondition({
      conditionType: '01',
      alternativeDescription: '',
      description: '',
      isLimiting: '02',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">
          Metodi di Pagamento e Condizioni
        </h2>
        <p className="text-muted-foreground text-sm">
          Definisci i metodi di pagamento accettati e le condizioni contrattuali
        </p>
      </div>

      {/* Payment Methods Section */}
      <Card>
        <CardHeader>
          <CardTitle>Metodi di Pagamento</CardTitle>
          <CardDescription>
            Specifica i metodi di pagamento disponibili per questa offerta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethodFields.map((field, index) => (
              <PaymentMethodCard
                index={index}
                key={field.id}
                onRemove={() => removePaymentMethod(index)}
                showRemove={paymentMethodFields.length > 1}
              />
            ))}

            <Button
              className="w-full"
              onClick={addNewPaymentMethod}
              type="button"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi Metodo di Pagamento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contractual Conditions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Condizioni Contrattuali</CardTitle>
          <CardDescription>
            Aggiungi le condizioni contrattuali specifiche per questa offerta
            (opzionale)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contractualConditionFields.map((field, index) => (
              <ContractualConditionCard
                index={index}
                key={field.id}
                onRemove={() => removeContractualCondition(index)}
                showRemove={true}
              />
            ))}

            <Button
              className="w-full"
              onClick={addNewContractualCondition}
              type="button"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi Condizione Contrattuale
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface PaymentMethodCardProps {
  index: number
  onRemove: () => void
  showRemove: boolean
}

function PaymentMethodCard({
  index,
  onRemove,
  showRemove,
}: PaymentMethodCardProps) {
  const form = useFormContext<PaymentConditionsFormValues>()
  const selectedPaymentMethod = form.watch(
    `paymentMethods.${index}.paymentMethodType`,
  )

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            Metodo di Pagamento {index + 1}
          </CardTitle>
          {showRemove && (
            <Button
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={onRemove}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <FormField
            control={form.control}
            name={`paymentMethods.${index}.paymentMethodType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo di Pagamento *</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo di pagamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedPaymentMethod === '99' && (
            <FormField
              control={form.control}
              name={`paymentMethods.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione *</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[100px]"
                      placeholder="Descrivi il metodo di pagamento alternativo..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Obbligatorio quando si seleziona &quot;Altro&quot;. Massimo
                    3000 caratteri.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ContractualConditionCardProps {
  index: number
  onRemove: () => void
  showRemove: boolean
}

function ContractualConditionCard({
  index,
  onRemove,
  showRemove,
}: ContractualConditionCardProps) {
  const form = useFormContext<PaymentConditionsFormValues>()
  const selectedConditionType = form.watch(
    `contractualConditions.${index}.conditionType`,
  )

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            Condizione Contrattuale {index + 1}
          </CardTitle>
          {showRemove && (
            <Button
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={onRemove}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name={`contractualConditions.${index}.conditionType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo di Condizione *</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo di condizione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(CONTRACTUAL_CONDITION_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`contractualConditions.${index}.isLimiting`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condizione Limitante *</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona se limitante" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(LIMITING_CONDITION_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {selectedConditionType === '99' && (
          <FormField
            control={form.control}
            name={`contractualConditions.${index}.alternativeDescription`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrizione Alternativa *</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[80px]"
                    placeholder="Descrivi il tipo di condizione alternativa..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Obbligatorio quando si seleziona &quot;Altro&quot;. Massimo
                  3000 caratteri.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name={`contractualConditions.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrizione della Condizione *</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[120px]"
                  placeholder="Descrivi dettagliatamente la condizione contrattuale..."
                  {...field}
                />
              </FormControl>
              <FormDescription>Massimo 3000 caratteri</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
