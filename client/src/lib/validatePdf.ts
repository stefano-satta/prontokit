import { formatBytes } from './formatBytes';

export const MAX_PDF_BYTES = 25 * 1024 * 1024;

const PDF_SIGNATURE = '%PDF-';
/** La specifica tollera byte spuri prima della firma: la cerchiamo nel primo KB. */
const SIGNATURE_WINDOW = 1024;

export type PdfValidation = { ok: true } | { ok: false; code: 'invalid-file' | 'too-large'; message: string };

/** Controlla dimensione e firma reale del file: estensione e MIME type si possono falsificare. */
export async function validatePdf(file: File): Promise<PdfValidation> {
  if (file.size === 0) return { ok: false, code: 'invalid-file', message: 'Il file è vuoto.' };
  if (file.size > MAX_PDF_BYTES) {
    return {
      ok: false,
      code: 'too-large',
      message: `Il file pesa ${formatBytes(file.size)}: il limite è ${formatBytes(MAX_PDF_BYTES)}.`,
    };
  }
  const head = new Uint8Array(await file.slice(0, SIGNATURE_WINDOW).arrayBuffer());
  if (!new TextDecoder('latin1').decode(head).includes(PDF_SIGNATURE)) {
    return { ok: false, code: 'invalid-file', message: 'Questo file non è un PDF valido.' };
  }
  return { ok: true };
}
