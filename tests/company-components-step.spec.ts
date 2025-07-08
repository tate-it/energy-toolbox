import { expect, test } from '@playwright/test'

test.describe('CompanyComponentsStep E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to XML generator page
    await page.goto('http://localhost:3000/xml-generator')
    await expect(page).toHaveTitle('Generatore XML Offerte SII')

    // Fill basic information (Step 1)
    await page
      .getByRole('textbox', { name: 'PIVA Utente (VAT Number) *' })
      .fill('12345678901')
    await page
      .getByRole('textbox', { name: 'Codice Offerta (Offer Code) *' })
      .fill('TEST123')
    await page.getByRole('button', { name: 'Successivo' }).click()

    // Fill offer details (Step 2) - minimum required fields
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

    // Navigate directly to step 5 (Componenti Impresa)
    await page.getByRole('tab', { name: '5' }).click()
    await expect(
      page.getByRole('heading', { name: 'Componenti Impresa', level: 2 }),
    ).toBeVisible()
  })

  test('should display regulated components section with electricity components', async ({
    page,
  }) => {
    // Verify regulated components section
    await expect(page.getByText('Componenti Regolate')).toBeVisible()
    await expect(
      page.getByText(
        'Seleziona i componenti regolati in base al tipo di mercato (Elettricità)',
      ),
    ).toBeVisible()

    // Verify electricity-specific regulated components
    await expect(page.getByRole('checkbox', { name: 'PCV (01)' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'PPE (02)' })).toBeVisible()
    await expect(page.getByText('PCV (01)')).toBeVisible()
    await expect(page.getByText('PPE (02)')).toBeVisible()
  })

  test('should allow selecting regulated components', async ({ page }) => {
    // Test PCV checkbox selection
    const pcvCheckbox = page.getByRole('checkbox', { name: 'PCV (01)' })
    await expect(pcvCheckbox).not.toBeChecked()

    await pcvCheckbox.click()
    await expect(pcvCheckbox).toBeChecked()

    // Test PPE checkbox selection
    const ppeCheckbox = page.getByRole('checkbox', { name: 'PPE (02)' })
    await ppeCheckbox.click()
    await expect(ppeCheckbox).toBeChecked()

    // Verify both can be selected together
    await expect(pcvCheckbox).toBeChecked()
    await expect(ppeCheckbox).toBeChecked()
  })

  test('should display company components section with add button', async ({
    page,
  }) => {
    // Verify company components section - use more specific selectors to avoid strict mode violations
    await expect(
      page
        .locator('[data-slot="card-title"]')
        .filter({ hasText: 'Componenti Aziendali' })
        .first(),
    ).toBeVisible()
    await expect(
      page.getByText(
        'Aggiungi i componenti aziendali con i relativi intervalli di prezzo',
      ),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Aggiungi Componente Aziendale' }),
    ).toBeVisible()
  })

  test('should allow adding and configuring company components', async ({
    page,
  }) => {
    // Click add company component button
    await page
      .getByRole('button', { name: 'Aggiungi Componente Aziendale' })
      .click()

    // Verify Component 1 form appears
    await expect(page.getByText('Componente 1')).toBeVisible()
    await expect(
      page.getByText(
        'Configura il componente aziendale e i suoi intervalli di prezzo',
      ),
    ).toBeVisible()

    // Verify all required form fields are present
    await expect(
      page.getByRole('textbox', { name: 'Nome Componente *' }),
    ).toBeVisible()
    await expect(
      page.getByRole('combobox', { name: 'Tipo Componente *' }),
    ).toBeVisible()
    await expect(
      page.getByRole('combobox', { name: 'Macroarea *' }),
    ).toBeVisible()
    await expect(
      page.getByRole('textbox', { name: 'Descrizione *' }),
    ).toBeVisible()

    // Verify help text
    await expect(page.getByText('Massimo 3000 caratteri')).toBeVisible()

    // Fill component name
    await page
      .getByRole('textbox', { name: 'Nome Componente *' })
      .fill('Test Component')
    await expect(
      page.getByRole('textbox', { name: 'Nome Componente *' }),
    ).toHaveValue('Test Component')

    // Fill description
    await page
      .getByRole('textbox', { name: 'Descrizione *' })
      .fill('Test component description')
    await expect(
      page.getByRole('textbox', { name: 'Descrizione *' }),
    ).toHaveValue('Test component description')
  })

  test('should display default values for component type and macro area', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'Aggiungi Componente Aziendale' })
      .click()

    // Verify default values
    await expect(
      page.getByRole('combobox', { name: 'Tipo Componente *' }),
    ).toContainText('STANDARD - Price included')
    await expect(
      page.getByRole('combobox', { name: 'Macroarea *' }),
    ).toContainText('Fixed commercialization fee')
  })

  test('should display price intervals section with all fields', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'Aggiungi Componente Aziendale' })
      .click()

    // Verify price intervals section
    await expect(
      page.getByRole('heading', { name: 'Intervalli di Prezzo', level: 4 }),
    ).toBeVisible()
    await expect(page.getByText('Intervallo 1')).toBeVisible()

    // Verify all price interval fields
    await expect(
      page.getByRole('spinbutton', { name: 'Prezzo *' }),
    ).toBeVisible()
    await expect(
      page.getByRole('combobox', { name: 'Unità di Misura *' }),
    ).toBeVisible()
    await expect(
      page.getByRole('spinbutton', { name: 'Consumo Da' }),
    ).toBeVisible()
    await expect(
      page.getByRole('spinbutton', { name: 'Consumo A' }),
    ).toBeVisible()
    await expect(
      page.getByRole('combobox', { name: 'Fascia Componente' }),
    ).toBeVisible()
    await expect(
      page.getByRole('textbox', { name: 'Data Inizio Validità' }),
    ).toBeVisible()
    await expect(
      page.getByRole('textbox', { name: 'Data Fine Validità' }),
    ).toBeVisible()

    // Verify date format help text
    await expect(page.getByText('Formato: gg/mm/aaaa').first()).toBeVisible()
    await expect(page.getByText('Formato: gg/mm/aaaa').nth(1)).toBeVisible()

    // Verify default price value
    await expect(
      page.getByRole('spinbutton', { name: 'Prezzo *' }),
    ).toHaveValue('0')

    // Verify default unit of measure
    await expect(
      page.getByRole('combobox', { name: 'Unità di Misura *' }),
    ).toContainText('€/Year')
  })

  test('should allow adding multiple price intervals', async ({ page }) => {
    await page
      .getByRole('button', { name: 'Aggiungi Componente Aziendale' })
      .click()

    // Add second price interval
    await page
      .getByRole('button', { name: 'Aggiungi Intervallo di Prezzo' })
      .click()

    // Verify both intervals are present
    await expect(page.getByText('Intervallo 1')).toBeVisible()
    await expect(page.getByText('Intervallo 2')).toBeVisible()

    // Verify remove buttons appear when multiple intervals exist - use more specific selector
    const removeButtons = page
      .locator('button[type="button"]')
      .filter({ has: page.locator('svg') })
      .filter({ hasText: '' })
      .locator('visible=true')
    const buttonCount = await removeButtons.count()
    expect(buttonCount).toBeGreaterThanOrEqual(2) // At least one for each interval
  })

  test('should allow removing price intervals', async ({ page }) => {
    await page
      .getByRole('button', { name: 'Aggiungi Componente Aziendale' })
      .click()
    await page
      .getByRole('button', { name: 'Aggiungi Intervallo di Prezzo' })
      .click()

    // Verify both intervals exist
    await expect(page.getByText('Intervallo 1')).toBeVisible()
    await expect(page.getByText('Intervallo 2')).toBeVisible()

    // Remove the second interval - find the remove button in the second interval's card
    const secondIntervalCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByText('Intervallo 2') })

    const removeButton = secondIntervalCard
      .locator('button[type="button"]')
      .filter({ has: page.locator('svg') })
      .first()

    await removeButton.click()

    // Verify only first interval remains - allow some time for removal
    await expect(page.getByText('Intervallo 1')).toBeVisible()
    await expect(page.getByText('Intervallo 2')).not.toBeVisible({
      timeout: 10_000,
    })
  })

  test('should allow adding multiple company components', async ({ page }) => {
    // Add first component
    await page
      .getByRole('button', { name: 'Aggiungi Componente Aziendale' })
      .click()
    await expect(page.getByText('Componente 1')).toBeVisible()

    // Add second component
    await page
      .getByRole('button', { name: 'Aggiungi Componente Aziendale' })
      .click()
    await expect(page.getByText('Componente 2')).toBeVisible()

    // Verify both components are present
    await expect(page.getByText('Componente 1')).toBeVisible()
    await expect(page.getByText('Componente 2')).toBeVisible()
  })

  test('should test dropdown interactions', async ({ page }) => {
    await page
      .getByRole('button', { name: 'Aggiungi Componente Aziendale' })
      .click()

    // Test component type dropdown
    await page.getByRole('combobox', { name: 'Tipo Componente *' }).click()
    await expect(
      page.getByRole('option', { name: 'STANDARD - Price included' }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: 'OPTIONAL - Price not included' }),
    ).toBeVisible()
    await page
      .getByRole('option', { name: 'OPTIONAL - Price not included' })
      .click()
    await expect(
      page.getByRole('combobox', { name: 'Tipo Componente *' }),
    ).toContainText('OPTIONAL - Price not included')

    // Test macro area dropdown
    await page.getByRole('combobox', { name: 'Macroarea *' }).click()
    await expect(
      page.getByRole('option', { name: 'Fixed commercialization fee' }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: 'Energy commercialization fee' }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: 'Energy price component' }),
    ).toBeVisible()
    await page.getByRole('option', { name: 'Energy price component' }).click()
    await expect(
      page.getByRole('combobox', { name: 'Macroarea *' }),
    ).toContainText('Energy price component')

    // Test unit of measure dropdown
    await page.getByRole('combobox', { name: 'Unità di Misura *' }).click()
    await expect(
      page.getByRole('option', { name: '€/Year', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: '€/kW', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: '€/kWh', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: '€/Sm³', exact: true }),
    ).toBeVisible()
    await page.getByRole('option', { name: '€/kWh', exact: true }).click()
    await expect(
      page.getByRole('combobox', { name: 'Unità di Misura *' }),
    ).toContainText('€/kWh')

    // Test component time band dropdown
    await page.getByRole('combobox', { name: 'Fascia Componente' }).click()
    await expect(
      page.getByRole('option', { name: 'Monorario/F1' }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: 'F2', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: 'F3', exact: true }),
    ).toBeVisible()
    await expect(page.getByRole('option', { name: 'Peak' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'OffPeak' })).toBeVisible()
    await page.getByRole('option', { name: 'Peak' }).click()
    await expect(
      page.getByRole('combobox', { name: 'Fascia Componente' }),
    ).toContainText('Peak')
  })

  test('should handle numeric inputs correctly', async ({ page }) => {
    await page
      .getByRole('button', { name: 'Aggiungi Componente Aziendale' })
      .click()

    // Test price input - handle number formatting
    const priceInput = page.getByRole('spinbutton', { name: 'Prezzo *' })
    await priceInput.fill('15.50')
    await expect(priceInput).toHaveValue('15.50') // Number inputs may keep trailing zeros

    // Test consumption range inputs
    const consumptionFromInput = page.getByRole('spinbutton', {
      name: 'Consumo Da',
    })
    await consumptionFromInput.fill('100')
    await expect(consumptionFromInput).toHaveValue('100')

    const consumptionToInput = page.getByRole('spinbutton', {
      name: 'Consumo A',
    })
    await consumptionToInput.fill('500')
    await expect(consumptionToInput).toHaveValue('500')
  })

  test('should handle date inputs with correct format', async ({ page }) => {
    await page
      .getByRole('button', { name: 'Aggiungi Componente Aziendale' })
      .click()

    // Test validity date inputs
    const startDateInput = page.getByRole('textbox', {
      name: 'Data Inizio Validità',
    })
    await startDateInput.fill('01/01/2024')
    await expect(startDateInput).toHaveValue('01/01/2024')

    const endDateInput = page.getByRole('textbox', {
      name: 'Data Fine Validità',
    })
    await endDateInput.fill('31/12/2024')
    await expect(endDateInput).toHaveValue('31/12/2024')
  })

  test('should display all Italian labels and help text correctly', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'Aggiungi Componente Aziendale' })
      .click()

    // Verify Italian labels - use heading selector to avoid strict mode violations
    await expect(
      page.getByRole('heading', { name: 'Componenti Impresa', level: 2 }),
    ).toBeVisible()
    await expect(
      page.getByText(
        'Definisci i componenti regolati e i componenti aziendali con relativi intervalli di prezzo',
      ),
    ).toBeVisible()
    await expect(page.getByText('Componenti Regolate')).toBeVisible()
    await expect(
      page
        .locator('[data-slot="card-title"]')
        .filter({ hasText: 'Componenti Aziendali' })
        .first(),
    ).toBeVisible()
    await expect(page.getByText('Nome Componente *')).toBeVisible()
    await expect(page.getByText('Tipo Componente *')).toBeVisible()
    await expect(page.getByText('Macroarea *')).toBeVisible()
    await expect(page.getByText('Descrizione *')).toBeVisible()
    await expect(page.getByText('Intervalli di Prezzo')).toBeVisible()
    await expect(page.getByText('Prezzo *')).toBeVisible()
    await expect(page.getByText('Unità di Misura *')).toBeVisible()
    await expect(page.getByText('Consumo Da')).toBeVisible()
    await expect(page.getByText('Consumo A')).toBeVisible()
    await expect(page.getByText('Fascia Componente')).toBeVisible()
    await expect(page.getByText('Data Inizio Validità')).toBeVisible()
    await expect(page.getByText('Data Fine Validità')).toBeVisible()

    // Verify help text
    await expect(page.getByText('Massimo 3000 caratteri')).toBeVisible()
    await expect(page.getByText('Formato: gg/mm/aaaa').first()).toBeVisible()
    await expect(page.getByText('Seleziona fascia (opzionale)')).toBeVisible()
  })

  test('should complete a full company component configuration', async ({
    page,
  }) => {
    // Select regulated component
    await page.getByRole('checkbox', { name: 'PCV (01)' }).click()

    // Add company component
    await page
      .getByRole('button', { name: 'Aggiungi Componente Aziendale' })
      .click()

    // Fill component details
    await page
      .getByRole('textbox', { name: 'Nome Componente *' })
      .fill('Componente Test Completo')
    await page
      .getByRole('textbox', { name: 'Descrizione *' })
      .fill(
        'Descrizione dettagliata del componente di test con tutti i campi compilati',
      )

    // Change component type
    await page.getByRole('combobox', { name: 'Tipo Componente *' }).click()
    await page
      .getByRole('option', { name: 'OPTIONAL - Price not included' })
      .click()

    // Change macro area
    await page.getByRole('combobox', { name: 'Macroarea *' }).click()
    await page.getByRole('option', { name: 'Energy price component' }).click()

    // Configure price interval
    await page.getByRole('spinbutton', { name: 'Prezzo *' }).fill('25.75')

    await page.getByRole('combobox', { name: 'Unità di Misura *' }).click()
    await page.getByRole('option', { name: '€/kWh' }).click()

    await page.getByRole('spinbutton', { name: 'Consumo Da' }).fill('0')
    await page.getByRole('spinbutton', { name: 'Consumo A' }).fill('1000')

    await page.getByRole('combobox', { name: 'Fascia Componente' }).click()
    await page
      .getByRole('option', { name: 'Monorario/F1', exact: true })
      .click()

    await page
      .getByRole('textbox', { name: 'Data Inizio Validità' })
      .fill('01/01/2024')
    await page
      .getByRole('textbox', { name: 'Data Fine Validità' })
      .fill('31/12/2024')

    // Verify all values are set correctly
    await expect(
      page.getByRole('textbox', { name: 'Nome Componente *' }),
    ).toHaveValue('Componente Test Completo')
    await expect(
      page.getByRole('combobox', { name: 'Tipo Componente *' }),
    ).toContainText('OPTIONAL - Price not included')
    await expect(
      page.getByRole('combobox', { name: 'Macroarea *' }),
    ).toContainText('Energy price component')
    await expect(
      page.getByRole('spinbutton', { name: 'Prezzo *' }),
    ).toHaveValue('25.75')
    await expect(
      page.getByRole('combobox', { name: 'Unità di Misura *' }),
    ).toContainText('€/kWh')

    // Verify the regulated component is still selected
    await expect(page.getByRole('checkbox', { name: 'PCV (01)' })).toBeChecked()
  })
})
