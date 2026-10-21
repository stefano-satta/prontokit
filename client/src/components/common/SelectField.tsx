import { ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { cn } from '../../lib/cn';

export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string | number> {
  label: string;
  options: readonly SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Menu a tendina nativo con etichetta, allineato a `TextField`. */
export function SelectField<T extends string | number>({ label, options, value, onChange, className }: SelectFieldProps<T>) {
  const id = useId();
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={String(value)}
          onChange={(event) => onChange(options.find((option) => String(option.value) === event.target.value)!.value)}
          className="h-12 w-full appearance-none rounded-lg border border-border-strong bg-surface pr-10 pl-3.5 text-[15px] text-fg transition-colors outline-none hover:border-fg-muted/60 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
        >
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-fg-muted" aria-hidden />
      </div>
    </div>
  );
}
