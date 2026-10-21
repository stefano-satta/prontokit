import { normalizeNumberText } from '../chart-generator/numbers';

export type DecimalParse = { ok: true; value: bigint } | { ok: false; reason: 'empty' | 'invalid' | 'too-many-decimals' | 'negative' };

/**
 * Legge un numero non negativo scritto all'italiana come intero scalato di 10^`decimals`
 * (es. "1.250,5" con 2 decimali → 125050n), così i calcoli restano esatti.
 */
export function parseScaled(input: string, decimals: number): DecimalParse {
  if (!input.trim()) return { ok: false, reason: 'empty' };
  const text = normalizeNumberText(input);
  if (text === null) return { ok: false, reason: 'invalid' };
  if (text.startsWith('-')) return { ok: false, reason: 'negative' };
  const [whole = '0', fraction = ''] = text.split('.');
  if (fraction.length > decimals) return { ok: false, reason: 'too-many-decimals' };
  return { ok: true, value: BigInt(whole + fraction.padEnd(decimals, '0')) };
}

/** Divisione intera con arrotondamento commerciale (metà per eccesso) per valori non negativi. */
export const divideRounded = (value: bigint, divisor: bigint): bigint => (value * 2n + divisor) / (divisor * 2n);

export const pow10 = (exponent: number): bigint => 10n ** BigInt(exponent);
