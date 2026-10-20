/**
 * Cella già interpretata, indipendente dalla libreria che legge il file.
 * Per le formule si conserva solo il valore calcolato salvato nel file, mai la formula.
 */
export type SheetCell =
  | { kind: 'text'; text: string }
  /** `display`: testo formattato secondo il formato numerico della cella, con separatori in stile inglese */
  | { kind: 'number'; display: string }
  | { kind: 'date'; serial: number; date1904: boolean; hasDate: boolean; hasTime: boolean; display: string }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'error'; display: string }
  /** Formula salvata senza valore calcolato (file generato da un programma che non ricalcola) */
  | { kind: 'missing-value' };

export interface RawSheet {
  name: string;
  hidden: boolean;
  /** Righe a partire da A1; `null` = cella vuota. Le righe possono avere lunghezze diverse. */
  rows: (SheetCell | null)[][];
}

export interface SheetCsv {
  name: string;
  hidden: boolean;
  empty: boolean;
  rows: number;
  columns: number;
  csv: string;
  /** Prime righe/colonne già formattate, per l'anteprima */
  preview: string[][];
  /** Celle di testo che iniziavano con = + - @ e sono state neutralizzate con un apostrofo */
  neutralizedCells: number;
  /** Formule senza valore calcolato, lasciate vuote */
  missingValues: number;
}

export interface WorkbookCsv {
  sheets: SheetCsv[];
}

export type ExcelConversionErrorCode =
  | 'invalid-file'
  | 'too-large'
  | 'password'
  | 'no-data'
  | 'too-much-data'
  | 'unreadable';

export type ExcelConversionState =
  | { status: 'idle' }
  | { status: 'converting'; fileName: string }
  | { status: 'ready'; fileName: string; workbook: WorkbookCsv }
  | { status: 'error'; fileName: string | null; code: ExcelConversionErrorCode; message: string };
