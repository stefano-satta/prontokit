import { useId, type ReactNode } from 'react';
import { Panel } from '../../common/Panel';

interface MetaTagsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Gruppo di campi del modulo con titolo: pagina, Open Graph, X. */
export function MetaTagsSection({ title, description, children }: MetaTagsSectionProps) {
  const titleId = useId();
  return (
    <Panel aria-labelledby={titleId} className="@container flex flex-col gap-5 p-5 sm:p-7">
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
