import { useCallback, useEffect, useRef, useState } from 'react';
import { freeSlots, mergedPdfFilename, MIN_PDFS, moveItem, rejectionNotices } from '../lib/pdf-merge/selectPdfs';
import { validatePdf } from '../lib/validatePdf';
import type { PdfMergePhase, PdfRejectReason, SelectedPdf } from '../models/pdfMerge';
import { inspectPdf, mergePdfs } from '../services/pdf-merge/pdfMerger';

let nextId = 0;

async function checkPdf(file: File) {
  if (file.size === 0) return { ok: false, reason: 'empty' } as const;
  try {
    const validation = await validatePdf(file);
    if (!validation.ok) return { ok: false, reason: validation.code === 'too-large' ? 'too-large' : 'invalid' } as const;
    return await inspectPdf(file);
  } catch {
    // Un file che il browser non riesce a leggere non deve lasciare la pagina in "Controllo dei PDF…"
    return { ok: false, reason: 'unreadable' } as const;
  }
}

/**
 * Selezione (fino a 5 PDF), ordinamento e unione nel browser.
 * I PDF protetti vengono scartati già quando si aggiungono, con un avviso che lo spiega.
 */
export const usePdfMerge = () => {
  const [pdfs, setPdfs] = useState<SelectedPdf[]>([]);
  const [phase, setPhase] = useState<PdfMergePhase>({ status: 'selecting' });
  const [notices, setNotices] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);

  const pdfsRef = useRef<SelectedPdf[]>([]);
  /** Cresce a ogni unione e con "Svuota": i risultati di un lavoro superato vengono scartati */
  const runRef = useRef(0);
  /**
   * Smontaggio separato dal contatore: in sviluppo StrictMode smonta e rimonta gli effetti dopo il primo disegno,
   * e un contatore aumentato lì scartava i file trascinati in quell'istante, lasciando la pagina bloccata.
   */
  const mountedRef = useRef(false);
  const isCurrent = (run: number) => mountedRef.current && run === runRef.current;

  const updatePdfs = (next: SelectedPdf[]) => {
    pdfsRef.current = next;
    setPdfs(next);
    // Cambiata la selezione, l'errore dell'unione precedente non vale più
    setPhase((current) => (current.status === 'error' ? { status: 'selecting' } : current));
  };

  const addFiles = useCallback(async (files: File[]) => {
    const run = runRef.current;
    setChecking(true);
    // Uno alla volta: analizzare insieme cinque PDF grandi può esaurire la memoria su mobile
    const checks = [];
    for (const file of files) checks.push({ file, check: await checkPdf(file) });
    if (!isCurrent(run)) return;
    setChecking(false);

    const rejected: { name: string; reason: PdfRejectReason }[] = [];
    const accepted: SelectedPdf[] = [];
    const overLimit: string[] = [];
    const slots = freeSlots(pdfsRef.current.length);
    for (const { file, check } of checks) {
      if (!check.ok) rejected.push({ name: file.name, reason: check.reason });
      else if (accepted.length >= slots) overLimit.push(file.name);
      else accepted.push({ id: `pdf-${nextId++}`, file, pageCount: check.pageCount, document: check.document });
    }
    setNotices(rejectionNotices(rejected, overLimit));
    if (accepted.length) updatePdfs([...pdfsRef.current, ...accepted]);
  }, []);

  const removePdf = useCallback((id: string) => {
    updatePdfs(pdfsRef.current.filter((pdf) => pdf.id !== id));
    setNotices([]);
  }, []);

  const movePdf = useCallback((id: string, offset: -1 | 1) => {
    const index = pdfsRef.current.findIndex((pdf) => pdf.id === id);
    updatePdfs(moveItem(pdfsRef.current, index, offset));
  }, []);

  const merge = useCallback(async () => {
    const selected = pdfsRef.current;
    if (selected.length < MIN_PDFS) return;
    const run = ++runRef.current;
    setNotices([]);
    setPhase({ status: 'merging' });
    try {
      const blob = await mergePdfs(selected.map((pdf) => pdf.document));
      if (!isCurrent(run)) return;
      setPhase({
        status: 'done',
        result: {
          blob,
          filename: mergedPdfFilename(),
          fileCount: selected.length,
          pageCount: selected.reduce((sum, pdf) => sum + pdf.pageCount, 0),
        },
      });
    } catch {
      if (!isCurrent(run)) return;
      setPhase({
        status: 'error',
        message: 'L’unione non è riuscita: uno dei PDF potrebbe essere danneggiato o troppo grande per questo browser. Rimuovilo e riprova.',
      });
    }
  }, []);

  const reset = useCallback(() => {
    runRef.current++;
    updatePdfs([]);
    setNotices([]);
    setChecking(false);
    setPhase({ status: 'selecting' });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { pdfs, phase, notices, checking, addFiles, removePdf, movePdf, merge, reset };
};
