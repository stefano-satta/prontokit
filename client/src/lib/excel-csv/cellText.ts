import type { SheetCell } from '../../models/excel';

const MS_PER_DAY = 86_400_000;
const SECONDS_PER_DAY = 86_400;
/** Nel sistema 1900 Excel conta un 29/02/1900 inesistente: i seriali da 61 in poi vanno spostati di un giorno. */
const EPOCH_1900 = Date.UTC(1899, 11, 31);
const EPOCH_1904 = Date.UTC(1904, 0, 1);
const LOTUS_BUG_SERIAL = 60;

const pad = (value: number, length = 2) => String(value).padStart(length, '0');

/**
 * Seriale Excel → data ISO coerente: `2026-10-16`, `2026-10-16 14:30:00` o `14:30:00`.
 * Calcolo in UTC per non dipendere dal fuso orario del browser.
 */
export function serialToIso(serial: number, date1904: boolean, hasDate: boolean, hasTime: boolean): string | null {
  if (!Number.isFinite(serial) || serial < 0) return null;
  const totalSeconds = Math.round(serial * SECONDS_PER_DAY);
  let days = Math.floor(totalSeconds / SECONDS_PER_DAY);
  const seconds = totalSeconds - days * SECONDS_PER_DAY;

  const time = `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;
  const showTime = hasTime || seconds !== 0;
  if (!hasDate && days === 0) return time;

  if (!date1904 && days > LOTUS_BUG_SERIAL) days -= 1;
  const date = new Date((date1904 ? EPOCH_1904 : EPOCH_1900) + days * MS_PER_DAY);
  const year = date.getUTCFullYear();
  if (year > 9999) return null;
  const iso = `${pad(year, 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  return showTime ? `${iso} ${time}` : iso;
}

/**
 * Converte i separatori dallo stile inglese (1,234.56) a quello italiano (1.234,56),
 * solo dentro le sequenze numeriche: simboli di valuta, % e testo del formato restano invariati.
 */
export const toItalianSeparators = (display: string): string =>
  display.replace(/\d[\d.,]*/g, (run) => run.replace(/[.,]/g, (sep) => (sep === '.' ? ',' : '.')));

/** Testo finale della cella, come lo mostra Excel in italiano. */
export function cellToText(cell: SheetCell | null): string {
  if (!cell) return '';
  switch (cell.kind) {
    case 'text':
      return cell.text;
    case 'number':
      return toItalianSeparators(cell.display);
    case 'date':
      return serialToIso(cell.serial, cell.date1904, cell.hasDate, cell.hasTime) ?? toItalianSeparators(cell.display);
    case 'boolean':
      return cell.value ? 'VERO' : 'FALSO';
    case 'error':
      return cell.display;
    case 'missing-value':
      return '';
  }
}

/** Analizza un codice di formato numerico per capire se mostra data, ora o entrambe. */
export function dateParts(format: string): { hasDate: boolean; hasTime: boolean; elapsed: boolean } {
  const tokens = format.replace(/"[^"]*"|\\./g, '');
  const elapsed = /\[(h+|m+|s+)\]/i.test(tokens);
  const clean = tokens.replace(/\[[^\]]*\]/g, '');
  const hasTime = /[hs]/i.test(clean) || /am\/pm|a\/p/i.test(clean);
  // "m" da solo è il mese; accanto a ore o secondi sono i minuti
  const hasDate = /[yd]/i.test(clean) || (/m/i.test(clean) && !hasTime);
  return { hasDate, hasTime, elapsed };
}
