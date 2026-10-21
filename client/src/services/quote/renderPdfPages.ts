import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

/** Font standard serviti dalla nostra origine (vedi `vite/pdfjsAssets.ts`): il PDF usa Helvetica senza incorporarla. */
const STANDARD_FONT_URL = '/pdfjs/standard_fonts/';

const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Anteprima non disponibile'))), 'image/png'));

/**
 * Disegna ogni pagina del PDF in un PNG largo `width` pixel, interamente nel browser con PDF.js.
 * `signal` interrompe il lavoro quando nel frattempo il preventivo è cambiato.
 */
export async function renderPdfPages(bytes: Uint8Array, width: number, signal: AbortSignal): Promise<Blob[]> {
  // PDF.js trasferisce il buffer al worker: si passa una copia per non svuotare l'originale
  const task = getDocument({
    data: bytes.slice(),
    standardFontDataUrl: STANDARD_FONT_URL,
    useSystemFonts: false,
    enableXfa: false,
  });
  const abort = () => void task.destroy();
  signal.addEventListener('abort', abort, { once: true });
  try {
    const pdf = await task.promise;
    const images: Blob[] = [];
    for (let number = 1; number <= pdf.numPages; number++) {
      signal.throwIfAborted();
      const page = await pdf.getPage(number);
      const viewport = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width });
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      await page.render({ canvas, viewport, background: '#ffffff' }).promise;
      page.cleanup();
      images.push(await toBlob(canvas));
    }
    return images;
  } finally {
    signal.removeEventListener('abort', abort);
    void task.destroy();
  }
}
