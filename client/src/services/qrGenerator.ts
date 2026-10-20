import QRCode from 'qrcode';
import type { QrResult } from '../models/qr';

/** Opzioni fisse: nero su bianco garantisce la leggibilità anche in dark mode. */
const QR_OPTIONS = {
  errorCorrectionLevel: 'M',
  margin: 2,
  color: { dark: '#0f172a', light: '#ffffff' },
} as const;

export const PNG_SIZE = 1024;

export async function generateQr(text: string): Promise<QrResult> {
  const [pngDataUrl, svg] = await Promise.all([
    QRCode.toDataURL(text, { ...QR_OPTIONS, width: PNG_SIZE, type: 'image/png' }),
    QRCode.toString(text, { ...QR_OPTIONS, type: 'svg' }),
  ]);
  return { pngDataUrl, svg };
}
