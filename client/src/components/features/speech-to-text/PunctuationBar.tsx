import { PUNCTUATION_MARKS, type PunctuationMark } from '../../../lib/speech-to-text/punctuation';

interface PunctuationBarProps {
  onInsert: (mark: PunctuationMark) => void;
  disabled?: boolean;
}

export function PunctuationBar({ onInsert, disabled }: PunctuationBarProps) {
  return (
    <div role="toolbar" aria-label="Punteggiatura" className="flex flex-wrap gap-2" data-testid="punctuation-bar">
      {PUNCTUATION_MARKS.map((mark) => (
        <span key={mark.label} className="group relative">
          <button
            type="button"
            aria-label={mark.label}
            disabled={disabled}
            // Il focus resta nella textarea, così il segno va dove c'è il cursore
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onInsert(mark)}
            className="grid size-10 place-items-center rounded-lg border border-border-strong bg-surface font-mono text-base font-semibold text-fg transition-colors not-disabled:hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden>{mark.key}</span>
          </button>
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md bg-fg px-2 py-1 text-xs font-medium whitespace-nowrap text-bg opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"
          >
            {mark.label}
          </span>
        </span>
      ))}
    </div>
  );
}
