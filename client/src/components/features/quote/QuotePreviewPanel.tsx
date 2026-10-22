import { Download, Maximize2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import type { QuotePreview } from '../../../hooks/useQuotePdf';
import { cn } from '../../../lib/cn';
import type { QuoteIssue } from '../../../models/quote';
import { Button } from '../../common/Button';
import { Dialog } from '../../common/Dialog';
import { Panel } from '../../common/Panel';
import { Spinner } from '../../common/Spinner';

interface QuotePreviewPanelProps {
  preview: QuotePreview;
  issues: readonly QuoteIssue[];
  onDownload: () => void;
  downloading: boolean;
  downloadError: string | null;
  className?: string;
}

/** Anteprima fedele del PDF (le pagine sono disegnate dal file stesso) e download, abilitato quando non manca nulla. */
export function QuotePreviewPanel({ preview, issues, onDownload, downloading, downloadError, className }: QuotePreviewPanelProps) {
  const pageCount = preview.pages.length;
  const blocked = issues.length > 0;
  const [zoomPage, setZoomPage] = useState<number | null>(null);
  const pageCountLabel = `${pageCount} ${pageCount === 1 ? 'pagina' : 'pagine'}`;

  // Porta in vista la pagina cliccata appena la modale la monta
  const scrollToZoomed = (index: number) => (image: HTMLImageElement | null) => {
    if (image && index === zoomPage && index > 0) image.scrollIntoView({ block: 'start' });
  };

  return (
    <Panel aria-labelledby="quote-preview-title" className={cn('flex flex-col gap-5 p-5 sm:p-6', className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="quote-preview-title" className="text-[17px] font-semibold tracking-[-0.01em]">
          Anteprima
        </h2>
        <span className="flex items-center gap-2 text-[13px] text-fg-muted" role="status" data-testid="preview-status" data-status={preview.status}>
          {preview.status === 'rendering' ? (
            <>
              <Spinner label="Aggiornamento dell'anteprima" /> Aggiornamento…
            </>
          ) : pageCount > 0 ? (
            pageCountLabel
          ) : null}
        </span>
      </div>

      <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto rounded-xl bg-surface-muted p-3" data-testid="preview-pages">
        {preview.status === 'error' && (
          <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
            Non riesco a mostrare l'anteprima. Puoi comunque scaricare il PDF; se il problema resta, prova a togliere il logo.
          </p>
        )}
        {preview.pages.map((url, index) => (
          <button
            key={url}
            type="button"
            onClick={() => setZoomPage(index)}
            aria-label={`Ingrandisci la pagina ${index + 1} di ${pageCount}`}
            className="group relative block w-full rounded-sm"
          >
            <img
              src={url}
              alt={`Pagina ${index + 1} di ${pageCount} del preventivo`}
              className={cn(
                'aspect-[210/297] w-full rounded-sm bg-white shadow-[0_1px_3px_rgb(15_23_42/0.18)] transition-[opacity,box-shadow]',
                'group-hover:shadow-[0_4px_16px_-4px_rgb(15_23_42/0.35)]',
                preview.status === 'rendering' && 'opacity-70',
              )}
            />
            <span
              aria-hidden
              className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-strong px-2.5 py-1 text-xs font-medium text-fg shadow-island backdrop-blur-md transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100"
            >
              <Maximize2 className="size-3.5" /> Ingrandisci
            </span>
          </button>
        ))}
        {!pageCount && preview.status === 'rendering' && <div className="aspect-[210/297] w-full animate-pulse rounded-sm bg-surface" aria-hidden />}
      </div>

      <Dialog open={zoomPage !== null && pageCount > 0} onClose={() => setZoomPage(null)} title="Anteprima del preventivo" meta={pageCountLabel}>
        <div className="flex flex-col items-center gap-4 overflow-y-auto bg-surface-muted p-3 sm:p-6" data-testid="preview-dialog-pages">
          {preview.pages.map((url, index) => (
            <img
              key={url}
              ref={scrollToZoomed(index)}
              src={url}
              alt={`Pagina ${index + 1} di ${pageCount} del preventivo`}
              className="aspect-[210/297] w-full max-w-[794px] scroll-mt-3 rounded-sm bg-white shadow-[0_2px_8px_rgb(15_23_42/0.18)] sm:scroll-mt-6"
            />
          ))}
        </div>
      </Dialog>

      <div className="flex flex-col gap-3">
        <Button size="lg" onClick={onDownload} disabled={blocked || downloading} icon={downloading ? <Spinner label="Creazione del PDF" /> : <Download className="size-[18px]" aria-hidden />}>
          Scarica PDF
        </Button>
        {downloadError && (
          <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
            {downloadError}
          </p>
        )}
        {blocked && (
          <div className="flex flex-col gap-1.5 rounded-lg bg-warning-soft px-4 py-3 text-sm" data-testid="quote-issues" aria-live="polite">
            <p className="flex items-center gap-2 font-semibold text-fg">
              <TriangleAlert className="size-4 shrink-0 text-warning" aria-hidden /> Per scaricare il PDF:
            </p>
            <ul className="flex list-disc flex-col gap-0.5 pl-6 text-fg-muted">
              {issues.slice(0, 6).map((issue) => (
                <li key={`${issue.field}-${issue.message}`}>{issue.message}</li>
              ))}
              {issues.length > 6 && <li>e altre {issues.length - 6} correzioni.</li>}
            </ul>
          </div>
        )}
      </div>
    </Panel>
  );
}
