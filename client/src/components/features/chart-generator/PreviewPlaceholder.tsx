/** Riquadro vuoto al posto dell'anteprima quando i dati non bastano. */
export function PreviewPlaceholder({ message }: { message: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-border-strong bg-surface-muted p-6 text-center text-sm text-fg-muted text-pretty">
      {message}
    </div>
  );
}
