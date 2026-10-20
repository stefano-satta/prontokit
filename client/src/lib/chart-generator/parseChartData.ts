import type { ChartKind, ChartRow, ParsedChartData } from '../../models/chart';
import { parseNumber, sumOf } from './numbers';

export const MAX_CHART_ROWS = 50;
export const SEPARATOR = ';';

/**
 * Una riga per dato nel formato "etichetta;valore".
 * Si divide sull'ultimo punto e virgola, così l'etichetta può contenerne altri.
 */
export const parseChartData = (text: string): ParsedChartData => {
  const rows: ChartRow[] = [];
  const issues: ParsedChartData['issues'] = [];
  let truncated = 0;

  text.split(/\r?\n/).forEach((raw, index) => {
    const content = raw.trim();
    if (!content) return;
    const line = index + 1;
    const at = content.lastIndexOf(SEPARATOR);
    if (at === -1) {
      issues.push({ line, message: 'manca il punto e virgola tra etichetta e valore (es. "Gennaio;120").' });
      return;
    }
    const label = content.slice(0, at).trim();
    const rawValue = content.slice(at + 1).trim();
    if (!label) {
      issues.push({ line, message: 'manca l’etichetta prima del punto e virgola.' });
      return;
    }
    if (!rawValue) {
      issues.push({ line, message: 'manca il valore dopo il punto e virgola.' });
      return;
    }
    const value = parseNumber(rawValue);
    if (value === null) {
      issues.push({ line, message: `"${rawValue}" non è un numero: usa solo cifre e la virgola per i decimali (es. 12,5).` });
      return;
    }
    if (rows.length >= MAX_CHART_ROWS) {
      truncated += 1;
      return;
    }
    rows.push({ label, value });
  });

  return { rows, issues, truncated };
};

/** Motivo per cui il tipo di grafico non può disegnare questi dati, oppure null. */
export const chartBlocker = (kind: ChartKind, rows: readonly ChartRow[]): string | null => {
  if (rows.length === 0) return 'Inserisci almeno una riga nel formato "etichetta;valore" per vedere l’anteprima.';
  if (kind !== 'pie') return null;
  const negatives = rows.filter((row) => row.value < 0).map((row) => `"${row.label}"`);
  if (negatives.length > 0) {
    return `La torta non può mostrare valori negativi: correggi ${negatives.length === 1 ? 'la voce' : 'le voci'} ${negatives.join(', ')}.`;
  }
  if (sumOf(rows.map((row) => row.value)) === 0) {
    return 'La somma dei valori è zero: inserisci almeno un valore maggiore di zero per disegnare la torta.';
  }
  return null;
};
