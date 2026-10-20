import { formatBytes } from './formatBytes';

export const MAX_SPREADSHEET_BYTES = 25 * 1024 * 1024;

export const SPREADSHEET_ACCEPT = [
  '.xlsx',
  '.xlsm',
  '.xlsb',
  '.xls',
  '.ods',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.oasis.opendocument.spreadsheet',
].join(',');

/** xlsx, xlsm, xlsb e ods sono archivi ZIP; i vecchi .xls sono contenitori OLE (CFB). */
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];
const CFB_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

export type SpreadsheetContainer = 'zip' | 'cfb';

export type SpreadsheetValidation =
  | { ok: true; container: SpreadsheetContainer }
  | { ok: false; code: 'invalid-file' | 'too-large'; message: string };

const startsWith = (bytes: Uint8Array, signature: number[]) => signature.every((byte, i) => bytes[i] === byte);

/** Controlla dimensione e firma reale: estensione e MIME type si possono falsificare. */
export async function validateSpreadsheet(file: File): Promise<SpreadsheetValidation> {
  if (file.size === 0) return { ok: false, code: 'invalid-file', message: 'Il file è vuoto: scegline uno che contenga dati.' };
  if (file.size > MAX_SPREADSHEET_BYTES) {
    return {
      ok: false,
      code: 'too-large',
      message: `Il file pesa ${formatBytes(file.size)}: il limite è ${formatBytes(MAX_SPREADSHEET_BYTES)}. Dividilo in file più piccoli.`,
    };
  }
  const head = new Uint8Array(await file.slice(0, CFB_SIGNATURE.length).arrayBuffer());
  if (startsWith(head, ZIP_SIGNATURE)) return { ok: true, container: 'zip' };
  if (startsWith(head, CFB_SIGNATURE)) return { ok: true, container: 'cfb' };
  return {
    ok: false,
    code: 'invalid-file',
    message: 'Questo file non è un foglio Excel valido. Sono supportati .xlsx, .xlsm, .xlsb, .xls e .ods.',
  };
}
