import {
  Chart,
  type ChartConfiguration,
  type Plugin,
  type TooltipItem,
} from 'chart.js';
import type { ChartPalette, ChartSpec } from '../../models/chart';
import { formatNumber, sumOf } from './numbers';
import { readableInkOn, seriesColor } from './palette';
import { legendEntries } from './legend';
import { pieSliceText } from './tableModel';

/** Sotto quest'angolo (radianti) lo spicchio è troppo stretto per l'etichetta: resta in legenda e tooltip. */
const MIN_LABEL_ANGLE = 0.35;

const numericData = (chart: Chart): number[] =>
  (chart.data.datasets[0]?.data ?? []).map((value) => (typeof value === 'number' ? value : 0));

/** Scrive il valore (o la percentuale) dentro ogni spicchio abbastanza ampio. */
const sliceLabelsPlugin = (spec: ChartSpec): Plugin => ({
  id: 'sliceLabels',
  afterDatasetsDraw(chart) {
    const meta = chart.getDatasetMeta(0);
    const values = numericData(chart);
    const total = sumOf(values);
    const colors = chart.data.datasets[0]?.backgroundColor;
    const { ctx } = chart;
    ctx.save();
    ctx.font = `600 13px ${Chart.defaults.font.family}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    meta.data.forEach((element, index) => {
      if (!chart.getDataVisibility(index)) return;
      const { startAngle, endAngle } = element.getProps(['startAngle', 'endAngle'], true) as {
        startAngle: number;
        endAngle: number;
      };
      if (endAngle - startAngle < MIN_LABEL_ANGLE) return;
      const { x, y } = element.tooltipPosition(true);
      const fill = Array.isArray(colors) ? String(colors[index]) : '#000000';
      ctx.fillStyle = readableInkOn(fill);
      ctx.fillText(pieSliceText(values[index], total, spec.pieFormat), x ?? 0, y ?? 0);
    });
    ctx.restore();
  },
});

const MAX_TICK_CHARS = 16;

/** Etichetta d'asse accorciata con i puntini se troppo lunga. */
export const shortLabel = (label: string): string =>
  label.length > MAX_TICK_CHARS ? `${label.slice(0, MAX_TICK_CHARS - 1).trimEnd()}…` : label;

/** Spazio sopra la barra o il punto più alto, così il valore non tocca il bordo del grafico. */
const AXIS_GRACE = '12%';
const LABEL_GAP = 6;

/** Valore scritto in cima a ogni barra (a destra se orizzontale) e sopra ogni punto della linea. */
const valueLabelsPlugin = (color: string, horizontal: boolean): Plugin => ({
  id: 'valueLabels',
  afterDatasetsDraw(chart) {
    const meta = chart.getDatasetMeta(0);
    const values = numericData(chart);
    const { ctx, chartArea } = chart;
    const slot = (horizontal ? chartArea.bottom - chartArea.top : chartArea.right - chartArea.left) / Math.max(values.length, 1);
    ctx.save();
    ctx.fillStyle = color;
    // Una sola dimensione per tutti i valori: la più grande in cui entra il più largo
    const texts = values.map((value) => formatNumber(value));
    const widest = (size: number) => {
      ctx.font = `600 ${size}px ${Chart.defaults.font.family}`;
      return Math.max(...texts.map((text) => ctx.measureText(text).width));
    };
    const size = horizontal
      ? slot < 18 ? 10 : 12
      : ([12, 11, 10, 9].find((candidate) => widest(candidate) <= slot - 2) ?? 9);
    ctx.font = `600 ${size}px ${Chart.defaults.font.family}`;
    meta.data.forEach((element, index) => {
      const value = values[index];
      const text = formatNumber(value);
      const { x, y } = element.getProps(['x', 'y'], true) as { x: number; y: number };
      const negative = value < 0;
      if (horizontal) {
        // Barre troppo sottili: il valore resta in tooltip, legenda e tabella
        if (slot < 12) return;
        ctx.textBaseline = 'middle';
        ctx.textAlign = negative ? 'right' : 'left';
        ctx.fillText(text, x + (negative ? -LABEL_GAP : LABEL_GAP), y);
        return;
      }
      // Oltre i 9px non si scende: il valore resta in tooltip, legenda e tabella
      if (ctx.measureText(text).width > slot - 2) return;
      ctx.textAlign = 'center';
      ctx.textBaseline = negative ? 'top' : 'bottom';
      ctx.fillText(text, x, y + (negative ? LABEL_GAP : -LABEL_GAP));
    });
    ctx.restore();
  },
});

const truncateToWidth = (ctx: CanvasRenderingContext2D, text: string, max: number): string => {
  if (ctx.measureText(text).width <= max) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > max) cut = cut.slice(0, -1);
  return `${cut.trimEnd()}…`;
};

/** Larghezza riservata alla legenda a destra nell'immagine esportata. */
export const LEGEND_WIDTH = 340;

/** Legenda in colonne (pallino, etichetta, dato allineato a destra) disegnata a destra del grafico esportato. */
export const dataLegendPlugin = (spec: ChartSpec, palette: ChartPalette): Plugin => ({
  id: 'dataLegend',
  afterDraw(chart) {
    const entries = legendEntries(spec, palette);
    const { ctx, chartArea, width } = chart;
    const left = width - LEGEND_WIDTH;
    const right = width - 40;
    const rowHeight = Math.min(30, (chartArea.bottom - chartArea.top) / Math.max(entries.length, 1));
    const fontSize = Math.max(10, Math.min(14, rowHeight - 8));
    let y = (chartArea.top + chartArea.bottom) / 2 - (rowHeight * entries.length) / 2 + rowHeight / 2;
    ctx.save();
    ctx.textBaseline = 'middle';
    entries.forEach((entry) => {
      ctx.font = `600 ${fontSize}px ${Chart.defaults.font.family}`;
      const valueWidth = ctx.measureText(entry.text).width;
      ctx.fillStyle = entry.color;
      ctx.beginPath();
      ctx.arc(left + 6, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = palette.fg;
      ctx.textAlign = 'right';
      ctx.fillText(entry.text, right, y);
      ctx.font = `400 ${fontSize}px ${Chart.defaults.font.family}`;
      ctx.textAlign = 'left';
      ctx.fillText(truncateToWidth(ctx, entry.label, right - valueWidth - 16 - (left + 22)), left + 22, y);
      y += rowHeight;
    });
    ctx.restore();
  },
});

/** Sfondo pieno per l'esportazione: il canvas è trasparente di suo. */
export const surfacePlugin = (color: string): Plugin => ({
  id: 'surface',
  beforeDraw(chart) {
    const { ctx, width, height } = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  },
});

const titleOptions = (spec: ChartSpec, palette: ChartPalette) => ({
  display: spec.title.trim() !== '',
  text: spec.title.trim(),
  color: palette.fg,
  align: 'start' as const,
  font: { size: 16, weight: 600 },
  padding: { top: 4, bottom: 20 },
});

const tooltipOptions = (palette: ChartPalette) => ({
  backgroundColor: palette.fg,
  titleColor: palette.surface,
  bodyColor: palette.surface,
  padding: 10,
  cornerRadius: 8,
  displayColors: true,
  boxPadding: 4,
});

/**
 * Configurazione Chart.js per anteprima ed esportazione.
 * Barre e spicchi hanno colori misti in ordine fisso; la linea usa il primo colore.
 */
export const buildChartConfig = (spec: ChartSpec, palette: ChartPalette, animate = true): ChartConfiguration => {
  const labels = spec.rows.map((row) => row.label);
  const values = spec.rows.map((row) => row.value);
  const colors = spec.rows.map((_, index) => seriesColor(palette, index));
  const base = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animate ? { duration: 300 } : (false as const),
    layout: { padding: 8 },
  };

  if (spec.kind === 'pie') {
    const total = sumOf(values);
    const config: ChartConfiguration<'pie' | 'doughnut'> = {
      type: spec.pieStyle,
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderColor: palette.surface, borderWidth: 2, hoverOffset: 6 }],
      },
      options: {
        ...base,
        cutout: spec.pieStyle === 'doughnut' ? '55%' : 0,
        plugins: {
          title: titleOptions(spec, palette),
          // In pagina la legenda è HTML a fianco del grafico; nell'export la disegna dataLegendPlugin
          legend: { display: false },
          tooltip: {
            ...tooltipOptions(palette),
            callbacks: {
              label: (item: TooltipItem<'pie' | 'doughnut'>) =>
                ` ${pieSliceText(Number(item.raw), total, spec.pieFormat)}`,
            },
          },
        },
      },
      plugins: [sliceLabelsPlugin(spec)],
    };
    return config as ChartConfiguration;
  }

  const horizontal = spec.kind === 'bar' && spec.orientation === 'horizontal';
  const valueAxis = {
    beginAtZero: true,
    grace: AXIS_GRACE,
    grid: { color: palette.grid },
    border: { display: false },
    ticks: { color: palette.muted, callback: (value: string | number) => formatNumber(Number(value)) },
  };
  const categoryAxis = {
    grid: { display: false },
    border: { color: palette.axis },
    // Tutte le etichette, mai alternate: Chart.js le ruota fino a 90° se non c'è spazio;
    // quelle lunghe si accorciano, il testo completo resta in legenda, tooltip e tabella
    ticks: {
      color: palette.muted,
      autoSkip: false,
      maxRotation: 90,
      callback: (_value: string | number, index: number) => shortLabel(labels[index] ?? ''),
    },
  };
  const valueTooltip = {
    ...tooltipOptions(palette),
    callbacks: { label: (item: TooltipItem<'bar' | 'line'>) => ` ${formatNumber(Number(item.raw))}` },
  };

  if (spec.kind === 'line') {
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: spec.title.trim() || 'Valore',
            data: values,
            borderColor: colors[0],
            backgroundColor: colors[0],
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBorderColor: palette.surface,
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        ...base,
        interaction: { mode: 'index', intersect: false },
        // offset: il primo e l'ultimo punto non stanno sul bordo, così il loro valore resta leggibile
        scales: { x: { ...categoryAxis, offset: true }, y: valueAxis },
        plugins: { title: titleOptions(spec, palette), legend: { display: false }, tooltip: valueTooltip },
      },
      plugins: [valueLabelsPlugin(palette.fg, false)],
    };
    return config as ChartConfiguration;
  }

  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: spec.title.trim() || 'Valore',
          data: values,
          backgroundColor: colors,
          borderRadius: 4,
          borderSkipped: 'start',
          maxBarThickness: 64,
          categoryPercentage: 0.75,
          barPercentage: 0.9,
        },
      ],
    },
    options: {
      ...base,
      indexAxis: horizontal ? 'y' : 'x',
      scales: horizontal ? { x: valueAxis, y: categoryAxis } : { x: categoryAxis, y: valueAxis },
      plugins: { title: titleOptions(spec, palette), legend: { display: false }, tooltip: valueTooltip },
    },
    plugins: [valueLabelsPlugin(palette.fg, horizontal)],
  };
  return config as ChartConfiguration;
};

/** Descrizione testuale del grafico per i lettori di schermo. */
export const describeChart = (spec: ChartSpec): string => {
  const kind = { bar: 'Grafico a barre', line: 'Grafico a linee', pie: spec.pieStyle === 'doughnut' ? 'Grafico a ciambella' : 'Grafico a torta' }[spec.kind];
  const title = spec.title.trim() ? ` "${spec.title.trim()}"` : '';
  const total = sumOf(spec.rows.map((row) => row.value));
  const items = spec.rows
    .map((row) => `${row.label} ${spec.kind === 'pie' ? pieSliceText(row.value, total, spec.pieFormat) : formatNumber(row.value)}`)
    .join(', ');
  return `${kind}${title}: ${items}.`;
};
