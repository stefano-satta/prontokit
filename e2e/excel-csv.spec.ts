import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { unzipSync } from 'fflate';
import { createEmptyWorkbook, createSampleWorkbook, createSingleSheetWorkbook } from './fixtures/excel';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const BOM = '﻿';

const upload = (page: Page, name: string, buffer: Buffer, mimeType = XLSX_MIME) =>
  page.getByTestId('file-input').setInputFiles({ name, mimeType, buffer });

const card = (page: Page) => page.getByTestId('conversion-card');

async function downloadText(page: Page, buttonName: string) {
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: buttonName }).click()]);
  return { filename: download.suggestedFilename(), content: await readFile((await download.path())!) };
}

test.describe('Excel in CSV', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/excel-csv');
  });

  test('converte il foglio scelto con valori finali, date ISO e zeri iniziali', async ({ page }) => {
    await upload(page, 'Vendite 2026.xlsx', createSampleWorkbook());
    await expect(card(page)).toHaveAttribute('data-status', 'ready');

    const options = page.getByTestId('sheet-option');
    await expect(options).toHaveCount(4);
    await expect(options.nth(2)).toContainText('Nascosto');
    await expect(options.nth(3)).toContainText('Vuoto');
    await expect(options.nth(3).getByRole('radio')).toBeDisabled();
    await expect(page.getByRole('radio', { name: /Ordini/ })).toBeChecked();
    await expect(page.getByTestId('hidden-summary')).toContainText('1 foglio nascosto, non incluso');
    await expect(page.getByTestId('neutralized-note')).toContainText('1 cella iniziava');
    await expect(page.getByTestId('csv-preview')).toContainText('1.234,50');

    const { filename, content } = await downloadText(page, 'Scarica CSV');
    expect(filename).toBe('Vendite 2026 - Ordini.csv');
    expect(content.toString('utf8')).toBe(
      BOM +
        [
          'Codice;Prezzo;Quantità;Totale;Data;Nota',
          `00123;1.234,50;3;3703,5;2026-10-16;"'=HYPERLINK(""http://evil"")"`,
          ';;;;;',
          '00456;-2,25;2;-4,5;2026-10-17;',
          '',
        ].join('\r\n'),
    );
  });

  test('"Tutti i fogli" scarica uno ZIP e dichiara i fogli nascosti esclusi o inclusi', async ({ page }) => {
    await upload(page, 'Vendite.xlsx', createSampleWorkbook());
    await page.getByTestId('sheet-option-all').click();
    await expect(page.getByTestId('hidden-summary')).toContainText('Fogli nascosti esclusi: “Interno”');
    await expect(page.getByTestId('hidden-summary')).toContainText('Fogli vuoti esclusi: “Vuoto”');

    let zip = await downloadText(page, 'Scarica ZIP');
    expect(zip.filename).toBe('Vendite.zip');
    expect(Object.keys(unzipSync(new Uint8Array(zip.content)))).toEqual(['Ordini.csv', 'Clienti.csv']);

    await page.getByRole('checkbox', { name: 'Includi il foglio nascosto' }).check();
    await expect(page.getByTestId('hidden-summary')).toContainText('Fogli nascosti inclusi: “Interno”');
    zip = await downloadText(page, 'Scarica ZIP');
    const files = unzipSync(new Uint8Array(zip.content));
    expect(Object.keys(files)).toEqual(['Ordini.csv', 'Clienti.csv', 'Interno.csv']);
    expect(Buffer.from(files['Interno.csv']!).toString('utf8')).toBe(`${BOM}riservato\r\n`);
  });

  test('con un solo foglio scarica subito il CSV con il nome del file', async ({ page }) => {
    await upload(page, 'dati.xlsx', createSingleSheetWorkbook());
    await expect(page.getByTestId('sheet-option')).toHaveCount(0);
    const { filename } = await downloadText(page, 'Scarica CSV');
    expect(filename).toBe('dati.csv');
  });

  test('accetta il file trascinato nella dropzone', async ({ page }) => {
    const bytes = [...createSingleSheetWorkbook()];
    const dataTransfer = await page.evaluateHandle((data) => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([new Uint8Array(data)], 'trascinato.xlsx'));
      return transfer;
    }, bytes);
    await page.getByTestId('dropzone').dispatchEvent('drop', { dataTransfer });
    await expect(card(page)).toHaveAttribute('data-status', 'ready');
  });

  test('il file non viene mai inviato in rete', async ({ page }) => {
    const outgoing: string[] = [];
    page.on('request', (request) => {
      if (request.method() !== 'GET' || request.postData()) outgoing.push(`${request.method()} ${request.url()}`);
    });
    await upload(page, 'privato.xlsx', createSampleWorkbook());
    await expect(card(page)).toHaveAttribute('data-status', 'ready');
    expect(outgoing).toEqual([]);
  });

  test('blocca un file senza dati spiegando il problema', async ({ page }) => {
    await upload(page, 'vuoto.xlsx', createEmptyWorkbook());
    await expect(page.getByRole('alert')).toContainText('Il file non contiene dati');
  });

  test('blocca un file corrotto', async ({ page }) => {
    await upload(page, 'rotto.xlsx', createSampleWorkbook().subarray(0, 1500));
    await expect(page.getByRole('alert')).toContainText('Non riesco a leggere questo file');
  });

  test('rifiuta un file che non è un foglio Excel anche se ha l’estensione giusta', async ({ page }) => {
    await upload(page, 'finto.xlsx', Buffer.from('Codice;Prezzo\n001;2'));
    await expect(page.getByRole('alert')).toContainText('Questo file non è un foglio Excel valido');
  });

  test('dopo una conversione si può caricare un altro file', async ({ page }) => {
    await upload(page, 'uno.xlsx', createSampleWorkbook());
    await expect(card(page)).toHaveAttribute('data-status', 'ready');
    await page.getByRole('button', { name: 'Converti un altro file' }).click();
    await expect(page.getByTestId('dropzone')).toBeVisible();
    await expect(page.getByTestId('csv-preview')).toHaveCount(0);
  });
});
