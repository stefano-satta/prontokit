import type { ChartPalette, ChartSpec } from '../../models/chart';
import { formatNumber, sumOf } from './numbers';
import { seriesColor } from './palette';
import { pieSliceText } from './tableModel';

export interface LegendEntry {
  label: string;
  /** Dato mostrato: valore così come inserito, o formato scelto per la torta */
  text: string;
  color: string;
}

/** Voci della legenda: barre e spicchi hanno un colore ciascuno, la linea uno solo. */
export const legendEntries = (spec: Pick<ChartSpec, 'kind' | 'rows' | 'pieFormat'>, palette: ChartPalette): LegendEntry[] => {
  const total = sumOf(spec.rows.map((row) => row.value));
  return spec.rows.map((row, index) => ({
    label: row.label,
    text: spec.kind === 'pie' ? pieSliceText(row.value, total, spec.pieFormat) : formatNumber(row.value),
    color: seriesColor(palette, spec.kind === 'line' ? 0 : index),
  }));
};
