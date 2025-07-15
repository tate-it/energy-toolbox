'use client'

import { Suspense } from 'react'
import { useFormContext } from 'react-hook-form'
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
import { Input } from '@/components/ui/input'
import type { BasicInfoFormValues } from '@/lib/xml-generator/schemas'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'
import { BasicInfoSkeleton } from './skeletons/basic-info-skeleton'

export function BasicInfoStepComponent() {
  const { Stepper } = xmlFormStepper
  const form = useFormContext<BasicInfoFormValues>()

  return (
    <Stepper.Panel>
      <div className="space-y-6">
        <div>
          <h2 className="font-bold text-2xl">Informazioni di Base</h2>
          <p className="text-muted-foreground">
            Inserire la partita IVA e il codice offerta come richiesto dalle
            specifiche SII
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dati Identificativi</CardTitle>
            <CardDescription>
              Campi obbligatori per l'identificazione dell'utente e dell'offerta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="pivaUtente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    PIVA Utente (VAT Number){' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={16}
                      onChange={(e) => {
                        field.onChange(e.target.value.toUpperCase())
                      }}
                      placeholder="IT12345678901"
                    />
                  </FormControl>
                  <FormDescription>
                    Partita IVA italiana (11-16 caratteri alfanumerici).
                    Rappresenta la partita IVA dell'utente accreditato.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codOfferta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Codice Offerta (Offer Code){' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={32}
                      onChange={(e) => {
                        field.onChange(e.target.value.toUpperCase())
                      }}
                      placeholder="OFFER2024001"
                    />
                  </FormControl>
                  <FormDescription>
                    Codice offerta univoco (max 32 caratteri alfanumerici).
                    Verrà utilizzato nel campo CODICE CONTRATTO durante la
                    sottoscrizione del cliente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requisiti Specifiche SII</CardTitle>
            <CardDescription>
              Informazioni tecniche sui campi richiesti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>PIVA_UTENTE:</strong> Rappresenta la partita IVA
                  dell'utente accreditato (Alfanumerico, max 16 caratteri)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>COD_OFFERTA:</strong> Codice univoco utilizzato nel
                  campo CODICE CONTRATTO durante le richieste di switching
                  (Alfanumerico, max 32 caratteri)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  Entrambi i campi accettano solo lettere maiuscole e numeri
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  Questi identificatori sono obbligatori per tutti i tipi di
                  offerta
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Stepper.Panel>
  )
}

export const BasicInfoStep = () => {
  return (
    <Suspense fallback={<BasicInfoSkeleton />}>
      <BasicInfoStepComponent />
    </Suspense>
  )
}
