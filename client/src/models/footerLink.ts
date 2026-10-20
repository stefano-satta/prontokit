import type { ComponentType } from 'react';

export interface FooterLink {
  label: string;
  path: string;
  /** Pagina lazy; senza, la route non viene registrata (pagina ancora da fare). */
  loadPage?: () => Promise<{ default: ComponentType }>;
}
