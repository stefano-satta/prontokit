import { CircleAlert, CircleCheck, FileSpreadsheet, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ExcelConversionState } from '../../../models/excel';
import { Button } from '../../common/Button';
import { Spinner } from '../../common/Spinner';

type Status = Exclude<ExcelConversionState, { status: 'idle' }>['status'];

function StatusIcon({ status }: { status: Status }) {
  if (status === 'ready') return <CircleCheck className="size-5 text-success" aria-hidden />;
  if (status === 'error') return <CircleAlert className="size-5 text-danger" aria-hidden />;
  return <FileSpreadsheet className="size-5 text-primary-text" aria-hidden />;
}

/** Intestazione con nome del file e stato, comune a tutte le fasi della conversione. */
export function FileStatusHeader({ fileName, status, detail }: { fileName: string | null; status: Status; detail: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-muted">
        <StatusIcon status={status} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-fg" title={fileName ?? undefined}>
          {fileName ?? 'File'}
        </p>
        <p className="tabular text-[13px] text-fg-muted" aria-live="polite">
          {detail}
        </p>
      </div>
    </div>
  );
}

type PendingState = Extract<ExcelConversionState, { status: 'converting' | 'error' }>;

/** Conversione in corso o non riuscita: mostra il problema e permette di riprovare. */
export function ExcelStatusCard({ state, onReset }: { state: PendingState; onReset: () => void }) {
  const converting = state.status === 'converting';
  return (
    <div className="flex flex-col gap-6" data-testid="conversion-card" data-status={state.status}>
      <FileStatusHeader
        fileName={state.fileName}
        status={state.status}
        detail={converting ? 'Lettura del file in corso…' : 'Conversione non riuscita'}
      />
      {converting && (
        <p className="flex items-center gap-2 text-sm text-fg-muted">
          <Spinner label="Conversione in corso" />
          Calcolo dei valori e preparazione dei CSV…
        </p>
      )}
      {state.status === 'error' && (
        <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {state.message}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" variant="secondary" onClick={onReset} icon={<RotateCcw className="size-[18px]" aria-hidden />}>
          {converting ? 'Annulla' : 'Converti un altro file'}
        </Button>
      </div>
    </div>
  );
}
