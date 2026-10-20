import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

export interface Utility {
  id: string;
  path: string;
  /** Etichetta breve per la navigazione */
  navLabel: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Illustrazione mostrata nel box della home */
  preview: ComponentType;
  /** Caricamento lazy della pagina (code splitting per route) */
  loadPage: () => Promise<{ default: ComponentType }>;
  /** `false` la nasconde e ne toglie la route, lasciando il codice pronto per riattivarla (predefinito: attiva) */
  enabled?: boolean;
}
