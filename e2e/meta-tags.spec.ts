import { expect, test } from '@playwright/test';

test.describe('Generatore di meta tag SEO', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/meta-tags');
  });

  test('i contatori sono verdi solo dentro l’intervallo consigliato', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Generatore di meta tag SEO');
    const counters = page.getByTestId('character-counter');
    await expect(counters.nth(0)).toHaveText('0 / 50–60');
    await expect(counters.nth(1)).toHaveText('0 / 145–160');

    await page.getByLabel('Page title').fill('Scarpe da trekking');
    await expect(counters.nth(0)).toHaveAttribute('data-status', 'short');
    await expect(counters.nth(0)).toHaveText('18 / 50–60· troppo corto');

    await page.getByLabel('Page title').fill('a'.repeat(55));
    await expect(counters.nth(0)).toHaveAttribute('data-status', 'ok');

    await page.getByLabel('Page title').fill('a'.repeat(61));
    await expect(counters.nth(0)).toHaveAttribute('data-status', 'long');
    await expect(counters.nth(0)).toContainText('troppo lungo');

    await page.getByLabel('Meta description').fill('b'.repeat(150));
    await expect(counters.nth(1)).toHaveAttribute('data-status', 'ok');
    await page.getByLabel('Meta description').fill('b'.repeat(161));
    await expect(counters.nth(1)).toHaveAttribute('data-status', 'long');
  });

  test('genera i tag mentre si scrive e li copia', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Copia tag' })).toBeDisabled();

    await page.getByLabel('Page title').fill('Scarpe da trekking');
    await page.getByLabel('Meta description').fill('Scarpe leggere e impermeabili.');
    await page.getByLabel('Canonical URL').fill('https://esempio.it/scarpe');
    await page.getByLabel('Account del sito (twitter:site)').fill('negozio');

    const tags = page.getByTestId('generated-tags');
    await expect(tags).toContainText('<title>Scarpe da trekking</title>');
    await expect(tags).toContainText('<link rel="canonical" href="https://esempio.it/scarpe">');
    await expect(tags).toContainText('<meta property="og:title" content="Scarpe da trekking">');
    await expect(tags).toContainText('<meta name="twitter:site" content="@negozio">');

    await page.getByRole('button', { name: 'Copia tag' }).click();
    await expect(page.getByRole('button', { name: 'Copiato' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await tags.textContent());
  });

  test('un URL non valido mostra l’errore e resta fuori dai tag', async ({ page }) => {
    await page.getByLabel('Page title').fill('Pagina');
    await page.getByLabel('Canonical URL').fill('ftp://esempio.it');
    await expect(page.getByText("L'URL deve iniziare con http:// o https://.")).toBeVisible();
    await expect(page.getByTestId('generated-tags')).not.toContainText('canonical');
  });

  test('svuota il modulo', async ({ page }) => {
    const reset = page.getByRole('button', { name: 'Svuota il modulo' });
    await expect(reset).toBeDisabled();
    await page.getByLabel('Page title').fill('Pagina');
    await reset.click();
    await expect(page.getByLabel('Page title')).toHaveValue('');
    await expect(page.getByTestId('generated-tags')).toHaveCount(0);
    await expect(reset).toBeDisabled();
  });
});
