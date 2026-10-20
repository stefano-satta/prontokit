import { useId } from 'react';
import { cn } from '../../../lib/cn';
import { CHARACTER_SETS } from '../../../lib/password-generator/characterSets';
import type { CharacterSetId } from '../../../models/password';

interface CharacterSetOptionsProps {
  selected: readonly CharacterSetId[];
  onToggle: (id: CharacterSetId) => void;
}

export function CharacterSetOptions({ selected, onToggle }: CharacterSetOptionsProps) {
  const hintId = useId();
  const onlyOne = selected.length === 1;

  return (
    <fieldset className="flex flex-col gap-3" aria-describedby={hintId}>
      <legend className="mb-3 text-sm font-medium text-fg">Caratteri da includere</legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {CHARACTER_SETS.map(({ id, label, example }) => {
          const checked = selected.includes(id);
          // L'ultimo gruppo rimasto non si può togliere: senza caratteri non c'è password
          const locked = checked && onlyOne;
          return (
            <label
              key={id}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                checked ? 'border-primary/50 bg-primary-soft' : 'border-border-strong bg-surface',
                locked ? 'cursor-not-allowed' : 'cursor-pointer not-has-[:checked]:hover:bg-surface-muted',
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={locked}
                onChange={() => onToggle(id)}
                className="size-4 shrink-0 accent-primary disabled:cursor-not-allowed"
              />
              <span className="flex-1 text-sm font-medium text-fg">{label}</span>
              <span className="font-mono text-[13px] text-fg-muted" aria-hidden>
                {example}
              </span>
            </label>
          );
        })}
      </div>
      <p id={hintId} className="text-[13px] text-fg-muted">
        {onlyOne ? 'Almeno un tipo di caratteri deve restare selezionato.' : 'Più tipi scegli, più la password è robusta.'}
      </p>
    </fieldset>
  );
}
