import { expect, test } from '@playwright/test'

test.describe('ActivationContactsStep E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the XML generator application
    await page.goto('http://localhost:3000/xml-generator')

    // Fill out basic information step with valid PIVA and offer code
    await page
      .getByRole('textbox', { name: 'PIVA Utente (VAT Number) *' })
      .fill('IT12345678901')
    await page
      .getByRole('textbox', { name: 'Codice Offerta (Offer Code) *' })
      .fill('OFFERTA123')

    // Navigate to the ActivationContactsStep (step 3)
    await page.getByRole('tab', { name: '3' }).click()
  })

  test('displays correct Italian labels and headings', async ({ page }) => {
    // Verify Italian labels and headings are displayed correctly
    await expect(
      page.getByRole('heading', { name: 'Attivazione e Contatti', level: 2 }),
    ).toBeVisible()
    await expect(
      page.getByText(
        "Configura i metodi di attivazione e le informazioni di contatto per l'offerta",
      ),
    ).toBeVisible()
    await expect(
      page
        .locator('[data-slot="card-title"]')
        .filter({ hasText: 'Metodi di Attivazione' }),
    ).toBeVisible()
    await expect(
      page
        .locator('[data-slot="card-title"]')
        .filter({ hasText: 'Informazioni di Contatto' }),
    ).toBeVisible()

    // Verify all activation method options are displayed in Italian
    await expect(page.getByText('Attivazione solo web')).toBeVisible()
    await expect(page.getByText('Attivazione qualsiasi canale')).toBeVisible()
    await expect(page.getByText('Punto vendita')).toBeVisible()
    await expect(page.getByText('Teleselling')).toBeVisible()
    await expect(page.getByText('Agenzia')).toBeVisible()
    await expect(page.getByText('Altro')).toBeVisible()

    // Verify contact information fields are displayed in Italian
    await expect(page.getByText('Numero di Telefono *')).toBeVisible()
    await expect(page.getByText('Sito Web del Venditore')).toBeVisible()
    await expect(page.getByText("URL dell'Offerta")).toBeVisible()
  })

  test('allows selecting multiple activation methods', async ({ page }) => {
    // Test activation methods selection - select multiple methods
    const webOnlyCheckbox = page.getByRole('checkbox', {
      name: 'Attivazione solo web',
    })
    const pointOfSaleCheckbox = page.getByRole('checkbox', {
      name: 'Punto vendita',
    })

    await webOnlyCheckbox.click()
    await pointOfSaleCheckbox.click()

    // Verify both checkboxes are checked
    await expect(webOnlyCheckbox).toBeChecked()
    await expect(pointOfSaleCheckbox).toBeChecked()
  })

  test('shows and hides conditional description field based on "Altro" selection', async ({
    page,
  }) => {
    const otherCheckbox = page.getByRole('checkbox', { name: 'Altro' })

    // Initially, description field should not be visible
    await expect(
      page.getByText('Descrizione Metodo Attivazione'),
    ).not.toBeVisible()

    // Test conditional field behavior - select 'Altro' and verify description field appears
    await otherCheckbox.click()
    await expect(page.getByText('Descrizione Metodo Attivazione')).toBeVisible()
    await expect(
      page.getByRole('textbox', { name: 'Descrizione Metodo Attivazione *' }),
    ).toBeVisible()

    // Test deselecting 'Altro' and verify description field disappears
    await otherCheckbox.click()
    await expect(
      page.getByText('Descrizione Metodo Attivazione'),
    ).not.toBeVisible()
  })

  test('fills out activation description when "Altro" is selected', async ({
    page,
  }) => {
    // Select "Altro" to show description field
    await page.getByRole('checkbox', { name: 'Altro' }).click()

    // Fill out activation description
    const descriptionField = page.getByRole('textbox', {
      name: 'Descrizione Metodo Attivazione *',
    })
    await descriptionField.fill(
      'Attivazione tramite consulente commerciale specializzato',
    )

    // Verify the text was entered correctly
    await expect(descriptionField).toHaveValue(
      'Attivazione tramite consulente commerciale specializzato',
    )
  })

  test('fills out contact information fields with valid data', async ({
    page,
  }) => {
    // Fill out contact information fields with valid data
    await page
      .getByRole('textbox', { name: 'Numero di Telefono *' })
      .fill('+39 02 1234567')
    await page
      .getByRole('textbox', { name: 'Sito Web del Venditore' })
      .fill('https://www.energiaitaliana.it')
    await page
      .getByRole('textbox', { name: "URL dell'Offerta" })
      .fill('https://www.energiaitaliana.it/offerta-verde')

    // Verify all fields have the correct values
    await expect(
      page.getByRole('textbox', { name: 'Numero di Telefono *' }),
    ).toHaveValue('+39 02 1234567')
    await expect(
      page.getByRole('textbox', { name: 'Sito Web del Venditore' }),
    ).toHaveValue('https://www.energiaitaliana.it')
    await expect(
      page.getByRole('textbox', { name: "URL dell'Offerta" }),
    ).toHaveValue('https://www.energiaitaliana.it/offerta-verde')
  })

  test('validates required fields before proceeding', async ({ page }) => {
    // Clear any existing values and try to proceed without required fields
    await page.getByRole('textbox', { name: 'Numero di Telefono *' }).clear()

    // Try to proceed to next step
    await page.getByRole('button', { name: 'Successivo' }).click()

    // Wait for validation to trigger
    await page.waitForTimeout(1000)

    // Should still be on the same step due to validation
    await expect(
      page.getByRole('heading', { name: 'Attivazione e Contatti', level: 2 }),
    ).toBeVisible()
  })

  test('navigates to next step with valid data submission', async ({
    page,
  }) => {
    // Select activation methods
    await page.getByRole('checkbox', { name: 'Attivazione solo web' }).click()
    await page.getByRole('checkbox', { name: 'Punto vendita' }).click()

    // Fill out required contact information
    await page
      .getByRole('textbox', { name: 'Numero di Telefono *' })
      .fill('+39 02 1234567')
    await page
      .getByRole('textbox', { name: 'Sito Web del Venditore' })
      .fill('https://www.energiaitaliana.it')
    await page
      .getByRole('textbox', { name: "URL dell'Offerta" })
      .fill('https://www.energiaitaliana.it/offerta-verde')

    // Navigate to next step
    await page.getByRole('button', { name: 'Successivo' }).click()

    // Verify we moved to the next step (step 4)
    await expect(page.getByRole('tab', { name: '4' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('navigates back to previous step', async ({ page }) => {
    // Click previous button
    await page.getByRole('button', { name: 'Precedente' }).click()

    // Verify we moved to the previous step (step 2)
    await expect(page.getByRole('tab', { name: '2' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('maintains form state when navigating between steps', async ({
    page,
  }) => {
    // Fill out form data
    await page.getByRole('checkbox', { name: 'Attivazione solo web' }).click()
    await page
      .getByRole('textbox', { name: 'Numero di Telefono *' })
      .fill('+39 02 1234567')

    // Navigate to previous step
    await page.getByRole('button', { name: 'Precedente' }).click()

    // Navigate back to current step
    await page.getByRole('tab', { name: '3' }).click()

    // Verify form data is preserved
    await expect(
      page.getByRole('checkbox', { name: 'Attivazione solo web' }),
    ).toBeChecked()
    await expect(
      page.getByRole('textbox', { name: 'Numero di Telefono *' }),
    ).toHaveValue('+39 02 1234567')
  })
})
