import { expect, test } from '@playwright/test';
import { openTools } from './helpers';

test.describe('Home', () => {
  test('mostra un box per ogni utility', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('ProntoKit');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meno tempo perso. Più cose fatte.');

    const cards = page.getByRole('main').getByRole('link');
    await expect(cards).toHaveCount(10);
    await expect(cards.first()).toContainText('Generatore di preventivi');
    await expect(cards.filter({ hasText: 'Generatore di QR code' })).toHaveAttribute('href', '/qr-code');
    await expect(cards.filter({ hasText: 'PDF in Markdown' })).toHaveAttribute('href', '/pdf-markdown');
    await expect(cards.filter({ hasText: 'Excel in CSV' })).toHaveAttribute('href', '/excel-csv');
    await expect(cards.filter({ hasText: 'Trascrizione vocale' })).toHaveAttribute('href', '/speech-to-text');
    await expect(cards.filter({ hasText: 'Generatore di grafici' })).toHaveAttribute('href', '/chart-generator');
    await expect(cards.filter({ hasText: 'Confronto JSON' })).toHaveAttribute('href', '/json-diff');
    await expect(cards.filter({ hasText: 'Convertitore di immagini' })).toHaveAttribute('href', '/image-converter');
    await expect(cards.filter({ hasText: 'Unisci PDF' })).toHaveAttribute('href', '/pdf-merge');
    await expect(cards.filter({ hasText: 'Generatore di password' })).toHaveAttribute('href', '/password-generator');
    await expect(cards.filter({ hasText: 'Generatore di preventivi' })).toHaveAttribute('href', '/quote-generator');
  });

  test('i box portano alle pagine delle utility', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Generatore di QR code/ }).click();
    await expect(page).toHaveURL('/qr-code');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Generatore di QR code');
  });

  test('il menu Tools elenca le utility ed evidenzia la pagina attiva', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    const tools = nav.getByRole('button', { name: 'Tools' });
    await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    await expect(tools).toHaveAttribute('aria-expanded', 'false');

    await openTools(page);
    await expect(nav.getByRole('listitem').getByRole('link')).toHaveCount(13);
    await nav.getByRole('link', { name: 'Unisci PDF' }).click();
    await expect(page).toHaveURL('/pdf-merge');
    await expect(tools).toHaveAttribute('aria-expanded', 'false');

    await openTools(page);
    await expect(nav.getByRole('link', { name: 'Unisci PDF' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  test('il menu Tools si chiude con Esc e con un click fuori', async ({ page }) => {
    await page.goto('/');
    const tools = page.getByRole('navigation').getByRole('button', { name: 'Tools' });
    await openTools(page);
    await page.keyboard.press('Escape');
    await expect(tools).toHaveAttribute('aria-expanded', 'false');
    await expect(tools).toBeFocused();

    await openTools(page);
    await page.mouse.click(200, 600);
    await expect(tools).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Unisci PDF' })).toBeHidden();
  });

  test('il tema scuro si attiva e resta salvato', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole('button', { name: 'Passa al tema scuro' }).click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(html).toHaveClass(/dark/);
    await expect(page.getByRole('button', { name: 'Passa al tema chiaro' })).toBeVisible();
  });

  test('mostra la pagina 404 per un percorso sconosciuto', async ({ page }) => {
    await page.goto('/pagina-inesistente');
    await expect(page.getByRole('heading', { name: 'Pagina non trovata' })).toBeVisible();
  });

  test('lo short URL è disattivato: niente box, voce di menu né pagina', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('main').getByRole('link', { name: /Short URL/ })).toHaveCount(0);
    await openTools(page);
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Short URL' })).toHaveCount(0);

    await page.goto('/short-url');
    await expect(page.getByRole('heading', { name: 'Pagina non trovata' })).toBeVisible();
  });
});
