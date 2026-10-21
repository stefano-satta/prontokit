import { describe, expect, it } from 'vitest';
import { calculateLine, calculateQuote } from '../src/lib/quote/calculateQuote';
import { createLine, createQuote } from '../src/lib/quote/createQuote';
import { addDays, formatDate, isIsoDate } from '../src/lib/quote/dates';
import { divideRounded, parseScaled } from '../src/lib/quote/decimal';
import { formatMoney, formatUnitPrice } from '../src/lib/quote/format';
import { formatIban, isValidIban } from '../src/lib/quote/iban';
import { toPdfText } from '../src/lib/quote/pdfText';
import { quoteFileName } from '../src/lib/quote/quoteFileName';
import { lineField, validUntilOf, validateQuote } from '../src/lib/quote/validateQuote';
import type { Quote, QuoteLine } from '../src/models/quote';

const line = (fields: Partial<QuoteLine>): QuoteLine => ({ ...createLine(), ...fields });

const quoteWith = (fields: Partial<Quote>): Quote => ({ ...createQuote('2026-10-21'), ...fields });

const validQuote = (fields: Partial<Quote> = {}): Quote =>
  quoteWith({
    number: '2026/001',
    supplier: { ...createQuote().supplier, name: 'Rossi Design' },
    client: { ...createQuote().client, name: 'Bianchi Srl' },
    lines: [line({ description: 'Logo', unitPrice: '500' })],
    ...fields,
  });

// Gli spazi di Intl sono non separabili: si confrontano come spazi normali
const plain = (text: string) => text.replace(/\s/g, ' ');

describe('parseScaled', () => {
  it.each([
    ['1.250,5', 2, 125050n],
    ['1250.5', 2, 125050n],
    ['1.500', 2, 150000n],
    ['0,0125', 4, 125n],
    ['3', 3, 3000n],
  ])('legge %s con %i decimali', (input, decimals, expected) => {
    expect(parseScaled(input, decimals)).toEqual({ ok: true, value: expected });
  });

  it('distingue vuoto, negativo, troppi decimali e testo', () => {
    expect(parseScaled('  ', 2)).toEqual({ ok: false, reason: 'empty' });
    expect(parseScaled('-5', 2)).toEqual({ ok: false, reason: 'negative' });
    expect(parseScaled('1,234', 2)).toEqual({ ok: false, reason: 'too-many-decimals' });
    expect(parseScaled('dieci', 2)).toEqual({ ok: false, reason: 'invalid' });
  });

  it('arrotonda a metà per eccesso', () => {
    expect(divideRounded(15n, 10n)).toBe(2n);
    expect(divideRounded(14n, 10n)).toBe(1n);
    expect(divideRounded(25n, 10n)).toBe(3n);
  });
});

describe('calculateLine', () => {
  it('moltiplica quantità e prezzo in centesimi esatti', () => {
    expect(calculateLine(line({ quantity: '3', unitPrice: '0,1' })).totalCents).toBe(30);
    expect(calculateLine(line({ quantity: '1,5', unitPrice: '45' })).totalCents).toBe(6750);
  });

  it('applica lo sconto di riga e arrotonda al centesimo', () => {
    expect(calculateLine(line({ quantity: '1', unitPrice: '100', discount: '10' })).totalCents).toBe(9000);
    // 3 × 0,0125 = 0,0375 → 0,04
    expect(calculateLine(line({ quantity: '3', unitPrice: '0,0125' })).totalCents).toBe(4);
    // 1 × 9,99 − 33,33% = 6,660333 → 6,66
    expect(calculateLine(line({ quantity: '1', unitPrice: '9,99', discount: '33,33' })).totalCents).toBe(666);
  });

  it('vale zero se quantità o prezzo non sono validi', () => {
    expect(calculateLine(line({ quantity: 'tre', unitPrice: '10' })).totalCents).toBe(0);
    expect(calculateLine(line({ quantity: '2', unitPrice: '' })).totalCents).toBe(0);
  });

  it('considera vuota una voce con la sola quantità predefinita', () => {
    expect(calculateLine(createLine()).filled).toBe(false);
    expect(calculateLine(line({ description: 'Sito' })).filled).toBe(true);
  });
});

describe('calculateQuote', () => {
  const lines = [line({ description: 'A', quantity: '2', unitPrice: '100' }), line({ description: 'B', unitPrice: '50,50' })];

  it('calcola imponibile, IVA da aggiungere e totale da pagare', () => {
    expect(calculateQuote(quoteWith({ lines }))).toMatchObject({
      subtotalCents: 25050,
      discountCents: 0,
      taxableCents: 25050,
      vatCents: 5511,
      totalCents: 30561,
    });
  });

  it('applica lo sconto globale in percentuale o in importo, mai oltre il totale', () => {
    expect(calculateQuote(quoteWith({ lines, discountType: 'percent', discountValue: '10' })).discountCents).toBe(2505);
    expect(calculateQuote(quoteWith({ lines, discountType: 'amount', discountValue: '50,50' })).taxableCents).toBe(20000);
    expect(calculateQuote(quoteWith({ lines, discountType: 'amount', discountValue: '1000' })).taxableCents).toBe(0);
  });

  it("calcola l'IVA una sola volta sull'imponibile", () => {
    // Tre voci da 0,33: per voce 0,07 × 3 = 0,21; sul totale 0,99 × 22% = 0,2178 → 0,22
    const small = [1, 2, 3].map((n) => line({ description: `V${n}`, unitPrice: '0,33' }));
    expect(calculateQuote(quoteWith({ lines: small })).vatCents).toBe(22);
  });

  it('con IVA allo 0% il totale coincide con l’imponibile', () => {
    const totals = calculateQuote(quoteWith({ lines, vatRate: 0 }));
    expect(totals.vatCents).toBe(0);
    expect(totals.totalCents).toBe(totals.taxableCents);
  });

  it('ignora le voci vuote', () => {
    expect(calculateQuote(quoteWith({ lines: [...lines, createLine()] })).subtotalCents).toBe(25050);
  });
});

describe('validateQuote', () => {
  const issuesOf = (quote: Quote) => validateQuote(quote, calculateQuote(quote));

  it('un preventivo completo non ha problemi', () => {
    expect(issuesOf(validQuote())).toEqual([]);
  });

  it('il preventivo vuoto chiede numero, fornitore, cliente e una voce', () => {
    expect(issuesOf(createQuote('2026-10-21')).map((issue) => issue.field)).toEqual(['number', 'supplier.name', 'client.name', 'lines']);
  });

  it('segnala i problemi di ogni voce con il suo campo', () => {
    const bad = line({ description: '', quantity: '0', unitPrice: 'abc', discount: '120' });
    const fields = issuesOf(validQuote({ lines: [bad] })).map((issue) => issue.field);
    expect(fields).toEqual(['description', 'quantity', 'unitPrice', 'discount'].map((key) => lineField(bad, key as never)));
  });

  it('controlla validità, sconto globale e IBAN', () => {
    expect(issuesOf(validQuote({ validityDays: '0' }))[0]?.field).toBe('validity');
    expect(issuesOf(validQuote({ validityMode: 'date', validUntil: '2026-10-01' }))[0]?.message).toContain('21/10/2026');
    expect(issuesOf(validQuote({ discountType: 'amount', discountValue: '600' }))[0]?.message).toContain('500,00');
    expect(issuesOf(validQuote({ iban: 'IT60X0542811101000000123457' }))[0]?.field).toBe('iban');
    expect(issuesOf(validQuote({ iban: 'IT60 X054 2811 1010 0000 0123 456' }))).toEqual([]);
  });

  it('calcola la scadenza dai giorni o dalla data scelta', () => {
    expect(validUntilOf(validQuote())).toBe('2026-11-20');
    expect(validUntilOf(validQuote({ validityMode: 'date', validUntil: '2026-12-31' }))).toBe('2026-12-31');
    expect(validUntilOf(validQuote({ validityDays: 'trenta' }))).toBeNull();
  });
});

describe('formattazione', () => {
  it('formatta importi e prezzi unitari all’italiana', () => {
    expect(plain(formatMoney(123450, 'EUR'))).toBe('1.234,50 €');
    expect(plain(formatMoney(5000, 'USD'))).toBe('50,00 USD');
    expect(plain(formatUnitPrice(0.0125, 'EUR'))).toBe('0,0125 €');
    expect(plain(formatUnitPrice(12, 'EUR'))).toBe('12,00 €');
  });

  it('gestisce le date senza scivolare con l’ora legale', () => {
    expect(addDays('2026-10-21', 30)).toBe('2026-11-20');
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30');
    expect(formatDate('2026-01-05')).toBe('05/01/2026');
    expect(isIsoDate('2026-02-31')).toBe(false);
  });

  it('valida e raggruppa l’IBAN', () => {
    expect(isValidIban('it60x0542811101000000123456')).toBe(true);
    expect(isValidIban('IT60X054281110100000012345')).toBe(false);
    expect(formatIban('IT60X0542811101000000123456')).toBe('IT60 X054 2811 1010 0000 0123 456');
  });

  it('rende il testo stampabile con il font standard del PDF', () => {
    expect(toPdfText('Caffè “perfetto” – 10 € … ok')).toBe('Caffè “perfetto” – 10 € … ok');
    expect(toPdfText('Łódź ≥ 3 🚀\r\nfine')).toBe('?ódz >= 3 ?\nfine');
    expect(toPdfText('Ş')).toBe('S');
  });

  it('crea un nome file sicuro dal numero', () => {
    expect(quoteFileName('2026/014')).toBe('preventivo_2026-014.pdf');
    expect(quoteFileName('  ')).toBe('preventivo_senza-numero.pdf');
  });
});
