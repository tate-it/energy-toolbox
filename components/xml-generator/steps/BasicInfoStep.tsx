'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { BasicInfoFormValues } from '@/lib/xml-generator/schemas'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'

export function BasicInfoStep() {
  const { Stepper} = xmlFormStepper
  const {
    register,
    formState: { errors },
  } = useFormContext<BasicInfoFormValues>()

  return (
    <Stepper.Panel>
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Informazioni di Base</CardTitle>
        <CardDescription>
          Inserire la partita IVA e il codice offerta come richiesto dalle specifiche SII
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PIVA_UTENTE Field */}
        <div className="space-y-2">
          <label
            htmlFor="pivaUtente"
            className="block text-sm font-medium text-primary"
          >
            PIVA Utente (VAT Number) *
          </label>
          <Input
            id="pivaUtente"
            {...register('pivaUtente')}
            placeholder="IT12345678901"
            className="block w-full uppercase"
            style={{ textTransform: 'uppercase' }}
            maxLength={16}
          />
          <p className="text-xs text-muted-foreground">
            Partita IVA italiana (11-16 caratteri alfanumerici). Rappresenta la partita IVA dell&apos;utente accreditato.
          </p>
          {errors.pivaUtente && (
            <span className="text-sm text-destructive">
              {errors.pivaUtente.message}
            </span>
          )}
        </div>

        {/* COD_OFFERTA Field */}
        <div className="space-y-2">
          <label
            htmlFor="codOfferta"
            className="block text-sm font-medium text-primary"
          >
            Codice Offerta (Offer Code) *
          </label>
          <Input
            id="codOfferta"
            {...register('codOfferta')}
            placeholder="OFFER2024001"
            className="block w-full uppercase"
            style={{ textTransform: 'uppercase' }}
            maxLength={32}
          />
          <p className="text-xs text-muted-foreground">
            Codice offerta univoco (max 32 caratteri alfanumerici). Verrà utilizzato nel campo CODICE CONTRATTO durante la sottoscrizione del cliente.
          </p>
          {errors.codOfferta && (
            <span className="text-sm text-destructive">
              {errors.codOfferta.message}
            </span>
          )}
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Requisiti Specifiche SII
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• PIVA_UTENTE: Rappresenta la partita IVA dell&apos;utente accreditato (Alfanumerico, max 16 caratteri)</li>
            <li>• COD_OFFERTA: Codice univoco utilizzato nel campo CODICE CONTRATTO durante le richieste di switching (Alfanumerico, max 32 caratteri)</li>
            <li>• Entrambi i campi accettano solo lettere maiuscole e numeri</li>
            <li>• Questi identificatori sono obbligatori per tutti i tipi di offerta</li>
          </ul>
        </div>
      </CardContent>
    </Card>
    </Stepper.Panel>
  )
} 