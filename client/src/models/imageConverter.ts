/** Formati accettati in ingresso, riconosciuti dalla firma del file. */
export type ImageInputFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'bmp';

/** Formati che il browser sa produrre con un canvas. */
export type ImageOutputFormat = Extract<ImageInputFormat, 'jpeg' | 'png' | 'webp'>;

export interface DetectedImage {
  format: ImageInputFormat;
  /** WebP o AVIF animati: si converte solo il primo fotogramma */
  animated: boolean;
}

export interface SelectedImage extends DetectedImage {
  id: string;
  file: File;
  /** URL blob: dell'originale, per la miniatura */
  previewUrl: string;
}

interface ResultBase {
  id: string;
  fileName: string;
  sourceFormat: ImageInputFormat;
  sourceSize: number;
}

export type ImageResult =
  | (ResultBase & {
      status: 'converted';
      outputFormat: ImageOutputFormat;
      blob: Blob;
      url: string;
      /** Nome del file convertito, già ripulito e univoco */
      filename: string;
      animated: boolean;
    })
  /** Già nel formato richiesto: non viene convertita né scaricata */
  | (ResultBase & { status: 'skipped'; url: string })
  | (ResultBase & { status: 'error'; message: string });

export type ImageConversionPhase =
  | { status: 'selecting' }
  | { status: 'converting'; done: number; total: number }
  | { status: 'done'; target: ImageOutputFormat; results: ImageResult[] };
