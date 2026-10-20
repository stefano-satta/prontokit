import type { MarkdownStats, PdfDocumentText } from '../../models/pdf';
import { buildHeadingScale, detectBodySize } from './headings';
import { groupLines, type TextLine } from './lines';
import { removePageFurniture } from './pageFurniture';
import { escapeBlockStart, joinLines } from './text';

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list-item'; marker: string; text: string; x: number }
  | { kind: 'page'; pageNumber: number };

/** Simboli di elenco: i trattini e l'asterisco valgono solo se seguiti da uno spazio (es. non "-5%"). */
const BULLET = /^(?:[•◦▪▫‣⁃●○■□·]\s*|[*–—-]\s+)(?=\S)/u;
const NUMBERED = /^(\d{1,3}|[a-z])[.)]\s+(?=\S)/i;
/** Oltre questa distanza verticale (in corpi) inizia un nuovo paragrafo. */
const PARAGRAPH_GAP = 1.6;

const parseListItem = (text: string): { marker: string; text: string } | null => {
  const bullet = text.match(BULLET);
  if (bullet) return { marker: '-', text: text.slice(bullet[0].length) };
  const numbered = text.match(NUMBERED);
  if (numbered) return { marker: /\d/.test(numbered[1]!) ? `${numbered[1]}.` : '-', text: text.slice(numbered[0].length) };
  return null;
};

function toBlocks(pages: TextLine[][], headingLevel: (line: TextLine) => number | null, bodySize: number): Block[] {
  const blocks: Block[] = [];
  let previous: TextLine | null = null;

  for (const lines of pages) {
    const pageNumber = lines[0]?.pageNumber;
    if (pageNumber !== undefined) blocks.push({ kind: 'page', pageNumber });
    previous = null;

    for (const line of lines) {
      const last = blocks.at(-1);
      const gap = previous ? previous.y - line.y : 0;
      const isNewBlock = !previous || gap > Math.max(line.fontSize, bodySize) * PARAGRAPH_GAP;
      const level = headingLevel(line);
      const listItem = parseListItem(line.text);

      if (level !== null) {
        if (last?.kind === 'heading' && last.level === level && !isNewBlock) last.text = joinLines(last.text, line.text);
        else blocks.push({ kind: 'heading', level, text: line.text });
      } else if (listItem) {
        blocks.push({ kind: 'list-item', ...listItem, x: line.x });
      } else if (last?.kind === 'list-item' && !isNewBlock && line.x > last.x) {
        last.text = joinLines(last.text, line.text);
      } else if (last?.kind === 'paragraph' && !isNewBlock) {
        last.text = joinLines(last.text, line.text);
      } else {
        blocks.push({ kind: 'paragraph', text: line.text });
      }
      previous = line;
    }
  }
  return blocks;
}

const renderBlock = (block: Block): string => {
  switch (block.kind) {
    case 'heading':
      return `${'#'.repeat(block.level)} ${block.text}`;
    case 'list-item':
      return `${block.marker} ${block.text}`;
    case 'page':
      return `<!-- page ${block.pageNumber} -->`;
    case 'paragraph':
      return escapeBlockStart(block.text);
  }
};

/** Le voci di elenco consecutive restano attaccate, tutti gli altri blocchi sono separati da una riga vuota. */
const renderBlocks = (blocks: Block[]): string =>
  blocks
    .map((block, index) => {
      const sticky = block.kind === 'list-item' && blocks[index - 1]?.kind === 'list-item';
      return (index === 0 || sticky ? '' : '\n') + renderBlock(block);
    })
    .join('\n');

const yamlString = (value: string) => JSON.stringify(value);

const frontMatter = (doc: PdfDocumentText, sourceName: string) =>
  ['---', doc.title ? `title: ${yamlString(doc.title)}` : null, `source: ${yamlString(sourceName)}`, `pages: ${doc.pageCount}`, '---']
    .filter(Boolean)
    .join('\n');

/**
 * Converte il testo estratto da un PDF in Markdown pensato per gli LLM:
 * front matter con i metadati, titoli dedotti dal corpo del carattere, paragrafi ricomposti,
 * elenchi normalizzati, intestazioni e piè di pagina ripetuti rimossi e marcatori di pagina per le citazioni.
 */
export function buildMarkdown(doc: PdfDocumentText, sourceName: string): { markdown: string; stats: MarkdownStats } {
  const pages = removePageFurniture(doc.pages.map(groupLines));
  const allLines = pages.flat();
  const bodySize = detectBodySize(allLines);
  const blocks = toBlocks(pages, buildHeadingScale(allLines, bodySize), bodySize);

  const body = renderBlocks(blocks).replace(/\n{3,}/g, '\n\n').trim();
  const markdown = `${frontMatter(doc, sourceName)}\n\n${body}\n`;
  const words = allLines.reduce((count, line) => count + line.text.split(/\s+/).filter(Boolean).length, 0);

  return { markdown, stats: { pages: doc.pageCount, words, approxTokens: Math.ceil(markdown.length / 4) } };
}

/** Vero se il PDF non contiene testo selezionabile (tipicamente una scansione). */
export const hasExtractableText = (doc: PdfDocumentText): boolean =>
  doc.pages.some((page) => page.fragments.some((fragment) => /\p{L}|\p{N}/u.test(fragment.text)));
