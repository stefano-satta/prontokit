import type { PdfPageText, PdfTextFragment } from '../../models/pdf';
import { normalizeText } from './text';

export interface TextLine {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  pageNumber: number;
  /** Posizione verticale relativa: 1 = bordo superiore, 0 = bordo inferiore */
  relativeY: number;
}

/** Due frammenti stanno sulla stessa riga se la loro y differisce meno di questa frazione del corpo. */
const SAME_LINE_TOLERANCE = 0.4;
/** Distanza orizzontale (in frazioni del corpo) oltre la quale inseriamo uno spazio. */
const WORD_GAP = 0.15;

const joinFragments = (fragments: PdfTextFragment[]): string => {
  let text = '';
  let previousEnd: number | null = null;
  for (const fragment of fragments) {
    const gap = previousEnd === null ? 0 : fragment.x - previousEnd;
    const needsSpace = previousEnd !== null && gap > fragment.fontSize * WORD_GAP && !/\s$/.test(text) && !/^\s/.test(fragment.text);
    text += (needsSpace ? ' ' : '') + fragment.text;
    previousEnd = fragment.x + fragment.width;
  }
  return normalizeText(text).trim();
};

/** Raggruppa i frammenti di una pagina in righe, dall'alto verso il basso e da sinistra a destra. */
export function groupLines(page: PdfPageText): TextLine[] {
  const fragments = page.fragments
    .filter((fragment) => fragment.text.trim() !== '' || fragment.text === ' ')
    .toSorted((a, b) => b.y - a.y || a.x - b.x);

  const rows: PdfTextFragment[][] = [];
  for (const fragment of fragments) {
    const row = rows.at(-1);
    const reference = row?.[0];
    if (row && reference && Math.abs(reference.y - fragment.y) <= Math.max(1, reference.fontSize * SAME_LINE_TOLERANCE)) {
      row.push(fragment);
    } else {
      rows.push([fragment]);
    }
  }

  return rows
    .map((row) => {
      const sorted = row.toSorted((a, b) => a.x - b.x);
      const y = Math.max(...sorted.map((f) => f.y));
      return {
        text: joinFragments(sorted),
        x: sorted[0]!.x,
        y,
        relativeY: page.height > 0 ? y / page.height : 0.5,
        fontSize: Math.max(...sorted.map((f) => f.fontSize)),
        pageNumber: page.pageNumber,
      };
    })
    .filter((line) => line.text !== '');
}
