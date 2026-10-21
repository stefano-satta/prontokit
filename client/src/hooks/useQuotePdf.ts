import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadBlob } from '../lib/downloadFile';
import { quoteFileName } from '../lib/quote/quoteFileName';
import type { Quote, QuoteLogo, QuoteTotals } from '../models/quote';
import { createQuotePdf } from '../services/quote/quotePdf';
import { renderPdfPages } from '../services/quote/renderPdfPages';

/** Attesa dopo l'ultima modifica prima di ridisegnare l'anteprima: si evita di rifarla a ogni tasto. */
const PREVIEW_DELAY_MS = 350;
/** Larghezza delle immagini di anteprima: nitide anche su schermi ad alta densità. */
const PREVIEW_WIDTH = 1100;

export interface QuotePreview {
  status: 'rendering' | 'ready' | 'error';
  pages: string[];
}

/** Anteprima del PDF (immagini delle pagine, disegnate con PDF.js) e download del file. */
export function useQuotePdf(quote: Quote, totals: QuoteTotals, logo: QuoteLogo | null) {
  const [preview, setPreview] = useState<QuotePreview>({ status: 'rendering', pages: [] });
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // URL blob delle pagine a schermo: si liberano solo quando arrivano le nuove, così l'anteprima non sfarfalla
  const shownUrls = useRef<string[]>([]);
  useEffect(() => () => shownUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  useEffect(() => {
    const controller = new AbortController();
    setPreview((current) => ({ ...current, status: 'rendering' }));
    const timer = setTimeout(async () => {
      try {
        const bytes = await createQuotePdf(quote, totals, logo);
        const images = await renderPdfPages(bytes, PREVIEW_WIDTH, controller.signal);
        if (controller.signal.aborted) return;
        const urls = images.map((image) => URL.createObjectURL(image));
        shownUrls.current.forEach((url) => URL.revokeObjectURL(url));
        shownUrls.current = urls;
        setPreview({ status: 'ready', pages: urls });
      } catch {
        if (!controller.signal.aborted) setPreview((current) => ({ ...current, status: 'error' }));
      }
    }, PREVIEW_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [quote, totals, logo]);

  const download = useCallback(async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const bytes = await createQuotePdf(quote, totals, logo);
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), quoteFileName(quote.number));
    } catch {
      setDownloadError('Non sono riuscito a creare il PDF. Riprova; se succede ancora, togli il logo e riprova.');
    } finally {
      setDownloading(false);
    }
  }, [quote, totals, logo]);

  return { preview, download, downloading, downloadError };
}
