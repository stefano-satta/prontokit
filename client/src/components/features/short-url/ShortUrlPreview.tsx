import { ArrowDown } from 'lucide-react';

/** Illustrazione "link lungo → link corto" per il box della home. */
export function ShortUrlPreview() {
  return (
    <div className="flex w-full flex-col items-stretch gap-2 font-mono text-[12px]" aria-hidden>
      <span className="truncate rounded-md border border-border bg-surface px-2.5 py-1.5 text-fg-muted">
        https://negozio.example.it/catalogo/estate/sandali?utm_source=newsletter&amp;id=48213
      </span>
      <ArrowDown className="mx-auto size-4 text-fg-muted" />
      <span className="rounded-md bg-primary px-2.5 py-1.5 text-center font-semibold text-primary-fg">
        pronto.kit/estate
      </span>
    </div>
  );
}
