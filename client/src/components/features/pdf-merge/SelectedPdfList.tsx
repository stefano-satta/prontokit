import { ArrowDown, ArrowUp, FileText, X } from 'lucide-react';
import { formatBytes } from '../../../lib/formatBytes';
import type { SelectedPdf } from '../../../models/pdfMerge';
import { Button } from '../../common/Button';

interface SelectedPdfListProps {
  pdfs: readonly SelectedPdf[];
  onMove: (id: string, offset: -1 | 1) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

const pages = (n: number) => `${n} ${n === 1 ? 'pagina' : 'pagine'}`;

/** PDF da unire, nell'ordine in cui finiranno nel file unito; le frecce cambiano l'ordine. */
export function SelectedPdfList({ pdfs, onMove, onRemove, disabled = false }: SelectedPdfListProps) {
  return (
    <ol className="flex flex-col divide-y divide-border rounded-xl border border-border" data-testid="selected-pdfs">
      {pdfs.map((pdf, index) => (
        <li key={pdf.id} className="flex items-center gap-3 px-3 py-2.5" data-testid="selected-pdf">
          <span className="tabular w-5 shrink-0 text-center text-sm font-semibold text-fg-muted">{index + 1}</span>
          <span className="hidden size-10 shrink-0 place-items-center rounded-lg border border-border bg-surface-muted sm:grid">
            <FileText className="size-5 text-danger" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg" title={pdf.file.name}>
              {pdf.file.name}
            </p>
            <p className="tabular text-[13px] text-fg-muted">
              {pages(pdf.pageCount)} · {formatBytes(pdf.file.size)}
            </p>
          </div>
          <div className="flex shrink-0 items-center">
            <Button
              variant="ghost"
              className="size-9 px-0"
              onClick={() => onMove(pdf.id, -1)}
              disabled={disabled || index === 0}
              aria-label={`Sposta su ${pdf.file.name}`}
              icon={<ArrowUp className="size-4" aria-hidden />}
            />
            <Button
              variant="ghost"
              className="size-9 px-0"
              onClick={() => onMove(pdf.id, 1)}
              disabled={disabled || index === pdfs.length - 1}
              aria-label={`Sposta giù ${pdf.file.name}`}
              icon={<ArrowDown className="size-4" aria-hidden />}
            />
            <Button
              variant="ghost"
              className="size-9 px-0"
              onClick={() => onRemove(pdf.id)}
              disabled={disabled}
              aria-label={`Rimuovi ${pdf.file.name}`}
              icon={<X className="size-4" aria-hidden />}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
