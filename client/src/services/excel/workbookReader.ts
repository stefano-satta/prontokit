import { unzipSync } from 'fflate';
import { read, SSF, type CellObject, type WorkBook } from 'xlsx';
import { dateParts } from '../../lib/excel-csv/cellText';
import type { RawSheet, SheetCell } from '../../models/excel';

/** Difesa contro gli "zip bomb": dimensione dichiarata dei file interni e numero di voci. */
const MAX_UNCOMPRESSED_BYTES = 400 * 1024 * 1024;
const MAX_ARCHIVE_ENTRIES = 20_000;

export type WorkbookErrorCode = 'password' | 'unreadable' | 'too-much-data' | 'no-data';

export class WorkbookError extends Error {
  readonly code: WorkbookErrorCode;

  constructor(code: WorkbookErrorCode, detail?: string) {
    super(detail ?? code);
    this.name = 'WorkbookError';
    this.code = code;
  }
}

/** Legge l'indice dello ZIP senza decomprimere nulla. */
function assertSafeArchive(data: Uint8Array) {
  let total = 0;
  let entries = 0;
  try {
    unzipSync(data, {
      filter: (file) => {
        total += file.originalSize;
        entries++;
        return false;
      },
    });
  } catch {
    throw new WorkbookError('unreadable', 'Archivio ZIP non valido');
  }
  if (total > MAX_UNCOMPRESSED_BYTES || entries > MAX_ARCHIVE_ENTRIES) throw new WorkbookError('too-much-data');
}

function parseWorkbook(data: Uint8Array): WorkBook {
  try {
    return read(data, {
      type: 'array',
      dense: true,
      cellNF: true, // serve il formato per riconoscere le date
      cellText: true, // testo formattato come in Excel (zeri iniziali, decimali, %)
      // Solo per riconoscere le formule senza valore (che senza stub sparirebbero): la formula non finisce mai nel CSV
      cellFormula: true,
      sheetStubs: true,
      cellHTML: false,
      cellStyles: false,
      bookVBA: false, // le macro non vengono nemmeno estratte
      WTF: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/password|encrypt/i.test(message)) throw new WorkbookError('password');
    throw new WorkbookError('unreadable', message);
  }
}

function toSheetCell(cell: CellObject | undefined, date1904: boolean): SheetCell | null {
  if (!cell) return null;
  if (cell.f !== undefined && (cell.v === undefined || cell.t === 'z')) return { kind: 'missing-value' };
  const display = cell.w ?? (cell.v === undefined ? '' : String(cell.v));

  switch (cell.t) {
    case 's':
      return { kind: 'text', text: String(cell.v ?? '') };
    case 'b':
      return { kind: 'boolean', value: Boolean(cell.v) };
    case 'e':
      return { kind: 'error', display };
    case 'n': {
      if (typeof cell.v !== 'number') return null;
      const format = typeof cell.z === 'string' ? cell.z : '';
      if (format && SSF.is_date(format)) {
        const parts = dateParts(format);
        // Le durate ([h]:mm) non sono date: restano come le mostra Excel
        if (!parts.elapsed) return { kind: 'date', serial: cell.v, date1904, hasDate: parts.hasDate, hasTime: parts.hasTime, display };
      }
      return { kind: 'number', display };
    }
    case 'd':
      return { kind: 'number', display };
    default:
      return null;
  }
}

/** File Excel/ODS in memoria → fogli con le celle già interpretate. */
export function readWorkbook(data: Uint8Array, container: 'zip' | 'cfb'): RawSheet[] {
  if (container === 'zip') assertSafeArchive(data);
  const workbook = parseWorkbook(data);
  const date1904 = Boolean(workbook.Workbook?.WBProps?.date1904);
  const visibility = workbook.Workbook?.Sheets ?? [];

  return workbook.SheetNames.map((name, index) => {
    const sheet = workbook.Sheets[name];
    const data = (sheet?.['!data'] as (CellObject | undefined)[][] | undefined) ?? [];
    const rows: (SheetCell | null)[][] = [];
    for (let r = 0; r < data.length; r++) {
      const source = data[r] ?? [];
      const row: (SheetCell | null)[] = [];
      for (let c = 0; c < source.length; c++) row.push(toSheetCell(source[c], date1904));
      rows.push(row);
    }
    return { name, hidden: Boolean(visibility[index]?.Hidden), rows };
  });
}
