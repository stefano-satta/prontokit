import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { unzipSync } from 'fflate';
import { createBmp, encodeInBrowser } from './fixtures/images';

interface Upload {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

const upload = (page: Page, files: Upload[]) => page.getByTestId('file-input').setInputFiles(files);
const rows = (page: Page) => page.getByTestId('result-row');
/** Il radio è nascosto sotto l'etichetta a pulsante: si clicca l'etichetta, come fa l'utente. */
const chooseFormat = (page: Page, label: string) => page.locator('fieldset label').filter({ hasText: new RegExp(`^${label}$`) }).click();

async function sampleImages(page: Page) {
  return {
    png: { name: 'logo.png', mimeType: 'image/png', buffer: await encodeInBrowser(page, 'image/png') },
    jpg: { name: 'foto.jpg', mimeType: 'image/jpeg', buffer: await encodeInBrowser(page, 'image/jpeg') },
    webp: { name: 'banner.webp', mimeType: 'image/webp', buffer: await encodeInBrowser(page, 'image/webp') },
    bmp: { name: 'icona.bmp', mimeType: 'image/bmp', buffer: createBmp() },
  };
}

async function download(page: Page, name: string | RegExp) {
  const [file] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name }).click()]);
  return { filename: file.suggestedFilename(), content: await readFile((await file.path())!) };
}

test.describe('Convertitore di immagini', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-converter');
  });

  test('converte solo le immagini in un formato diverso e scarica uno ZIP', async ({ page }) => {
    const images = await sampleImages(page);
    await upload(page, [images.png, images.jpg, images.bmp]);
    await expect(page.getByTestId('selected-image')).toHaveCount(3);
    await expect(page.getByTestId('selected-image').first()).toContainText('già PNG, non verrà convertita');

    await page.getByRole('button', { name: 'Converti', exact: true }).click();
    await expect(page.getByTestId('conversion-card')).toHaveAttribute('data-status', 'done');
    await expect(page.getByTestId('result-summary')).toHaveText('2 immagini convertite in PNG · 1 già in PNG, non convertita');
    await expect(rows(page)).toHaveCount(3);
    await expect(rows(page).nth(0)).toHaveAttribute('data-status', 'skipped');
    await expect(rows(page).nth(1)).toHaveAttribute('data-status', 'converted');
    await expect(rows(page).nth(1)).toContainText('foto.png');
    await expect(rows(page).nth(1).locator('img')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Scarica foto.png' })).toBeVisible();

    const zip = await download(page, 'Scarica ZIP (2 immagini)');
    expect(zip.filename).toBe('immagini_png_prontokit.zip');
    const entries = unzipSync(new Uint8Array(zip.content));
    expect(Object.keys(entries)).toEqual(['foto.png', 'icona.png']);
    expect([...entries['icona.png']!.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  test('con una sola immagine da convertire scarica direttamente il file', async ({ page }) => {
    const images = await sampleImages(page);
    await upload(page, [images.webp]);
    await chooseFormat(page, 'JPG');
    await page.getByRole('button', { name: 'Converti', exact: true }).click();
    const file = await download(page, 'Scarica JPG');
    expect(file.filename).toBe('banner.jpg');
    expect([...file.content.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
  });

  test('si ferma e lo segnala se tutte le immagini sono già nel formato scelto', async ({ page }) => {
    const images = await sampleImages(page);
    await upload(page, [images.webp, { ...images.webp, name: 'altro.webp' }]);
    await chooseFormat(page, 'WebP');
    await page.getByRole('button', { name: 'Converti', exact: true }).click();
    await expect(page.getByRole('alert')).toHaveText('Tutte le 2 immagini sono già in formato WebP: scegli un altro formato di destinazione.');
    await expect(page.getByTestId('conversion-card')).toHaveAttribute('data-status', 'selecting');

    await chooseFormat(page, 'PNG');
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('accetta al massimo 5 immagini e scarta i formati non supportati', async ({ page }) => {
    const { png } = await sampleImages(page);
    const six = Array.from({ length: 6 }, (_, i) => ({ ...png, name: `img-${i + 1}.png` }));
    await upload(page, [...six, { name: 'animazione.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a') }]);
    await expect(page.getByTestId('selected-image')).toHaveCount(5);
    const notices = page.getByTestId('notices');
    await expect(notices).toContainText('“animazione.gif” non è un’immagine supportata');
    await expect(notices).toContainText('Puoi convertire al massimo 5 immagini alla volta: “img-6.png” non è stata aggiunta.');
    await expect(page.getByTestId('dropzone')).toHaveAttribute('aria-disabled', 'true');

    await page.getByRole('button', { name: 'Rimuovi img-1.png' }).click();
    await expect(page.getByTestId('selected-image')).toHaveCount(4);
    await expect(page.getByTestId('dropzone')).not.toHaveAttribute('aria-disabled');
  });

  test('accetta i file trascinati nella dropzone', async ({ page }) => {
    const bmp = [...createBmp()];
    const dataTransfer = await page.evaluateHandle((data) => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([new Uint8Array(data)], 'uno.bmp'));
      transfer.items.add(new File([new Uint8Array(data)], 'due.bmp'));
      return transfer;
    }, bmp);
    await page.getByTestId('dropzone').dispatchEvent('drop', { dataTransfer });
    await expect(page.getByTestId('selected-image')).toHaveCount(2);
  });

  test('le immagini non vengono mai inviate in rete', async ({ page }) => {
    const images = await sampleImages(page);
    const outgoing: string[] = [];
    page.on('request', (request) => {
      if (request.method() !== 'GET' || request.postData()) outgoing.push(`${request.method()} ${request.url()}`);
    });
    await upload(page, [images.jpg, images.bmp]);
    await page.getByRole('button', { name: 'Converti', exact: true }).click();
    await expect(page.getByTestId('conversion-card')).toHaveAttribute('data-status', 'done');
    expect(outgoing).toEqual([]);
  });

  test('dopo la conversione si può ricominciare', async ({ page }) => {
    const images = await sampleImages(page);
    await upload(page, [images.jpg]);
    await page.getByRole('button', { name: 'Converti', exact: true }).click();
    await page.getByRole('button', { name: 'Converti altre immagini' }).click();
    await expect(page.getByTestId('dropzone')).toBeVisible();
    await expect(page.getByTestId('selected-image')).toHaveCount(0);
  });
});
