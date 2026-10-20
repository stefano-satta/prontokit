import { describe, expect, it } from 'vitest';
import { buildMarkdown, hasExtractableText } from '../src/lib/pdf-markdown/buildMarkdown';
import type { PdfDocumentText, PdfPageText, PdfTextFragment } from '../src/models/pdf';

const PAGE_HEIGHT = 800;

/** Riga di testo sintetica: una riga = un frammento, y decrescente come in un PDF reale. */
const line = (text: string, y: number, fontSize = 11, x = 50): PdfTextFragment => ({
  text,
  x,
  y,
  fontSize,
  width: text.length * fontSize * 0.5,
});

const page = (pageNumber: number, fragments: PdfTextFragment[]): PdfPageText => ({ pageNumber, height: PAGE_HEIGHT, fragments });

const doc = (pages: PdfPageText[], title: string | null = null): PdfDocumentText => ({ title, pageCount: pages.length, pages });

const body = (markdown: string) => markdown.split('---\n').slice(2).join('---\n').trim();

describe('buildMarkdown', () => {
  it('scrive il front matter con titolo, sorgente e numero di pagine', () => {
    const { markdown } = buildMarkdown(doc([page(1, [line('Ciao', 700)])], 'Relazione "2026"'), 'relazione.pdf');
    expect(markdown.startsWith('---\ntitle: "Relazione \\"2026\\""\nsource: "relazione.pdf"\npages: 1\n---\n')).toBe(true);
  });

  it('deduce i livelli dei titoli dalla dimensione del carattere', () => {
    const { markdown } = buildMarkdown(
      doc([
        page(1, [
          line('Manuale utente', 750, 24),
          line('Installazione', 700, 16),
          line('Il programma si installa in pochi minuti.', 680),
          line('Requisiti', 640, 13),
          line('Serve Node 20 o superiore.', 620),
        ]),
      ]),
      'm.pdf',
    );
    expect(body(markdown)).toContain('# Manuale utente\n\n## Installazione\n\nIl programma si installa in pochi minuti.\n\n### Requisiti');
  });

  it('ricompone i paragrafi e le parole sillabate a fine riga', () => {
    const { markdown } = buildMarkdown(
      doc([page(1, [line('La conversione avviene local-', 700), line('mente nel browser.', 686), line('Nuovo paragrafo.', 640)])]),
      'p.pdf',
    );
    expect(body(markdown)).toContain('La conversione avviene localmente nel browser.\n\nNuovo paragrafo.');
  });

  it('normalizza gli elenchi puntati e numerati senza scambiare un numero negativo per un punto elenco', () => {
    const { markdown } = buildMarkdown(
      doc([page(1, [line('• primo', 700), line('◦ secondo', 686), line('2) terzo', 672), line('-5% rispetto al 2025', 630)])]),
      'l.pdf',
    );
    expect(body(markdown)).toContain('- primo\n- secondo\n2. terzo\n\n-5% rispetto al 2025');
  });

  it('rimuove intestazioni, piè di pagina e numeri di pagina ripetuti', () => {
    const pages = [1, 2, 3].map((n) =>
      page(n, [line('ACME S.p.A. · Riservato', 780, 9), line(`Contenuto della pagina ${n}.`, 700), line(`${n} / 3`, 30, 9)]),
    );
    const text = body(buildMarkdown(doc(pages), 'r.pdf').markdown);
    expect(text).not.toContain('ACME');
    expect(text).not.toMatch(/\d \/ 3/);
    expect(text).toContain('<!-- page 2 -->\n\nContenuto della pagina 2.');
  });

  it('unisce i frammenti della stessa riga rispettando gli spazi', () => {
    const { markdown } = buildMarkdown(
      doc([page(1, [{ text: 'Totale', x: 50, y: 700, width: 30, fontSize: 11 }, { text: '42 €', x: 100, y: 700.4, width: 20, fontSize: 11 }])]),
      't.pdf',
    );
    expect(body(markdown)).toContain('Totale 42 €');
  });

  it('protegge i paragrafi che sembrerebbero sintassi Markdown', () => {
    const { markdown } = buildMarkdown(doc([page(1, [line('# non è un titolo', 700)])]), 'e.pdf');
    expect(body(markdown)).toContain('\\# non è un titolo');
  });

  it('normalizza le legature tipografiche', () => {
    const { markdown } = buildMarkdown(doc([page(1, [line('ﬁne del ﬂusso', 700)])]), 'f.pdf');
    expect(body(markdown)).toContain('fine del flusso');
  });
});

describe('hasExtractableText', () => {
  it('è falso per un PDF senza testo (es. scansione)', () => {
    expect(hasExtractableText(doc([page(1, [])]))).toBe(false);
    expect(hasExtractableText(doc([page(1, [line('  ', 700)])]))).toBe(false);
    expect(hasExtractableText(doc([page(1, [line('Testo', 700)])]))).toBe(true);
  });
});
