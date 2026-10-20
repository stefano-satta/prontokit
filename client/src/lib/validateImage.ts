import type { DetectedImage } from '../models/imageConverter';
import { MAX_IMAGE_BYTES, SIGNATURE_BYTES, detectImageFormat } from './image-converter/imageFormats';

export type ImageRejectReason = 'empty' | 'too-large' | 'unsupported';

export type ImageValidation = ({ ok: true } & DetectedImage) | { ok: false; reason: ImageRejectReason };

/** Controlla dimensione e firma reale del file, prima di provare a decodificarlo. */
export async function validateImage(file: File): Promise<ImageValidation> {
  if (file.size === 0) return { ok: false, reason: 'empty' };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, reason: 'too-large' };
  const detected = detectImageFormat(new Uint8Array(await file.slice(0, SIGNATURE_BYTES).arrayBuffer()));
  return detected ? { ok: true, ...detected } : { ok: false, reason: 'unsupported' };
}
