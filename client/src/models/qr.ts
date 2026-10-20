export interface QrResult {
  pngDataUrl: string;
  svg: string;
}

export type QrState =
  | { status: 'idle' }
  | { status: 'ready'; text: string; result: QrResult }
  | { status: 'error'; message: string };
