'use client'

import { useFormContext } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { BasicInfoFormValues } from '@/lib/xml-generator/schemas'
import { xmlFormStepper } from '@/lib/xml-generator/stepperize-config'

export function BasicInfoStep() {
  const { Stepper } = xmlFormStepper
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
            Inserire la partita IVA e il codice offerta come richiesto dalle
            specifiche SII
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PIVA_UTENTE Field */}
          <div className="space-y-2">
            <label
              className="block font-medium text-primary text-sm"
              htmlFor="pivaUtente"
            >
              PIVA Utente (VAT Number) *
            </label>
            <Input
              id="pivaUtente"
              {...register('pivaUtente')}
              className="block w-full uppercase"
              maxLength={16}
              placeholder="IT12345678901"
              style={{ textTransform: 'uppercase' }}
            />
            <p className="text-muted-foreground text-xs">
              Partita IVA italiana (11-16 caratteri alfanumerici). Rappresenta
              la partita IVA dell&apos;utente accreditato.
            </p>
            {errors.pivaUtente && (
              <span className="text-destructive text-sm">
                {errors.pivaUtente.message}
              </span>
            )}
          </div>

          {/* COD_OFFERTA Field */}
          <div className="space-y-2">
            <label
              className="block font-medium text-primary text-sm"
              htmlFor="codOfferta"
            >
              Codice Offerta (Offer Code) *
            </label>
            <Input
              id="codOfferta"
              {...register('codOfferta')}
              className="block w-full uppercase"
              maxLength={32}
              placeholder="OFFER2024001"
              style={{ textTransform: 'uppercase' }}
            />
            <p className="text-muted-foreground text-xs">
              Codice offerta univoco (max 32 caratteri alfanumerici). Verrà
              utilizzato nel campo CODICE CONTRATTO durante la sottoscrizione
              del cliente.
            </p>
            {errors.codOfferta && (
              <span className="text-destructive text-sm">
                {errors.codOfferta.message}
              </span>
            )}
          </div>

          {/* Information Box */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900 text-sm">
              Requisiti Specifiche SII
            </h4>
            <ul className="space-y-1 text-blue-800 text-xs">
              <li>
                • PIVA_UTENTE: Rappresenta la partita IVA dell&apos;utente
                accreditato (Alfanumerico, max 16 caratteri)
              </li>
              <li>
                • COD_OFFERTA: Codice univoco utilizzato nel campo CODICE
                CONTRATTO durante le richieste di switching (Alfanumerico, max
                32 caratteri)
              </li>
              <li>
                • Entrambi i campi accettano solo lettere maiuscole e numeri
              </li>
              <li>
                • Questi identificatori sono obbligatori per tutti i tipi di
                offerta
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </Stepper.Panel>
  )
}
