import type { CharacterSet, CharacterSetId } from '../../models/password';

export const PASSWORD_LENGTH = { min: 10, max: 30, default: 16 } as const;

/**
 * Simboli accettati quasi ovunque: niente spazi, virgolette e backslash,
 * che molti moduli rifiutano o che vanno "escapati" se la password finisce in un file di configurazione.
 */
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/~';

/** In ordine di visualizzazione */
export const CHARACTER_SETS: readonly CharacterSet[] = [
  { id: 'uppercase', label: 'Lettere maiuscole', example: 'ABC', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  { id: 'lowercase', label: 'Lettere minuscole', example: 'abc', chars: 'abcdefghijklmnopqrstuvwxyz' },
  { id: 'digits', label: 'Numeri', example: '123', chars: '0123456789' },
  { id: 'symbols', label: 'Caratteri speciali', example: '#$&', chars: SYMBOLS },
];

export const ALL_CHARACTER_SET_IDS: readonly CharacterSetId[] = CHARACTER_SETS.map(({ id }) => id);

const BY_ID = new Map(CHARACTER_SETS.map((set) => [set.id, set]));

export const charactersOf = (id: CharacterSetId): string => BY_ID.get(id)!.chars;

/** Numero di caratteri possibili per ogni posizione con i gruppi scelti. */
export const poolSize = (sets: readonly CharacterSetId[]): number =>
  [...new Set(sets)].reduce((total, id) => total + charactersOf(id).length, 0);

/** Gruppo a cui appartiene un carattere della password. */
export const characterSetOf = (char: string): CharacterSetId =>
  CHARACTER_SETS.find(({ chars }) => chars.includes(char))?.id ?? 'symbols';
