import { useId, type ReactNode } from 'react';
import { cn } from '../../../lib/cn';
import { Panel } from '../../common/Panel';

interface QuoteSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/** Blocco del modulo con titolo: ogni parte del preventivo ha il suo. */
export function QuoteSection({ title, description, children, className }: QuoteSectionProps) {
  const titleId = useId();
  return (
    <Panel aria-labelledby={titleId} className={cn('@container flex flex-col gap-5 p-5 sm:p-7', className)}>
      <div className="flex flex-col gap-1">
        <h2 id={titleId} className="text-[17px] font-semibold tracking-[-0.01em]">
          {title}
        </h2>
        {description && <p className="text-[13px] text-fg-muted">{description}</p>}
      </div>
      {children}
    </Panel>
  );
}
