import type { SheetCsv } from '../../models/excel';
import { csvFilename, zipEntryNames, zipFilename } from './csvFileNames';

/** Indice di un foglio oppure tutti i fogli in un unico ZIP. */
export type SheetChoice = number | 'all';

export type ExclusionReason = 'hidden' | 'empty';

export type DownloadPlan =
  | { kind: 'csv'; filename: string; sheet: SheetCsv }
  | {
      kind: 'zip';
      filename: string;
      files: { name: string; csv: string }[];
      included: SheetCsv[];
      excluded: { sheet: SheetCsv; reason: ExclusionReason }[];
    };

export const sheetsWithData = (sheets: readonly SheetCsv[]) => sheets.filter((sheet) => !sheet.empty);

/** "Tutti" ha senso solo se almeno due fogli contengono dati. */
export const canChooseAll = (sheets: readonly SheetCsv[]) => sheetsWithData(sheets).length > 1;

/** Scelta iniziale: il primo foglio visibile con dati (o, in mancanza, il primo con dati). */
export function defaultChoice(sheets: readonly SheetCsv[]): SheetChoice {
  const visible = sheets.findIndex((sheet) => !sheet.empty && !sheet.hidden);
  return visible >= 0 ? visible : sheets.findIndex((sheet) => !sheet.empty);
}

export function planDownload(
  fileName: string,
  sheets: readonly SheetCsv[],
  choice: SheetChoice,
  includeHidden: boolean,
): DownloadPlan {
  if (choice !== 'all') {
    const sheet = sheets[choice]!;
    return { kind: 'csv', sheet, filename: csvFilename(fileName, sheet.name, sheets.length === 1) };
  }

  const included: SheetCsv[] = [];
  const excluded: { sheet: SheetCsv; reason: ExclusionReason }[] = [];
  for (const sheet of sheets) {
    if (sheet.empty) excluded.push({ sheet, reason: 'empty' });
    else if (sheet.hidden && !includeHidden) excluded.push({ sheet, reason: 'hidden' });
    else included.push(sheet);
  }
  const names = zipEntryNames(included.map((sheet) => sheet.name));
  return {
    kind: 'zip',
    filename: zipFilename(fileName),
    files: included.map((sheet, index) => ({ name: names[index]!, csv: sheet.csv })),
    included,
    excluded,
  };
}

/** Totali per gli avvisi del riepilogo, sui soli fogli che finiscono nel download. */
export function planTotals(plan: DownloadPlan) {
  const sheets = plan.kind === 'csv' ? [plan.sheet] : plan.included;
  return {
    neutralizedCells: sheets.reduce((total, sheet) => total + sheet.neutralizedCells, 0),
    missingValues: sheets.reduce((total, sheet) => total + sheet.missingValues, 0),
  };
}
