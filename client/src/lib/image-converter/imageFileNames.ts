import { SITE } from '../../config/site';
import type { ImageOutputFormat } from '../../models/imageConverter';
import { baseNameOf, uniqueFilenames } from '../fileName';
import { FORMAT_INFO } from './imageFormats';

const IMAGE_EXTENSION = /\.(jpe?g|png|webp|avif|bmp)$/i;

/**
 * Nomi dei file convertiti: ripuliti (niente percorsi, quindi niente "zip slip") e resi univoci
 * senza distinguere maiuscole, perché `foto.jpg` e `foto.webp` diventerebbero entrambi `foto.png`.
 */
export const convertedFilenames = (originalNames: readonly string[], target: ImageOutputFormat): string[] =>
  uniqueFilenames(
    originalNames.map((name, index) => baseNameOf(name, IMAGE_EXTENSION, `immagine-${index + 1}`)),
    FORMAT_INFO[target].extension,
  );

/** `immagini_png_prontokit.zip`: il nome del sito segue `SITE.name`. */
export const imagesZipFilename = (target: ImageOutputFormat): string =>
  `immagini_${FORMAT_INFO[target].extension}_${SITE.name.toLowerCase()}.zip`;
