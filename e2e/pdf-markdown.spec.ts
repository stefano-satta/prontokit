import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { createBlankPdf, createSamplePdf } from './fixtures/pdf';

const PDF_MIME = 'application/pdf';

const upload = (page: Page, name: string, buffer: Buffer, mimeType = PDF_MIME) =>
  page.getByTestId('file-input').setInputFiles({ name, mimeType, buffer });

const downloadButton = (page: Page) => page.getByRole('button', { name: /Scarica Markdown|Elaborazione/ });

test.describe('PDF in Markdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pdf-markdown');
  });

  test('converte un PDF e scarica il Markdown ottimizzato', async ({ page }) => {
    await upload(page, 'Guida di prova.pdf', await createSamplePdf());

    const card = page.getByTestId('conversion-card');
    await expect(card).toHaveAttribute('data-status', 'done');
    await expect(downloadButton(page)).toBeEnabled();
    await expect(card).toContainText('3 pagine');

    const preview = page.getByTestId('markdown-preview');
    await expect(preview).toContainText('title: "Guida di prova"');
    await expect(preview).toContainText('# Guida di prova');
    await expect(preview).toContainText('## Introduzione');
    await expect(preview).toContainText('Questa guida spiega la conversione dei documenti in Markdown.');
    await expect(preview).toContainText('- primo punto');
    await expect(preview).not.toContainText('Documento interno ACME');
    await expect(preview).not.toContainText('Pagina 2 di 3');

    const [download] = await Promise.all([page.waitForEvent('download'), downloadButton(page).click()]);
    expect(download.suggestedFilename()).toBe('Guida di prova.md');
    const markdown = await readFile((await download.path())!, 'utf8');
    expect(markdown).toContain('<!-- page 3 -->');
    expect(markdown).toContain('Contenuto specifico del capitolo numero 3.');
  });

  test('accetta il file trascinato nella dropzone', async ({ page }) => {
    const bytes = [...(await createSamplePdf())];
    const dataTransfer = await page.evaluateHandle((data) => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([new Uint8Array(data)], 'trascinato.pdf', { type: 'application/pdf' }));
      return transfer;
    }, bytes);
    await page.getByTestId('dropzone').dispatchEvent('drop', { dataTransfer });
    await expect(page.getByTestId('conversion-card')).toHaveAttribute('data-status', 'done');
  });

  test('il PDF non viene mai inviato in rete', async ({ page }) => {
    const outgoing: string[] = [];
    page.on('request', (request) => {
      if (request.method() !== 'GET' || request.postData()) outgoing.push(`${request.method()} ${request.url()}`);
    });
    await upload(page, 'privato.pdf', await createSamplePdf());
    await expect(page.getByTestId('conversion-card')).toHaveAttribute('data-status', 'done');
    expect(outgoing).toEqual([]);
  });

  test('rifiuta un file che non è un PDF anche se ha l’estensione giusta', async ({ page }) => {
    await upload(page, 'finto.pdf', Buffer.from('<html>non sono un pdf</html>'));
    await expect(page.getByRole('alert')).toHaveText('Questo file non è un PDF valido.');
  });

  test('rifiuta un PDF oltre i 25 MB', async ({ page }) => {
    const big = Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.alloc(26 * 1024 * 1024)]);
    await upload(page, 'enorme.pdf', big);
    await expect(page.getByRole('alert')).toContainText('il limite è 25.0 MB');
  });

  test('segnala un PDF senza testo selezionabile', async ({ page }) => {
    await upload(page, 'scansione.pdf', await createBlankPdf());
    await expect(page.getByRole('alert')).toContainText('non contiene testo selezionabile');
  });

  test('dopo una conversione si può caricare un altro file', async ({ page }) => {
    await upload(page, 'uno.pdf', await createSamplePdf());
    await expect(page.getByTestId('conversion-card')).toHaveAttribute('data-status', 'done');
    await page.getByRole('button', { name: 'Converti un altro file' }).click();
    await expect(page.getByTestId('dropzone')).toBeVisible();
    await expect(page.getByTestId('markdown-preview')).toHaveCount(0);
  });
});
