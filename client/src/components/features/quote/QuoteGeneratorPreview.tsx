/** Foglio di preventivo stilizzato con righe e totale, per il box della home. */
export function QuoteGeneratorPreview() {
  return (
    <div className="flex w-full max-w-48 flex-col gap-2.5 rounded-lg border border-border bg-surface p-3.5 shadow-[0_1px_2px_rgb(15_23_42/0.05)]" aria-hidden>
      <span className="flex items-start justify-between">
        <span className="flex flex-col gap-1">
          <span className="h-1.5 w-12 rounded-full bg-fg/70" />
          <span className="h-1 w-9 rounded-full bg-border-strong" />
        </span>
        <span className="text-[9px] font-bold tracking-wide text-primary-text">PREVENTIVO</span>
      </span>
      <span className="h-2.5 rounded-sm bg-primary" />
      {[16, 12, 14].map((width, index) => (
        <span key={index} className="flex items-center justify-between">
          <span className="h-1 rounded-full bg-border-strong" style={{ width: `${width * 4}px` }} />
          <span className="h-1 w-6 rounded-full bg-border-strong" />
        </span>
      ))}
      <span className="mt-1 flex items-center justify-between self-end rounded-sm bg-primary-soft px-2 py-1">
        <span className="tabular text-[9px] font-semibold text-primary-text">3.435,85 €</span>
      </span>
    </div>
  );
}
