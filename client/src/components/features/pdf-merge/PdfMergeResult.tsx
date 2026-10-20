import { CircleCheck, Download, RotateCcw } from 'lucide-react';
import { downloadBlob } from '../../../lib/downloadFile';
import { formatBytes } from '../../../lib/formatBytes';
import type { MergedPdf } from '../../../models/pdfMerge';
import { Button } from '../../common/Button';
import { Panel } from '../../common/Panel';

interface PdfMergeResultProps {
  result: MergedPdf;
  onReset: () => void;
}

/** Esito dell'unione: riepilogo e download del PDF unito. */
export function PdfMergeResult({ result, onReset }: PdfMergeResultProps) {
  return (
    <Panel className="p-6 sm:p-8">
      <div className="flex flex-col gap-6" data-testid="merge-card" data-status="done">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-muted">
            <CircleCheck className="size-5 text-success" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-medium text-fg">PDF uniti</h2>
            <p className="tabular text-[13px] text-fg-muted" aria-live="polite" data-testid="result-summary">
              {result.fileCount} PDF in un unico file · {result.pageCount} {result.pageCount === 1 ? 'pagina' : 'pagine'} · {formatBytes(result.blob.size)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={() => downloadBlob(result.blob, result.filename)}
            icon={<Download className="size-[18px]" aria-hidden />}
          >
            Scarica PDF unito
          </Button>
          <Button size="lg" variant="secondary" onClick={onReset} icon={<RotateCcw className="size-[18px]" aria-hidden />}>
            Unisci altri PDF
          </Button>
        </div>
      </div>
    </Panel>
  );
}
