import type { PasswordOptions, PasswordStrength, PasswordStrengthLevel } from '../../models/password';
import { PASSWORD_LENGTH, poolSize } from './characterSets';

/**
 * Soglie in bit di entropia. La password è casuale, quindi l'entropia dipende solo da lunghezza e caratteri
 * possibili: log2(caratteri possibili) × lunghezza. 80 bit restano fuori portata anche per attacchi offline
 * su hash veloci; sotto i 60 un attacco offline mirato diventa realistico.
 */
export const STRENGTH_THRESHOLDS = { fair: 60, strong: 80 } as const;

export const strengthLevelFor = (entropyBits: number): PasswordStrengthLevel => {
  if (entropyBits >= STRENGTH_THRESHOLDS.strong) return 'strong';
  if (entropyBits >= STRENGTH_THRESHOLDS.fair) return 'fair';
  return 'weak';
};

export const passwordStrength = ({ length, sets }: PasswordOptions): PasswordStrength => {
  const pool = poolSize(sets);
  const bitsPerChar = pool > 1 ? Math.log2(pool) : 0;
  const entropy = bitsPerChar * length;
  const level = strengthLevelFor(entropy);

  const needed = bitsPerChar > 0 ? Math.ceil(STRENGTH_THRESHOLDS.strong / bitsPerChar) : Infinity;
  return {
    level,
    entropyBits: Math.floor(entropy),
    lengthForStrong: level !== 'strong' && needed <= PASSWORD_LENGTH.max ? needed : null,
  };
};
