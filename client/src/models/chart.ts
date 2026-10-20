export type ChartKind = 'bar' | 'pie' | 'line';
export type BarOrientation = 'vertical' | 'horizontal';
export type PieStyle = 'pie' | 'doughnut';
/** Come mostrare gli spicchi: valore inserito o percentuale sul totale */
export type PieValueMode = 'value' | 'percent';
export type PieDecimals = 1 | 2;

export interface ChartRow {
  label: string;
  value: number;
}

export interface ParseIssue {
  /** Numero di riga nella textarea (da 1) */
  line: number;
  message: string;
}

export interface ParsedChartData {
  rows: ChartRow[];
  issues: ParseIssue[];
  /** Righe valide scartate perché oltre il limite */
  truncated: number;
}

export interface PieFormat {
  mode: PieValueMode;
  decimals: PieDecimals;
}

export interface ChartSpec {
  kind: ChartKind;
  title: string;
  rows: readonly ChartRow[];
  orientation: BarOrientation;
  pieStyle: PieStyle;
  pieFormat: PieFormat;
}

/** Colori del grafico per un tema: superficie, inchiostri e serie categoriali in ordine fisso */
export interface ChartPalette {
  surface: string;
  fg: string;
  muted: string;
  grid: string;
  axis: string;
  series: readonly string[];
}

export interface TableColumn {
  label: string;
  align: 'left' | 'right';
}

/** Colonna con barra di avanzamento: quota di ogni riga (0–1) e indice del colore della serie */
export interface TableMeter {
  column: number;
  fractions: number[];
  colorIndexes: number[];
}

export interface TableModel {
  columns: TableColumn[];
  rows: string[][];
  footer?: string[];
  meter?: TableMeter;
}
