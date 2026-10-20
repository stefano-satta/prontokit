import { useEffect, useId, type RefObject } from 'react';

interface TranscriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Durante la dettatura il testo cresce da solo: si modifica a registrazione ferma */
  listening: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

const numberFormatter = new Intl.NumberFormat('it-IT');

const countWords = (text: string) => text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;

export function TranscriptEditor({ value, onChange, listening, textareaRef }: TranscriptEditorProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const words = countWords(value);

  // Mentre si parla, segui il testo che arriva in fondo
  useEffect(() => {
    const textarea = textareaRef.current;
    if (listening && textarea) textarea.scrollTop = textarea.scrollHeight;
  }, [value, listening, textareaRef]);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fg">
        Testo trascritto
      </label>
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={listening}
        aria-describedby={hintId}
        spellCheck
        placeholder="Premi «Inizia a parlare»: il testo apparirà qui mentre parli. Poi potrai correggerlo come vuoi."
        className="min-h-80 w-full resize-y rounded-lg border border-border-strong bg-surface px-4 py-3.5 text-base leading-relaxed text-fg transition-colors outline-none placeholder:text-fg-muted hover:border-fg-muted/60 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 read-only:bg-surface-muted/50 sm:min-h-96"
        data-testid="transcript"
      />
      <div id={hintId} className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-[13px] text-fg-muted">
        <span>{listening ? 'Ferma la registrazione per modificare il testo.' : 'Puoi modificare il testo liberamente.'}</span>
        <span className="tabular" aria-live="off">
          {numberFormatter.format(words)} {words === 1 ? 'parola' : 'parole'}
        </span>
      </div>
    </div>
  );
}
