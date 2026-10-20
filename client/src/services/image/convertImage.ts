import { FORMAT_INFO, LOSSY_QUALITY, MAX_IMAGE_PIXELS } from '../../lib/image-converter/imageFormats';
import type { ImageInputFormat, ImageOutputFormat } from '../../models/imageConverter';

export type ImageConversionErrorCode = 'undecodable' | 'too-many-pixels' | 'unsupported-output' | 'encode-failed';

export class ImageConversionError extends Error {
  constructor(readonly code: ImageConversionErrorCode) {
    super(code);
    this.name = 'ImageConversionError';
  }
}

type Drawable = ImageBitmap | HTMLImageElement;

/** Ripiego per i browser che non decodificano alcuni formati con `createImageBitmap`. */
async function decodeWithImageElement(file: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function decode(file: Blob): Promise<Drawable> {
  try {
    return await createImageBitmap(file);
  } catch {
    try {
      return await decodeWithImageElement(file);
    } catch {
      throw new ImageConversionError('undecodable');
    }
  }
}

const sizeOf = (image: Drawable) =>
  image instanceof HTMLImageElement ? { width: image.naturalWidth, height: image.naturalHeight } : { width: image.width, height: image.height };

const toBlob = (canvas: HTMLCanvasElement, mime: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));

/**
 * Converte un'immagine ridisegnandola su un canvas, interamente nel browser.
 * I metadati (EXIF, posizione GPS) non vengono copiati nel file nuovo.
 */
export async function convertImage(file: Blob, target: ImageOutputFormat): Promise<Blob> {
  const image = await decode(file);
  try {
    const { width, height } = sizeOf(image);
    if (!width || !height) throw new ImageConversionError('undecodable');
    if (width * height > MAX_IMAGE_PIXELS) throw new ImageConversionError('too-many-pixels');

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new ImageConversionError('encode-failed');
    // JPG non ha trasparenza: senza uno sfondo le parti trasparenti diventerebbero nere
    if (target === 'jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(image, 0, 0);

    const { mime } = FORMAT_INFO[target];
    const blob = await toBlob(canvas, mime, LOSSY_QUALITY);
    canvas.width = canvas.height = 0;
    if (!blob) throw new ImageConversionError('encode-failed');
    // Un browser che non sa codificare il formato restituisce in silenzio un PNG
    if (blob.type !== mime) throw new ImageConversionError('unsupported-output');
    return blob;
  } finally {
    if ('close' in image) image.close();
  }
}

export const conversionErrorMessage = (code: ImageConversionErrorCode, source: ImageInputFormat, target: ImageOutputFormat): string => {
  switch (code) {
    case 'undecodable':
      return source === 'avif'
        ? 'Il browser non riesce a leggere questo AVIF: aggiornalo oppure prova con Chrome, Edge o Firefox.'
        : 'Non riesco a leggere questa immagine: potrebbe essere danneggiata. Prova ad aprirla e salvarla di nuovo.';
    case 'too-many-pixels':
      return 'L’immagine è troppo grande per essere convertita nel browser (oltre 100 megapixel): riducine le dimensioni e riprova.';
    case 'unsupported-output':
      return `Il tuo browser non sa creare file ${FORMAT_INFO[target].label}: scegli un altro formato oppure usa Chrome, Edge o Firefox.`;
    case 'encode-failed':
      return 'La conversione non è riuscita: l’immagine potrebbe essere troppo grande per questo browser (capita su iPhone e iPad oltre i 16 megapixel). Riducine le dimensioni e riprova.';
  }
};
