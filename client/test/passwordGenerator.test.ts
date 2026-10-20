import { describe, expect, it } from 'vitest';
import {
  ALL_CHARACTER_SET_IDS,
  characterSetOf,
  charactersOf,
  poolSize,
} from '../src/lib/password-generator/characterSets';
import { cryptoRandomInt, generatePassword, segmentPassword } from '../src/lib/password-generator/generatePassword';
import { passwordStrength, strengthLevelFor } from '../src/lib/password-generator/passwordStrength';
import type { CharacterSetId } from '../src/models/password';

const onlyFrom = (password: string, sets: readonly CharacterSetId[]) =>
  [...password].every((char) => sets.some((id) => charactersOf(id).includes(char)));

describe('generatePassword', () => {
  it.each([10, 16, 30])('rispetta la lunghezza %i', (length) => {
    expect(generatePassword({ length, sets: ALL_CHARACTER_SET_IDS })).toHaveLength(length);
  });

  it('usa solo i gruppi scelti e almeno un carattere per gruppo', () => {
    const sets: CharacterSetId[] = ['digits', 'symbols'];
    for (let i = 0; i < 200; i++) {
      const password = generatePassword({ length: 10, sets });
      expect(onlyFrom(password, sets)).toBe(true);
      expect(password).toMatch(/\d/);
      expect(password).toMatch(/[^0-9]/);
    }
  });

  it('con tutti i gruppi contiene maiuscole, minuscole, numeri e simboli', () => {
    for (let i = 0; i < 200; i++) {
      const password = generatePassword({ length: 10, sets: ALL_CHARACTER_SET_IDS });
      expect(new Set([...password].map(characterSetOf))).toEqual(new Set(ALL_CHARACTER_SET_IDS));
    }
  });

  it('con un solo gruppo pesca solo da quello', () => {
    const password = generatePassword({ length: 30, sets: ['lowercase'] });
    expect(password).toMatch(/^[a-z]{30}$/);
  });

  it('rifiuta nessun gruppo o una lunghezza fuori intervallo', () => {
    expect(() => generatePassword({ length: 16, sets: [] })).toThrow('almeno un tipo');
    expect(() => generatePassword({ length: 9, sets: ['digits'] })).toThrow('tra 10 e 30');
    expect(() => generatePassword({ length: 31, sets: ['digits'] })).toThrow('tra 10 e 30');
  });

  it('è deterministica con un generatore casuale finto', () => {
    const alwaysZero = () => 0;
    // Primo carattere di ogni gruppo, poi riempimento con il primo di tutti, poi rimescolamento fisso
    expect(generatePassword({ length: 10, sets: ['digits'] }, alwaysZero)).toBe('0000000000');
  });

  it('distribuisce i caratteri in modo uniforme', () => {
    const counts = new Map<string, number>();
    for (let i = 0; i < 400; i++) {
      for (const char of generatePassword({ length: 30, sets: ['digits'] })) counts.set(char, (counts.get(char) ?? 0) + 1);
    }
    // 12.000 cifre: ~1.200 per cifra
    expect(counts.size).toBe(10);
    for (const count of counts.values()) expect(count).toBeGreaterThan(1000);
  });
});

describe('cryptoRandomInt', () => {
  it('resta nell’intervallo [0, max)', () => {
    for (let i = 0; i < 1000; i++) {
      const value = cryptoRandomInt(7);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(7);
    }
  });
});

describe('poolSize', () => {
  it('somma i caratteri dei gruppi senza contare i doppioni', () => {
    expect(poolSize([])).toBe(0);
    expect(poolSize(['digits'])).toBe(10);
    expect(poolSize(['lowercase', 'uppercase', 'lowercase'])).toBe(52);
    expect(poolSize(ALL_CHARACTER_SET_IDS)).toBe(87);
  });
});

describe('passwordStrength', () => {
  it.each([
    [59.9, 'weak'],
    [60, 'fair'],
    [79.9, 'fair'],
    [80, 'strong'],
  ] as const)('%f bit → %s', (bits, level) => {
    expect(strengthLevelFor(bits)).toBe(level);
  });

  it.each([
    [10, ['digits'], 'weak', 33],
    [10, ['lowercase'], 'weak', 47],
    [10, ['uppercase', 'lowercase', 'digits'], 'weak', 59],
    [10, ALL_CHARACTER_SET_IDS, 'fair', 64],
    [12, ALL_CHARACTER_SET_IDS, 'fair', 77],
    [13, ALL_CHARACTER_SET_IDS, 'strong', 83],
    [16, ALL_CHARACTER_SET_IDS, 'strong', 103],
    [30, ['digits'], 'strong', 99],
  ] as const)('%i caratteri da %j → %s (%i bit)', (length, sets, level, bits) => {
    const strength = passwordStrength({ length, sets });
    expect(strength.level).toBe(level);
    expect(strength.entropyBits).toBe(bits);
  });

  it('suggerisce la lunghezza minima per una password forte', () => {
    expect(passwordStrength({ length: 10, sets: ALL_CHARACTER_SET_IDS }).lengthForStrong).toBe(13);
    expect(passwordStrength({ length: 10, sets: ['digits'] }).lengthForStrong).toBe(25);
    expect(passwordStrength({ length: 16, sets: ALL_CHARACTER_SET_IDS }).lengthForStrong).toBeNull();
  });
});

describe('segmentPassword', () => {
  it('raggruppa i caratteri consecutivi dello stesso tipo', () => {
    expect(segmentPassword('ab12#Cd')).toEqual([
      { text: 'ab', set: 'lowercase' },
      { text: '12', set: 'digits' },
      { text: '#', set: 'symbols' },
      { text: 'C', set: 'uppercase' },
      { text: 'd', set: 'lowercase' },
    ]);
  });
});
