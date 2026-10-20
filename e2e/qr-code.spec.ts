import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.describe('Generatore di QR code', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/qr-code');
  });

  test('i download sono disabilitati finché non c’è un URL', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Scarica PNG' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Scarica SVG' })).toBeDisabled();
  });

  test('genera il QR e completa l’URL senza protocollo', async ({ page }) => {
    await page.getByLabel('URL del sito').fill('www.example.com/pagina');
    await expect(page.getByTestId('qr-image')).toBeVisible();
    await expect(page.getByTestId('qr-target')).toHaveText('https://www.example.com/pagina');
    await expect(page.getByTestId('qr-image')).toHaveAttribute('src', /^data:image\/png;base64,/);
  });

  test('segnala un URL non valido', async ({ page }) => {
    const field = page.getByLabel('URL del sito');
    await field.fill('ftp://example.com');
    await field.blur();
    await expect(page.getByRole('alert')).toContainText('http:// o https://');
    await expect(page.getByTestId('qr-image')).toHaveCount(0);
  });

  test('scarica il QR in PNG e in SVG', async ({ page }) => {
    await page.getByLabel('URL del sito').fill('https://example.com');
    await expect(page.getByTestId('qr-image')).toBeVisible();

    const [png] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Scarica PNG' }).click()]);
    expect(png.suggestedFilename()).toBe('qr-example.com.png');
    const pngBytes = await readFile((await png.path())!);
    expect(pngBytes.subarray(1, 4).toString()).toBe('PNG');

    const [svg] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Scarica SVG' }).click()]);
    expect(svg.suggestedFilename()).toBe('qr-example.com.svg');
    expect(await readFile((await svg.path())!, 'utf8')).toContain('<svg');
  });
});
