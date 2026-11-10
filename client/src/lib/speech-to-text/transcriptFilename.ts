import { timestampedFilename } from '../fileName';

/** Nome del file .txt scaricato, con data e ora locali: "trascrizione-2026-10-17-1134.txt". */
export const transcriptFilename = (date?: Date): string => timestampedFilename('trascrizione', 'txt', date);
