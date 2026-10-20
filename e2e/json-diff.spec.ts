import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.describe('Confronto JSON', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/json-diff');
  });

  test('segnala JSON identici ed equivalenti', async ({ page }) => {
    await page.getByLabel('Sinistra · Originale').fill('{"a":1,"b":[1,2]}');
    await page.getByLabel('Destra · Modificato').fill('{"a":1,"b":[1,2]}');
    await expect(page.getByTestId('diff-verdict')).toHaveText('I due JSON sono identici.');

    await page.getByLabel('Destra · Modificato').fill('{\n  "b": [1, 2],\n  "a": 1\n}');
    await expect(page.getByTestId('diff-verdict')).toContainText('Stessi dati');
  });

  test('errore → correzione → download e copia', async ({ page }) => {
    await page.getByRole('button', { name: 'Prova con un esempio' }).click();
    await expect(page.getByTestId('error-right')).toContainText('Riga 7, colonna 17');
    await expect(page.getByTestId('diff-verdict')).toHaveCount(0);
    await expect(page.getByTestId('json-right-error-line')).toBeAttached();
    await expect(page.getByRole('button', { name: 'Scarica .json' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Copia JSON' })).toBeDisabled();

    await page.getByRole('button', { name: 'Vai all’errore' }).click();
    await page.keyboard.type(',');
    await expect(page.getByTestId('diff-verdict')).toHaveText('I due JSON sono diversi: 3 righe evidenziate in verde.');
    await expect(page.getByTestId('download-hint')).toHaveText('JSON valido: pronto da scaricare o copiare.');

    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Scarica .json' }).click()]);
    expect(download.suggestedFilename()).toMatch(/^json-\d{4}-\d{2}-\d{2}-\d{4}\.json$/);
    const content = await readFile(await download.path(), 'utf8');
    expect(JSON.parse(content).limiti.fileMb).toBe(50);

    await page.getByRole('button', { name: 'Copia JSON' }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('"json-diff"');
  });

  test('formatta e minifica solo il JSON di destra, con annulla', async ({ page }) => {
    const left = page.getByLabel('Sinistra · Originale');
    const right = page.getByLabel('Destra · Modificato');
    await expect(page.getByRole('button', { name: 'Scambia' })).toHaveCount(0);
    await left.fill('{"a":{"b":[]}}');
    await expect(page.getByRole('button', { name: 'Formatta' })).toBeDisabled();

    await right.fill('{"a": 1,}');
    await page.getByRole('button', { name: 'Formatta' }).click();
    await expect(right).toHaveValue('{"a": 1,}');
    await expect(page.getByTestId('action-notice')).toContainText('Correggi prima l’errore alla riga 1');

    await right.fill('{"a":{"b":[]}}');
    await page.getByRole('button', { name: 'Formatta' }).click();
    await expect(right).toHaveValue('{\n  "a": {\n    "b": []\n  }\n}');
    await expect(left).toHaveValue('{"a":{"b":[]}}');

    await page.getByRole('button', { name: 'Minifica' }).click();
    await expect(right).toHaveValue('{"a":{"b":[]}}');
    await page.getByRole('button', { name: 'Annulla' }).click();
    await expect(right).toHaveValue('{\n  "a": {\n    "b": []\n  }\n}');

    await page.getByRole('button', { name: 'Svuota' }).click();
    await expect(left).toHaveValue('');
    await expect(right).toHaveValue('');
  });

  test('nessuno scroll orizzontale della pagina', async ({ page }) => {
    await page.getByRole('button', { name: 'Prova con un esempio' }).click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
