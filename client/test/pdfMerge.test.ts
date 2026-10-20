import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { createPagedPdf, createProtectedPdf } from '../../e2e/fixtures/pdf';
import { hasEncryptEntry } from '../src/lib/pdf-merge/encryption';
import { freeSlots, mergedPdfFilename, moveItem, rejectionNotices } from '../src/lib/pdf-merge/selectPdfs';
import { inspectPdf, mergePdfs } from '../src/services/pdf-merge/pdfMerger';

/** Blob da un Buffer di Node: copia i byte in un `Uint8Array` con `ArrayBuffer` proprio. */
const toBlob = (buffer: Buffer) => new Blob([new Uint8Array(buffer)]);

describe('selezione dei PDF', () => {
  it('calcola i posti liberi fino a 5', () => {
    expect(freeSlots(0)).toBe(5);
    expect(freeSlots(4)).toBe(1);
    expect(freeSlots(7)).toBe(0);
  });

  it('sposta un elemento su e giù senza uscire dai limiti', () => {
    expect(moveItem(['a', 'b', 'c'], 1, -1)).toEqual(['b', 'a', 'c']);
    expect(moveItem(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'c', 'b']);
    expect(moveItem(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
    expect(moveItem(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'b', 'c']);
    expect(moveItem(['a', 'b'], -1, 1)).toEqual(['a', 'b']);
  });

  it('raggruppa gli avvisi per motivo', () => {
    expect(
      rejectionNotices(
        [
          { name: 'a.pdf', reason: 'protected' },
          { name: 'b.pdf', reason: 'protected' },
          { name: 'foto.jpg', reason: 'invalid' },
        ],
        ['f.pdf'],
      ),
    ).toEqual([
      '“a.pdf” e “b.pdf” sono protetti da password o da restrizioni e non si possono unire: salva una copia senza protezione e riprova.',
      '“foto.jpg” non è un PDF: carica solo file PDF.',
      'Puoi unire al massimo 5 PDF alla volta: “f.pdf” non è stato aggiunto.',
    ]);
    expect(rejectionNotices([{ name: 'x.pdf', reason: 'protected' }], [])[0]).toMatch(/^“x\.pdf” è protetto .* non si può unire/);
  });

  it('dà un nome fisso al PDF unito', () => {
    expect(mergedPdfFilename()).toBe('pdf_unito_prontokit.pdf');
  });
});

describe('hasEncryptEntry', () => {
  it('trova /Encrypt come riferimento o dizionario', () => {
    expect(hasEncryptEntry('trailer << /Size 9 /Encrypt 8 0 R >>')).toBe(true);
    expect(hasEncryptEntry('<< /Type /XRef /Encrypt << /Filter /Standard >> >>')).toBe(true);
    expect(hasEncryptEntry('trailer << /Size 9 /Root 1 0 R >>')).toBe(false);
  });
});

describe('inspectPdf e mergePdfs', () => {
  it('rifiuta un PDF protetto', async () => {
    expect(await inspectPdf(toBlob(await createProtectedPdf()))).toEqual({ ok: false, reason: 'protected' });
  });

  it('segnala un PDF illeggibile', async () => {
    expect(await inspectPdf(new Blob(['%PDF-1.7\nnon è un pdf']))).toEqual({ ok: false, reason: 'unreadable' });
  });

  it('unisce le pagine nell’ordine dato', async () => {
    const first = await inspectPdf(toBlob(await createPagedPdf('A', 2)));
    const second = await inspectPdf(toBlob(await createPagedPdf('B', 3)));
    if (!first.ok || !second.ok) throw new Error('PDF di prova non validi');
    expect(first.pageCount).toBe(2);

    const merged = await mergePdfs([second.document, first.document]);
    expect(merged.type).toBe('application/pdf');
    const reloaded = await PDFDocument.load(new Uint8Array(await merged.arrayBuffer()));
    expect(reloaded.getPageCount()).toBe(5);
  });
});
