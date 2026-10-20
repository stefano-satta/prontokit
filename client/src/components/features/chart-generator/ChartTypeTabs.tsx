import { ChartColumn, ChartLine, ChartPie, type LucideIcon } from 'lucide-react';
import { useRef, type KeyboardEvent } from 'react';
import { cn } from '../../../lib/cn';
import type { ChartKind } from '../../../models/chart';

export const CHART_TABS: readonly { kind: ChartKind; label: string; icon: LucideIcon }[] = [
  { kind: 'bar', label: 'Barre', icon: ChartColumn },
  { kind: 'pie', label: 'Torta', icon: ChartPie },
  { kind: 'line', label: 'Linee', icon: ChartLine },
];

export const tabId = (kind: ChartKind) => `chart-tab-${kind}`;
export const TAB_PANEL_ID = 'chart-tab-panel';

interface ChartTypeTabsProps {
  value: ChartKind;
  onChange: (kind: ChartKind) => void;
}

/** Tab ARIA: frecce, Home e Fine spostano e attivano la scheda. */
export function ChartTypeTabs({ value, onChange }: ChartTypeTabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = CHART_TABS.findIndex((tab) => tab.kind === value);
    const last = CHART_TABS.length - 1;
    const next = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onChange(CHART_TABS[next].kind);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Tipo di grafico"
      onKeyDown={onKeyDown}
      className="grid grid-cols-3 gap-1 rounded-xl bg-surface-muted p-1 sm:inline-grid sm:w-auto"
    >
      {CHART_TABS.map(({ kind, label, icon: Icon }, index) => {
        const selected = kind === value;
        return (
          <button
            key={kind}
            ref={(node) => {
              refs.current[index] = node;
            }}
            id={tabId(kind)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={TAB_PANEL_ID}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(kind)}
            className={cn(
              'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors sm:px-5',
              selected
                ? 'bg-surface text-primary-text shadow-[0_1px_2px_rgb(15_23_42/0.12)]'
                : 'text-fg-muted hover:text-fg',
            )}
          >
            <Icon className="size-[18px]" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
