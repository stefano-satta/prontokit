import type { ConversionProgress } from '../../../models/pdf';

export function ConversionProgressBar({ progress }: { progress: ConversionProgress | null }) {
  const percent = progress ? Math.round((progress.page / progress.total) * 100) : null;

  return (
    <div className="flex flex-col gap-2">
      <div
        role="progressbar"
        aria-label="Avanzamento conversione"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent ?? undefined}
        className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className={
            percent === null
              ? 'h-full w-1/3 animate-[indeterminate_1.2s_ease-in-out_infinite] rounded-full bg-primary'
              : 'h-full rounded-full bg-primary transition-[width] duration-300 ease-out-expo'
          }
          style={percent === null ? undefined : { width: `${percent}%` }}
        />
      </div>
      <p className="tabular text-[13px] text-fg-muted" aria-live="polite">
        {progress ? `Lettura pagina ${progress.page} di ${progress.total}` : 'Apertura del documento…'}
      </p>
    </div>
  );
}
