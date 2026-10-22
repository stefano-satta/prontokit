import type { LengthRange, LengthStatus } from '../../models/metaTags';

/**
 * Intervalli consigliati in caratteri. Google non pubblica limiti ufficiali: tronca il testo in base ai pixel
 * (circa 600 px per il titolo su desktop). Questi sono gli intervalli più usati nelle guide SEO:
 * sotto il minimo si spreca spazio nei risultati, sopra il massimo il testo rischia di essere tagliato.
 */
export const LENGTH_LIMITS = {
  title: { min: 50, max: 60 },
  description: { min: 145, max: 160 },
} as const satisfies Record<string, LengthRange>;

export const lengthStatus = (value: string, { min, max }: LengthRange): LengthStatus => {
  const length = cleanText(value).length;
  if (length === 0) return 'empty';
  if (length < min) return 'short';
  return length > max ? 'long' : 'ok';
};

/** Spazi e a capo ridotti a un solo spazio: è così che il testo finisce nei tag. */
export const cleanText = (value: string) => value.replace(/\s+/g, ' ').trim();
