import type { JsonComparison, LineDiff, SideState } from '../../models/jsonDiff';
import { analyzeJson } from './analyzeJson';
import { diffLines } from './lineDiff';

const NO_DIFF: LineDiff = { leftChanged: new Set(), rightChanged: new Set(), hunks: [] };

export const readSide = (text: string): SideState => {
  const empty = text.trim() === '';
  return { text, empty, analysis: empty ? null : analyzeJson(text) };
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Uguaglianza dei dati: l'ordine delle chiavi non conta, quello degli elementi di un array sì. */
export const sameJsonData = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((item, index) => sameJsonData(item, b[index]));
  if (isPlainObject(a)) {
    if (!isPlainObject(b)) return false;
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every((key) => Object.hasOwn(b, key) && sameJsonData(a[key], b[key]));
  }
  return Object.is(a, b);
};

/** JSON.parse rifiuta il BOM iniziale, che l'analisi invece accetta. */
const parseJson = (text: string): unknown => JSON.parse(text.replace(/^\uFEFF/, ''));

/** Confronta due testi JSON: validità di ciascun lato, righe diverse ed esito complessivo. */
export const compareJson = (leftText: string, rightText: string): JsonComparison => {
  const left = readSide(leftText);
  const right = readSide(rightText);

  if (left.empty || right.empty) {
    return { left, right, verdict: left.empty && right.empty ? 'empty' : 'waiting', diff: NO_DIFF };
  }

  const diff = diffLines(leftText, rightText);
  if (!left.analysis?.ok || !right.analysis?.ok) return { left, right, verdict: 'invalid', diff };
  if (diff.hunks.length === 0) return { left, right, verdict: 'identical', diff };
  const equivalent = sameJsonData(parseJson(leftText), parseJson(rightText));
  return { left, right, verdict: equivalent ? 'equivalent' : 'different', diff };
};
