import type { DetectedImage, ImageInputFormat, ImageOutputFormat } from '../../models/imageConverter';

export const MAX_IMAGES = 5;
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
/** Oltre questa soglia la memoria del canvas diventa un rischio per la scheda: meglio un messaggio chiaro. */
export const MAX_IMAGE_PIXELS = 100_000_000;
/** Qualità per JPG e WebP: buon compromesso tra peso e resa, senza artefatti visibili. */
export const LOSSY_QUALITY = 0.9;

interface FormatInfo {
  label: string;
  mime: string;
  extension: string;
}

export const FORMAT_INFO: Record<ImageInputFormat, FormatInfo> = {
  jpeg: { label: 'JPG', mime: 'image/jpeg', extension: 'jpg' },
  png: { label: 'PNG', mime: 'image/png', extension: 'png' },
  webp: { label: 'WebP', mime: 'image/webp', extension: 'webp' },
  avif: { label: 'AVIF', mime: 'image/avif', extension: 'avif' },
  bmp: { label: 'BMP', mime: 'image/bmp', extension: 'bmp' },
};

export const OUTPUT_FORMATS: readonly ImageOutputFormat[] = ['png', 'jpeg', 'webp'];

export const IMAGE_ACCEPT = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.bmp', 'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/bmp'].join(',');

const ascii = (bytes: Uint8Array, start: number, length: number) => String.fromCharCode(...bytes.subarray(start, start + length));
const startsWith = (bytes: Uint8Array, signature: number[]) => signature.every((byte, i) => bytes[i] === byte);

/** Byte iniziali necessari a `detectImageFormat` (l'intestazione `ftyp` di AVIF elenca più brand). */
export const SIGNATURE_BYTES = 64;

/** Riconosce il formato dalla firma reale: estensione e MIME type si possono falsificare. */
export function detectImageFormat(bytes: Uint8Array): DetectedImage | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { format: 'jpeg', animated: false };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { format: 'png', animated: false };
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') {
    // Formato esteso VP8X: il bit 1 dei flag segnala l'animazione
    const animated = ascii(bytes, 12, 4) === 'VP8X' && ((bytes[20] ?? 0) & 0x02) !== 0;
    return { format: 'webp', animated };
  }
  if (ascii(bytes, 0, 2) === 'BM' && bytes.length >= 14) return { format: 'bmp', animated: false };
  if (ascii(bytes, 4, 4) === 'ftyp') {
    const boxSize = Math.min(((bytes[0] ?? 0) << 24) | ((bytes[1] ?? 0) << 16) | ((bytes[2] ?? 0) << 8) | (bytes[3] ?? 0), bytes.length);
    // Major brand (8..12) e brand compatibili (da 16 in poi, saltando la minor version)
    const brands = [ascii(bytes, 8, 4)];
    for (let offset = 16; offset + 4 <= boxSize; offset += 4) brands.push(ascii(bytes, offset, 4));
    if (brands.includes('avis')) return { format: 'avif', animated: true };
    if (brands.includes('avif')) return { format: 'avif', animated: false };
  }
  return null;
}
