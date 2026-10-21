const PLAIN_NUMBER = /^-?\d+(\.\d+)?$/;
/** "1.250" o "12.500.000": punti come separatori delle migliaia all'italiana */
const DOTTED_THOUSANDS = /^-?\d{1,3}(\.\d{3})+$/;

/**
 * Riporta un numero scritto all'italiana ("12,5", "1.250,75") o con il punto decimale ("12.5")
 * alla forma `-1234.5`. Un punto seguito da gruppi di tre cifre senza virgola vale come separatore delle migliaia.
 */
export const normalizeNumberText = (input: string): string | null => {
  let text = input.replace(/[\s  ]/g, '').replace(/^\+/, '');
  if (text.includes(',')) text = text.replace(/\./g, '').replace(',', '.');
  else if (DOTTED_THOUSANDS.test(text)) text = text.replace(/\./g, '');
  return PLAIN_NUMBER.test(text) ? text : null;
};

/** Legge un numero scritto all'italiana o con il punto decimale (vedi `normalizeNumberText`). */
export const parseNumber = (input: string): number | null => {
  const text = normalizeNumberText(input);
  if (text === null) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};

const formatters = new Map<string, Intl.NumberFormat>();

/** Formato italiano; senza `decimals` mostra le cifre decimali così come inserite. */
export const formatNumber = (value: number, decimals?: number): string => {
  const key = String(decimals ?? 'auto');
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(
      'it-IT',
      decimals === undefined
        ? { maximumFractionDigits: 6 }
        : { minimumFractionDigits: decimals, maximumFractionDigits: decimals },
    );
    formatters.set(key, formatter);
  }
  return formatter.format(value);
};

export const formatPercent = (value: number, decimals: number): string => `${formatNumber(value, decimals)}%`;

export const sumOf = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0);
