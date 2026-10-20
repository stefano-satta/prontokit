import { BarChart3 } from 'lucide-react';

const numberFormatter = new Intl.NumberFormat('it-IT');

/** Contatore globale dei link creati da tutti gli utenti. */
export function ServiceUsage({ total }: { total: number }) {
  return (
    <p
      className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] text-fg-muted"
      data-testid="service-usage"
    >
      <BarChart3 className="size-4 text-primary-text" aria-hidden />
      <span>
        Servizio utilizzato{' '}
        <strong className="tabular font-semibold text-fg">{numberFormatter.format(total)}</strong>{' '}
        {total === 1 ? 'volta' : 'volte'}
      </span>
    </p>
  );
}
