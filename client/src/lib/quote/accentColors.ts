import type { AccentColorId } from '../../models/quote';

export interface AccentColor {
  id: AccentColorId;
  label: string;
  /** Colore del PDF: tutti reggono il testo bianco con contrasto ≥ 4,5:1 */
  hex: string;
}

/** Colori di accento del PDF (titolo, intestazione della tabella, totale). Il documento è sempre su fondo bianco. */
export const ACCENT_COLORS: readonly AccentColor[] = [
  { id: 'blue', label: 'Blu', hex: '#1d4ed8' },
  { id: 'slate', label: 'Ardesia', hex: '#334155' },
  { id: 'green', label: 'Verde', hex: '#047857' },
  { id: 'teal', label: 'Petrolio', hex: '#0f766e' },
  { id: 'violet', label: 'Viola', hex: '#6d28d9' },
  { id: 'red', label: 'Rosso', hex: '#b91c1c' },
  { id: 'amber', label: 'Ambra', hex: '#b45309' },
  { id: 'black', label: 'Nero', hex: '#111827' },
];

export const accentColorOf = (id: AccentColorId): AccentColor => ACCENT_COLORS.find((color) => color.id === id) ?? ACCENT_COLORS[0]!;
