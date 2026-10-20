import { CircleAlert, CircleCheck, Download, FileText, RotateCcw } from 'lucide-react';
import { downloadText } from '../../../lib/downloadFile';
import type { PdfConversionState } from '../../../models/pdf';
import { Button } from '../../common/Button';
import { Spinner } from '../../common/Spinner';
import { ConversionProgressBar } from './ConversionProgressBar';
import { PasswordForm } from './PasswordForm';

type ActiveState = Exclude<PdfConversionState, { status: 'idle' }>;

interface ConversionCardProps {
  state: ActiveState;
  onPassword: (password: string) => void;
  onReset: () => void;
}

const numberFormatter = new Intl.NumberFormat('it-IT');

function StatusIcon({ status }: { status: ActiveState['status'] }) {
  if (status === 'done') return <CircleCheck className="size-5 text-success" aria-hidden />;
  if (status === 'error') return <CircleAlert className="size-5 text-danger" aria-hidden />;
  return <FileText className="size-5 text-primary-text" aria-hidden />;
}

export function ConversionCard({ state, onPassword, onReset }: ConversionCardProps) {
  const converting = state.status === 'converting';
  const result = state.status === 'done' ? state.result : null;

  return (
    <div className="flex flex-col gap-6" data-testid="conversion-card" data-status={state.status}>
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-muted">
          <StatusIcon status={state.status} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-fg" title={state.fileName ?? undefined}>
            {state.fileName ?? 'File'}
          </p>
          <p className="tabular text-[13px] text-fg-muted" aria-live="polite">
            {converting && 'Conversione in corso…'}
            {state.status === 'password' && 'In attesa della password'}
            {state.status === 'error' && 'Conversione non riuscita'}
            {result &&
              `${numberFormatter.format(result.stats.pages)} pagine · ${numberFormatter.format(result.stats.words)} parole · ~${numberFormatter.format(result.stats.approxTokens)} token`}
          </p>
        </div>
      </div>

      {converting && <ConversionProgressBar progress={state.progress} />}
      {state.status === 'password' && <PasswordForm incorrect={state.incorrect} onSubmit={onPassword} />}
      {state.status === 'error' && (
        <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {state.status !== 'error' && state.status !== 'password' && (
          <Button
            size="lg"
            disabled={!result}
            aria-busy={converting}
            onClick={() => result && downloadText(result.markdown, result.filename, 'text/markdown;charset=utf-8')}
            icon={converting ? <Spinner label="Conversione in corso" /> : <Download className="size-[18px]" aria-hidden />}
          >
            {converting ? 'Elaborazione…' : 'Scarica Markdown'}
          </Button>
        )}
        <Button size="lg" variant="secondary" onClick={onReset} icon={<RotateCcw className="size-[18px]" aria-hidden />}>
          {converting ? 'Annulla' : 'Converti un altro file'}
        </Button>
      </div>
    </div>
  );
}
