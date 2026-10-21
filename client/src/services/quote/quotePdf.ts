import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage, type RGB } from 'pdf-lib';
import { SITE } from '../../config/site';
import { accentColorOf } from '../../lib/quote/accentColors';
import { formatDate } from '../../lib/quote/dates';
import { formatMoney, formatPercent, formatQuantity, formatUnitPrice } from '../../lib/quote/format';
import { formatIban } from '../../lib/quote/iban';
import { toPdfText } from '../../lib/quote/pdfText';
import { validUntilOf } from '../../lib/quote/validateQuote';
import type { Quote, QuoteLogo, QuoteParty, QuoteTotals } from '../../models/quote';

/** A4 in punti tipografici. */
const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = { x: 48, top: 48, bottom: 56 };
const CONTENT_WIDTH = PAGE.width - MARGIN.x * 2;
const FOOTER_Y = 32;

const SIZE = { body: 9, small: 7.5, label: 7, party: 11, title: 20 };
const LEADING = 1.35;
const CELL_PADDING = { x: 6, y: 5.5 };

const hexToRgb = (hex: string): RGB => {
  const value = Number.parseInt(hex.slice(1), 16);
  return rgb(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255);
};

/** Il PDF è sempre su fondo bianco, indipendente dal tema dell'app. */
const INK = hexToRgb('#0f172a');
const MUTED = hexToRgb('#4b5870');
const RULE = hexToRgb('#dde3ec');
const TINT = hexToRgb('#f3f5f9');
const WHITE = rgb(1, 1, 1);

interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
}

interface Column {
  key: 'description' | 'quantity' | 'unit' | 'unitPrice' | 'discount' | 'total';
  label: string;
  width: number;
  align: 'left' | 'right';
}

interface Writer {
  doc: PDFDocument;
  fonts: Fonts;
  accent: RGB;
  page: PDFPage;
  /** Coordinata y della prossima riga, dall'alto verso il basso */
  y: number;
}

/** Spezza il testo in righe che stanno in `maxWidth`, rispettando gli a capo; le parole troppo lunghe si spezzano. */
export function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const fits = (value: string) => font.widthOfTextAtSize(value, size) <= maxWidth;
  const lines: string[] = [];
  for (const paragraph of toPdfText(text).split('\n')) {
    let current = '';
    for (const word of paragraph.split(/ +/)) {
      const candidate = current ? `${current} ${word}` : word;
      if (fits(candidate)) {
        current = candidate;
        continue;
      }
      if (current) lines.push(current);
      current = '';
      let rest = word;
      while (rest && !fits(rest)) {
        let cut = rest.length - 1;
        while (cut > 1 && !fits(rest.slice(0, cut))) cut--;
        lines.push(rest.slice(0, cut));
        rest = rest.slice(cut);
      }
      current = rest;
    }
    lines.push(current);
  }
  return lines;
}

const lineHeight = (size: number) => size * LEADING;

function newPage(writer: Writer): void {
  writer.page = writer.doc.addPage([PAGE.width, PAGE.height]);
  writer.y = PAGE.height - MARGIN.top;
}

/** Va a pagina nuova se lo spazio rimasto non basta per `height`. */
function ensureSpace(writer: Writer, height: number): boolean {
  if (writer.y - height >= MARGIN.bottom) return false;
  newPage(writer);
  return true;
}

function drawText(
  writer: Writer,
  text: string,
  x: number,
  y: number,
  { font = writer.fonts.regular, size = SIZE.body, color = INK, align = 'left', width = 0 }: { font?: PDFFont; size?: number; color?: RGB; align?: 'left' | 'right'; width?: number } = {},
): void {
  const value = toPdfText(text);
  const left = align === 'right' ? x + width - font.widthOfTextAtSize(value, size) : x;
  // y è il bordo alto della riga: pdf-lib disegna dalla linea di base
  writer.page.drawText(value, { x: left, y: y - size, size, font, color });
}

const joinPresent = (values: readonly string[], separator = ' · ') => values.map((value) => value.trim()).filter(Boolean).join(separator);

/** Righe di anagrafica sotto il nome: indirizzo, dati fiscali e contatti. */
function partyLines(party: QuoteParty): string[] {
  return [
    party.address,
    party.city,
    party.country,
    joinPresent([party.vatNumber && `P.IVA ${party.vatNumber.trim()}`, party.taxCode && `C.F. ${party.taxCode.trim()}`]),
    joinPresent([party.email, party.phone]),
    party.website,
  ].filter((line) => line.trim());
}

/** Blocco di anagrafica in colonna; restituisce l'altezza occupata. */
function drawParty(writer: Writer, party: QuoteParty, x: number, top: number, width: number, label?: string): number {
  let y = top;
  if (label) {
    drawText(writer, label.toUpperCase(), x, y, { font: writer.fonts.bold, size: SIZE.label, color: writer.accent });
    y -= lineHeight(SIZE.label) + 3;
  }
  for (const line of wrapText(party.name, writer.fonts.bold, SIZE.party, width)) {
    drawText(writer, line, x, y, { font: writer.fonts.bold, size: SIZE.party });
    y -= lineHeight(SIZE.party);
  }
  y -= 2;
  for (const text of partyLines(party)) {
    for (const line of wrapText(text, writer.fonts.regular, SIZE.body, width)) {
      drawText(writer, line, x, y, { color: MUTED });
      y -= lineHeight(SIZE.body);
    }
  }
  return top - y;
}

const LOGO_BOX = { width: 160, height: 56 };

function drawHeader(writer: Writer, quote: Quote, logo: PDFImage | null): void {
  const top = writer.y;
  const rightWidth = 190;
  const leftWidth = CONTENT_WIDTH - rightWidth - 24;
  let leftY = top;

  if (logo) {
    const scale = Math.min(LOGO_BOX.width / logo.width, LOGO_BOX.height / logo.height, 1);
    const height = logo.height * scale;
    writer.page.drawImage(logo, { x: MARGIN.x, y: top - height, width: logo.width * scale, height });
    leftY -= height + 14;
  }
  leftY -= drawParty(writer, quote.supplier, MARGIN.x, leftY, leftWidth);

  const rightX = PAGE.width - MARGIN.x - rightWidth;
  let rightY = top;
  drawText(writer, 'PREVENTIVO', rightX, rightY, { font: writer.fonts.bold, size: SIZE.title, color: writer.accent, align: 'right', width: rightWidth });
  rightY -= lineHeight(SIZE.title) + 6;

  const validUntil = validUntilOf(quote);
  const meta: [string, string][] = [
    ['Numero', quote.number],
    ['Data', quote.issueDate ? formatDate(quote.issueDate) : ''],
    ['Valido fino al', validUntil ? formatDate(validUntil) : ''],
  ];
  for (const [label, value] of meta) {
    if (!value.trim()) continue;
    drawText(writer, label, rightX, rightY, { color: MUTED });
    drawText(writer, value, rightX, rightY, { font: writer.fonts.bold, align: 'right', width: rightWidth });
    rightY -= lineHeight(SIZE.body) + 3;
  }
  writer.y = Math.min(leftY, rightY) - 22;
}

function drawClient(writer: Writer, quote: Quote): void {
  const padding = 12;
  const width = CONTENT_WIDTH / 2;
  // L'altezza del riquadro si misura prima di disegnarlo, con lo stesso a capo del testo
  const lines = partyLines(quote.client).flatMap((text) => wrapText(text, writer.fonts.regular, SIZE.body, width - padding * 2));
  const nameLines = wrapText(quote.client.name, writer.fonts.bold, SIZE.party, width - padding * 2);
  const height = padding * 2 + lineHeight(SIZE.label) + 3 + nameLines.length * lineHeight(SIZE.party) + 2 + lines.length * lineHeight(SIZE.body);
  writer.page.drawRectangle({ x: MARGIN.x, y: writer.y - height, width, height, color: TINT });
  writer.page.drawRectangle({ x: MARGIN.x, y: writer.y - height, width: 2.5, height, color: writer.accent });
  drawParty(writer, quote.client, MARGIN.x + padding, writer.y - padding, width - padding * 2, 'Spett.le cliente');
  writer.y -= height + 18;

  if (quote.subject.trim()) {
    const labelWidth = writer.fonts.bold.widthOfTextAtSize('Oggetto: ', SIZE.body + 1);
    const subjectLines = wrapText(quote.subject, writer.fonts.regular, SIZE.body + 1, CONTENT_WIDTH - labelWidth);
    drawText(writer, 'Oggetto:', MARGIN.x, writer.y, { font: writer.fonts.bold, size: SIZE.body + 1 });
    for (const line of subjectLines) {
      drawText(writer, line, MARGIN.x + labelWidth, writer.y, { size: SIZE.body + 1 });
      writer.y -= lineHeight(SIZE.body + 1);
    }
    writer.y -= 12;
  }
}

function tableColumns(hasDiscount: boolean): Column[] {
  const fixed: Column[] = [
    { key: 'quantity', label: 'Q.tà', width: 46, align: 'right' },
    { key: 'unit', label: 'U.M.', width: 40, align: 'left' },
    { key: 'unitPrice', label: 'Prezzo unit.', width: 78, align: 'right' },
    ...(hasDiscount ? [{ key: 'discount', label: 'Sconto', width: 46, align: 'right' } as Column] : []),
    { key: 'total', label: 'Importo', width: 82, align: 'right' },
  ];
  const used = fixed.reduce((sum, column) => sum + column.width, 0);
  return [{ key: 'description', label: 'Descrizione', width: CONTENT_WIDTH - used, align: 'left' }, ...fixed];
}

const TABLE_HEADER_HEIGHT = 20;

function drawTableHeader(writer: Writer, columns: Column[]): void {
  writer.page.drawRectangle({ x: MARGIN.x, y: writer.y - TABLE_HEADER_HEIGHT, width: CONTENT_WIDTH, height: TABLE_HEADER_HEIGHT, color: writer.accent });
  let x = MARGIN.x;
  for (const column of columns) {
    drawText(writer, column.label, x + CELL_PADDING.x, writer.y - (TABLE_HEADER_HEIGHT - SIZE.small) / 2 + 0.5, {
      font: writer.fonts.bold,
      size: SIZE.small,
      color: WHITE,
      align: column.align,
      width: column.width - CELL_PADDING.x * 2,
    });
    x += column.width;
  }
  writer.y -= TABLE_HEADER_HEIGHT;
}

function drawLines(writer: Writer, quote: Quote, totals: QuoteTotals): void {
  const filled = quote.lines.flatMap((line, index) => {
    const total = totals.lines[index]!;
    return total.filled ? [{ line, total }] : [];
  });
  const columns = tableColumns(filled.some(({ total }) => total.discountPercent > 0));
  const descriptionWidth = columns[0]!.width - CELL_PADDING.x * 2;
  const rowLine = lineHeight(SIZE.body);

  ensureSpace(writer, TABLE_HEADER_HEIGHT + rowLine + CELL_PADDING.y * 2);
  drawTableHeader(writer, columns);

  for (const { line, total } of filled) {
    const cells: Record<Column['key'], string> = {
      description: '',
      quantity: total.quantity === null ? '' : formatQuantity(total.quantity),
      unit: line.unit,
      unitPrice: total.unitPrice === null ? '' : formatUnitPrice(total.unitPrice, quote.currency),
      discount: total.discountPercent > 0 ? formatPercent(total.discountPercent) : '',
      total: formatMoney(total.totalCents, quote.currency),
    };
    let pending = wrapText(line.description, writer.fonts.regular, SIZE.body, descriptionWidth);
    let first = true;
    // Una descrizione più lunga della pagina continua sulla successiva, con l'intestazione ripetuta
    while (pending.length) {
      const room = Math.floor((writer.y - MARGIN.bottom - CELL_PADDING.y * 2) / rowLine);
      if (room < Math.min(pending.length, 2)) {
        newPage(writer);
        drawTableHeader(writer, columns);
        continue;
      }
      const chunk = pending.slice(0, room);
      pending = pending.slice(room);
      const height = chunk.length * rowLine + CELL_PADDING.y * 2;
      const top = writer.y - CELL_PADDING.y;
      chunk.forEach((text, index) => drawText(writer, text, MARGIN.x + CELL_PADDING.x, top - index * rowLine));
      if (first) {
        let x = MARGIN.x;
        for (const column of columns) {
          if (column.key !== 'description') {
            drawText(writer, cells[column.key], x + CELL_PADDING.x, top, {
              font: column.key === 'total' ? writer.fonts.bold : writer.fonts.regular,
              align: column.align,
              width: column.width - CELL_PADDING.x * 2,
            });
          }
          x += column.width;
        }
        first = false;
      }
      writer.y -= height;
      writer.page.drawLine({ start: { x: MARGIN.x, y: writer.y }, end: { x: MARGIN.x + CONTENT_WIDTH, y: writer.y }, thickness: 0.6, color: RULE });
    }
  }
  writer.y -= 14;
}

function drawTotals(writer: Writer, quote: Quote, totals: QuoteTotals): void {
  const width = 240;
  const x = PAGE.width - MARGIN.x - width;
  const rows: [string, string][] = [];
  if (totals.discountCents > 0) {
    const percent = quote.discountType === 'percent' ? ` (${quote.discountValue.trim().replace('.', ',')}%)` : '';
    rows.push(['Totale voci', formatMoney(totals.subtotalCents, quote.currency)]);
    rows.push([`Sconto${percent}`, `- ${formatMoney(totals.discountCents, quote.currency)}`]);
  }
  rows.push(['Imponibile (IVA esclusa)', formatMoney(totals.taxableCents, quote.currency)]);
  rows.push([`IVA ${quote.vatRate}%`, formatMoney(totals.vatCents, quote.currency)]);

  const rowHeight = lineHeight(SIZE.body) + 6;
  const totalHeight = 30;
  const noteLines = quote.vatRate === 0 && quote.vatNote.trim() ? wrapText(quote.vatNote, writer.fonts.regular, SIZE.small, width) : [];
  ensureSpace(writer, rows.length * rowHeight + totalHeight + noteLines.length * lineHeight(SIZE.small) + 8);

  for (const [label, value] of rows) {
    drawText(writer, label, x, writer.y - 3, { color: MUTED });
    drawText(writer, value, x, writer.y - 3, { align: 'right', width });
    writer.y -= rowHeight;
    writer.page.drawLine({ start: { x, y: writer.y }, end: { x: x + width, y: writer.y }, thickness: 0.6, color: RULE });
  }
  writer.y -= 6;
  writer.page.drawRectangle({ x, y: writer.y - totalHeight, width, height: totalHeight, color: writer.accent });
  const textTop = writer.y - (totalHeight - 12) / 2;
  drawText(writer, 'Totale da pagare', x + 10, textTop + 0.5, { font: writer.fonts.bold, size: 10, color: WHITE });
  drawText(writer, formatMoney(totals.totalCents, quote.currency), x, textTop + 1, { font: writer.fonts.bold, size: 12, color: WHITE, align: 'right', width: width - 10 });
  writer.y -= totalHeight + 6;
  for (const line of noteLines) {
    drawText(writer, line, x, writer.y, { size: SIZE.small, color: MUTED });
    writer.y -= lineHeight(SIZE.small);
  }
  writer.y -= 18;
}

/** Sezioni di testo libero: il titolo resta sempre con le prime righe, il resto può andare a pagina nuova. */
function drawSection(writer: Writer, title: string, text: string): void {
  const lines = wrapText(text, writer.fonts.regular, SIZE.body, CONTENT_WIDTH);
  const rowLine = lineHeight(SIZE.body);
  ensureSpace(writer, lineHeight(SIZE.label) + 4 + Math.min(lines.length, 2) * rowLine);
  drawText(writer, title.toUpperCase(), MARGIN.x, writer.y, { font: writer.fonts.bold, size: SIZE.label, color: writer.accent });
  writer.y -= lineHeight(SIZE.label) + 4;
  for (const line of lines) {
    ensureSpace(writer, rowLine);
    drawText(writer, line, MARGIN.x, writer.y);
    writer.y -= rowLine;
  }
  writer.y -= 12;
}

function drawConditions(writer: Writer, quote: Quote): void {
  const iban = quote.iban.trim() ? joinPresent([`IBAN ${formatIban(quote.iban)}`, quote.supplier.name && `Intestato a ${quote.supplier.name.trim()}`]) : '';
  const sections: [string, string][] = [
    ['Condizioni di pagamento', quote.paymentTerms],
    ['Tempi di consegna', quote.deliveryTerms],
    ['Coordinate bancarie', iban],
    ['Note', quote.notes],
  ];
  for (const [title, text] of sections) if (text.trim()) drawSection(writer, title, text);
}

function drawSignature(writer: Writer): void {
  const height = 80;
  ensureSpace(writer, height);
  writer.y -= 6;
  drawText(writer, 'PER ACCETTAZIONE', MARGIN.x, writer.y, { font: writer.fonts.bold, size: SIZE.label, color: writer.accent });
  writer.y -= 46;
  const columns: [string, number, number][] = [
    ['Data', MARGIN.x, 150],
    ['Timbro e firma del cliente', MARGIN.x + CONTENT_WIDTH - 250, 250],
  ];
  for (const [label, x, width] of columns) {
    writer.page.drawLine({ start: { x, y: writer.y }, end: { x: x + width, y: writer.y }, thickness: 0.8, color: MUTED });
    drawText(writer, label, x, writer.y - 4, { size: SIZE.small, color: MUTED });
  }
  writer.y -= 30;
}

/** Piè di pagina su ogni pagina, a documento finito (serve il numero totale di pagine). */
function drawFooters(doc: PDFDocument, fonts: Fonts, quote: Quote): void {
  const pages = doc.getPages();
  const left = toPdfText(joinPresent([quote.number.trim() && `Preventivo n. ${quote.number.trim()}`, quote.supplier.name]));
  pages.forEach((page, index) => {
    page.drawLine({ start: { x: MARGIN.x, y: FOOTER_Y + 12 }, end: { x: PAGE.width - MARGIN.x, y: FOOTER_Y + 12 }, thickness: 0.6, color: RULE });
    const maxLeft = CONTENT_WIDTH - 80;
    let footer = left;
    while (footer && fonts.regular.widthOfTextAtSize(footer, SIZE.small) > maxLeft) footer = `${footer.slice(0, -2)}…`;
    page.drawText(footer, { x: MARGIN.x, y: FOOTER_Y, size: SIZE.small, font: fonts.regular, color: MUTED });
    const counter = `Pagina ${index + 1} di ${pages.length}`;
    const width = fonts.regular.widthOfTextAtSize(counter, SIZE.small);
    page.drawText(counter, { x: PAGE.width - MARGIN.x - width, y: FOOTER_Y, size: SIZE.small, font: fonts.regular, color: MUTED });
  });
}

const embedLogo = (doc: PDFDocument, logo: QuoteLogo | null): Promise<PDFImage | null> =>
  !logo ? Promise.resolve(null) : logo.format === 'png' ? doc.embedPng(logo.bytes) : doc.embedJpg(logo.bytes);

/**
 * Crea il PDF del preventivo in memoria, nel browser: intestazione con logo e dati del fornitore,
 * cliente, tabella delle voci (con intestazione ripetuta a ogni pagina), totali, condizioni e firma.
 */
export async function createQuotePdf(quote: Quote, totals: QuoteTotals, logo: QuoteLogo | null): Promise<Uint8Array<ArrayBuffer>> {
  const doc = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const title = toPdfText(joinPresent(['Preventivo', quote.number, quote.client.name], ' '));
  doc.setTitle(title);
  if (quote.supplier.name.trim()) doc.setAuthor(toPdfText(quote.supplier.name.trim()));
  doc.setCreator(SITE.name);
  doc.setProducer(SITE.name);
  doc.setLanguage('it-IT');

  const writer: Writer = { doc, fonts, accent: hexToRgb(accentColorOf(quote.accentColor).hex), page: doc.addPage([PAGE.width, PAGE.height]), y: PAGE.height - MARGIN.top };
  drawHeader(writer, quote, await embedLogo(doc, logo));
  drawClient(writer, quote);
  drawLines(writer, quote, totals);
  drawTotals(writer, quote, totals);
  drawConditions(writer, quote);
  if (quote.signature) drawSignature(writer);
  drawFooters(doc, fonts, quote);

  return (await doc.save()) as Uint8Array<ArrayBuffer>;
}
