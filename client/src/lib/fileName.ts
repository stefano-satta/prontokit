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

/** Nome file sicuro per il download del Markdown. */
export const toMarkdownFilename = (originalName: string): string =>
  `${baseNameOf(originalName, /\.pdf$/i, 'documento')}.md`;
