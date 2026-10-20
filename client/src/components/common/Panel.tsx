import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

/** Superficie base per i blocchi di lavoro. */
export function Panel({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgb(15_23_42/0.04),0_8px_24px_-12px_rgb(15_23_42/0.08)]',
        className,
      )}
      {...props}
    />
  );
}
