import { ArrowRight, FileText } from 'lucide-react';

/** Illustrazione "PDF → Markdown" per il box della home. */
export function PdfMarkdownPreview() {
  return (
    <div className="flex w-full items-center justify-center gap-4" aria-hidden>
      <span className="flex h-24 w-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-surface shadow-[0_1px_2px_rgb(15_23_42/0.05)]">
        <FileText className="size-6 text-danger" />
        <span className="text-[11px] font-semibold text-fg-muted">PDF</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-fg-muted" />
      <span className="flex h-24 w-32 flex-col gap-1.5 rounded-lg bg-primary p-3 font-mono text-[11px] leading-tight text-primary-fg">
        <span className="font-semibold"># Titolo</span>
        <span className="opacity-80">Testo del…</span>
        <span className="opacity-80">- punto uno</span>
        <span className="opacity-80">- punto due</span>
      </span>
    </div>
  );
}
