import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { utils, write, type WorkBook } from 'xlsx';
import { escapeCsvField, sheetToCsv } from '../src/lib/excel-csv/buildCsv';
import { dateParts, serialToIso, toItalianSeparators } from '../src/lib/excel-csv/cellText';
import { csvFilename, zipEntryNames, zipFilename } from '../src/lib/excel-csv/csvFileNames';
import { convertWorkbookToCsv } from '../src/services/excel/excelToCsv';
import { WorkbookError } from '../src/services/excel/workbookReader';

const BOM = '\uFEFF';

/** Scrive un vero .xlsx (o altro formato) in memoria, come lo salverebbe un programma esterno. */
const toFile = (workbook: WorkBook, bookType: 'xlsx' | 'xls' | 'ods' = 'xlsx') =>
  new Uint8Array(write(workbook, { type: 'array', bookType }) as ArrayBuffer);

const NS = 'http://schemas.openxmlformats.org';
/** .xlsx minimo scritto a mano: serve per file che il writer di SheetJS non produrrebbe. */
const handmadeXlsx = (sheetData: string) =>
  zipSync({
    '[Content_Types].xml': strToU8(
      `<Types xmlns="${NS}/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
    ),
    '_rels/.rels': strToU8(
      `<Relationships xmlns="${NS}/package/2006/relationships"><Relationship Id="rId1" Type="${NS}/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    ),
    'xl/workbook.xml': strToU8(
      `<workbook xmlns="${NS}/spreadsheetml/2006/main" xmlns:r="${NS}/officeDocument/2006/relationships"><sheets><sheet name="F" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    ),
    'xl/_rels/workbook.xml.rels': strToU8(
      `<Relationships xmlns="${NS}/package/2006/relationships"><Relationship Id="rId1" Type="${NS}/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
    ),
    'xl/worksheets/sheet1.xml': strToU8(`<worksheet xmlns="${NS}/spreadsheetml/2006/main"><sheetData>${sheetData}</sheetData></worksheet>`),
  });

const csvLines = (csv: string) => csv.replace(BOM, '').split('\r\n').slice(0, -1);

function sampleWorkbook(): WorkBook {
  const sheet = utils.aoa_to_sheet([
    ['Codice', 'Prezzo', 'Quantità', 'Totale', 'Data', 'Nota'],
    ['00123', 1234.5, 3, null, 46311, '=HYPERLINK("http://evil")'],
    [],
    ['00456', -2.25, 0.125, null, 46311.6041666667, 'Rossi; "Mario"'],
  ]);
  sheet.D2 = { t: 'n', v: 3703.5, f: 'B2*C2' };
  sheet.D4 = { t: 'n', v: -0.28125, f: 'B4*C4' };
  sheet.B2!.z = '#,##0.00';
  sheet.C4!.z = '0.0%';
  sheet.E2!.z = 'dd/mm/yyyy';
  sheet.E4!.z = 'dd/mm/yyyy hh:mm';
  const zero = utils.aoa_to_sheet([[123]]);
  zero.A1!.z = '00000';

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, sheet, 'Ordini');
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([['segreto']]), 'Nascosto');
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([]), 'Vuoto');
  utils.book_append_sheet(workbook, zero, 'Zeri');
  workbook.Workbook = { Sheets: [{ Hidden: 0 }, { Hidden: 1 }, { Hidden: 0 }, { Hidden: 0 }] };
  return workbook;
}

describe('serialToIso', () => {
  it.each([
    [46311, false, true, false, '2026-10-16'],
    [1, false, true, false, '1900-01-01'],
    [61, false, true, false, '1900-03-01'],
    [44927.5, false, true, true, '2023-01-01 12:00:00'],
    [0.75, false, false, true, '18:00:00'],
    [0, true, true, false, '1904-01-01'],
  ])('%s (1904: %s) → %s', (serial, date1904, hasDate, hasTime, expected) => {
    expect(serialToIso(serial, date1904, hasDate, hasTime)).toBe(expected);
  });

  it('rifiuta seriali non validi', () => {
    expect(serialToIso(-1, false, true, false)).toBeNull();
  });
});

describe('dateParts', () => {
  it.each([
    ['dd/mm/yyyy', { hasDate: true, hasTime: false, elapsed: false }],
    ['hh:mm', { hasDate: false, hasTime: true, elapsed: false }],
    ['d-mmm-yy h:mm AM/PM', { hasDate: true, hasTime: true, elapsed: false }],
    ['[h]:mm:ss', { hasDate: false, hasTime: true, elapsed: true }],
    ['[$-410]dddd d mmmm yyyy', { hasDate: true, hasTime: false, elapsed: false }],
  ])('%s', (format, expected) => {
    expect(dateParts(format)).toEqual(expected);
  });
});

describe('toItalianSeparators', () => {
  it.each([
    ['1,234.50', '1.234,50'],
    ['-0.125', '-0,125'],
    ['12.5%', '12,5%'],
    ['€ 1,000,000.00', '€ 1.000.000,00'],
    ['1.23E+05', '1,23E+05'],
    ['00123', '00123'],
  ])('%s → %s', (input, expected) => {
    expect(toItalianSeparators(input)).toBe(expected);
  });
});

describe('escapeCsvField', () => {
  it.each([
    ['semplice', 'semplice'],
    ['a;b', '"a;b"'],
    ['dice "ciao"', '"dice ""ciao"""'],
    ['riga1\nriga2', '"riga1\nriga2"'],
    [' spazio', '" spazio"'],
  ])('%j → %j', (input, expected) => {
    expect(escapeCsvField(input)).toBe(expected);
  });
});

describe('sheetToCsv', () => {
  it('neutralizza il testo pericoloso ma non i numeri negativi', () => {
    const result = sheetToCsv({
      name: 'F',
      hidden: false,
      rows: [
        [
          { kind: 'text', text: '=1+1' },
          { kind: 'text', text: '-meno' },
          { kind: 'text', text: '@cmd' },
          { kind: 'number', display: '-5' },
        ],
      ],
    });
    expect(csvLines(result.csv)).toEqual(["'=1+1;'-meno;'@cmd;-5"]);
    expect(result.neutralizedCells).toBe(3);
  });

  it('mantiene le celle vuote in mezzo e toglie quelle in coda', () => {
    const result = sheetToCsv({
      name: 'F',
      hidden: false,
      rows: [
        [null, { kind: 'text', text: 'b' }, null, null],
        [],
        [{ kind: 'text', text: 'c' }, null, null],
        [null, null],
      ],
    });
    expect(csvLines(result.csv)).toEqual([';b', ';', 'c;']);
    expect(result).toMatchObject({ rows: 3, columns: 2, empty: false });
  });

  it('segnala un foglio vuoto e le formule senza valore', () => {
    const result = sheetToCsv({ name: 'F', hidden: false, rows: [[{ kind: 'missing-value' }]] });
    expect(result).toMatchObject({ empty: true, csv: '', missingValues: 1 });
  });
});

describe('convertWorkbookToCsv', () => {
  it('produce i valori finali, non le formule, con date ISO e formati italiani', () => {
    const { sheets } = convertWorkbookToCsv(toFile(sampleWorkbook()), 'zip');
    const orders = sheets[0]!;
    expect(csvLines(orders.csv)).toEqual([
      'Codice;Prezzo;Quantità;Totale;Data;Nota',
      `00123;1.234,50;3;3703,5;2026-10-16;'=HYPERLINK(""http://evil"")`.replace(`'=HYPERLINK(""http://evil"")`, `"'=HYPERLINK(""http://evil"")"`),
      ';;;;;',
      '00456;-2,25;12,5%;-0,28125;2026-10-16 14:30:00;"Rossi; ""Mario"""',
    ]);
    expect(orders.csv.startsWith(BOM)).toBe(true);
    expect(orders.csv).not.toContain('B2*C2');
    expect(orders.neutralizedCells).toBe(1);
  });

  it('mantiene gli zeri iniziali dati dal formato numerico', () => {
    const { sheets } = convertWorkbookToCsv(toFile(sampleWorkbook()), 'zip');
    expect(csvLines(sheets[3]!.csv)).toEqual(['00123']);
  });

  it('riconosce fogli nascosti e vuoti', () => {
    const { sheets } = convertWorkbookToCsv(toFile(sampleWorkbook()), 'zip');
    expect(sheets.map(({ name, hidden, empty }) => ({ name, hidden, empty }))).toEqual([
      { name: 'Ordini', hidden: false, empty: false },
      { name: 'Nascosto', hidden: true, empty: false },
      { name: 'Vuoto', hidden: false, empty: true },
      { name: 'Zeri', hidden: false, empty: false },
    ]);
  });

  it('legge anche .xls e .ods', () => {
    for (const [type, container] of [['xls', 'cfb'], ['ods', 'zip']] as const) {
      const { sheets } = convertWorkbookToCsv(toFile(sampleWorkbook(), type), container);
      expect(csvLines(sheets[0]!.csv)[1]).toMatch(/^00123;1\.?234,50?;3;3703,5;2026-10-16;/);
    }
  });

  it('lascia vuote le formule senza valore calcolato e le conta', () => {
    const sheet = utils.aoa_to_sheet([['a', null, 'c']]);
    sheet.B1 = { t: 'z', f: 'SUM(1,2)' } as never;
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, sheet, 'F');
    const { sheets } = convertWorkbookToCsv(toFile(workbook), 'zip');
    expect(csvLines(sheets[0]!.csv)).toEqual(['a;;c']);
    expect(sheets[0]!.missingValues).toBe(1);
  });

  it('solleva no-data se nessun foglio ha dati', () => {
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, utils.aoa_to_sheet([]), 'Vuoto');
    expect(() => convertWorkbookToCsv(toFile(workbook), 'zip')).toThrow(expect.objectContaining({ code: 'no-data' }));
  });

  it('solleva unreadable su un file corrotto', () => {
    const corrupted = toFile(sampleWorkbook()).slice(0, 2000);
    expect(() => convertWorkbookToCsv(corrupted, 'zip')).toThrow(WorkbookError);
  });

  it('rifiuta uno ZIP che non è un foglio di calcolo', () => {
    const zip = zipSync({ 'leggimi.txt': strToU8('ciao') });
    expect(() => convertWorkbookToCsv(zip, 'zip')).toThrow(expect.objectContaining({ code: 'unreadable' }));
  });

  it('rifiuta fogli con una cella isolata in fondo che esploderebbe il CSV', () => {
    const file = handmadeXlsx(
      '<row r="1"><c r="A1" t="inlineStr"><is><t>a</t></is></c></row><row r="1048576"><c r="XFD1048576" t="inlineStr"><is><t>b</t></is></c></row>',
    );
    expect(() => convertWorkbookToCsv(file, 'zip')).toThrow(expect.objectContaining({ code: 'too-much-data' }));
  });

  it('usa il valore salvato delle formule scritte da altri programmi', () => {
    const file = handmadeXlsx('<row r="1"><c r="A1"><v>2</v></c><c r="B1"><f>A1*21</f><v>42</v></c><c r="C1"><f>A1+1</f></c></row>');
    const { sheets } = convertWorkbookToCsv(file, 'zip');
    expect(csvLines(sheets[0]!.csv)).toEqual(['2;42']);
    expect(sheets[0]!.missingValues).toBe(1);
  });
});

describe('nomi dei file', () => {
  it('compone nomi sicuri per CSV e ZIP', () => {
    expect(csvFilename('Bilancio 2026.xlsx', 'Gennaio', false)).toBe('Bilancio 2026 - Gennaio.csv');
    expect(csvFilename('../../etc/dati.XLS', 'Foglio1', true)).toBe('dati.csv');
    expect(csvFilename('report.ods', '..', false)).toBe('report - foglio.csv');
    expect(zipFilename('C:\\Users\\me\\vendite?.xlsm')).toBe('vendite.zip');
  });

  it('rende univoci i nomi delle voci dello ZIP senza percorsi', () => {
    expect(zipEntryNames(['Dati', 'dati', '../x', 'CON', 'Dati'])).toEqual([
      'Dati.csv',
      'dati (2).csv',
      'x.csv',
      'foglio-4.csv',
      'Dati (3).csv',
    ]);
  });
});
