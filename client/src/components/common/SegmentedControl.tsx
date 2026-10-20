import { useId } from 'react';
import { cn } from '../../lib/cn';

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number> {
  legend: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Scelta esclusiva compatta: radio nativi (frecce da tastiera incluse) con aspetto a pulsanti. */
export function SegmentedControl<T extends string | number>({ legend, options, value, onChange, className }: SegmentedControlProps<T>) {
  const name = useId();
  return (
    <fieldset className={cn('flex flex-col gap-1.5', className)}>
      <legend className="mb-1.5 text-[13px] font-medium text-fg-muted">{legend}</legend>
      <div className="flex w-full rounded-lg border border-border-strong bg-surface-muted p-0.5 sm:w-fit">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={String(option.value)}
              className={cn(
                'relative flex h-9 flex-1 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors sm:flex-none',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-ring',
                checked ? 'bg-surface text-fg shadow-[0_1px_2px_rgb(15_23_42/0.12)]' : 'text-fg-muted hover:text-fg',
              )}
            >
              <input
                type="radio"
                name={name}
                value={String(option.value)}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
