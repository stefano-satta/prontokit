import type { TextLine } from './lines';

const SIZE_STEP = 0.5;
/** Una riga è un titolo se il suo corpo supera quello del testo di almeno il 15%. */
const HEADING_RATIO = 1.15;
const MAX_HEADING_LENGTH = 120;
const MAX_LEVELS = 3;

const roundSize = (size: number) => Math.round(size / SIZE_STEP) * SIZE_STEP;

/** Corpo del testo: la dimensione con più caratteri nel documento. */
export function detectBodySize(lines: TextLine[]): number {
  const charsBySize = new Map<number, number>();
  for (const line of lines) {
    const size = roundSize(line.fontSize);
    charsBySize.set(size, (charsBySize.get(size) ?? 0) + line.text.length);
  }
  let best = 0;
  let bestChars = -1;
  for (const [size, chars] of charsBySize) {
    if (chars > bestChars) [best, bestChars] = [size, chars];
  }
  return best;
}

/** Associa ogni dimensione "da titolo" a un livello Markdown: la più grande diventa #. */
export function buildHeadingScale(lines: TextLine[], bodySize: number): (line: TextLine) => number | null {
  const isCandidate = (line: TextLine) =>
    line.fontSize >= bodySize * HEADING_RATIO && line.text.length <= MAX_HEADING_LENGTH && /\p{L}/u.test(line.text);

  const sizes = [...new Set(lines.filter(isCandidate).map((line) => roundSize(line.fontSize)))].sort((a, b) => b - a);
  const levelBySize = new Map(sizes.map((size, index) => [size, Math.min(index + 1, MAX_LEVELS)]));

  return (line) => (isCandidate(line) ? (levelBySize.get(roundSize(line.fontSize)) ?? null) : null);
}
