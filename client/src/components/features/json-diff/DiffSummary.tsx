import { CircleCheck, Info } from 'lucide-react';
import type { JsonComparison, JsonSide } from '../../../models/jsonDiff';

export const SIDE_LABELS: Record<JsonSide, string> = { left: 'Originale', right: 'Modificato' };

interface DiffSummaryProps {
  comparison: JsonComparison;
  onExample: () => void;
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/**
 * Esito del confronto in una riga, senza riquadro: le differenze si vedono già evidenziate negli editor
 * e gli errori di sintassi sono spiegati sotto ciascun riquadro, quindi qui non compaiono.
 */
export function DiffSummary({ comparison, onExample }: DiffSummaryProps) {
  const { verdict, diff, left } = comparison;
  const changedLines = Math.max(diff.leftChanged.size, diff.rightChanged.size);
  const success = verdict === 'identical' || verdict === 'equivalent';

  const text = (() => {
    switch (verdict) {
      case 'empty':
        return 'Incolla un JSON in ciascun riquadro: le differenze compaiono mentre scrivi.';
      case 'waiting':
        return `Manca il JSON «${SIDE_LABELS[left.empty ? 'left' : 'right']}»: incollalo per avviare il confronto.`;
      case 'identical':
        return 'I due JSON sono identici.';
      case 'equivalent':
        return 'Stessi dati: cambiano solo spazi, a capo o ordine delle chiavi.';
      case 'different':
        return `I due JSON sono diversi: ${plural(changedLines, 'riga evidenziata', 'righe evidenziate')} in verde.`;
      case 'invalid':
        return null;
    }
  })();

  return (
    <div className="flex min-h-6 flex-wrap items-center gap-x-3 gap-y-1 text-sm" data-testid="diff-summary" data-verdict={verdict} role="status">
      {text && (
        <p className={success ? 'flex items-center gap-1.5 font-semibold text-success' : 'flex items-center gap-1.5 text-fg-muted'} data-testid="diff-verdict">
          {success ? <CircleCheck className="size-4 shrink-0" aria-hidden /> : <Info className="size-4 shrink-0" aria-hidden />}
          {text}
        </p>
      )}
      {verdict === 'empty' && (
        <button type="button" onClick={onExample} className="inline-flex min-h-11 items-center font-semibold text-primary-text underline-offset-2 hover:underline sm:min-h-0">
          Prova con un esempio
        </button>
      )}
    </div>
  );
}
