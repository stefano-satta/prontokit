import { PDFDocument, StandardFonts } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { calculateQuote } from '../src/lib/quote/calculateQuote';
import { createLine, createParty, createQuote } from '../src/lib/quote/createQuote';
import { createQuotePdf, wrapText } from '../src/services/quote/quotePdf';
import type { Quote } from '../src/models/quote';

const quoteWithLines = (count: number, description = 'Sviluppo pagina'): Quote => ({
  ...createQuote('2026-10-21'),
  number: '2026/014',
  supplier: { ...createParty(), name: 'Rossi Design', vatNumber: '01234567890' },
  client: { ...createParty(), name: 'Bianchi Srl' },
  lines: Array.from({ length: count }, (_, index) => ({ ...createLine(), description: `${description} ${index + 1}`, unitPrice: '100' })),
  paymentTerms: '30% all’ordine, saldo alla consegna',
  iban: 'IT60X0542811101000000123456',
});

const pagesOf = async (quote: Quote) => {
  const bytes = await createQuotePdf(quote, calculateQuote(quote), null);
  return (await PDFDocument.load(bytes)).getPageCount();
};

describe('createQuotePdf', () => {
  it('crea un PDF A4 di una pagina per un preventivo breve', async () => {
    const quote = quoteWithLines(3);
    const doc = await PDFDocument.load(await createQuotePdf(quote, calculateQuote(quote), null));
    expect(doc.getPageCount()).toBe(1);
    expect(doc.getTitle()).toBe('Preventivo 2026/014 Bianchi Srl');
    const { width, height } = doc.getPage(0).getSize();
    expect([Math.round(width), Math.round(height)]).toEqual([595, 842]);
  });

  it('va su più pagine quando le voci sono tante', async () => {
    expect(await pagesOf(quoteWithLines(80))).toBeGreaterThan(1);
  });

  it('spezza una descrizione più lunga di una pagina', async () => {
    const long = 'Riga di descrizione molto dettagliata.\n'.repeat(120);
    expect(await pagesOf(quoteWithLines(1, long))).toBeGreaterThan(1);
  });

  it('non si blocca con caratteri fuori dal font standard', async () => {
    expect(await pagesOf(quoteWithLines(2, 'Łódź 🚀 ≥ 3'))).toBe(1);
  });
});

describe('wrapText', () => {
  it('va a capo nelle parole e spezza quelle troppo lunghe', async () => {
    const font = await (await PDFDocument.create()).embedFont(StandardFonts.Helvetica);
    const lines = wrapText('uno due tre\nquattro ' + 'x'.repeat(200), font, 9, 100);
    expect(lines[0]).toBe('uno due tre');
    expect(lines.length).toBeGreaterThan(3);
    expect(lines.every((line) => font.widthOfTextAtSize(line, 9) <= 100)).toBe(true);
  });
});
