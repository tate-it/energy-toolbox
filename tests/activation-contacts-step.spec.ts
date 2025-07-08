import { expect, test } from '@playwright/test'

// Define regex at top level for performance
const ACTIVATION_CONTACTS_URL_PATTERN = /activationContacts=/
const ANY_ACCESSIBLE_NAME_PATTERN = /./
const PHONE_ACCESSIBLE_NAME_PATTERN = /Numero di Telefono/
const WEBSITE_ACCESSIBLE_NAME_PATTERN = /Sito Web del Venditore/
const URL_ACCESSIBLE_NAME_PATTERN = /URL dell'Offerta/

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
    await expect(page.getByText('Informazioni di Contatto')).toBeVisible()

    // Verify all activation method options are displayed in Italian
    await expect(page.getByText('Attivazione solo web')).toBeVisible()
    await expect(page.getByText('Attivazione qualsiasi canale')).toBeVisible()
    await expect(page.getByText('Punto vendita')).toBeVisible()
    await expect(page.getByText('Teleselling')).toBeVisible()
    await expect(page.getByText('Agenzia')).toBeVisible()
    await expect(page.getByText('Altro')).toBeVisible()

    // Verify contact information fields are displayed in Italian
    await expect(page.getByText('Numero di Telefono')).toBeVisible()
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

  test('accepts invalid phone number and URL formats without client-side blocking', async ({
    page,
  }) => {
    // Test phone number validation with invalid format
    const phoneField = page.getByRole('textbox', {
      name: 'Numero di Telefono *',
    })
    await phoneField.fill('invalid-phone-123@test')
    await expect(phoneField).toHaveValue('invalid-phone-123@test')

    // Test URL validation for vendor website with invalid format
    const vendorWebsiteField = page.getByRole('textbox', {
      name: 'Sito Web del Venditore',
    })
    await vendorWebsiteField.fill('invalid-url-test')
    await expect(vendorWebsiteField).toHaveValue('invalid-url-test')

    // Note: Client-side validation may occur on form submission or field blur
    // This test verifies that invalid input can be entered (validation happens later)
  })

  test('preserves form state when navigating between steps', async ({
    page,
  }) => {
    // Fill out the form with test data
    await page.getByRole('checkbox', { name: 'Attivazione solo web' }).click()
    await page.getByRole('checkbox', { name: 'Punto vendita' }).click()
    await page.getByRole('checkbox', { name: 'Altro' }).click()
    await page
      .getByRole('textbox', { name: 'Descrizione Metodo Attivazione *' })
      .fill('Test description')
    await page
      .getByRole('textbox', { name: 'Numero di Telefono *' })
      .fill('+39 02 1234567')
    await page
      .getByRole('textbox', { name: 'Sito Web del Venditore' })
      .fill('https://www.test.it')
    await page
      .getByRole('textbox', { name: "URL dell'Offerta" })
      .fill('https://www.test.it/offerta')

    // Navigate to another step
    await page.getByRole('tab', { name: '1' }).click()
    await expect(
      page.getByRole('textbox', { name: 'PIVA Utente (VAT Number) *' }),
    ).toHaveValue('IT12345678901')

    // Navigate back to ActivationContactsStep
    await page.getByRole('tab', { name: '3' }).click()

    // Verify form state persistence - all data should be preserved
    await expect(
      page.getByRole('checkbox', { name: 'Attivazione solo web' }),
    ).toBeChecked()
    await expect(
      page.getByRole('checkbox', { name: 'Punto vendita' }),
    ).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Altro' })).toBeChecked()
    await expect(
      page.getByRole('textbox', { name: 'Descrizione Metodo Attivazione *' }),
    ).toHaveValue('Test description')
    await expect(
      page.getByRole('textbox', { name: 'Numero di Telefono *' }),
    ).toHaveValue('+39 02 1234567')
    await expect(
      page.getByRole('textbox', { name: 'Sito Web del Venditore' }),
    ).toHaveValue('https://www.test.it')
    await expect(
      page.getByRole('textbox', { name: "URL dell'Offerta" }),
    ).toHaveValue('https://www.test.it/offerta')
  })

  test('displays required field indicators and help text', async ({ page }) => {
    // Verify required field indicators (asterisks) are displayed
    await expect(page.getByText('Modalità di Attivazione *')).toBeVisible()
    await expect(page.getByText('Numero di Telefono *')).toBeVisible()

    // Verify help text is displayed in Italian
    await expect(
      page.getByText(
        'Numero di telefono per il supporto clienti (massimo 15 caratteri)',
      ),
    ).toBeVisible()
    await expect(
      page.getByText(
        'URL del sito web aziendale (opzionale, massimo 100 caratteri)',
      ),
    ).toBeVisible()
    await expect(
      page.getByText(
        "URL specifico dell'offerta (opzionale, massimo 100 caratteri)",
      ),
    ).toBeVisible()
  })

  test('allows deselecting activation methods', async ({ page }) => {
    // Select multiple methods first
    const webOnlyCheckbox = page.getByRole('checkbox', {
      name: 'Attivazione solo web',
    })
    const pointOfSaleCheckbox = page.getByRole('checkbox', {
      name: 'Punto vendita',
    })

    await webOnlyCheckbox.click()
    await pointOfSaleCheckbox.click()

    // Verify both are checked
    await expect(webOnlyCheckbox).toBeChecked()
    await expect(pointOfSaleCheckbox).toBeChecked()

    // Deselect one method
    await webOnlyCheckbox.click()

    // Verify the state is correct
    await expect(webOnlyCheckbox).not.toBeChecked()
    await expect(pointOfSaleCheckbox).toBeChecked()
  })

  test('completes full workflow with valid data submission', async ({
    page,
  }) => {
    // Fill out complete form with valid data
    await page.getByRole('checkbox', { name: 'Attivazione solo web' }).click()
    await page.getByRole('checkbox', { name: 'Punto vendita' }).click()
    await page.getByRole('checkbox', { name: 'Altro' }).click()
    await page
      .getByRole('textbox', { name: 'Descrizione Metodo Attivazione *' })
      .fill('Attivazione tramite consulente commerciale specializzato')
    await page
      .getByRole('textbox', { name: 'Numero di Telefono *' })
      .fill('+39 02 1234567')
    await page
      .getByRole('textbox', { name: 'Sito Web del Venditore' })
      .fill('https://www.energiaitaliana.it')
    await page
      .getByRole('textbox', { name: "URL dell'Offerta" })
      .fill('https://www.energiaitaliana.it/offerta-verde')

    // Test form submission with complete valid data
    await page.getByRole('button', { name: 'Successivo' }).click()

    // Handle the debug alert dialog that appears
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    // Verify the URL contains the form data (indicating successful submission)
    await expect(page).toHaveURL(ACTIVATION_CONTACTS_URL_PATTERN)

    // Verify we're still on the same step (since next steps aren't implemented yet)
    await expect(page.getByRole('tab', { name: '3' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('has proper accessibility attributes', async ({ page }) => {
    // Verify checkboxes have accessible names
    const checkboxes = page.getByRole('checkbox')
    const checkboxCount = await checkboxes.count()

    // Verify all checkboxes have accessible names
    const checkboxPromises: Promise<void>[] = []
    for (let i = 0; i < checkboxCount; i++) {
      const checkbox = checkboxes.nth(i)
      checkboxPromises.push(
        expect(checkbox).toHaveAccessibleName(ANY_ACCESSIBLE_NAME_PATTERN),
      )
    }
    await Promise.all(checkboxPromises)

    // Verify inputs have accessible names
    await expect(
      page.getByRole('textbox', { name: 'Numero di Telefono *' }),
    ).toHaveAccessibleName(PHONE_ACCESSIBLE_NAME_PATTERN)
    await expect(
      page.getByRole('textbox', { name: 'Sito Web del Venditore' }),
    ).toHaveAccessibleName(WEBSITE_ACCESSIBLE_NAME_PATTERN)
    await expect(
      page.getByRole('textbox', { name: "URL dell'Offerta" }),
    ).toHaveAccessibleName(URL_ACCESSIBLE_NAME_PATTERN)
  })
})
