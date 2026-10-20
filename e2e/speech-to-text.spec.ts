import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

interface FakeSpeechOptions {
  unsupported?: boolean;
  denyMicrophone?: boolean;
}

/**
 * Sostituisce microfono e Web Speech API con dei finti controllabili dal test:
 * `window.__speech.say(testo, definitivo)` simula ciò che il browser riconosce.
 */
async function installFakeSpeech(page: Page, options: FakeSpeechOptions = {}) {
  await page.addInitScript(({ unsupported, denyMicrophone }) => {
    type Result = { transcript: string; confidence: number }[] & { isFinal: boolean };
    const speech = {
      started: [] as string[],
      current: null as null | FakeRecognition,
      say(text: string, isFinal: boolean) {
        const recognition = speech.current!;
        const result = Object.assign([{ transcript: text, confidence: 1 }], { isFinal }) as Result;
        const last = recognition.results.length - 1;
        const index = last >= 0 && !recognition.results[last].isFinal ? last : recognition.results.length;
        recognition.results[index] = result;
        recognition.onresult?.({ resultIndex: index, results: recognition.results });
      },
      /** Il browser chiude la sessione da solo, come dopo un silenzio */
      silence() {
        speech.current!.results = [];
        speech.current!.onend?.();
      },
    };

    class FakeRecognition extends EventTarget {
      lang = '';
      continuous = false;
      interimResults = false;
      results: Result[] = [];
      onresult: ((event: unknown) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      constructor() {
        super();
        speech.current = this;
      }
      start() {
        speech.started.push(this.lang);
      }
      stop() {
        setTimeout(() => this.onend?.(), 50);
      }
      abort() {
        this.onend?.();
      }
    }

    Object.assign(window, { __speech: speech });
    const w = window as unknown as Record<string, unknown>;
    delete w.webkitSpeechRecognition;
    if (!unsupported) w.SpeechRecognition = FakeRecognition;
    else delete w.SpeechRecognition;

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => {
          if (denyMicrophone) throw new DOMException('Permission denied', 'NotAllowedError');
          return { getTracks: () => [{ stop() {} }] };
        },
      },
    });
  }, options);
}

const say = (page: Page, text: string, isFinal: boolean) =>
  page.evaluate(([t, f]) => (window as unknown as { __speech: { say: (t: string, f: boolean) => void } }).__speech.say(t, f), [
    text,
    isFinal,
  ] as const);

const startedLocales = (page: Page) =>
  page.evaluate(() => (window as unknown as { __speech: { started: string[] } }).__speech.started);

const transcript = (page: Page) => page.getByRole('textbox', { name: 'Testo trascritto' });
const downloadButton = (page: Page) => page.getByRole('button', { name: 'Scarica .txt' });
const copyButton = (page: Page) => page.getByRole('button', { name: /Copia testo|Copiato/ });
const punctuation = (page: Page, label: string) =>
  page.getByRole('toolbar', { name: 'Punteggiatura' }).getByRole('button', { name: label, exact: true });

test.describe('Trascrizione vocale', () => {
  test('mostra il testo mentre si parla, inserisce la punteggiatura con i tasti e scarica il .txt', async ({ page }) => {
    await installFakeSpeech(page);
    await page.goto('/speech-to-text');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trascrizione vocale');
    await expect(page.getByLabel('Lingua')).toHaveValue('it');
    await expect(downloadButton(page)).toBeDisabled();
    await expect(copyButton(page)).toBeDisabled();

    await page.getByRole('button', { name: 'Inizia a parlare' }).click();
    await expect(page.getByRole('button', { name: 'Ferma registrazione' })).toBeVisible();
    expect(await startedLocales(page)).toEqual(['it-IT']);

    await say(page, 'ciao come', false);
    await expect(transcript(page)).toHaveValue('Ciao come');
    await say(page, 'ciao virgola come stai', true);
    await expect(transcript(page)).toHaveValue('Ciao virgola come stai');
    await expect(transcript(page)).toHaveAttribute('readonly');
    await expect(downloadButton(page)).toBeDisabled();
    await expect(copyButton(page)).toBeDisabled();
    await expect(punctuation(page, 'Punto di domanda')).toBeDisabled();

    await page.getByRole('button', { name: 'Ferma registrazione' }).click();
    await expect(page.getByRole('button', { name: 'Inizia a parlare' })).toBeEnabled();
    await expect(transcript(page)).not.toHaveAttribute('readonly');

    await transcript(page).fill('Ciao come stai');
    await punctuation(page, 'Punto di domanda').click();
    await transcript(page).pressSequentially('tutto bene');
    await punctuation(page, 'Punto').click();
    await expect(transcript(page)).toHaveValue('Ciao come stai? tutto bene. ');
    // Il cursore dopo "Ciao": la virgola va lì
    await transcript(page).evaluate((el: HTMLTextAreaElement) => el.setSelectionRange(4, 4));
    await punctuation(page, 'Virgola').click();
    await expect(transcript(page)).toHaveValue('Ciao, come stai? tutto bene. ');

    const [download] = await Promise.all([page.waitForEvent('download'), downloadButton(page).click()]);
    expect(download.suggestedFilename()).toMatch(/^trascrizione-\d{4}-\d{2}-\d{2}-\d{4}\.txt$/);
    expect((await readFile((await download.path())!)).toString('utf8')).toBe('Ciao, come stai? tutto bene. ');
  });

  test('copia il testo negli appunti', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await installFakeSpeech(page);
    await page.goto('/speech-to-text');
    await transcript(page).fill('Testo da copiare');
    await copyButton(page).click();
    await expect(copyButton(page)).toHaveText('Copiato');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Testo da copiare');
  });

  test('i tasti di punteggiatura mostrano l’etichetta al passaggio del mouse', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Niente hover sui dispositivi touch');
    await installFakeSpeech(page);
    await page.goto('/speech-to-text');
    const bar = page.getByRole('toolbar', { name: 'Punteggiatura' });
    await expect(bar.getByRole('button')).toHaveCount(8);
    const label = bar.getByText('Nuovo paragrafo');
    await expect(label).toHaveCSS('opacity', '0');
    await punctuation(page, 'Nuovo paragrafo').hover();
    await expect(label).toHaveCSS('opacity', '1');
  });

  test('dopo un silenzio continua ad ascoltare e accoda il testo', async ({ page }) => {
    await installFakeSpeech(page);
    await page.goto('/speech-to-text');
    await page.getByRole('button', { name: 'Inizia a parlare' }).click();
    await say(page, 'prima parte', true);
    await page.evaluate(() => (window as unknown as { __speech: { silence: () => void } }).__speech.silence());

    await expect(page.getByRole('button', { name: 'Ferma registrazione' })).toBeVisible();
    expect(await startedLocales(page)).toHaveLength(2);
    await say(page, 'seconda parte', true);
    await expect(transcript(page)).toHaveValue('Prima parte seconda parte');
  });

  test('usa la lingua scelta per il riconoscimento', async ({ page }) => {
    await installFakeSpeech(page);
    await page.goto('/speech-to-text');
    await page.getByLabel('Lingua').selectOption('fr');

    await page.getByRole('button', { name: 'Inizia a parlare' }).click();
    await expect(page.getByLabel('Lingua')).toBeDisabled();
    expect(await startedLocales(page)).toEqual(['fr-FR']);
    await say(page, 'bonjour ça va', true);
    await expect(transcript(page)).toHaveValue('Bonjour ça va');
  });

  test('spiega cosa fare se il permesso del microfono è negato', async ({ page }) => {
    await installFakeSpeech(page, { denyMicrophone: true });
    await page.goto('/speech-to-text');
    await page.getByRole('button', { name: 'Inizia a parlare' }).click();
    await expect(page.getByRole('alert')).toContainText('Accesso al microfono negato');
    await expect(page.getByRole('button', { name: 'Inizia a parlare' })).toBeEnabled();
    expect(await startedLocales(page)).toEqual([]);
  });

  test('avvisa se il browser non supporta il riconoscimento vocale', async ({ page }) => {
    await installFakeSpeech(page, { unsupported: true });
    await page.goto('/speech-to-text');
    await expect(page.getByRole('alert')).toContainText('non supporta il riconoscimento vocale');
    await expect(page.getByRole('button', { name: 'Inizia a parlare' })).toBeDisabled();
    await expect(transcript(page)).toBeEditable();
  });
});
