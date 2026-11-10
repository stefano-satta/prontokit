import { localHourMinute, localIsoDate } from './localDate';

const MAX_BASENAME = 80;
/** Nomi riservati di Windows: un file chiamato così non si può salvare. */
const WINDOWS_RESERVED = /^(con|prn|aux|nul|com\d|lpt\d)$/i;

/** Parte di nome file sicura: niente percorsi, caratteri di controllo o riservati, punti iniziali. */
export const sanitizeFilePart = (name: string, fallback: string): string => {
  const clean = name
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]+/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s.]+|[\s.]+$/g, '')
    .slice(0, MAX_BASENAME)
    .trim();
  return !clean || WINDOWS_RESERVED.test(clean) ? fallback : clean;
};

/** Nome del file caricato senza percorso né estensione. */
export const baseNameOf = (originalName: string, extension: RegExp, fallback: string): string =>
  sanitizeFilePart(originalName.replace(/^.*[\\/]/, '').replace(extension, ''), fallback);

/** Nome con data e ora locali, per i testi scritti in pagina: `json-2026-10-20-0905.json`. */
export const timestampedFilename = (prefix: string, extension: string, date: Date = new Date()): string =>
  `${prefix}-${localIsoDate(date)}-${localHourMinute(date)}.${extension}`;

/**
 * Nomi univoci per più file scaricati insieme (ZIP), senza distinguere maiuscole perché Windows e macOS
 * non le distinguono: il secondo `foto` diventa `foto (2)`. Le basi devono essere già ripulite.
 */
export const uniqueFilenames = (bases: readonly string[], extension: string): string[] => {
  const used = new Set<string>();
  return bases.map((base) => {
    let candidate = base;
    for (let n = 2; used.has(candidate.toLowerCase()); n++) candidate = `${base} (${n})`;
    used.add(candidate.toLowerCase());
    return `${candidate}.${extension}`;
  });
};
