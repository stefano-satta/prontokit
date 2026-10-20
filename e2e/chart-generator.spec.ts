import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.describe('Generatore di grafici', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/chart-generator');
  });

  test('mostra subito un esempio con grafico a barre e tabella', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Barre' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('chart-preview').locator('canvas')).toBeVisible();
    await expect(page.getByTestId('chart-preview').locator('canvas')).toHaveAttribute('aria-label', /Febbraio 98,5/);
    await expect(page.getByTestId('table-preview').getByRole('row')).toHaveCount(6);
    await expect(page.getByTestId('data-legend').getByRole('listitem')).toHaveCount(5);
    await expect(page.getByTestId('data-legend').getByRole('listitem').nth(1)).toContainText('98,5');
    await expect(page.getByTestId('table-preview').getByRole('columnheader', { name: 'Rispetto al massimo' })).toBeVisible();
    await expect(page.getByTestId('table-preview').getByRole('row', { name: /Maggio/ })).toContainText('100,0%');
  });

  test('i tab cambiano le opzioni e mantengono i dati', async ({ page }) => {
    await expect(page.getByRole('radio', { name: 'Orizzontali' })).toBeAttached();
    await page.getByRole('tab', { name: 'Torta' }).click();
    await expect(page.getByRole('radio', { name: 'Ciambella' })).toBeAttached();
    await expect(page.getByRole('radio', { name: 'Orizzontali' })).toHaveCount(0);
    await expect(page.getByTestId('data-legend').getByRole('listitem')).toHaveCount(5);
    await expect(page.getByTestId('data-legend').getByRole('listitem').first()).toContainText('18,9%');
    await expect(page.getByTestId('table-preview')).toContainText('Percentuale');
    await expect(page.getByTestId('table-preview').getByRole('row').last()).toContainText('100,0%');

    await page.getByText('2 cifre').click();
    await expect(page.getByTestId('table-preview').getByRole('row').last()).toContainText('100,00%');

    await page.getByRole('tab', { name: 'Linee' }).click();
    await expect(page.getByTestId('data-legend').getByRole('listitem').first()).toContainText('120');
    await expect(page.getByRole('radio', { name: 'Ciambella' })).toHaveCount(0);
    await expect(page.getByLabel('Etichette e valori')).toHaveValue(/Gennaio;120/);
  });

  test('segnala le righe non valide e blocca i download senza dati', async ({ page }) => {
    const data = page.getByLabel('Etichette e valori');
    await data.fill('Gennaio,120\nFebbraio;abc');
    await expect(page.getByText('Riga 1: manca il punto e virgola')).toBeVisible();
    await expect(page.getByText('Riga 2: "abc" non è un numero')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Scarica PNG del grafico' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Copia SVG della tabella' })).toBeDisabled();
  });

  test('la torta rifiuta i valori negativi', async ({ page }) => {
    await page.getByLabel('Etichette e valori').fill('A;3\nB;-1');
    await page.getByRole('tab', { name: 'Torta' }).click();
    await expect(page.getByText('La torta non può mostrare valori negativi')).toHaveCount(2);
  });

  test('scarica i PNG e copia gli SVG', async ({ page }) => {
    await page.getByLabel('Titolo').fill('Report Q1');

    const [chartPng] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Scarica PNG del grafico' }).click(),
    ]);
    expect(chartPng.suggestedFilename()).toBe('Report Q1-barre.png');
    expect((await readFile((await chartPng.path())!)).subarray(1, 4).toString()).toBe('PNG');

    const [tablePng] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Scarica PNG della tabella' }).click(),
    ]);
    expect(tablePng.suggestedFilename()).toBe('Report Q1-tabella.png');
    expect((await readFile((await tablePng.path())!)).subarray(1, 4).toString()).toBe('PNG');

    await page.getByRole('button', { name: 'Copia SVG del grafico' }).click();
    await expect(page.getByRole('button', { name: 'Copia SVG del grafico' })).toContainText('SVG copiato');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^<svg[\s\S]*<image[^>]+data:image\/png;base64,/);

    await page.getByRole('button', { name: 'Copia SVG della tabella' }).click();
    const tableSvg = await page.evaluate(() => navigator.clipboard.readText());
    expect(tableSvg).toContain('<title>Report Q1</title>');
    expect(tableSvg).toContain('>Febbraio</text>');
  });
});
