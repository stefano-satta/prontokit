import type { TextLine } from './lines';

/** Quante righe all'inizio e alla fine di ogni pagina consideriamo candidate a intestazione/piè di pagina. */
const EDGE_LINES = 2;
/** Fascia (in frazione dell'altezza) in alto e in basso dove vivono intestazioni e piè di pagina. */
const EDGE_BAND = 0.12;
const MIN_PAGES = 3;
const MIN_SHARE = 0.6;
const PAGE_NUMBER = /^(?:(?:pag(?:ina)?|page|p)\.?\s*)?\d{1,4}(?:\s*(?:\/|di|of|-)\s*\d{1,4})?$/i;

/** Chiave che ignora i numeri, così "Report 2026 · 3" e "Report 2026 · 4" coincidono. */
const furnitureKey = (text: string) => text.toLowerCase().replace(/\d+/g, '#').trim();

const inEdgeBand = (line: TextLine) => line.relativeY >= 1 - EDGE_BAND || line.relativeY <= EDGE_BAND;

/** Le prime e ultime righe della pagina, purché stiano davvero nei margini. */
const edgeLines = (lines: TextLine[]) =>
  [...new Set([...lines.slice(0, EDGE_LINES), ...lines.slice(-EDGE_LINES)])].filter(inEdgeBand);

/**
 * Rimuove intestazioni, piè di pagina e numeri di pagina ripetuti:
 * per un LLM sono rumore che spezza i paragrafi e spreca token.
 */
export function removePageFurniture(pages: TextLine[][]): TextLine[][] {
  const pageCountByKey = new Map<string, number>();
  for (const lines of pages) {
    const keys = new Set(edgeLines(lines).map((line) => furnitureKey(line.text)));
    keys.forEach((key) => pageCountByKey.set(key, (pageCountByKey.get(key) ?? 0) + 1));
  }

  const threshold = Math.max(MIN_PAGES, Math.ceil(pages.length * MIN_SHARE));
  const repeated = new Set([...pageCountByKey].filter(([, count]) => count >= threshold).map(([key]) => key));

  return pages.map((lines) => {
    const edges = new Set(edgeLines(lines));
    return lines.filter(
      (line) => !edges.has(line) || !(repeated.has(furnitureKey(line.text)) || PAGE_NUMBER.test(line.text)),
    );
  });
}
