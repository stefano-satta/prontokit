import type { PasswordOptions, PasswordSegment } from '../../models/password';
import { characterSetOf, charactersOf, PASSWORD_LENGTH } from './characterSets';

/** Restituisce un intero casuale uniforme in [0, max). */
export type RandomInt = (max: number) => number;

const UINT32_RANGE = 2 ** 32;

/**
 * Generatore crittografico del browser (mai Math.random). Scarta i valori oltre l'ultimo multiplo di `max`,
 * così ogni carattere ha la stessa probabilità (niente bias del modulo).
 */
export const cryptoRandomInt: RandomInt = (max) => {
  const limit = UINT32_RANGE - (UINT32_RANGE % max);
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % max;
};

const pick = (chars: string, random: RandomInt) => chars[random(chars.length)];

/**
 * Genera una password con almeno un carattere di ogni gruppo scelto; le altre posizioni pescano da tutti i gruppi.
 * Alla fine i caratteri vengono rimescolati, così quelli garantiti non stanno sempre in testa.
 */
export const generatePassword = ({ length, sets }: PasswordOptions, random: RandomInt = cryptoRandomInt): string => {
  const groups = [...new Set(sets)].map(charactersOf);
  if (groups.length === 0) throw new Error('Seleziona almeno un tipo di caratteri.');
  if (!Number.isInteger(length) || length < PASSWORD_LENGTH.min || length > PASSWORD_LENGTH.max) {
    throw new Error(`La lunghezza deve essere tra ${PASSWORD_LENGTH.min} e ${PASSWORD_LENGTH.max} caratteri.`);
  }

  const all = groups.join('');
  const chars = groups.map((group) => pick(group, random));
  while (chars.length < length) chars.push(pick(all, random));

  // Fisher-Yates
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
};

/** Divide la password in porzioni consecutive dello stesso gruppo, per colorare cifre e simboli. */
export const segmentPassword = (password: string): PasswordSegment[] =>
  [...password].reduce<PasswordSegment[]>((segments, char) => {
    const set = characterSetOf(char);
    const last = segments.at(-1);
    if (last?.set === set) last.text += char;
    else segments.push({ text: char, set });
    return segments;
  }, []);
