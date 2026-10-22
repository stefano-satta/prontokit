import { cn } from '../../../lib/cn';
import { cleanText, lengthStatus } from '../../../lib/meta-tags/lengthLimits';
import type { LengthRange, LengthStatus } from '../../../models/metaTags';

interface CharacterCounterProps {
  value: string;
  range: LengthRange;
}

const NOTES: Partial<Record<LengthStatus, string>> = {
  short: 'troppo corto',
  long: 'troppo lungo',
};

/** Caratteri usati e intervallo consigliato: verde solo dentro l'intervallo, ambra fuori, con lo stato sempre scritto. */
export function CharacterCounter({ value, range }: CharacterCounterProps) {
  const length = cleanText(value).length;
  const status = lengthStatus(value, range);
  const note = NOTES[status];

  return (
    <span
      data-testid="character-counter"
      data-status={status}
      className={cn(
        'tabular inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium',
        status === 'empty' && 'bg-surface-muted text-fg-muted',
        status === 'ok' && 'bg-success-soft text-success',
        (status === 'short' || status === 'long') && 'bg-warning-soft text-warning',
      )}
    >
      {length} / {range.min}–{range.max}
      {note && <span>· {note}</span>}
    </span>
  );
}
