import { Gift, ShieldCheck, UsersRound, type LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface Highlight {
  title: string;
  detail?: string;
  icon: LucideIcon;
  /** Colori dell'icona, solo token semantici */
  tone: string;
}

const HIGHLIGHTS: readonly Highlight[] = [
  { title: 'Veloce e affidabile', icon: ShieldCheck, tone: 'bg-success-soft text-success' },
  { title: 'Nessuna registrazione', icon: UsersRound, tone: 'bg-primary-soft text-primary-text' },
  { title: '100% gratis', icon: Gift, tone: 'bg-accent-soft text-accent' },
];

/** Punti di forza sotto il titolo della home. */
export function HomeHighlights() {
  return (
    <ul className="mx-auto flex w-fit flex-col gap-4 sm:flex-row sm:gap-0">
      {HIGHLIGHTS.map(({ title, detail, icon: Icon, tone }) => (
        <li key={title} className="flex items-center gap-3.5 sm:px-6 lg:px-8">
          <span className={cn('grid size-12 shrink-0 place-items-center rounded-xl', tone)}>
            <Icon className="size-6" aria-hidden />
          </span>
          <span className="flex flex-col text-left leading-snug">
            <span className="text-fg-muted text-sm">{title}</span>
            {detail && <span className="text-sm text-fg-muted">{detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
