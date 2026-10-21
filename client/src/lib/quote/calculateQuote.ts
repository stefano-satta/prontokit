import type { Quote, QuoteLine, QuoteLineTotal, QuoteTotals } from '../../models/quote';
import { divideRounded, parseScaled, pow10 } from './decimal';

/** Cifre decimali accettate: quantità (1,5 ore), prezzi unitari (0,0125 €) e sconti in percentuale. */
export const QUANTITY_DECIMALS = 3;
export const PRICE_DECIMALS = 4;
export const PERCENT_DECIMALS = 2;
const CENT_DECIMALS = 2;

const HUNDRED_PERCENT = 100n * pow10(PERCENT_DECIMALS);

/** Una voce entra nel preventivo se ha almeno un campo compilato oltre alla quantità predefinita. */
export const isLineFilled = (line: QuoteLine): boolean =>
  [line.description, line.unitPrice, line.discount, line.unit].some((value) => value.trim() !== '');

const parsedOrNull = (input: string, decimals: number): bigint | null => {
  const parsed = parseScaled(input, decimals);
  return parsed.ok ? parsed.value : null;
};

/** Percentuale di sconto valida (0–100) come intero scalato, 0 se vuota o non valida. */
const discountOf = (input: string): bigint => {
  const value = parsedOrNull(input, PERCENT_DECIMALS);
  return value !== null && value <= HUNDRED_PERCENT ? value : 0n;
};

/** Importo della voce in centesimi: quantità × prezzo × (1 − sconto), arrotondato al centesimo. */
export function calculateLine(line: QuoteLine): QuoteLineTotal {
  const quantity = parsedOrNull(line.quantity, QUANTITY_DECIMALS);
  const unitPrice = parsedOrNull(line.unitPrice, PRICE_DECIMALS);
  const discount = discountOf(line.discount);
  const base = {
    id: line.id,
    filled: isLineFilled(line),
    quantity: quantity === null ? null : Number(quantity) / Number(pow10(QUANTITY_DECIMALS)),
    unitPrice: unitPrice === null ? null : Number(unitPrice) / Number(pow10(PRICE_DECIMALS)),
    discountPercent: Number(discount) / Number(pow10(PERCENT_DECIMALS)),
  };
  if (quantity === null || unitPrice === null) return { ...base, totalCents: 0 };

  const product = quantity * unitPrice * (HUNDRED_PERCENT - discount);
  const scale = QUANTITY_DECIMALS + PRICE_DECIMALS + PERCENT_DECIMALS + 2 - CENT_DECIMALS;
  return { ...base, totalCents: Number(divideRounded(product, pow10(scale))) };
}

/** Sconto globale in centesimi: mai oltre la somma delle voci, 0 se non valido. */
export function calculateGlobalDiscount(quote: Pick<Quote, 'discountType' | 'discountValue'>, subtotalCents: number): number {
  const subtotal = BigInt(subtotalCents);
  if (quote.discountType === 'percent') {
    const percent = discountOf(quote.discountValue);
    return Number(divideRounded(subtotal * percent, HUNDRED_PERCENT));
  }
  const amount = parsedOrNull(quote.discountValue, CENT_DECIMALS) ?? 0n;
  return Number(amount > subtotal ? subtotal : amount);
}

/**
 * Totali del preventivo: somma delle voci, sconto globale, imponibile, IVA da aggiungere e totale da pagare.
 * L'IVA si calcola una volta sola sull'imponibile complessivo, con arrotondamento al centesimo.
 */
export function calculateQuote(quote: Pick<Quote, 'lines' | 'discountType' | 'discountValue' | 'vatRate'>): QuoteTotals {
  const lines = quote.lines.map(calculateLine);
  const subtotalCents = lines.reduce((sum, line) => (line.filled ? sum + line.totalCents : sum), 0);
  const discountCents = calculateGlobalDiscount(quote, subtotalCents);
  const taxableCents = subtotalCents - discountCents;
  const vatCents = Number(divideRounded(BigInt(taxableCents) * BigInt(quote.vatRate), 100n));
  return { lines, subtotalCents, discountCents, taxableCents, vatCents, totalCents: taxableCents + vatCents };
}
