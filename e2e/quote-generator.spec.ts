import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { createBmp } from './fixtures/images';

const section = (page: Page, name: string) => page.getByRole('region', { name, exact: true });
const lines = (page: Page) => page.getByTestId('quote-line');
const downloadButton = (page: Page) => page.getByRole('button', { name: 'Scarica PDF' });
// Gli importi di Intl usano spazi non separabili
const money = (text: string) => new RegExp(text.replace(/[.]/g, '\\.').replace(' ', '\\s'));

async function fillRequired(page: Page) {
  await section(page, 'Preventivo').getByLabel('Numero').fill('2026/014');
  await section(page, 'I tuoi dati').getByLabel('Nome o ragione sociale', { exact: true }).fill('Rossi Design');
  await section(page, 'Cliente').getByLabel('Nome o ragione sociale del cliente').fill('Bianchi Srl');
}

async function fillLine(page: Page, index: number, { description, quantity, unitPrice, discount }: { description: string; quantity?: string; unitPrice: string; discount?: string }) {
  const line = lines(page).nth(index);
  await line.getByLabel('Descrizione').fill(description);
  if (quantity) await line.getByLabel('Quantità').fill(quantity);
  await line.getByLabel('Prezzo unitario').fill(unitPrice);
  if (discount) await line.getByLabel('Sconto').fill(discount);
}

test.describe('Generatore di preventivi', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quote-generator');
  });

  test('parte vuoto e dice cosa manca per scaricare', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Generatore di preventivi');
    await expect(lines(page)).toHaveCount(1);
    await expect(downloadButton(page)).toBeDisabled();
    const issues = page.getByTestId('quote-issues');
    await expect(issues).toContainText('Inserisci il numero del preventivo');
    await expect(issues).toContainText('Inserisci il nome del cliente');
    await expect(issues).toContainText('Aggiungi almeno una voce');
    await expect(page.getByTestId('preview-status')).toHaveAttribute('data-status', 'ready');
    await expect(page.getByTestId('preview-pages').getByRole('img')).toHaveCount(1);
  });

  test('calcola imponibile, IVA e totale con sconti di riga e globale', async ({ page }) => {
    await fillLine(page, 0, { description: 'Sviluppo front-end', quantity: '32', unitPrice: '55', discount: '10' });
    await page.getByRole('button', { name: 'Aggiungi voce' }).click();
    await expect(lines(page).nth(1).getByLabel('Descrizione')).toBeFocused();
    await fillLine(page, 1, { description: 'Hosting annuale', unitPrice: '180,50' });
    await expect(lines(page).first().getByTestId('line-total')).toHaveText(money('1.584,00 €'));

    const totals = section(page, 'Sconto e IVA');
    await totals.getByLabel('Valore dello sconto').fill('5');
    await expect(page.getByTestId('total-subtotal')).toContainText(money('1.764,50 €'));
    await expect(page.getByTestId('total-discount')).toContainText(money('88,23 €'));
    await expect(page.getByTestId('total-taxable')).toContainText(money('1.676,27 €'));
    await expect(page.getByTestId('total-vat')).toContainText(money('368,78 €'));
    await expect(page.getByTestId('total-due')).toContainText(money('2.045,05 €'));

    await totals.getByLabel('Aliquota IVA').selectOption({ label: '0% (senza IVA)' });
    await expect(totals.getByLabel("Motivo dell'IVA allo 0%")).toBeVisible();
    await expect(page.getByTestId('total-due')).toContainText(money('1.676,27 €'));
  });

  test('segnala i valori non validi sotto il campo', async ({ page }) => {
    await fillLine(page, 0, { description: 'Consulenza', quantity: 'due', unitPrice: '10' });
    await expect(lines(page).first().getByRole('alert')).toHaveText('Voce 1: scrivi la quantità come numero, es. 2 o 1,5.');
    await section(page, 'Condizioni').getByLabel('IBAN').fill('IT00 1234');
    await expect(section(page, 'Condizioni').getByRole('alert')).toContainText("L'IBAN non è valido");
  });

  test('sposta ed elimina le voci', async ({ page }) => {
    await fillLine(page, 0, { description: 'Prima', unitPrice: '1' });
    await page.getByRole('button', { name: 'Aggiungi voce' }).click();
    await fillLine(page, 1, { description: 'Seconda', unitPrice: '2' });
    await page.getByRole('button', { name: 'Sposta su la voce 2' }).click();
    await expect(lines(page).first().getByLabel('Descrizione')).toHaveValue('Seconda');
    await page.getByRole('button', { name: 'Elimina la voce 1' }).click();
    await expect(lines(page)).toHaveCount(1);
    await expect(lines(page).first().getByLabel('Descrizione')).toHaveValue('Prima');
  });

  test('crea il PDF con logo, condizioni e firma e lo scarica', async ({ page }) => {
    await fillRequired(page);
    await fillLine(page, 0, { description: 'Restyling del sito', unitPrice: '1.200' });
    await section(page, 'Condizioni').getByLabel('Condizioni di pagamento').fill('30% all’ordine, saldo alla consegna');
    await section(page, 'Condizioni').getByLabel('IBAN').fill('IT60 X054 2811 1010 0000 0123 456');
    await page.getByTestId('logo-input').setInputFiles({ name: 'logo.bmp', mimeType: 'image/bmp', buffer: createBmp(40, 20) });
    await expect(page.getByTestId('logo-preview')).toBeVisible();
    await page.getByTitle('Verde').click();
    await expect(page.getByRole('radio', { name: 'Verde' })).toBeChecked();

    await expect(page.getByTestId('quote-issues')).toHaveCount(0);
    await expect(page.getByTestId('preview-status')).toHaveAttribute('data-status', 'ready');
    const [download] = await Promise.all([page.waitForEvent('download'), downloadButton(page).click()]);
    expect(download.suggestedFilename()).toBe('preventivo_2026-014.pdf');
    const pdf = await PDFDocument.load(await readFile((await download.path())!));
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getTitle()).toBe('Preventivo 2026/014 Bianchi Srl');
  });

  test('con molte voci il PDF va su più pagine', async ({ page }) => {
    await fillRequired(page);
    for (let index = 0; index < 30; index++) {
      if (index > 0) await page.getByRole('button', { name: 'Aggiungi voce' }).click();
      await fillLine(page, index, { description: `Voce numero ${index + 1}\ncon una seconda riga di dettaglio`, unitPrice: '10' });
    }
    const status = page.getByTestId('preview-status');
    await expect(status).toHaveAttribute('data-status', 'ready');
    await expect(status).toHaveText(/^[2-9] pagine$/);
    const pages = Number((await status.textContent())!.charAt(0));
    await expect(page.getByTestId('preview-pages').getByRole('img')).toHaveCount(pages);
  });

  test("ingrandisce l'anteprima in una finestra e la chiude con Esc", async ({ page }) => {
    await expect(page.getByTestId('preview-status')).toHaveAttribute('data-status', 'ready');
    const zoom = page.getByRole('button', { name: 'Ingrandisci la pagina 1 di 1' });
    await zoom.click();
    const dialog = page.getByRole('dialog', { name: 'Anteprima del preventivo' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId('preview-dialog-pages').getByRole('img')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(zoom).toBeFocused();

    await zoom.click();
    await dialog.getByRole('button', { name: 'Chiudi' }).click();
    await expect(dialog).toBeHidden();
  });

  test('non invia dati in rete mentre si crea il preventivo', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.method() !== 'GET') requests.push(`${request.method()} ${request.url()}`);
    });
    await fillRequired(page);
    await fillLine(page, 0, { description: 'Riservato', unitPrice: '99' });
    await expect(page.getByTestId('preview-status')).toHaveAttribute('data-status', 'ready');
    await Promise.all([page.waitForEvent('download'), downloadButton(page).click()]);
    expect(requests).toEqual([]);
  });
});
