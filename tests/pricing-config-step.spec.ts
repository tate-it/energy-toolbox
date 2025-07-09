import { expect, test } from '@playwright/test'

test.describe('PricingConfigStep - Complete Functionality Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000/xml-generator')

    // Fill basic information step
    await page
      .getByRole('textbox', { name: 'PIVA Utente (VAT Number) *' })
      .fill('IT12345678901')
    await page
      .getByRole('textbox', { name: 'Codice Offerta (Offer Code) *' })
      .fill('OFFER2024TEST')

    // Navigate to offer details step
    await page.getByRole('tab', { name: '2' }).click()

    // Handle any dialogs that appear
    page.on('dialog', (dialog) => dialog.accept())

    // Configure offer details for electricity market with variable pricing
    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona tipo di mercato' })
      .click()
    await page.getByRole('option', { name: 'Elettrico' }).click()

    await page
      .getByRole('combobox')
      .filter({ hasText: "Seleziona se l'offerta può" })
      .click()
    await page
      .getByRole('option', { name: 'Sì - può essere sottoscritta' })
      .click()

    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona tipo di cliente' })
      .click()
    await page.getByRole('option', { name: 'Domestico', exact: true }).click()

    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona tipo di offerta' })
      .click()
    await page.getByRole('option', { name: 'Variabile' }).click()

    // Fill required fields
    await page.getByRole('checkbox', { name: 'Sempre' }).click()
    await page
      .getByRole('textbox', { name: "Nome dell'Offerta *" })
      .fill('Offerta Test Elettrica Variabile')
    await page
      .getByRole('textbox', { name: "Descrizione dell'Offerta *" })
      .fill(
        'Offerta elettrica a prezzo variabile per clienti domestici con configurazione di fasce orarie e dispacciamento',
      )
    await page.getByRole('spinbutton', { name: 'Durata (mesi) *' }).fill('12')
    await page.getByRole('textbox', { name: 'Garanzie *' }).fill('NO')

    // Navigate to pricing configuration step
    await page.getByRole('tab', { name: '4' }).click()
  })

  test('should display all main sections for electricity variable offers', async ({
    page,
  }) => {
    // Verify the main heading and description are in Italian
    await expect(
      page.getByRole('heading', { name: 'Configurazione Prezzi', level: 2 }),
    ).toBeVisible()
    await expect(
      page.getByText(
        "Configura i prezzi dell'energia, le fasce orarie e i componenti di dispacciamento",
      ),
    ).toBeVisible()

    // Verify Energy Price References section is visible (conditional on variable offer type)
    await expect(
      page.getByText('Riferimenti Prezzo Energia').first(),
    ).toBeVisible()
    await expect(
      page.getByText('Indice di prezzo per le offerte a prezzo variabile'),
    ).toBeVisible()

    // Verify Time Band Configuration section is visible (conditional on electricity market)
    await expect(
      page.getByText('Configurazione Fasce Orarie').first(),
    ).toBeVisible()
    await expect(
      page.getByText(
        'Tipo di configurazione delle fasce orarie per le offerte elettriche',
      ),
    ).toBeVisible()

    // Verify Dispatching section is visible (conditional on electricity market)
    await expect(page.getByText('Dispacciamento').first()).toBeVisible()
    await expect(
      page.getByText('Componenti di dispacciamento per le offerte elettriche'),
    ).toBeVisible()

    // Verify Help Information section
    await expect(page.getByText('Informazioni di Aiuto')).toBeVisible()
  })

  test('should handle energy price index selection and conditional fields', async ({
    page,
  }) => {
    // Test energy price index dropdown
    await page.getByRole('combobox', { name: 'Indice Prezzo Energia' }).click()

    // Verify all energy price index options are available
    await expect(
      page.getByRole('option', { name: 'PUN (Quarterly)' }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: 'TTF (Monthly)' }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: 'Other (Not managed by Portal)' }),
    ).toBeVisible()

    // Select 'Other' to trigger conditional field
    await page
      .getByRole('option', { name: 'Other (Not managed by Portal)' })
      .click()

    // Wait for the conditional field to appear and verify
    await expect(page.getByText('Descrizione Indice Alternativo')).toBeVisible({
      timeout: 10_000,
    })
    await expect(
      page.getByRole('textbox', { name: 'Descrizione Indice Alternativo' }),
    ).toBeVisible()
    await expect(
      page.getByText(
        "Descrizione dell'indice alternativo (max 3000 caratteri)",
      ),
    ).toBeVisible()
  })

  test('should handle time band configuration and weekly time bands', async ({
    page,
  }) => {
    // Test time band configuration dropdown
    await page.getByRole('combobox', { name: 'Tipologia Fasce' }).click()

    // Verify all time band configuration options
    await expect(page.getByRole('option', { name: 'Monorario' })).toBeVisible()
    await expect(
      page.getByRole('option', { name: 'F1, F2', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: 'F1, F2, F3 (Standard)', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: 'F1, F2, F3, F4', exact: true }),
    ).toBeVisible()

    // Select 'F1, F2' to trigger weekly time bands
    await page.getByRole('option', { name: 'F1, F2', exact: true }).click()

    // Verify weekly time bands section appears
    await expect(
      page.getByRole('heading', { name: 'Fasce Orarie Settimanali' }),
    ).toBeVisible()
    await expect(
      page.getByText('Formato: XXI-YI,XXII-YII,...,XXN-YN'),
    ).toBeVisible()

    // Verify all 8 day fields are present (Monday through Sunday + Holidays)
    await expect(page.getByRole('textbox', { name: 'Lunedì' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Martedì' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Mercoledì' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Giovedì' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Venerdì' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Sabato' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Domenica' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Festività' })).toBeVisible()
  })

  test('should handle dispatching components with add/remove functionality', async ({
    page,
  }) => {
    // Add first dispatching component
    await page.getByRole('button', { name: 'Aggiungi Componente' }).click()

    // Verify first component appears
    await expect(
      page.getByRole('heading', { name: 'Componente Dispacciamento 1' }),
    ).toBeVisible()
    await expect(
      page.getByRole('combobox', { name: 'Tipo Dispacciamento' }),
    ).toBeVisible()
    await expect(
      page.getByRole('textbox', { name: 'Nome Componente' }),
    ).toBeVisible()

    // Test dispatching type dropdown
    await page.getByRole('combobox', { name: 'Tipo Dispacciamento' }).click()

    // Verify dispatching type options
    await expect(
      page.getByRole('option', { name: 'Disp. del.111/06' }),
    ).toBeVisible()
    await expect(page.getByRole('option', { name: 'PD' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'MSD' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'Altro' })).toBeVisible()

    // Select 'Altro' to trigger value field
    await page.getByRole('option', { name: 'Altro' }).click()

    // Verify dispatching value field appears
    await expect(page.getByText('Valore Dispacciamento')).toBeVisible()
    await expect(
      page.getByRole('spinbutton', { name: 'Valore Dispacciamento' }),
    ).toBeVisible()
    await expect(
      page.getByText("Valore numerico con separatore decimale '.'"),
    ).toBeVisible()

    // Add second dispatching component
    await page.getByRole('button', { name: 'Aggiungi Componente' }).click()

    // Verify second component appears
    await expect(
      page.getByRole('heading', { name: 'Componente Dispacciamento 2' }),
    ).toBeVisible()

    // Delete second component
    await page
      .getByRole('heading', { name: 'Componente Dispacciamento 2' })
      .locator('..')
      .getByRole('button')
      .first()
      .click()

    // Verify second component is removed but first remains
    await expect(
      page.getByRole('heading', { name: 'Componente Dispacciamento 2' }),
    ).not.toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Componente Dispacciamento 1' }),
    ).toBeVisible()

    // Verify first component's configuration is preserved
    await expect(
      page.getByRole('combobox', { name: 'Tipo Dispacciamento' }),
    ).toHaveText('Altro')
    await expect(
      page.getByRole('spinbutton', { name: 'Valore Dispacciamento' }),
    ).toBeVisible()
  })

  test('should display comprehensive help information in Italian', async ({
    page,
  }) => {
    // Verify help section content is in Italian - use partial text matching
    await expect(
      page.getByText('Obbligatorio solo per offerte a prezzo variabile'),
    ).toBeVisible()
    await expect(
      page.getByText('Obbligatorio per il mercato elettrico quando'),
    ).toBeVisible()
    await expect(
      page.getByText('Obbligatorio quando la configurazione è'),
    ).toBeVisible()
    await expect(
      page.getByText('È possibile aggiungere più componenti'),
    ).toBeVisible()
  })

  test('should handle form navigation correctly', async ({ page }) => {
    // Verify navigation buttons are present
    await expect(page.getByRole('button', { name: 'Precedente' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Successivo' })).toBeVisible()

    // Verify current step is highlighted
    await expect(page.getByRole('tab', { name: '4' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(
      page.getByRole('heading', { name: 'Configurazione Prezzi', level: 4 }),
    ).toBeVisible()
  })

  test('should maintain proper form state and validation', async ({ page }) => {
    // Fill out some fields and verify they maintain their values
    await page.getByRole('combobox', { name: 'Indice Prezzo Energia' }).click()
    await page.getByRole('option', { name: 'PUN (Quarterly)' }).click()

    await page.getByRole('combobox', { name: 'Tipologia Fasce' }).click()
    await page.getByRole('option', { name: 'Monorario' }).click()

    // Navigate away and back to verify state persistence
    await page.getByRole('tab', { name: '3' }).click()
    await page.getByRole('tab', { name: '4' }).click()

    // Verify selections are maintained
    await expect(
      page.getByRole('combobox', { name: 'Indice Prezzo Energia' }),
    ).toHaveText('PUN (Quarterly)')
    await expect(
      page.getByRole('combobox', { name: 'Tipologia Fasce' }),
    ).toHaveText('Monorario')
  })
})
