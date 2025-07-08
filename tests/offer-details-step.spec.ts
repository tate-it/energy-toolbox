import { expect, test } from '@playwright/test'

test.describe('OfferDetailsStep E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the XML generator page
    await page.goto('http://localhost:3000/xml-generator')

    // Fill in basic info step with valid PIVA and offer code
    await page
      .getByRole('textbox', { name: 'PIVA Utente (VAT Number) *' })
      .fill('IT12345678901')
    await page
      .getByRole('textbox', { name: 'Codice Offerta (Offer Code) *' })
      .fill('TESTOFFER2024')

    // Navigate to the offer details step
    await page.getByRole('tab', { name: '2' }).click()
    await expect(page.getByRole('tab', { name: '2' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('should display all field labels in Italian', async ({ page }) => {
    // Verify all field labels are in Italian
    await expect(page.getByText('Tipo di Mercato *')).toBeVisible()
    await expect(page.getByText('Tipo di Cliente *')).toBeVisible()
    await expect(page.getByText('Tipo di Offerta *')).toBeVisible()
    await expect(
      page.getByText('Tipologie di Attivazione Contratto *'),
    ).toBeVisible()
    await expect(page.getByText("Nome dell'Offerta *")).toBeVisible()
    await expect(page.getByText("Descrizione dell'Offerta *")).toBeVisible()
    await expect(page.getByText('Durata (mesi) *')).toBeVisible()
    await expect(page.getByText('Garanzie *')).toBeVisible()
  })

  test('should display market type dropdown options in Italian', async ({
    page,
  }) => {
    // Test market type dropdown options and translations
    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona tipo di mercato' })
      .click()

    // Verify Italian market type options
    await expect(page.getByRole('option', { name: 'Elettrico' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'Gas' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'Dual Fuel' })).toBeVisible()
  })

  test('should show conditional Offerta Singola field when Elettrico market type is selected', async ({
    page,
  }) => {
    // Select 'Elettrico' market type and verify 'Offerta Singola' field appears
    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona tipo di mercato' })
      .click()
    await page.getByRole('option', { name: 'Elettrico' }).click()

    // Verify the conditional field appears
    await expect(page.getByText('Offerta Singola *')).toBeVisible()
    await expect(
      page.getByRole('combobox').filter({
        hasText: "Seleziona se l'offerta può essere sottoscritta singolarmente",
      }),
    ).toBeVisible()
  })

  test('should display client type dropdown options in Italian', async ({
    page,
  }) => {
    // Test client type dropdown options and translations
    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona tipo di cliente' })
      .click()

    // Verify Italian client type options
    await expect(
      page.getByRole('option', { name: 'Domestico', exact: true }),
    ).toBeVisible()
    await expect(page.getByRole('option', { name: 'Altri Usi' })).toBeVisible()
    await expect(
      page.getByRole('option', { name: 'Condominio Uso Domestico (Gas)' }),
    ).toBeVisible()
  })

  test('should show conditional Stato Residenziale field when Domestico client type is selected', async ({
    page,
  }) => {
    // Select 'Domestico' client type and verify 'Stato Residenziale' field appears
    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona tipo di cliente' })
      .click()
    await page.getByRole('option', { name: 'Domestico', exact: true }).click()

    // Verify the conditional field appears
    await expect(
      page.getByText('Stato Residenziale', { exact: true }),
    ).toBeVisible()
    await expect(
      page
        .getByRole('combobox')
        .filter({ hasText: 'Seleziona stato residenziale' }),
    ).toBeVisible()
  })

  test('should display residential status dropdown options in Italian', async ({
    page,
  }) => {
    // First select Domestico to make residential status field visible
    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona tipo di cliente' })
      .click()
    await page.getByRole('option', { name: 'Domestico', exact: true }).click()

    // Test residential status dropdown options and translations
    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona stato residenziale' })
      .click()

    // Verify Italian residential status options
    await expect(
      page.getByRole('option', { name: 'Domestico Residente' }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: 'Domestico Non Residente' }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: 'Tutti i tipi' }),
    ).toBeVisible()
  })

  test('should display offer type dropdown options in Italian', async ({
    page,
  }) => {
    // Test offer type dropdown options and translations
    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona tipo di offerta' })
      .click()

    // Verify Italian offer type options
    await expect(page.getByRole('option', { name: 'Fisso' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'Variabile' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'FLAT' })).toBeVisible()
  })

  test('should display contract activation checkboxes with Italian labels', async ({
    page,
  }) => {
    // Test contract activation checkboxes with Italian labels
    await expect(page.getByRole('checkbox', { name: 'Sempre' })).toBeVisible()
    await expect(
      page.getByRole('checkbox', { name: 'Cambio Fornitore' }),
    ).toBeVisible()
    await expect(
      page.getByRole('checkbox', {
        name: 'Prima Attivazione (Contatore non presente)',
      }),
    ).toBeVisible()
    await expect(
      page.getByRole('checkbox', {
        name: 'Riattivazione (Contatore presente ma disattivato)',
      }),
    ).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Voltura' })).toBeVisible()

    // Test checkbox functionality
    await page.getByRole('checkbox', { name: 'Cambio Fornitore' }).click()
    await expect(
      page.getByRole('checkbox', { name: 'Cambio Fornitore' }),
    ).toBeChecked()
  })

  test('should allow filling all required text fields', async ({ page }) => {
    // Fill in all required text fields
    await page
      .getByRole('textbox', { name: "Nome dell'Offerta *" })
      .fill('Offerta Test Elettrico')
    await page
      .getByRole('textbox', { name: "Descrizione dell'Offerta *" })
      .fill(
        "Descrizione dettagliata dell'offerta di test per il mercato elettrico",
      )
    await page.getByRole('spinbutton', { name: 'Durata (mesi) *' }).fill('24')
    await page.getByRole('textbox', { name: 'Garanzie *' }).fill('NO')

    // Verify values are filled
    await expect(
      page.getByRole('textbox', { name: "Nome dell'Offerta *" }),
    ).toHaveValue('Offerta Test Elettrico')
    await expect(
      page.getByRole('textbox', { name: "Descrizione dell'Offerta *" }),
    ).toHaveValue(
      "Descrizione dettagliata dell'offerta di test per il mercato elettrico",
    )
    await expect(
      page.getByRole('spinbutton', { name: 'Durata (mesi) *' }),
    ).toHaveValue('24')
    await expect(page.getByRole('textbox', { name: 'Garanzie *' })).toHaveValue(
      'NO',
    )
  })

  test('should validate required fields', async ({ page }) => {
    // Try to navigate to next step without filling required fields
    await page.getByRole('button', { name: 'Successivo' }).click()

    // Wait a moment for any navigation to complete
    await page.waitForTimeout(1000)

    // Form should remain on the same step due to validation errors
    // Check that we haven't navigated to step 3
    await expect(page.getByRole('tab', { name: '3' })).not.toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('should test conditional field logic for different market types', async ({
    page,
  }) => {
    // Test Elettrico market type shows Offerta Singola field
    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona tipo di mercato' })
      .click()
    await page.getByRole('option', { name: 'Elettrico' }).click()
    await expect(page.getByText('Offerta Singola *')).toBeVisible()

    // Test Gas market type shows Offerta Singola field
    await page.getByRole('combobox').filter({ hasText: 'Elettrico' }).click()
    await page.getByRole('option', { name: 'Gas' }).click()
    await expect(page.getByText('Offerta Singola *')).toBeVisible()

    // Test Dual Fuel market type hides Offerta Singola field
    await page.getByRole('combobox').filter({ hasText: 'Gas' }).click()
    await page.getByRole('option', { name: 'Dual Fuel' }).click()
    await expect(page.getByText('Offerta Singola *')).not.toBeVisible()
  })

  test('should test conditional field logic for different client types', async ({
    page,
  }) => {
    // Test Domestico client type shows Stato Residenziale field
    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona tipo di cliente' })
      .click()
    await page.getByRole('option', { name: 'Domestico', exact: true }).click()
    await expect(
      page.getByText('Stato Residenziale', { exact: true }),
    ).toBeVisible()

    // Test Altri Usi client type hides Stato Residenziale field
    await page.getByRole('combobox').filter({ hasText: 'Domestico' }).click()
    await page.getByRole('option', { name: 'Altri Usi' }).click()
    await expect(
      page.getByText('Stato Residenziale', { exact: true }),
    ).not.toBeVisible()

    // Test Condominio client type hides Stato Residenziale field
    await page.getByRole('combobox').filter({ hasText: 'Altri Usi' }).click()
    await page
      .getByRole('option', { name: 'Condominio Uso Domestico (Gas)' })
      .click()
    await expect(
      page.getByText('Stato Residenziale', { exact: true }),
    ).not.toBeVisible()
  })

  test('should complete form with valid data and navigate to next step', async ({
    page,
  }) => {
    // Fill all required fields with valid data
    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona tipo di mercato' })
      .click()
    await page.getByRole('option', { name: 'Elettrico' }).click()

    await page
      .getByRole('combobox')
      .filter({
        hasText: "Seleziona se l'offerta può essere sottoscritta singolarmente",
      })
      .click()
    await page
      .getByRole('option', {
        name: 'Sì - può essere sottoscritta singolarmente',
      })
      .click()

    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona tipo di cliente' })
      .click()
    await page.getByRole('option', { name: 'Domestico', exact: true }).click()

    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona stato residenziale' })
      .click()
    await page.getByRole('option', { name: 'Domestico Residente' }).click()

    await page
      .getByRole('combobox')
      .filter({ hasText: 'Seleziona tipo di offerta' })
      .click()
    await page.getByRole('option', { name: 'Fisso' }).click()

    // Select at least one contract activation type
    await page.getByRole('checkbox', { name: 'Cambio Fornitore' }).click()

    // Fill text fields
    await page
      .getByRole('textbox', { name: "Nome dell'Offerta *" })
      .fill('Offerta Test Completa')
    await page
      .getByRole('textbox', { name: "Descrizione dell'Offerta *" })
      .fill("Descrizione completa dell'offerta di test")
    await page.getByRole('spinbutton', { name: 'Durata (mesi) *' }).fill('12')
    await page.getByRole('textbox', { name: 'Garanzie *' }).fill('NO')

    // Try to navigate to next step
    await page.getByRole('button', { name: 'Successivo' }).click()

    // Should successfully navigate to next step (step 3)
    await expect(page.getByRole('tab', { name: '3' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('should display help text for duration field', async ({ page }) => {
    // Verify help text is displayed in Italian
    await expect(
      page.getByText(
        'Inserisci -1 per durata indeterminata o un valore da 1 a 99 mesi',
      ),
    ).toBeVisible()
  })

  test('should display help text for guarantees field', async ({ page }) => {
    // Verify help text is displayed in Italian
    await expect(
      page.getByText(
        'Inserisci "NO" se non sono richieste garanzie, altrimenti descrivi le garanzie richieste come cauzioni o domiciliazioni',
      ),
    ).toBeVisible()
  })

  test('should allow navigation back to previous step', async ({ page }) => {
    // Click previous button
    await page.getByRole('button', { name: 'Precedente' }).click()

    // Should navigate back to step 1
    await expect(page.getByRole('tab', { name: '1' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })
})
