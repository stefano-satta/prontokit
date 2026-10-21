import { useId, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
}

/** Testo su più righe con etichetta, suggerimento ed errore, con lo stesso aspetto di `TextField`. */
export function TextAreaField({ label, hint, error, optional, className, rows = 3, ...props }: TextAreaFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
        {optional && <span className="ml-1.5 font-normal text-fg-muted">(facoltativo)</span>}
      </label>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'min-h-20 resize-y rounded-lg border bg-surface px-3.5 py-2.5 text-[15px] leading-6 text-fg outline-none transition-colors',
          'focus:border-primary focus:ring-3 focus:ring-primary/20',
          error ? 'border-danger' : 'border-border-strong hover:border-fg-muted/60',
        )}
        {...props}
      />
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
