import { EncryptedPDFError, PDFDocument } from 'pdf-lib';
import { hasEncryptEntry } from '../../lib/pdf-merge/encryption';

export type PdfInspection = { ok: true; document: PDFDocument; pageCount: number } | { ok: false; reason: 'protected' | 'unreadable' };

/**
 * Legge il PDF nel browser e lo scarta se è protetto: pdf-lib non decifra, quindi
 * unire un file cifrato (anche solo con restrizioni, senza password di apertura) darebbe pagine illeggibili.
 */
export async function inspectPdf(file: Blob): Promise<PdfInspection> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    const document = await PDFDocument.load(bytes, { updateMetadata: false });
    if (document.isEncrypted) return { ok: false, reason: 'protected' };
    const pageCount = document.getPageCount();
    return pageCount > 0 ? { ok: true, document, pageCount } : { ok: false, reason: 'unreadable' };
  } catch (error) {
    if (error instanceof EncryptedPDFError) return { ok: false, reason: 'protected' };
    return { ok: false, reason: hasEncryptEntry(new TextDecoder('latin1').decode(bytes)) ? 'protected' : 'unreadable' };
  }
}

/** Unisce le pagine dei documenti nell'ordine dato, in un PDF nuovo creato in memoria. */
export async function mergePdfs(documents: readonly PDFDocument[]): Promise<Blob> {
  const merged = await PDFDocument.create();
  for (const source of documents) {
    const pages = await merged.copyPages(source, source.getPageIndices());
    for (const page of pages) merged.addPage(page);
  }
  const bytes = await merged.save();
  return new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}
