import { segmentPassword } from '../../../lib/password-generator/generatePassword';
import type { CharacterSetId } from '../../../models/password';

/** Cifre e simboli colorati: si distinguono a colpo d'occhio 0/O e 1/l quando la password va ricopiata a mano. */
const SEGMENT_CLASSES: Record<CharacterSetId, string> = {
  uppercase: 'text-fg',
  lowercase: 'text-fg',
  digits: 'text-primary-text',
  symbols: 'text-accent',
};

export function PasswordDisplay({ password }: { password: string }) {
  return (
    <output
      aria-label="Password generata"
      className="block rounded-xl border border-border bg-surface-muted px-4 py-5 text-center font-mono text-xl leading-relaxed font-medium tracking-wide break-all sm:text-2xl"
      data-testid="password-value"
    >
      {segmentPassword(password).map(({ text, set }, index) => (
        <span key={index} className={SEGMENT_CLASSES[set]}>
          {text}
        </span>
      ))}
    </output>
  );
}
