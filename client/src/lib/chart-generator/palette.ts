import type { ChartPalette } from '../../models/chart';

/*
 * Serie categoriali in ordine fisso (riferimento dataviz), validate contro le superfici dell'app:
 * separazione per daltonismo ΔE ≥ 8 tra colori vicini in entrambi i temi. In chiaro tre colori
 * stanno sotto 3:1 sulla superficie: per questo la tabella dei dati è sempre presente.
 */
export const LIGHT_CHART_PALETTE: ChartPalette = {
  surface: '#ffffff',
  fg: '#0f172a',
  muted: '#4b5870',
  grid: '#dde3ec',
  axis: '#c3ccd9',
  series: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
};

export const DARK_CHART_PALETTE: ChartPalette = {
  surface: '#111a2b',
  fg: '#e6ebf4',
  muted: '#9aa8bf',
  grid: '#223049',
  axis: '#33456a',
  series: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

/** Colore della voce in posizione `index`: barre e spicchi hanno colori misti, sempre nello stesso ordine. */
export const seriesColor = (palette: ChartPalette, index: number): string =>
  palette.series[index % palette.series.length];

const channel = (value: number) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export const relativeLuminance = (hex: string): number => {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
};

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

export const DARK_INK = '#0b0b0b';
export const LIGHT_INK = '#ffffff';

/** Inchiostro (bianco o quasi nero) più leggibile sopra un colore di riempimento. */
export const readableInkOn = (hex: string): string => {
  const l = relativeLuminance(hex);
  return contrast(l, 1) >= contrast(l, relativeLuminance(DARK_INK)) ? LIGHT_INK : DARK_INK;
};
