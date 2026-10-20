import type { RawSheet, SheetCell, SheetCsv } from '../../models/excel';
import { cellToText } from './cellText';

/** Separatore usato da Excel in italiano: la virgola è già il separatore decimale. */
export const CSV_DELIMITER = ';';
const LINE_BREAK = '\r\n';
/** Il BOM fa riconoscere a Excel la codifica UTF-8 (accenti, €). */
const UTF8_BOM = '﻿';
const PREVIEW_ROWS = 10;
const PREVIEW_COLUMNS = 8;

/**
 * CSV injection: all'apertura in un foglio di calcolo, una cella che inizia con questi caratteri
 * può essere eseguita come formula. Per il testo valgono anche + e -; per i numeri no (i negativi restano tali).
 */
const DANGEROUS_TEXT = /^[=+\-@\t\r]/;
const DANGEROUS_OTHER = /^[=@\t\r]/;

const needsNeutralizing = (cell: SheetCell, text: string) =>
  (cell.kind === 'text' ? DANGEROUS_TEXT : DANGEROUS_OTHER).test(text);

/** Virgolette solo quando servono (RFC 4180), raddoppiando quelle interne. */
export const escapeCsvField = (value: string): string =>
  /[";\r\n]/.test(value) || value !== value.trim() ? `"${value.replaceAll('"', '""')}"` : value;

const isBlank = (cell: SheetCell | null) => !cell || cellToText(cell) === '';

/** Ultima riga e ultima colonna con un valore: le celle vuote in mezzo restano, quelle in coda no. */
export function dataExtent(rows: (SheetCell | null)[][]): { rows: number; columns: number } {
  let lastRow = -1;
  let lastColumn = -1;
  rows.forEach((row, r) => {
    for (let c = row.length - 1; c >= 0; c--) {
      if (!isBlank(row[c] ?? null)) {
        lastRow = r;
        lastColumn = Math.max(lastColumn, c);
        break;
      }
    }
  });
  return { rows: lastRow + 1, columns: lastColumn + 1 };
}

const countMissingValues = (rows: (SheetCell | null)[][]) =>
  rows.reduce((total, row) => total + row.filter((cell) => cell?.kind === 'missing-value').length, 0);

/** Foglio → CSV (UTF-8 con BOM, `;`, CRLF) con conteggi per il riepilogo. */
export function sheetToCsv(sheet: RawSheet): SheetCsv {
  const extent = dataExtent(sheet.rows);
  const lines: string[] = [];
  const preview: string[][] = [];
  let neutralizedCells = 0;

  for (let r = 0; r < extent.rows; r++) {
    const row = sheet.rows[r] ?? [];
    const fields: string[] = [];
    for (let c = 0; c < extent.columns; c++) {
      const cell = row[c] ?? null;
      let text = cellToText(cell);
      if (cell && needsNeutralizing(cell, text)) {
        text = `'${text}`;
        neutralizedCells++;
      }
      fields.push(escapeCsvField(text));
      if (r < PREVIEW_ROWS && c < PREVIEW_COLUMNS) (preview[r] ??= []).push(text);
    }
    lines.push(fields.join(CSV_DELIMITER));
  }

  return {
    name: sheet.name,
    hidden: sheet.hidden,
    empty: extent.rows === 0,
    rows: extent.rows,
    columns: extent.columns,
    csv: extent.rows === 0 ? '' : UTF8_BOM + lines.join(LINE_BREAK) + LINE_BREAK,
    preview,
    neutralizedCells,
    missingValues: countMissingValues(sheet.rows),
  };
}
