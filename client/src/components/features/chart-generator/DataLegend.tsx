import { legendEntries } from '../../../lib/chart-generator/legend';
import type { ChartPalette, ChartSpec } from '../../../models/chart';

interface DataLegendProps {
  spec: ChartSpec;
  palette: ChartPalette;
}

/** Legenda dei dati in colonne: colore, etichetta e dato allineato a destra. */
export function DataLegend({ spec, palette }: DataLegendProps) {
  return (
    <ul className="flex flex-col text-sm md:max-h-[420px] md:overflow-y-auto md:pr-3" aria-label="Legenda" data-testid="data-legend">
      {legendEntries(spec, palette).map((entry, index) => (
        <li
          key={`${index}-${entry.label}`}
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-2 last:border-b-0"
        >
          <span className="size-3 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden />
          <span className="break-words text-fg">{entry.label}</span>
          <span className="tabular font-semibold text-fg">{entry.text}</span>
        </li>
      ))}
    </ul>
  );
}
