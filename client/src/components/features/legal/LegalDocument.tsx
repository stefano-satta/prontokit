import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHeader } from '../../common/PageHeader';

interface LegalDocumentProps {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Data dell'ultimo aggiornamento, già formattata */
  updatedAt: string;
  children: ReactNode;
}

/** Impaginazione condivisa di Privacy e Termini: testo lungo, righe di lettura comode. */
export function LegalDocument({ title, description, icon, updatedAt, children }: LegalDocumentProps) {
  return (
    <div className="mx-auto flex w-full max-w-[68ch] flex-col gap-10">
      <PageHeader icon={icon} title={title} description={description} />
      <div className="flex flex-col gap-8">
        <p className="text-sm text-fg-muted">Ultimo aggiornamento: {updatedAt}</p>
        <div className="flex flex-col gap-10 text-[15px] leading-relaxed text-fg">{children}</div>
      </div>
    </div>
  );
}

interface LegalSectionProps {
  title: string;
  children: ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-[-0.01em]">{title}</h2>
      {children}
    </section>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-fg-muted">{children}</ul>;
}
