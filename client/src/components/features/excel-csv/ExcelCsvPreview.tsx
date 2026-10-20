import { ArrowRight, FileSpreadsheet } from 'lucide-react';

/** Illustrazione "Excel → CSV" per il box della home. */
export function ExcelCsvPreview() {
  return (
    <div className="flex w-full items-center justify-center gap-4" aria-hidden>
      <span className="flex h-24 w-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-surface shadow-[0_1px_2px_rgb(15_23_42/0.05)]">
        <FileSpreadsheet className="size-6 text-success" />
        <span className="text-[11px] font-semibold text-fg-muted">XLSX</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-fg-muted" />
      <span className="flex h-24 w-32 flex-col gap-1.5 rounded-lg bg-primary p-3 font-mono text-[11px] leading-tight text-primary-fg">
        <span className="font-semibold">codice;prezzo</span>
        <span className="opacity-80">00123;1.234,50</span>
        <span className="opacity-80">00456;-2,25</span>
        <span className="opacity-80">00789;;</span>
      </span>
    </div>
  );
}
