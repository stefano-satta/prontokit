import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { cn } from '../../../lib/cn';
import { EDITOR_LINE_HEIGHT, EDITOR_PADDING_Y } from '../../../lib/json-diff/editorScroll';
import { splitLines } from '../../../lib/json-diff/lineDiff';

export type ChangeTone = 'removed' | 'added';

interface JsonEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Righe (0-based) da evidenziare come differenze */
  changed: ReadonlySet<number>;
  tone: ChangeTone;
  /** Riga (1-based) dell'errore di sintassi, se c'è */
  errorLine?: number;
  /** Stato breve mostrato accanto all'etichetta */
  badge: ReactNode;
  /** Testo sotto il riquadro: righe e differenze, oppure l'errore */
  footer: ReactNode;
  footerId: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  testId: string;
}

/** Le righe diverse sono verdi da entrambi i lati: il rosso è riservato alla riga con l'errore di sintassi */
const TONES: Record<ChangeTone, { line: string; sign: string; mark: string }> = {
  removed: { line: 'bg-success-soft', sign: 'text-success', mark: '−' },
  added: { line: 'bg-success-soft', sign: 'text-success', mark: '+' },
};

/** Righe oltre la parte visibile da disegnare comunque, così lo scorrimento veloce non mostra buchi */
const OVERSCAN = 20;

/**
 * Textarea per il codice con numeri di riga ed evidenziazione delle righe diverse.
 * Numeri ed evidenziazioni sono livelli dietro la textarea trasparente, spostati con il suo scorrimento:
 * il testo resta un normale campo modificabile (incolla, annulla, tastiera e lettori di schermo).
 */
export function JsonEditor({
  id,
  label,
  value,
  onChange,
  placeholder,
  changed,
  tone,
  errorLine,
  badge,
  footer,
  footerId,
  textareaRef,
  testId,
}: JsonEditorProps) {
  const [viewport, setViewport] = useState({ top: 0, height: 0 });
  const lineCount = useMemo(() => splitLines(value).length, [value]);
  const gutterText = useMemo(() => Array.from({ length: lineCount }, (_, index) => index + 1).join('\n'), [lineCount]);
  const digits = Math.max(2, String(lineCount).length);

  const syncViewport = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) setViewport({ top: textarea.scrollTop, height: textarea.clientHeight });
  }, [textareaRef]);

  // La textarea si può ridimensionare (e il testo può cambiare da fuori): ricalcola la parte visibile
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    syncViewport();
    const observer = new ResizeObserver(syncViewport);
    observer.observe(textarea);
    return () => observer.disconnect();
  }, [textareaRef, syncViewport]);

  // Formatta, Scambia e le altre azioni cambiano testo e scorrimento senza un evento scroll
  useEffect(syncViewport, [value, syncViewport]);

  const firstVisible = Math.max(0, Math.floor((viewport.top - EDITOR_PADDING_Y) / EDITOR_LINE_HEIGHT) - OVERSCAN);
  const lastVisible = Math.ceil((viewport.top + viewport.height) / EDITOR_LINE_HEIGHT) + OVERSCAN;
  const errorIndex = errorLine === undefined ? undefined : errorLine - 1;
  // La riga con l'errore resta solo rossa, anche se è anche una riga diversa
  const visibleChanges = useMemo(
    () => [...changed].filter((line) => line >= firstVisible && line <= lastVisible && line !== errorIndex),
    [changed, firstVisible, lastVisible, errorIndex],
  );
  const toneStyle = TONES[tone];
  const offset = { transform: `translateY(${-viewport.top}px)` };
  const lineBox = (index: number) => ({ top: EDITOR_PADDING_Y + index * EDITOR_LINE_HEIGHT, height: EDITOR_LINE_HEIGHT });

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-h-7 items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-fg">
          {label}
        </label>
        {badge}
      </div>
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border bg-surface font-mono text-[13px] leading-6 transition-colors pointer-coarse:text-base',
          'focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/20',
          errorLine === undefined ? 'border-border-strong hover:border-fg-muted/60' : 'border-danger',
        )}
        style={{ '--gutter': `${digits + 3}ch` } as CSSProperties}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="relative" style={offset}>
            {visibleChanges.map((index) => (
              <div key={index} className={cn('absolute inset-x-0', toneStyle.line)} style={lineBox(index)}>
                <span className={cn('absolute left-1.5 font-semibold', toneStyle.sign)}>{toneStyle.mark}</span>
              </div>
            ))}
            {errorIndex !== undefined && (
              <div
                className="absolute inset-x-0 bg-danger/15 shadow-[inset_3px_0_0_var(--color-danger)]"
                style={lineBox(errorIndex)}
                data-testid={`${testId}-error-line`}
              >
                <span className="absolute left-1.5 font-bold text-danger">!</span>
              </div>
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-(--gutter) overflow-hidden border-r border-border" aria-hidden>
          <pre className="py-3 pr-2 text-right font-[inherit] text-fg-muted/80 tabular" style={offset}>
            {gutterText}
          </pre>
        </div>
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onScroll={syncViewport}
          placeholder={placeholder}
          wrap="off"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          translate="no"
          aria-describedby={footerId}
          aria-invalid={errorLine === undefined ? undefined : true}
          className="relative block h-72 w-full resize-y bg-transparent py-3 pr-3 pl-[calc(var(--gutter)+0.75rem)] whitespace-pre text-fg outline-none placeholder:font-sans md:h-[26rem] lg:h-[30rem]"
          data-testid={testId}
        />
      </div>
      <div id={footerId} className="min-h-5 text-[13px] text-fg-muted">
        {footer}
      </div>
    </div>
  );
}
