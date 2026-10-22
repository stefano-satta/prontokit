import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'prefix'> {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  prefix?: ReactNode;
  optional?: boolean;
  /** Contenuto sulla riga dell'etichetta, a destra (es. un contatore); letto anche dagli screen reader */
  aside?: ReactNode;
}

export function TextField({ label, hint, error, prefix, optional, aside, className, ...props }: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const asideId = `${id}-aside`;
  const describedBy = [aside && asideId, hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
          {optional && <span className="ml-1.5 font-normal text-fg-muted">(facoltativo)</span>}
        </label>
        {aside && <span id={asideId}>{aside}</span>}
      </div>
      <div
        className={cn(
          'flex h-12 items-center overflow-hidden rounded-lg border bg-surface transition-colors',
          'focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/20',
          error ? 'border-danger' : 'border-border-strong hover:border-fg-muted/60',
        )}
      >
        {prefix && (
          <span className="flex h-full items-center border-r border-border bg-surface-muted px-3 font-mono text-sm text-fg-muted">
            {prefix}
          </span>
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-[15px] text-fg outline-none"
          {...props}
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="text-[13px] text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-[13px] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
