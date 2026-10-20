import type { WorkbookCsv } from '../../models/excel';
import type { ExcelWorkerRequest, ExcelWorkerResponse } from './excelToCsv.worker';
import type { WorkbookErrorCode } from './workbookReader';

export class ExcelConversionError extends Error {
  readonly code: WorkbookErrorCode;

  constructor(code: WorkbookErrorCode) {
    super(code);
    this.name = 'ExcelConversionError';
    this.code = code;
  }
}

/**
 * Converte il file in un Web Worker dedicato, chiuso a fine lavoro o all'annullamento:
 * nessun dato resta in memoria nel worker e un file malevolo non può bloccare la pagina.
 */
export async function convertSpreadsheet(file: File, container: 'zip' | 'cfb', signal: AbortSignal): Promise<WorkbookCsv> {
  const buffer = await file.arrayBuffer();
  signal.throwIfAborted();

  const worker = new Worker(new URL('./excelToCsv.worker.ts', import.meta.url), { type: 'module' });
  try {
    return await new Promise<WorkbookCsv>((resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      worker.onerror = () => reject(new ExcelConversionError('unreadable'));
      worker.onmessage = ({ data }: MessageEvent<ExcelWorkerResponse>) =>
        data.ok ? resolve(data.workbook) : reject(new ExcelConversionError(data.code));
      worker.postMessage({ buffer, container } satisfies ExcelWorkerRequest, [buffer]);
    });
  } finally {
    worker.terminate();
  }
}
