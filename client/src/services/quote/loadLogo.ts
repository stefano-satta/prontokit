import { SIGNATURE_BYTES, detectImageFormat } from '../../lib/image-converter/imageFormats';
import type { QuoteLogo } from '../../models/quote';

/** Un logo più pesante di così rallenta il PDF senza migliorarne la resa. */
export const MAX_LOGO_BYTES = 5 * 1024 * 1024;
/** Lato massimo in pixel: nel PDF il logo occupa al massimo 160 × 56 punti, questo basta anche in stampa. */
const MAX_LOGO_SIDE = 1200;

export type LogoErrorCode = 'too-large' | 'unsupported' | 'undecodable';

export class LogoError extends Error {
  constructor(readonly code: LogoErrorCode) {
    super(code);
    this.name = 'LogoError';
  }
}

const canvasBlob = (canvas: HTMLCanvasElement, mime: string) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new LogoError('undecodable'))), mime, 0.92));

/**
 * Prepara il logo per pdf-lib, che accetta solo PNG e JPG: gli altri formati (riconosciuti dalla firma)
 * e le immagini troppo grandi vengono ridisegnati su un canvas. Tutto avviene nel browser.
 */
export async function loadLogo(file: File): Promise<QuoteLogo> {
  if (file.size > MAX_LOGO_BYTES) throw new LogoError('too-large');
  const detected = detectImageFormat(new Uint8Array(await file.slice(0, SIGNATURE_BYTES).arrayBuffer()));
  if (!detected) throw new LogoError('unsupported');

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new LogoError('undecodable');
  });
  try {
    const { width, height } = bitmap;
    const scale = Math.min(1, MAX_LOGO_SIDE / Math.max(width, height));
    const native = detected.format === 'png' || detected.format === 'jpeg';
    let blob: Blob = file;
    let format: QuoteLogo['format'] = detected.format === 'jpeg' ? 'jpeg' : 'png';

    if (!native || scale < 1) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      // Il JPG resta JPG (foto più leggere); tutto il resto diventa PNG, che conserva la trasparenza
      format = detected.format === 'jpeg' ? 'jpeg' : 'png';
      blob = await canvasBlob(canvas, format === 'jpeg' ? 'image/jpeg' : 'image/png');
    }

    const bytes = new Uint8Array(await blob.arrayBuffer());
    return {
      bytes,
      format,
      width: Math.round(width * scale),
      height: Math.round(height * scale),
      url: URL.createObjectURL(blob),
    };
  } finally {
    bitmap.close();
  }
}
