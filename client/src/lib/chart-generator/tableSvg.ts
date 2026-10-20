import type { TableModel } from '../../models/chart';
import { LIGHT_CHART_PALETTE, seriesColor } from './palette';
import { escapeXml } from './xml';

/** Misura la larghezza di un testo in px; iniettata per poter testare il layout senza canvas. */
export type MeasureText = (text: string, weight: 'normal' | 'bold') => number;

/** Font di sistema: un SVG usato come immagine non vede i web font della pagina. */
export const TABLE_FONT_FAMILY = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
export const TABLE_FONT_SIZE = 14;
const TITLE_SIZE = 18;
const PAD = 24;
const CELL_X = 16;
const ROW_H = 40;
const TITLE_GAP = 16;
const MIN_COL = 80;
const METER_W = 140;
const METER_H = 8;
const METER_GAP = 12;

const COLORS = {
  surface: '#ffffff',
  fg: '#0f172a',
  muted: '#4b5870',
  headerBg: '#eef2f7',
  line: '#dde3ec',
  strong: '#c3ccd9',
};

export interface TableSvg {
  svg: string;
  width: number;
  height: number;
}

/** Tabella come SVG vettoriale autonomo, sempre in tema chiaro per stampa e documenti. */
export const buildTableSvg = (model: TableModel, title: string, measure: MeasureText): TableSvg => {
  const all = [...model.rows, ...(model.footer ? [model.footer] : [])];
  const { meter } = model;
  const widths = model.columns.map((column, c) => {
    const cellText = Math.max(
      ...all.map((row, r) => measure(row[c] ?? '', model.footer && r === all.length - 1 ? 'bold' : 'normal')),
    );
    const content = meter?.column === c ? METER_W + METER_GAP + cellText : cellText;
    return Math.ceil(Math.max(MIN_COL, measure(column.label, 'bold'), content) + CELL_X * 2);
  });
  const tableWidth = widths.reduce((sum, w) => sum + w, 0);
  const titleText = title.trim();
  const width = Math.max(tableWidth, titleText ? Math.ceil(measure(titleText, 'bold') * (TITLE_SIZE / TABLE_FONT_SIZE)) : 0) + PAD * 2;
  const top = PAD + (titleText ? TITLE_SIZE + TITLE_GAP : 0);
  const height = top + ROW_H * (all.length + 1) + PAD;

  const parts: string[] = [];
  parts.push(`<rect width="${width}" height="${height}" fill="${COLORS.surface}"/>`);
  if (titleText) {
    parts.push(
      `<text x="${PAD}" y="${PAD + TITLE_SIZE * 0.8}" font-size="${TITLE_SIZE}" font-weight="600" fill="${COLORS.fg}">${escapeXml(titleText)}</text>`,
    );
  }

  const textAt = (value: string, c: number, x: number, y: number, weight: string, fill: string) => {
    const right = model.columns[c].align === 'right';
    const tx = right ? x + widths[c] - CELL_X : x + CELL_X;
    return `<text x="${tx}" y="${y + ROW_H / 2}" dominant-baseline="central"${right ? ' text-anchor="end"' : ''} font-weight="${weight}" fill="${fill}">${escapeXml(value)}</text>`;
  };

  const rowCells = (cells: readonly string[], y: number, weight: string, fill: string) => {
    let x = PAD;
    return cells.map((value, c) => {
      const out = textAt(value, c, x, y, weight, fill);
      x += widths[c];
      return out;
    });
  };

  parts.push(`<rect x="${PAD}" y="${top}" width="${tableWidth}" height="${ROW_H}" fill="${COLORS.headerBg}"/>`);
  parts.push(...rowCells(model.columns.map((column) => column.label), top, '600', COLORS.muted));

  all.forEach((cells, r) => {
    const y = top + ROW_H * (r + 1);
    const isFooter = Boolean(model.footer) && r === all.length - 1;
    parts.push(
      `<line x1="${PAD}" y1="${y}" x2="${PAD + tableWidth}" y2="${y}" stroke="${isFooter ? COLORS.strong : COLORS.line}" stroke-width="1"/>`,
    );
    parts.push(...rowCells(cells, y, isFooter ? '600' : '400', COLORS.fg));
    if (meter && !isFooter) {
      const x = PAD + widths.slice(0, meter.column).reduce((sum, w) => sum + w, 0) + CELL_X;
      const barY = y + (ROW_H - METER_H) / 2;
      const fill = Math.round(METER_W * meter.fractions[r]);
      parts.push(`<rect x="${x}" y="${barY}" width="${METER_W}" height="${METER_H}" rx="${METER_H / 2}" fill="${COLORS.headerBg}"/>`);
      if (fill > 0) {
        const color = seriesColor(LIGHT_CHART_PALETTE, meter.colorIndexes[r]);
        parts.push(`<rect x="${x}" y="${barY}" width="${fill}" height="${METER_H}" rx="${METER_H / 2}" fill="${color}"/>`);
      }
    }
  });
  const bottom = top + ROW_H * (all.length + 1);
  parts.push(`<line x1="${PAD}" y1="${bottom}" x2="${PAD + tableWidth}" y2="${bottom}" stroke="${COLORS.line}" stroke-width="1"/>`);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="${TABLE_FONT_FAMILY}" font-size="${TABLE_FONT_SIZE}">` +
    (titleText ? `<title>${escapeXml(titleText)}</title>` : '') +
    parts.join('') +
    '</svg>';
  return { svg, width, height };
};
