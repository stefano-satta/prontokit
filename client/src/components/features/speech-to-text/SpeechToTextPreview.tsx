import { ArrowRight, Mic } from 'lucide-react';

/** Illustrazione "voce → testo" per il box della home. */
export function SpeechToTextPreview() {
  return (
    <div className="flex w-full items-center justify-center gap-4" aria-hidden>
      <span className="grid size-[4.5rem] shrink-0 place-items-center rounded-full bg-primary text-primary-fg shadow-[0_1px_2px_rgb(15_23_42/0.12)]">
        <Mic className="size-7" />
      </span>
      <ArrowRight className="size-5 shrink-0 text-fg-muted" />
      <span className="flex h-24 w-32 flex-col gap-1.5 rounded-lg border border-border bg-surface p-3 text-[11px] leading-tight text-fg shadow-[0_1px_2px_rgb(15_23_42/0.05)]">
        <span>Ciao, come stai?</span>
        <span className="text-fg-muted">Ci vediamo alle</span>
        <span className="text-fg-muted">
          dieci<span className="ml-px inline-block h-3 w-px translate-y-0.5 bg-primary" />
        </span>
      </span>
    </div>
  );
}
