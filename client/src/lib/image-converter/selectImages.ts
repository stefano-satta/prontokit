import type { ImageInputFormat, ImageOutputFormat } from '../../models/imageConverter';
import { formatBytes } from '../formatBytes';
import type { ImageRejectReason } from '../validateImage';
import { FORMAT_INFO, MAX_IMAGE_BYTES, MAX_IMAGES } from './imageFormats';

const quoteList = (names: readonly string[]) => {
  const quoted = names.map((name) => `“${name}”`);
  return quoted.length > 1 ? `${quoted.slice(0, -1).join(', ')} e ${quoted.at(-1)}` : (quoted[0] ?? '');
};

/** Quante immagini nuove entrano ancora nella selezione, rispettando il limite. */
export const freeSlots = (selected: number): number => Math.max(0, MAX_IMAGES - selected);

/** Avvisi per i file scartati, raggruppati per motivo e con l'indicazione di cosa fare. */
export function rejectionNotices(rejected: readonly { name: string; reason: ImageRejectReason }[], overLimit: readonly string[]): string[] {
  const by = (reason: ImageRejectReason) => rejected.filter((item) => item.reason === reason).map((item) => item.name);
  const notices: string[] = [];
  const unsupported = by('unsupported');
  const tooLarge = by('too-large');
  const empty = by('empty');
  if (unsupported.length) {
    notices.push(
      `${quoteList(unsupported)} ${unsupported.length === 1 ? 'non è un’immagine supportata' : 'non sono immagini supportate'}: carica file JPG, PNG, WebP, AVIF o BMP.`,
    );
  }
  if (tooLarge.length) {
    notices.push(`${quoteList(tooLarge)} ${tooLarge.length === 1 ? 'supera' : 'superano'} il limite di ${formatBytes(MAX_IMAGE_BYTES)}: riducine le dimensioni e riprova.`);
  }
  if (empty.length) notices.push(`${quoteList(empty)} ${empty.length === 1 ? 'è vuoto' : 'sono vuoti'}: scegli un’immagine che contenga dati.`);
  if (overLimit.length) {
    notices.push(
      `Puoi convertire al massimo ${MAX_IMAGES} immagini alla volta: ${quoteList(overLimit)} ${overLimit.length === 1 ? 'non è stata aggiunta' : 'non sono state aggiunte'}.`,
    );
  }
  return notices;
}

/** Tutte le immagini sono già nel formato scelto: non c'è niente da convertire. */
export const allAlreadyInFormat = (formats: readonly ImageInputFormat[], target: ImageOutputFormat): boolean =>
  formats.length > 0 && formats.every((format) => format === target);

export const sameFormatMessage = (count: number, target: ImageOutputFormat): string =>
  `${count === 1 ? 'L’immagine è già' : `Tutte le ${count} immagini sono già`} in formato ${FORMAT_INFO[target].label}: scegli un altro formato di destinazione.`;
