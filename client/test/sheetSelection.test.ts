import { describe, expect, it } from 'vitest';
import { canChooseAll, defaultChoice, planDownload, planTotals } from '../src/lib/excel-csv/sheetSelection';
import type { SheetCsv } from '../src/models/excel';

const sheet = (name: string, overrides: Partial<SheetCsv> = {}): SheetCsv => ({
  name,
  hidden: false,
  empty: false,
  rows: 1,
  columns: 1,
  csv: `${name}\r\n`,
  preview: [[name]],
  neutralizedCells: 0,
  missingValues: 0,
  ...overrides,
});

const sheets = [
  sheet('Riepilogo', { hidden: true, neutralizedCells: 2 }),
  sheet('Gennaio', { neutralizedCells: 1, missingValues: 3 }),
  sheet('Note', { empty: true, csv: '' }),
  sheet('gennaio'),
];

describe('sheetSelection', () => {
  it('sceglie il primo foglio visibile con dati', () => {
    expect(defaultChoice(sheets)).toBe(1);
    expect(defaultChoice([sheet('Solo nascosto', { hidden: true })])).toBe(0);
  });

  it('offre "Tutti" solo con almeno due fogli con dati', () => {
    expect(canChooseAll(sheets)).toBe(true);
    expect(canChooseAll([sheet('A'), sheet('B', { empty: true })])).toBe(false);
  });

  it('un foglio singolo diventa un CSV con il nome del foglio', () => {
    const plan = planDownload('Vendite.xlsx', sheets, 1, false);
    expect(plan).toMatchObject({ kind: 'csv', filename: 'Vendite - Gennaio.csv' });
    expect(planTotals(plan)).toEqual({ neutralizedCells: 1, missingValues: 3 });
  });

  it('"Tutti" esclude vuoti e nascosti, salvo richiesta', () => {
    const plan = planDownload('Vendite.xlsx', sheets, 'all', false);
    if (plan.kind !== 'zip') throw new Error('atteso ZIP');
    expect(plan.filename).toBe('Vendite.zip');
    expect(plan.files.map((file) => file.name)).toEqual(['Gennaio.csv', 'gennaio (2).csv']);
    expect(plan.excluded.map(({ sheet, reason }) => [sheet.name, reason])).toEqual([
      ['Riepilogo', 'hidden'],
      ['Note', 'empty'],
    ]);

    const withHidden = planDownload('Vendite.xlsx', sheets, 'all', true);
    if (withHidden.kind !== 'zip') throw new Error('atteso ZIP');
    expect(withHidden.included.map((item) => item.name)).toEqual(['Riepilogo', 'Gennaio', 'gennaio']);
    expect(planTotals(withHidden)).toEqual({ neutralizedCells: 3, missingValues: 3 });
  });
});
