import { sanitizeFilePart } from '../fileName';

/** `preventivo_2026-014.pdf`: le barre del numero diventano trattini, il resto si ripulisce. */
export const quoteFileName = (number: string): string =>
  `preventivo_${sanitizeFilePart(number.trim().replace(/[/\\]+/g, '-').replace(/\s+/g, '_'), 'senza-numero')}.pdf`;
