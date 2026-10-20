import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { createPagedPdf, createProtectedPdf } from './fixtures/pdf';

const pdfFile = (name: string, buffer: Buffer) => ({ name, mimeType: 'application/pdf', buffer });
const upload = (page: Page, files: ReturnType<typeof pdfFile>[]) => page.getByTestId('file-input').setInputFiles(files);
const selected = (page: Page) => page.getByTestId('selected-pdf');
const mergeButton = (page: Page) => page.getByRole('button', { name: 'Unisci PDF', exact: true });

test.describe('Unisci PDF', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pdf-merge');
  });

  test('unisce i PDF nell’ordine scelto e scarica il file', async ({ page }) => {
    await upload(page, [pdfFile('primo.pdf', await createPagedPdf('Primo', 1)), pdfFile('secondo.pdf', await createPagedPdf('Secondo', 2))]);
    await expect(selected(page)).toHaveCount(2);
    await expect(selected(page).nth(1)).toContainText('2 pagine');

    await page.getByRole('button', { name: 'Sposta su secondo.pdf' }).click();
    await expect(selected(page).first()).toContainText('secondo.pdf');

    await mergeButton(page).click();
    await expect(page.getByTestId('merge-card')).toHaveAttribute('data-status', 'done');
    await expect(page.getByTestId('result-summary')).toContainText('2 PDF in un unico file · 3 pagine');

    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Scarica PDF unito' }).click()]);
    expect(download.suggestedFilename()).toBe('pdf_unito_prontokit.pdf');
    const merged = await PDFDocument.load(await readFile((await download.path())!));
    expect(merged.getPageCount()).toBe(3);

    await page.getByRole('button', { name: 'Unisci altri PDF' }).click();
    await expect(selected(page)).toHaveCount(0);
  });

  test('scarta i PDF protetti e i file che non sono PDF', async ({ page }) => {
    await upload(page, [
      pdfFile('libero.pdf', await createPagedPdf('Libero', 1)),
      pdfFile('protetto.pdf', await createProtectedPdf()),
      { name: 'finto.pdf', mimeType: 'application/pdf', buffer: Buffer.from('non sono un pdf') },
    ]);
    await expect(selected(page)).toHaveCount(1);
    const notices = page.getByTestId('notices');
    await expect(notices).toContainText('“protetto.pdf” è protetto da password o da restrizioni e non si può unire');
    await expect(notices).toContainText('“finto.pdf” non è un PDF');
    await expect(mergeButton(page)).toBeDisabled();
    await expect(page.getByTestId('min-hint')).toBeVisible();
  });

  test('accetta al massimo 5 PDF', async ({ page }) => {
    const buffer = await createPagedPdf('Pagina', 1);
    await upload(page, Array.from({ length: 6 }, (_, i) => pdfFile(`doc-${i + 1}.pdf`, buffer)));
    await expect(selected(page)).toHaveCount(5);
    await expect(page.getByTestId('notices')).toContainText('Puoi unire al massimo 5 PDF alla volta: “doc-6.pdf” non è stato aggiunto.');
    await expect(page.getByTestId('dropzone')).toHaveAttribute('aria-disabled', 'true');

    await page.getByRole('button', { name: 'Rimuovi doc-1.pdf' }).click();
    await expect(selected(page)).toHaveCount(4);
    await expect(page.getByTestId('dropzone')).not.toHaveAttribute('aria-disabled');
  });

  test('accetta i file trascinati nella dropzone', async ({ page }) => {
    const bytes = [...(await createPagedPdf('Trascinato', 1))];
    const dataTransfer = await page.evaluateHandle((data) => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([new Uint8Array(data)], 'uno.pdf', { type: 'application/pdf' }));
      transfer.items.add(new File([new Uint8Array(data)], 'due.pdf', { type: 'application/pdf' }));
      return transfer;
    }, bytes);
    await page.getByTestId('dropzone').dispatchEvent('drop', { dataTransfer });
    await expect(selected(page)).toHaveCount(2);
  });

  test('i PDF non vengono mai inviati in rete', async ({ page }) => {
    const outgoing: string[] = [];
    page.on('request', (request) => {
      if (request.method() !== 'GET' || request.postData()) outgoing.push(`${request.method()} ${request.url()}`);
    });
    const buffer = await createPagedPdf('Privato', 1);
    await upload(page, [pdfFile('a.pdf', buffer), pdfFile('b.pdf', buffer)]);
    await mergeButton(page).click();
    await expect(page.getByTestId('merge-card')).toHaveAttribute('data-status', 'done');
    expect(outgoing).toEqual([]);
  });
});
