import { SITE } from '../../config/site';
import type { ImageOutputFormat } from '../../models/imageConverter';
import { baseNameOf } from '../fileName';
import { FORMAT_INFO } from './imageFormats';

const IMAGE_EXTENSION = /\.(jpe?g|png|webp|avif|bmp)$/i;

/**
 * Nomi dei file convertiti: ripuliti (niente percorsi, quindi niente "zip slip") e resi univoci
 * senza distinguere maiuscole, perché `foto.jpg` e `foto.webp` diventerebbero entrambi `foto.png`.
 */
export const convertedFilenames = (originalNames: readonly string[], target: ImageOutputFormat): string[] => {
  const used = new Set<string>();
  const extension = FORMAT_INFO[target].extension;
  return originalNames.map((name, index) => {
    const base = baseNameOf(name, IMAGE_EXTENSION, `immagine-${index + 1}`);
    let candidate = base;
    for (let n = 2; used.has(candidate.toLowerCase()); n++) candidate = `${base} (${n})`;
    used.add(candidate.toLowerCase());
    return `${candidate}.${extension}`;
  });
};

/** `immagini_png_prontokit.zip`: il nome del sito segue `SITE.name`. */
export const imagesZipFilename = (target: ImageOutputFormat): string =>
  `immagini_${FORMAT_INFO[target].extension}_${SITE.name.toLowerCase()}.zip`;
