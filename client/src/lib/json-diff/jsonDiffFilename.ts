import { timestampedFilename } from '../fileName';

/** Nome del file scaricato, con data e ora locali: "json-2026-10-20-0905.json". */
export const jsonDiffFilename = (date?: Date): string => timestampedFilename('json', 'json', date);
