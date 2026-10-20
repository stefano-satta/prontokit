export type CharacterSetId = 'lowercase' | 'uppercase' | 'digits' | 'symbols';

export interface CharacterSet {
  id: CharacterSetId;
  label: string;
  /** Esempio breve mostrato accanto alla casella */
  example: string;
  chars: string;
}

export interface PasswordOptions {
  length: number;
  sets: readonly CharacterSetId[];
}

export type PasswordStrengthLevel = 'weak' | 'fair' | 'strong';

export interface PasswordStrength {
  level: PasswordStrengthLevel;
  /** Entropia in bit, arrotondata per difetto */
  entropyBits: number;
  /** Lunghezza minima per arrivare a "forte" con i caratteri scelti; null se già forte o se non basta il massimo */
  lengthForStrong: number | null;
}

/** Una porzione della password con il tipo di caratteri, per colorare cifre e simboli */
export interface PasswordSegment {
  text: string;
  set: CharacterSetId;
}
