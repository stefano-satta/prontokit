import type { ChartKind } from '../../models/chart';
import { sanitizeFilePart } from '../fileName';
import { escapeXml } from './xml';

const KIND_SUFFIX: Record<ChartKind, string> = { bar: 'barre', pie: 'torta', line: 'linee' };

/** Nome base sicuro per i file esportati, dal titolo del grafico. */
export const chartFileBase = (title: string, kind: ChartKind): string =>
  `${sanitizeFilePart(title, 'grafico')}-${KIND_SUFFIX[kind]}`;

export const tableFileBase = (title: string): string => `${sanitizeFilePart(title, 'grafico')}-tabella`;

/** SVG che incapsula l'immagine PNG del grafico (Chart.js disegna su canvas). */
export const svgFromPng = (pngDataUrl: string, width: number, height: number, title: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
  (title.trim() ? `<title>${escapeXml(title.trim())}</title>` : '') +
  `<image width="${width}" height="${height}" href="${pngDataUrl}" xlink:href="${pngDataUrl}"/></svg>`;
