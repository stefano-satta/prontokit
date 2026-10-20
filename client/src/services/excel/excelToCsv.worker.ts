/// <reference lib="webworker" />
import type { WorkbookCsv } from '../../models/excel';
import { convertWorkbookToCsv } from './excelToCsv';
import { WorkbookError, type WorkbookErrorCode } from './workbookReader';

export interface ExcelWorkerRequest {
  buffer: ArrayBuffer;
  container: 'zip' | 'cfb';
}

export type ExcelWorkerResponse = { ok: true; workbook: WorkbookCsv } | { ok: false; code: WorkbookErrorCode };

// Il file viene elaborato fuori dal thread principale: l'interfaccia resta reattiva e si può annullare.
self.onmessage = (event: MessageEvent<ExcelWorkerRequest>) => {
  let response: ExcelWorkerResponse;
  try {
    response = { ok: true, workbook: convertWorkbookToCsv(new Uint8Array(event.data.buffer), event.data.container) };
  } catch (error) {
    response = { ok: false, code: error instanceof WorkbookError ? error.code : 'unreadable' };
  }
  self.postMessage(response);
};
