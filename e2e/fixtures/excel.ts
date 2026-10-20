import { utils, write, type WorkBook } from 'xlsx';

const toBuffer = (workbook: WorkBook) => Buffer.from(write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer);

/** Cartella con formule, date, zeri iniziali, celle vuote, un foglio nascosto e uno vuoto. */
export function createSampleWorkbook(): Buffer {
  const orders = utils.aoa_to_sheet([
    ['Codice', 'Prezzo', 'Quantità', 'Totale', 'Data', 'Nota'],
    ['00123', 1234.5, 3, null, 46311, '=HYPERLINK("http://evil")'],
    [],
    ['00456', -2.25, 2, null, 46312, null],
  ]);
  orders.D2 = { t: 'n', v: 3703.5, f: 'B2*C2' };
  orders.D4 = { t: 'n', v: -4.5, f: 'B4*C4' };
  orders.B2!.z = '#,##0.00';
  orders.E2!.z = 'dd/mm/yyyy';
  orders.E4!.z = 'dd/mm/yyyy';

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, orders, 'Ordini');
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([['Cliente'], ['Bianchi']]), 'Clienti');
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([['riservato']]), 'Interno');
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([]), 'Vuoto');
  workbook.Workbook = { Sheets: [{ Hidden: 0 }, { Hidden: 0 }, { Hidden: 1 }, { Hidden: 0 }] };
  return toBuffer(workbook);
}

export function createSingleSheetWorkbook(): Buffer {
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([['a', 'b'], [1, 2]]), 'Unico');
  return toBuffer(workbook);
}

export function createEmptyWorkbook(): Buffer {
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([]), 'Foglio1');
  return toBuffer(workbook);
}
