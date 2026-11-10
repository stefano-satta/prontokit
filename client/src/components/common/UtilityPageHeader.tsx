import type { ReactNode } from 'react';
import { findUtility } from '../../config/utilities';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from './PageHeader';

interface UtilityPageHeaderProps {
  /** `id` della voce in `UTILITIES`, da cui vengono titolo, icona e titolo della scheda */
  utilityId: string;
  description: string;
  /** Nota sotto l'intestazione (di solito la `PrivacyNote`), alla stessa distanza in ogni pagina */
  children?: ReactNode;
}

export function UtilityPageHeader({ utilityId, description, children }: UtilityPageHeaderProps) {
  const { title, icon } = findUtility(utilityId);
  useDocumentTitle(title);
  const header = <PageHeader icon={icon} title={title} description={description} />;
  if (!children) return header;
  return (
    <div className="flex flex-col gap-4">
      {header}
      {children}
    </div>
  );
}
