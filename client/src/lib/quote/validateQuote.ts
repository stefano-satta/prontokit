import type { Quote, QuoteIssue, QuoteLine, QuoteTotals } from '../../models/quote';
import { addDays, formatDate, isIsoDate } from './dates';
import { PERCENT_DECIMALS, PRICE_DECIMALS, QUANTITY_DECIMALS, isLineFilled } from './calculateQuote';
import { parseScaled, type DecimalParse } from './decimal';
import { formatMoney } from './format';
import { isValidIban } from './iban';
import { MAX_VALIDITY_DAYS } from './options';

/** Chiave del campo di una voce, per collegare il messaggio al suo input. */
export const lineField = (line: Pick<QuoteLine, 'id'>, key: keyof Omit<QuoteLine, 'id'>): string => `line.${line.id}.${key}`;

const decimalsWord = (decimals: number) => (decimals === 1 ? 'un decimale' : `${decimals} decimali`);

/** Messaggio per un numero non valido, `null` se va bene. */
const numberProblem = (parsed: DecimalParse, label: string, decimals: number, example = '1.250,50'): string | null => {
  if (parsed.ok) return null;
  switch (parsed.reason) {
    case 'empty':
      return `Inserisci ${label}.`;
    case 'negative':
      return `${capitalize(label)} non può essere negativo.`;
    case 'too-many-decimals':
      return `Usa al massimo ${decimalsWord(decimals)} per ${label}.`;
    default:
      return `Scrivi ${label} come numero, es. ${example}.`;
  }
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Ultimo giorno di validità del preventivo, o `null` se i dati non bastano a calcolarlo. */
export function validUntilOf(quote: Pick<Quote, 'issueDate' | 'validityMode' | 'validityDays' | 'validUntil'>): string | null {
  if (quote.validityMode === 'date') return isIsoDate(quote.validUntil) ? quote.validUntil : null;
  if (!isIsoDate(quote.issueDate)) return null;
  const days = Number(quote.validityDays.trim());
  return Number.isInteger(days) && days >= 1 && days <= MAX_VALIDITY_DAYS ? addDays(quote.issueDate, days) : null;
}

function validateLine(line: QuoteLine, index: number): QuoteIssue[] {
  if (!isLineFilled(line)) return [];
  const label = `Voce ${index + 1}`;
  const issues: QuoteIssue[] = [];
  if (!line.description.trim()) issues.push({ field: lineField(line, 'description'), message: `${label}: scrivi la descrizione.` });

  const quantity = parseScaled(line.quantity, QUANTITY_DECIMALS);
  const quantityProblem = numberProblem(quantity, 'la quantità', QUANTITY_DECIMALS, '2 o 1,5');
  if (quantityProblem) issues.push({ field: lineField(line, 'quantity'), message: `${label}: ${lower(quantityProblem)}` });
  else if (quantity.ok && quantity.value === 0n) issues.push({ field: lineField(line, 'quantity'), message: `${label}: la quantità deve essere maggiore di zero.` });

  const priceProblem = numberProblem(parseScaled(line.unitPrice, PRICE_DECIMALS), 'il prezzo unitario', PRICE_DECIMALS);
  if (priceProblem) issues.push({ field: lineField(line, 'unitPrice'), message: `${label}: ${lower(priceProblem)}` });

  if (line.discount.trim()) {
    const discount = parseScaled(line.discount, PERCENT_DECIMALS);
    const discountProblem = numberProblem(discount, 'lo sconto', PERCENT_DECIMALS, '10 o 12,5');
    if (discountProblem) issues.push({ field: lineField(line, 'discount'), message: `${label}: ${lower(discountProblem)}` });
    else if (discount.ok && discount.value > 100n * 10n ** BigInt(PERCENT_DECIMALS)) {
      issues.push({ field: lineField(line, 'discount'), message: `${label}: lo sconto va da 0 a 100%.` });
    }
  }
  return issues;
}

const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

function validateDiscount(quote: Quote, totals: QuoteTotals): QuoteIssue | null {
  if (!quote.discountValue.trim()) return null;
  const percent = quote.discountType === 'percent';
  const decimals = percent ? PERCENT_DECIMALS : 2;
  const parsed = parseScaled(quote.discountValue, decimals);
  const problem = numberProblem(parsed, 'lo sconto', decimals, percent ? '10 o 12,5' : '1.250,50');
  if (problem) return { field: 'discount', message: problem };
  if (!parsed.ok) return null;
  if (percent && parsed.value > 100n * 10n ** BigInt(decimals)) return { field: 'discount', message: 'Lo sconto va da 0 a 100%.' };
  if (!percent && parsed.value > BigInt(totals.subtotalCents)) {
    return { field: 'discount', message: `Lo sconto supera il totale delle voci (${formatMoney(totals.subtotalCents, quote.currency)}).` };
  }
  return null;
}

/**
 * Cosa manca o non va per scaricare il preventivo. I messaggi dicono il problema e come risolverlo;
 * `field` collega ciascuno al suo campo.
 */
export function validateQuote(quote: Quote, totals: QuoteTotals): QuoteIssue[] {
  const issues: QuoteIssue[] = [];
  if (!quote.number.trim()) issues.push({ field: 'number', message: 'Inserisci il numero del preventivo, es. 2026/001.' });
  if (!isIsoDate(quote.issueDate)) issues.push({ field: 'issueDate', message: 'Inserisci la data del preventivo.' });

  if (quote.validityMode === 'days') {
    const days = Number(quote.validityDays.trim());
    if (!quote.validityDays.trim() || !Number.isInteger(days) || days < 1 || days > MAX_VALIDITY_DAYS) {
      issues.push({ field: 'validity', message: `Indica per quanti giorni vale l'offerta, da 1 a ${MAX_VALIDITY_DAYS}.` });
    }
  } else if (!isIsoDate(quote.validUntil)) {
    issues.push({ field: 'validity', message: "Scegli la data di scadenza dell'offerta." });
  } else if (isIsoDate(quote.issueDate) && quote.validUntil < quote.issueDate) {
    issues.push({ field: 'validity', message: `La scadenza deve venire dopo la data del preventivo (${formatDate(quote.issueDate)}).` });
  }

  if (!quote.supplier.name.trim()) issues.push({ field: 'supplier.name', message: 'Inserisci il tuo nome o la ragione sociale.' });
  if (!quote.client.name.trim()) issues.push({ field: 'client.name', message: 'Inserisci il nome del cliente.' });

  if (!quote.lines.some(isLineFilled)) issues.push({ field: 'lines', message: 'Aggiungi almeno una voce con descrizione e prezzo.' });
  quote.lines.forEach((line, index) => issues.push(...validateLine(line, index)));

  const discount = validateDiscount(quote, totals);
  if (discount) issues.push(discount);

  if (quote.iban.trim() && !isValidIban(quote.iban)) {
    issues.push({ field: 'iban', message: "L'IBAN non è valido: controlla di averlo copiato per intero, es. IT60 X054 2811 1010 0000 0123 456." });
  }
  return issues;
}
