import { ArrowRight, Image } from 'lucide-react';

const SOURCES = ['JPG', 'AVIF', 'BMP'];

/** Illustrazione "immagini → nuovo formato" per il box della home. */
export function ImageConverterPreview() {
  return (
    <div className="flex w-full items-center justify-center gap-4" aria-hidden>
      <span className="flex flex-col gap-1.5">
        {SOURCES.map((label) => (
          <span
            key={label}
            className="flex h-7 w-20 items-center gap-1.5 rounded-md border border-border bg-surface px-2 shadow-[0_1px_2px_rgb(15_23_42/0.05)]"
          >
            <Image className="size-3.5 text-fg-muted" />
            <span className="text-[11px] font-semibold text-fg-muted">{label}</span>
          </span>
        ))}
      </span>
      <ArrowRight className="size-5 shrink-0 text-fg-muted" />
      <span className="flex h-24 w-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-fg">
        <Image className="size-6" />
        <span className="text-[11px] font-semibold">WebP</span>
      </span>
    </div>
  );
}
