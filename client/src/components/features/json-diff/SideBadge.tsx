import { CircleAlert, CircleCheck } from 'lucide-react';
import { cn } from '../../../lib/cn';
import type { SideState } from '../../../models/jsonDiff';

export function SideBadge({ side }: { side: SideState }) {
  const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold';
  if (side.empty) return <span className={cn(base, 'bg-surface-muted text-fg-muted')}>Vuoto</span>;
  if (side.analysis?.ok) {
    return (
      <span className={cn(base, 'bg-success-soft text-success')}>
        <CircleCheck className="size-3.5" aria-hidden />
        JSON valido
      </span>
    );
  }
  return (
    <span className={cn(base, 'bg-danger-soft text-danger')}>
      <CircleAlert className="size-3.5" aria-hidden />
      Errore alla riga {side.analysis?.error.line}
    </span>
  );
}
