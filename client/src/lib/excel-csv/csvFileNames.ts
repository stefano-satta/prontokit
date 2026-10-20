import { baseNameOf, sanitizeFilePart } from '../fileName';

const SPREADSHEET_EXTENSION = /\.(xlsx|xlsm|xlsb|xls|ods)$/i;
const FALLBACK_BASE = 'foglio-di-calcolo';

export const spreadsheetBaseName = (originalName: string): string =>
  baseNameOf(originalName, SPREADSHEET_EXTENSION, FALLBACK_BASE);

/** CSV di un solo foglio: `Bilancio - Gennaio.csv`, oppure `Bilancio.csv` se il file ha un solo foglio. */
export const csvFilename = (originalName: string, sheetName: string, singleSheet: boolean): string => {
  const base = spreadsheetBaseName(originalName);
  return singleSheet ? `${base}.csv` : `${base} - ${sanitizeFilePart(sheetName, 'foglio')}.csv`;
};

export const zipFilename = (originalName: string): string => `${spreadsheetBaseName(originalName)}.zip`;

/**
 * Nomi delle voci nello ZIP, uno per foglio: ripuliti (niente percorsi, quindi niente "zip slip")
 * e resi univoci senza distinguere maiuscole, perché Windows e macOS non le distinguono.
 */
export const zipEntryNames = (sheetNames: readonly string[]): string[] => {
  const used = new Set<string>();
  return sheetNames.map((sheetName, index) => {
    const base = sanitizeFilePart(sheetName, `foglio-${index + 1}`);
    let candidate = base;
    for (let n = 2; used.has(candidate.toLowerCase()); n++) candidate = `${base} (${n})`;
    used.add(candidate.toLowerCase());
    return `${candidate}.csv`;
  });
};
