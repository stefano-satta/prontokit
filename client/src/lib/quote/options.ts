import type { QuoteCurrency, VatRate } from '../../models/quote';

export const CURRENCIES: readonly { value: QuoteCurrency; label: string }[] = [
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'USD', label: 'Dollaro USA (USD)' },
  { value: 'GBP', label: 'Sterlina (GBP)' },
  { value: 'CHF', label: 'Franco svizzero (CHF)' },
];

export const VAT_RATES: readonly { value: VatRate; label: string }[] = [
  { value: 22, label: '22% (ordinaria)' },
  { value: 10, label: '10% (ridotta)' },
  { value: 5, label: '5% (ridotta)' },
  { value: 4, label: '4% (minima)' },
  { value: 0, label: '0% (senza IVA)' },
];

/** Massimo di giorni di validità: oltre un anno un preventivo non ha più senso. */
export const MAX_VALIDITY_DAYS = 365;
