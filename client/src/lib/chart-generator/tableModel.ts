import type { ChartKind, ChartRow, PieFormat, TableModel } from '../../models/chart';
import { formatNumber, formatPercent, sumOf } from './numbers';

export const MAX_SHARE_LABEL = 'Rispetto al massimo';
const MAX_SHARE_DECIMALS = 1;

/**
 * Tabella dei dati. Barre e linee: quota di ogni valore rispetto al massimo, con barra di avanzamento.
 * Torta: quota percentuale sul totale e riga del totale.
 */
export const buildTableModel = (kind: ChartKind, rows: readonly ChartRow[], pieFormat: PieFormat): TableModel => {
  const base = rows.map((row) => [row.label, formatNumber(row.value)]);
  if (kind !== 'pie') {
    const max = Math.max(...rows.map((row) => row.value));
    const ratios = rows.map((row) => (max > 0 ? row.value / max : null));
    return {
      columns: [
        { label: 'Etichetta', align: 'left' },
        { label: 'Valore', align: 'right' },
        { label: MAX_SHARE_LABEL, align: 'right' },
      ],
      rows: rows.map((_, index) => {
        const ratio = ratios[index];
        return [...base[index], ratio === null ? '–' : formatPercent(ratio * 100, MAX_SHARE_DECIMALS)];
      }),
      meter: {
        column: 2,
        fractions: ratios.map((ratio) => Math.min(1, Math.max(0, ratio ?? 0))),
        // Le barre del grafico hanno colori misti, la linea uno solo: la tabella li riprende
        colorIndexes: rows.map((_, index) => (kind === 'bar' ? index : 0)),
      },
    };
  }
  const total = sumOf(rows.map((row) => row.value));
  const share = (value: number) => (total === 0 ? '–' : formatPercent((value / total) * 100, pieFormat.decimals));
  return {
    columns: [
      { label: 'Etichetta', align: 'left' },
      { label: 'Valore', align: 'right' },
      { label: 'Percentuale', align: 'right' },
    ],
    rows: rows.map((row, index) => [...base[index], share(row.value)]),
    footer: ['Totale', formatNumber(total), total === 0 ? '–' : formatPercent(100, pieFormat.decimals)],
  };
};

/** Testo dello spicchio secondo il formato scelto. */
export const pieSliceText = (value: number, total: number, format: PieFormat): string =>
  format.mode === 'percent'
    ? formatPercent(total === 0 ? 0 : (value / total) * 100, format.decimals)
    : formatNumber(value, format.decimals);
