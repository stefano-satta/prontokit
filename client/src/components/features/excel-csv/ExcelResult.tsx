import { Download, Info, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { downloadBlob, downloadText } from '../../../lib/downloadFile';
import {
  defaultChoice,
  planDownload,
  planTotals,
  type DownloadPlan,
  type SheetChoice,
} from '../../../lib/excel-csv/sheetSelection';
import type { WorkbookCsv } from '../../../models/excel';
import { createCsvZip } from '../../../services/excel/csvArchive';
import { Button } from '../../common/Button';
import { Panel } from '../../common/Panel';
import { CsvPreview } from './CsvPreview';
import { FileStatusHeader } from './ExcelStatusCard';
import { SheetPicker } from './SheetPicker';

interface ExcelResultProps {
  fileName: string;
  workbook: WorkbookCsv;
  onReset: () => void;
}

const numberFormatter = new Intl.NumberFormat('it-IT');
const count = (n: number, one: string, many: string) => `${numberFormatter.format(n)} ${n === 1 ? one : many}`;

function Note({ children, testId }: { children: string; testId?: string }) {
  return (
    <p className="flex items-start gap-2.5 rounded-lg bg-surface-muted px-4 py-3 text-sm text-fg" data-testid={testId}>
      <Info className="mt-0.5 size-4 shrink-0 text-primary-text" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

const quoteList = (names: string[]) => names.map((name) => `“${name}”`).join(', ');

/** Cosa contiene lo ZIP, detto esplicitamente: inclusi, nascosti esclusi, vuoti esclusi. */
function zipSummary(plan: Extract<DownloadPlan, { kind: 'zip' }>): string {
  const parts = [`Lo ZIP contiene ${count(plan.included.length, 'foglio', 'fogli')}: ${quoteList(plan.included.map((s) => s.name))}.`];
  const hiddenIncluded = plan.included.filter((sheet) => sheet.hidden).map((sheet) => sheet.name);
  const hiddenExcluded = plan.excluded.filter((item) => item.reason === 'hidden').map((item) => item.sheet.name);
  const empty = plan.excluded.filter((item) => item.reason === 'empty').map((item) => item.sheet.name);
  if (hiddenIncluded.length) parts.push(`Fogli nascosti inclusi: ${quoteList(hiddenIncluded)}.`);
  if (hiddenExcluded.length) parts.push(`Fogli nascosti esclusi: ${quoteList(hiddenExcluded)}.`);
  if (empty.length) parts.push(`Fogli vuoti esclusi: ${quoteList(empty)}.`);
  return parts.join(' ');
}

function hiddenSummary(workbook: WorkbookCsv, plan: DownloadPlan): string | null {
  if (plan.kind === 'zip') return zipSummary(plan);
  if (plan.sheet.hidden) return `Il foglio “${plan.sheet.name}” è nascosto nel file Excel: lo stai convertendo comunque.`;
  const hidden = workbook.sheets.filter((sheet) => sheet.hidden);
  if (!hidden.length) return null;
  return `Il file contiene anche ${count(hidden.length, 'foglio nascosto, non incluso', 'fogli nascosti, non inclusi')} in questo CSV.`;
}

export function ExcelResult({ fileName, workbook, onReset }: ExcelResultProps) {
  const { sheets } = workbook;
  const [choice, setChoice] = useState<SheetChoice>(() => defaultChoice(sheets));
  const [includeHidden, setIncludeHidden] = useState(false);
  const plan = useMemo(() => planDownload(fileName, sheets, choice, includeHidden), [fileName, sheets, choice, includeHidden]);
  const totals = planTotals(plan);
  const visibility = hiddenSummary(workbook, plan);
  const nothingToDownload = plan.kind === 'zip' && plan.files.length === 0;

  const download = () => {
    if (plan.kind === 'csv') downloadText(plan.sheet.csv, plan.filename, 'text/csv;charset=utf-8');
    else if (plan.files.length) downloadBlob(createCsvZip(plan.files), plan.filename);
  };

  return (
    <>
      <Panel className="p-6 sm:p-8">
        <div className="flex flex-col gap-6" data-testid="conversion-card" data-status="ready">
          <FileStatusHeader
            fileName={fileName}
            status="ready"
            detail={`${count(sheets.length, 'foglio', 'fogli')} · valori calcolati, formule escluse`}
          />
          {sheets.length > 1 && (
            <SheetPicker
              sheets={sheets}
              choice={choice}
              onChoice={setChoice}
              includeHidden={includeHidden}
              onIncludeHidden={setIncludeHidden}
            />
          )}
          <div className="flex flex-col gap-2" aria-live="polite">
            {visibility && <Note testId="hidden-summary">{visibility}</Note>}
            {totals.neutralizedCells > 0 && (
              <Note testId="neutralized-note">
                {`${count(totals.neutralizedCells, 'cella iniziava', 'celle iniziavano')} con =, +, - o @: abbiamo aggiunto un apostrofo davanti, così all'apertura del CSV non ${totals.neutralizedCells === 1 ? 'viene eseguita' : 'vengono eseguite'} come formula.`}
              </Note>
            )}
            {totals.missingValues > 0 && (
              <Note testId="missing-note">
                {`${count(totals.missingValues, 'formula non ha', 'formule non hanno')} un valore calcolato salvato nel file e ${totals.missingValues === 1 ? 'è rimasta vuota' : 'sono rimaste vuote'}. Apri il file in Excel, salvalo e riprova per ottenere i valori.`}
              </Note>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={download}
              disabled={nothingToDownload}
              icon={<Download className="size-[18px]" aria-hidden />}
            >
              {plan.kind === 'zip' ? 'Scarica ZIP' : 'Scarica CSV'}
            </Button>
            <Button size="lg" variant="secondary" onClick={onReset} icon={<RotateCcw className="size-[18px]" aria-hidden />}>
              Converti un altro file
            </Button>
          </div>
        </div>
      </Panel>
      {plan.kind === 'csv' && <CsvPreview sheet={plan.sheet} />}
    </>
  );
}
