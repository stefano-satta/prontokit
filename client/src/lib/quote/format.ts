import type { QuoteCurrency } from '../../models/quote';

const moneyFormatters = new Map<string, Intl.NumberFormat>();

const moneyFormatter = (currency: QuoteCurrency, maxDecimals: number) => {
  const key = `${currency}-${maxDecimals}`;
  let formatter = moneyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency,
      currencyDisplay: currency === 'EUR' ? 'symbol' : 'code',
      minimumFractionDigits: 2,
      maximumFractionDigits: maxDecimals,
      // In it-IT i numeri di 4 cifre non avrebbero il punto delle migliaia: in un documento si vuole "1.234,50"
      useGrouping: 'always',
    });
    moneyFormatters.set(key, formatter);
  }
  return formatter;
};

/** Importo in centesimi all'italiana: "1.234,50 €", "1.234,50 USD". */
export const formatMoney = (cents: number, currency: QuoteCurrency): string => moneyFormatter(currency, 2).format(cents / 100);

/** Prezzo unitario: almeno 2 decimali, fino a 4 se l'utente li ha scritti (0,0125 €). */
export const formatUnitPrice = (value: number, currency: QuoteCurrency): string => moneyFormatter(currency, 4).format(value);

const quantityFormatter = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 3, useGrouping: 'always' });
export const formatQuantity = (value: number): string => quantityFormatter.format(value);

const percentFormatter = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 });
export const formatPercent = (value: number): string => `${percentFormatter.format(value)}%`;

/** Simbolo o codice della valuta, per i prefissi dei campi. */
export const currencySymbol = (currency: QuoteCurrency): string =>
  moneyFormatter(currency, 2).formatToParts(0).find((part) => part.type === 'currency')?.value ?? currency;
