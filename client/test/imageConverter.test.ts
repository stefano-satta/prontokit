import { describe, expect, it } from 'vitest';
import { convertedFilenames, imagesZipFilename } from '../src/lib/image-converter/imageFileNames';
import { detectImageFormat } from '../src/lib/image-converter/imageFormats';
import { allAlreadyInFormat, freeSlots, rejectionNotices, sameFormatMessage } from '../src/lib/image-converter/selectImages';

const bytes = (...parts: (string | number[])[]) =>
  new Uint8Array(parts.flatMap((part) => (typeof part === 'string' ? [...part].map((c) => c.charCodeAt(0)) : part)));

/** Box `ftyp` ISO-BMFF: dimensione, tipo, major brand, minor version, brand compatibili. */
const ftyp = (major: string, ...compatible: string[]) => {
  const size = 16 + compatible.length * 4;
  return bytes([0, 0, 0, size], 'ftyp', major, [0, 0, 0, 0], ...compatible);
};

describe('detectImageFormat', () => {
  it('riconosce i formati dalla firma', () => {
    expect(detectImageFormat(bytes([0xff, 0xd8, 0xff, 0xe0]))).toEqual({ format: 'jpeg', animated: false });
    expect(detectImageFormat(bytes([0x89], 'PNG', [0x0d, 0x0a, 0x1a, 0x0a]))).toEqual({ format: 'png', animated: false });
    expect(detectImageFormat(bytes('RIFF', [0, 0, 0, 0], 'WEBPVP8 '))).toEqual({ format: 'webp', animated: false });
    expect(detectImageFormat(bytes('BM', new Array(12).fill(0)))).toEqual({ format: 'bmp', animated: false });
    expect(detectImageFormat(ftyp('avif', 'mif1', 'miaf'))).toEqual({ format: 'avif', animated: false });
  });

  it('segnala WebP e AVIF animati', () => {
    const flags = [0x02, 0, 0, 0];
    expect(detectImageFormat(bytes('RIFF', [0, 0, 0, 0], 'WEBPVP8X', [0, 0, 0, 0], flags))?.animated).toBe(true);
    expect(detectImageFormat(ftyp('avis', 'avif', 'msf1'))).toEqual({ format: 'avif', animated: true });
  });

  it('trova AVIF anche tra i brand compatibili', () => {
    expect(detectImageFormat(ftyp('mif1', 'avif'))?.format).toBe('avif');
  });

  it('rifiuta formati non supportati o file finti', () => {
    expect(detectImageFormat(bytes('GIF89a'))).toBeNull();
    expect(detectImageFormat(ftyp('heic', 'mif1'))).toBeNull();
    expect(detectImageFormat(bytes('ciao, non sono un PNG'))).toBeNull();
    expect(detectImageFormat(bytes('BM'))).toBeNull();
  });
});

describe('convertedFilenames', () => {
  it('cambia estensione e rende univoci i nomi senza distinguere maiuscole', () => {
    expect(convertedFilenames(['foto.jpg', 'FOTO.webp', 'foto.bmp', 'vacanze.JPEG'], 'png')).toEqual([
      'foto.png',
      'FOTO (2).png',
      'foto (3).png',
      'vacanze.png',
    ]);
  });

  it('ripulisce percorsi e nomi vuoti', () => {
    expect(convertedFilenames(['../../etc/passwd.png', '<>.bmp'], 'jpeg')).toEqual(['passwd.jpg', 'immagine-2.jpg']);
  });

  it('nome dello ZIP per formato', () => {
    expect(imagesZipFilename('webp')).toBe('immagini_webp_prontokit.zip');
  });
});

describe('selezione delle immagini', () => {
  it('rispetta il limite di 5', () => {
    expect(freeSlots(0)).toBe(5);
    expect(freeSlots(4)).toBe(1);
    expect(freeSlots(7)).toBe(0);
  });

  it('raggruppa gli avvisi per motivo', () => {
    expect(
      rejectionNotices(
        [
          { name: 'a.gif', reason: 'unsupported' },
          { name: 'b.tiff', reason: 'unsupported' },
          { name: 'vuoto.png', reason: 'empty' },
        ],
        ['sesta.png'],
      ),
    ).toEqual([
      '“a.gif” e “b.tiff” non sono immagini supportate: carica file JPG, PNG, WebP, AVIF o BMP.',
      '“vuoto.png” è vuoto: scegli un’immagine che contenga dati.',
      'Puoi convertire al massimo 5 immagini alla volta: “sesta.png” non è stata aggiunta.',
    ]);
    expect(rejectionNotices([], [])).toEqual([]);
  });

  it('blocca solo se tutte le immagini sono già nel formato scelto', () => {
    expect(allAlreadyInFormat(['png', 'png'], 'png')).toBe(true);
    expect(allAlreadyInFormat(['png', 'jpeg'], 'png')).toBe(false);
    expect(allAlreadyInFormat([], 'png')).toBe(false);
    expect(sameFormatMessage(2, 'jpeg')).toBe('Tutte le 2 immagini sono già in formato JPG: scegli un altro formato di destinazione.');
  });
});
