import { buildMarkdown, hasExtractableText } from '../../lib/pdf-markdown/buildMarkdown';
import { toMarkdownFilename } from '../../lib/fileName';
import type { MarkdownResult } from '../../models/pdf';
import { extractPdfText, type ExtractOptions } from './pdfTextExtractor';

export class PdfNoTextError extends Error {
  constructor() {
    super('Il PDF non contiene testo selezionabile');
    this.name = 'PdfNoTextError';
  }
}

/** Facciata: PDF (in memoria) → Markdown ottimizzato per LLM. */
export async function convertPdfToMarkdown(file: File, options: ExtractOptions = {}): Promise<MarkdownResult> {
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await extractPdfText(data, options);
  if (!hasExtractableText(doc)) throw new PdfNoTextError();

  const { markdown, stats } = buildMarkdown(doc, file.name);
  return { markdown, stats, filename: toMarkdownFilename(file.name) };
}
