import type { DiffHunk, LineDiff } from '../../models/jsonDiff';

/** Oltre questo numero di modifiche il confronto smette di cercare l'allineamento migliore (testi quasi del tutto diversi). */
export const MAX_EDIT_DISTANCE = 2000;

type Edit = 'equal' | 'delete' | 'insert';

export const splitLines = (text: string): string[] => text.split(/\r\n|\r|\n/);

/** Righe da confrontare: gli spazi a fine riga e l'a capo finale non contano come differenze. */
const comparableLines = (text: string): string[] => {
  const lines = splitLines(text).map((line) => line.trimEnd());
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines;
};

/**
 * Algoritmo di Myers sulle righe: restituisce la sequenza di modifiche più breve,
 * o null se supera `maxDistance`. Di ogni passo conserva solo la parte utile del vettore V,
 * così la memoria cresce con il numero di modifiche e non con la lunghezza del testo.
 */
const myers = (a: readonly string[], b: readonly string[], maxDistance: number): Edit[] | null => {
  const n = a.length;
  const m = b.length;
  const max = n + m;
  const offset = max + 1;
  const v = new Int32Array(2 * max + 3);
  const trace: Int32Array[] = [];
  let distance = -1;

  search: for (let d = 0; d <= Math.min(max, maxDistance); d++) {
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1]) ? v[offset + k + 1] : v[offset + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v[offset + k] = x;
      if (x >= n && y >= m) {
        trace.push(v.slice(offset - d, offset + d + 1));
        distance = d;
        break search;
      }
    }
    trace.push(v.slice(offset - d, offset + d + 1));
  }
  if (distance < 0) return null;

  const edits: Edit[] = [];
  let x = n;
  let y = m;
  for (let d = distance; d > 0; d--) {
    const previous = trace[d - 1];
    const at = (k: number) => previous[k + d - 1];
    const k = x - y;
    const fromAbove = k === -d || (k !== d && at(k - 1) < at(k + 1));
    const previousK = fromAbove ? k + 1 : k - 1;
    const previousX = at(previousK);
    const previousY = previousX - previousK;
    while (x > previousX && y > previousY) {
      edits.push('equal');
      x--;
      y--;
    }
    edits.push(fromAbove ? 'insert' : 'delete');
    x = previousX;
    y = previousY;
  }
  for (; x > 0; x--) edits.push('equal');
  return edits.reverse();
};

/** Confronto riga per riga: quali righe cambiano da ciascun lato e i blocchi di differenze. */
export const diffLines = (leftText: string, rightText: string, maxDistance = MAX_EDIT_DISTANCE): LineDiff => {
  const left = comparableLines(leftText);
  const right = comparableLines(rightText);

  // Le parti uguali all'inizio e alla fine non servono all'algoritmo
  let prefix = 0;
  while (prefix < left.length && prefix < right.length && left[prefix] === right[prefix]) prefix++;
  let suffix = 0;
  while (
    suffix < left.length - prefix &&
    suffix < right.length - prefix &&
    left[left.length - 1 - suffix] === right[right.length - 1 - suffix]
  ) {
    suffix++;
  }

  const leftMiddle = left.slice(prefix, left.length - suffix);
  const rightMiddle = right.slice(prefix, right.length - suffix);
  const edits =
    myers(leftMiddle, rightMiddle, maxDistance) ??
    // Testi troppo diversi: tutta la parte centrale è un unico blocco cambiato
    [...leftMiddle.map((): Edit => 'delete'), ...rightMiddle.map((): Edit => 'insert')];

  const leftChanged = new Set<number>();
  const rightChanged = new Set<number>();
  const hunks: DiffHunk[] = [];
  let leftIndex = prefix;
  let rightIndex = prefix;
  let open: DiffHunk | null = null;

  for (const edit of edits) {
    if (edit === 'equal') {
      open = null;
      leftIndex++;
      rightIndex++;
      continue;
    }
    if (!open) {
      open = { leftStart: leftIndex, leftEnd: leftIndex, rightStart: rightIndex, rightEnd: rightIndex };
      hunks.push(open);
    }
    if (edit === 'delete') {
      leftChanged.add(leftIndex++);
      open.leftEnd = leftIndex;
    } else {
      rightChanged.add(rightIndex++);
      open.rightEnd = rightIndex;
    }
  }

  return { leftChanged, rightChanged, hunks };
};
