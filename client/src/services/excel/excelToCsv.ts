import { dataExtent, sheetToCsv } from '../../lib/excel-csv/buildCsv';
import type { WorkbookCsv } from '../../models/excel';
import { readWorkbook, WorkbookError } from './workbookReader';

/** Oltre questa soglia il CSV peserebbe decine di MB e il browser rischierebbe di bloccarsi. */
export const MAX_TOTAL_CELLS = 3_000_000;

/** Facciata: file in memoria → un CSV per ogni foglio. Si usa dentro il Web Worker. */
export function convertWorkbookToCsv(data: Uint8Array, container: 'zip' | 'cfb'): WorkbookCsv {
  const rawSheets = readWorkbook(data, container);

  let totalCells = 0;
  for (const sheet of rawSheets) {
    const extent = dataExtent(sheet.rows);
    totalCells += extent.rows * extent.columns;
    if (totalCells > MAX_TOTAL_CELLS) throw new WorkbookError('too-much-data');
  }

  const sheets = rawSheets.map(sheetToCsv);
  if (sheets.every((sheet) => sheet.empty)) throw new WorkbookError('no-data');
  return { sheets };
}
