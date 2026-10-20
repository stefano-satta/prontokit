import { SITE } from '../../config/site';
import type { PdfRejectReason } from '../../models/pdfMerge';
import { formatBytes } from '../formatBytes';
import { MAX_PDF_BYTES } from '../validatePdf';

export const MAX_PDFS = 5;
export const MIN_PDFS = 2;
export const PDF_ACCEPT = '.pdf,application/pdf';

const quoteList = (names: readonly string[]) => {
  const quoted = names.map((name) => `“${name}”`);
  return quoted.length > 1 ? `${quoted.slice(0, -1).join(', ')} e ${quoted.at(-1)}` : (quoted[0] ?? '');
};

/** Quanti PDF nuovi entrano ancora nella selezione, rispettando il limite. */
export const freeSlots = (selected: number): number => Math.max(0, MAX_PDFS - selected);

/** Avvisi per i file scartati, raggruppati per motivo e con l'indicazione di cosa fare. */
export function rejectionNotices(rejected: readonly { name: string; reason: PdfRejectReason }[], overLimit: readonly string[]): string[] {
  const by = (reason: PdfRejectReason) => rejected.filter((item) => item.reason === reason).map((item) => item.name);
  const one = (names: readonly string[], singular: string, plural: string) => (names.length === 1 ? singular : plural);
  const notices: string[] = [];
  const isProtected = by('protected');
  const invalid = by('invalid');
  const unreadable = by('unreadable');
  const tooLarge = by('too-large');
  const empty = by('empty');
  if (isProtected.length) {
    notices.push(
      `${quoteList(isProtected)} ${one(isProtected, 'è protetto', 'sono protetti')} da password o da restrizioni e non si ${one(isProtected, 'può', 'possono')} unire: salva una copia senza protezione e riprova.`,
    );
  }
  if (invalid.length) notices.push(`${quoteList(invalid)} ${one(invalid, 'non è un PDF', 'non sono PDF')}: carica solo file PDF.`);
  if (unreadable.length) {
    notices.push(
      `${quoteList(unreadable)} ${one(unreadable, 'sembra danneggiato', 'sembrano danneggiati')}: prova ad aprirlo e salvarlo di nuovo in PDF.`,
    );
  }
  if (tooLarge.length) {
    notices.push(`${quoteList(tooLarge)} ${one(tooLarge, 'supera', 'superano')} il limite di ${formatBytes(MAX_PDF_BYTES)}: riducine le dimensioni e riprova.`);
  }
  if (empty.length) notices.push(`${quoteList(empty)} ${one(empty, 'è vuoto', 'sono vuoti')}: scegli un PDF che contenga dati.`);
  if (overLimit.length) {
    notices.push(
      `Puoi unire al massimo ${MAX_PDFS} PDF alla volta: ${quoteList(overLimit)} ${one(overLimit, 'non è stato aggiunto', 'non sono stati aggiunti')}.`,
    );
  }
  return notices;
}

/** Sposta un elemento di una posizione; fuori dai limiti restituisce l'elenco invariato. */
export function moveItem<T>(items: readonly T[], index: number, offset: -1 | 1): T[] {
  const target = index + offset;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) return [...items];
  const next = [...items];
  [next[index], next[target]] = [next[target]!, next[index]!];
  return next;
}

/** `pdf_unito_prontokit.pdf`: il nome del sito segue `SITE.name`. */
export const mergedPdfFilename = (): string => `pdf_unito_${SITE.name.toLowerCase()}.pdf`;
