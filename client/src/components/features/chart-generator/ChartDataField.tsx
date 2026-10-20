import { useId } from 'react';
import { cn } from '../../../lib/cn';
import { MAX_CHART_ROWS } from '../../../lib/chart-generator/parseChartData';
import type { ParsedChartData } from '../../../models/chart';

interface ChartDataFieldProps {
  value: string;
  onChange: (value: string) => void;
  parsed: ParsedChartData;
}

/** Textarea dei dati, una riga "etichetta;valore" per voce, con gli errori riga per riga. */
export function ChartDataField({ value, onChange, parsed }: ChartDataFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const issuesId = `${id}-issues`;
  const hasIssues = parsed.issues.length > 0 || parsed.truncated > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fg">
        Etichette e valori
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={7}
        spellCheck={false}
        aria-describedby={hasIssues ? `${hintId} ${issuesId}` : hintId}
        aria-invalid={parsed.issues.length > 0 ? true : undefined}
        placeholder={'Gennaio;120\nFebbraio;98,5\nMarzo;143'}
        className={cn(
          'min-h-40 resize-y rounded-lg border bg-surface px-3.5 py-3 font-mono text-[14px] leading-6 text-fg outline-none transition-colors',
          'focus:border-primary focus:ring-3 focus:ring-primary/20',
          parsed.issues.length > 0 ? 'border-danger' : 'border-border-strong hover:border-fg-muted/60',
        )}
      />
      <p id={hintId} className="text-[13px] text-fg-muted">
        Una voce per riga nel formato <span className="font-mono text-fg">etichetta;valore</span>. Per i decimali usa la virgola, es.{' '}
        <span className="font-mono text-fg">Febbraio;98,5</span>. Massimo {MAX_CHART_ROWS} righe.
      </p>
      {hasIssues && (
        <ul id={issuesId} className="flex flex-col gap-0.5 text-[13px] font-medium text-danger" aria-live="polite">
          {parsed.issues.slice(0, 5).map((issue) => (
            <li key={issue.line}>
              Riga {issue.line}: {issue.message}
            </li>
          ))}
          {parsed.issues.length > 5 && <li>Altre {parsed.issues.length - 5} righe da correggere.</li>}
          {parsed.truncated > 0 && (
            <li>
              Ho usato le prime {MAX_CHART_ROWS} righe valide: {parsed.truncated === 1 ? 'una è stata esclusa' : `${parsed.truncated} sono state escluse`}.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
