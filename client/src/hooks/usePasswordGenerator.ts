import { useCallback, useMemo, useState } from 'react';
import { ALL_CHARACTER_SET_IDS, PASSWORD_LENGTH } from '../lib/password-generator/characterSets';
import { generatePassword } from '../lib/password-generator/generatePassword';
import { passwordStrength } from '../lib/password-generator/passwordStrength';
import type { CharacterSetId, PasswordOptions } from '../models/password';

const DEFAULT_OPTIONS: PasswordOptions = { length: PASSWORD_LENGTH.default, sets: ALL_CHARACTER_SET_IDS };

/** Opzioni, password corrente e forza: ogni cambio di opzione genera subito una nuova password. */
export const usePasswordGenerator = () => {
  const [state, setState] = useState(() => ({ options: DEFAULT_OPTIONS, password: generatePassword(DEFAULT_OPTIONS) }));

  const update = useCallback((next: (options: PasswordOptions) => PasswordOptions) => {
    setState(({ options }) => {
      const nextOptions = next(options);
      return { options: nextOptions, password: generatePassword(nextOptions) };
    });
  }, []);

  const toggleSet = useCallback(
    (id: CharacterSetId) =>
      update((options) => {
        const sets = options.sets.includes(id) ? options.sets.filter((set) => set !== id) : [...options.sets, id];
        // Almeno un gruppo resta sempre selezionato
        return sets.length === 0 ? options : { ...options, sets };
      }),
    [update],
  );

  const setLength = useCallback((length: number) => update((options) => ({ ...options, length })), [update]);
  const regenerate = useCallback(() => update((options) => options), [update]);

  const strength = useMemo(() => passwordStrength(state.options), [state.options]);

  return { ...state, strength, toggleSet, setLength, regenerate };
};
