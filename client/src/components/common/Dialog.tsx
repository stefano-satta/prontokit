import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Testo accanto al titolo (es. numero di pagine). */
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Finestra modale sul `<dialog>` nativo: `showModal` rende inerte il resto della pagina,
 * tiene il focus dentro e chiude con Esc; il focus torna da solo all'elemento che l'ha aperta.
 */
export function Dialog({ open, onClose, title, meta, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }
    dialog.showModal();
    // Il dialog non blocca lo scroll della pagina sotto; lo spazio della scrollbar resta riservato (`scrollbar-gutter`)
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // Click sul velo: il target è il dialog stesso solo fuori dal contenuto
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className={cn(
        'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface p-0 text-fg',
        'shadow-[0_24px_64px_-16px_rgb(15_23_42/0.45)] backdrop:bg-bg/70 backdrop:backdrop-blur-sm',
        'open:flex open:flex-col open:animate-[result-in_200ms_var(--ease-out-expo)]',
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <div className="flex min-w-0 items-baseline gap-3">
          <h2 id={titleId} className="truncate text-[17px] font-semibold tracking-[-0.01em]">
            {title}
          </h2>
          {meta && <span className="shrink-0 text-[13px] text-fg-muted">{meta}</span>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-fg-muted transition-colors not-disabled:hover:bg-surface-muted not-disabled:hover:text-fg"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
      {open && children}
    </dialog>
  );
}
