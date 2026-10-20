import { getDocument, GlobalWorkerOptions, PasswordException, PasswordResponses, type PDFDocumentProxy } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { ConversionProgress, PdfDocumentText, PdfPageText } from '../../models/pdf';

GlobalWorkerOptions.workerSrc = workerUrl;

/** CMap serviti dalla nostra origine (vedi vite.config.ts): nessuna richiesta a CDN esterni. */
const CMAP_URL = '/pdfjs/cmaps/';

export class PdfPasswordError extends Error {
  constructor(public readonly incorrect: boolean) {
    super(incorrect ? 'Password errata' : 'Password richiesta');
    this.name = 'PdfPasswordError';
  }
}

export interface ExtractOptions {
  password?: string;
  signal?: AbortSignal;
  onProgress?: (progress: ConversionProgress) => void;
}

const isTextItem = (item: object): item is TextItem => 'str' in item;

async function readPage(pdf: PDFDocumentProxy, pageNumber: number): Promise<PdfPageText> {
  const page = await pdf.getPage(pageNumber);
  try {
    const { height } = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const fragments = content.items.filter(isTextItem).map((item) => {
      const [, , c, d, x, y] = item.transform as number[];
      return { text: item.str, x: x!, y: y!, width: item.width, fontSize: Math.hypot(c!, d!) };
    });
    return { pageNumber, height, fragments };
  } finally {
    page.cleanup();
  }
}

const readTitle = async (pdf: PDFDocumentProxy): Promise<string | null> => {
  const { info } = await pdf.getMetadata().catch(() => ({ info: {} }));
  const title = (info as { Title?: unknown }).Title;
  return typeof title === 'string' && title.trim() ? title.trim() : null;
};

/**
 * Estrae il testo di un PDF interamente nel browser con PDF.js (in un Web Worker).
 * Il file non viene mai inviato a un server; script, form XFA e font remoti sono disattivati.
 */
export async function extractPdfText(data: Uint8Array, { password, signal, onProgress }: ExtractOptions = {}): Promise<PdfDocumentText> {
  const task = getDocument({
    data,
    password,
    cMapUrl: CMAP_URL,
    cMapPacked: true,
    enableXfa: false,
    disableFontFace: true,
    useSystemFonts: false,
    stopAtErrors: false,
  });
  const abort = () => void task.destroy();
  signal?.addEventListener('abort', abort, { once: true });

  try {
    const pdf = await task.promise.catch((error: unknown) => {
      if (error instanceof PasswordException) {
        throw new PdfPasswordError(error.code === PasswordResponses.INCORRECT_PASSWORD);
      }
      throw error;
    });

    const pages: PdfPageText[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      signal?.throwIfAborted();
      pages.push(await readPage(pdf, pageNumber));
      onProgress?.({ page: pageNumber, total: pdf.numPages });
    }
    return { title: await readTitle(pdf), pageCount: pdf.numPages, pages };
  } finally {
    signal?.removeEventListener('abort', abort);
    await task.destroy();
  }
}
