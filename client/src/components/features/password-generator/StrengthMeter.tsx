import { cn } from '../../../lib/cn';
import { STRENGTH_THRESHOLDS } from '../../../lib/password-generator/passwordStrength';
import type { PasswordStrength, PasswordStrengthLevel } from '../../../models/password';

interface LevelStyle {
  label: string;
  /** Spiegazione della soglia, mostrata nella legenda */
  rule: string;
  /** Segmenti accesi sui 3 della barra */
  filled: number;
  text: string;
  bar: string;
  soft: string;
}

/** Rosso, ambra, verde: il nome del livello è sempre scritto, così il colore non è l'unica informazione. */
const LEVELS: Record<PasswordStrengthLevel, LevelStyle> = {
  weak: {
    label: 'Debole',
    rule: `meno di ${STRENGTH_THRESHOLDS.fair} bit: si può indovinare in tempi brevi`,
    filled: 1,
    text: 'text-danger',
    bar: 'bg-danger',
    soft: 'bg-danger-soft',
  },
  fair: {
    label: 'Accettabile',
    rule: `da ${STRENGTH_THRESHOLDS.fair} a ${STRENGTH_THRESHOLDS.strong - 1} bit: va bene per account poco importanti`,
    filled: 2,
    text: 'text-warning',
    bar: 'bg-warning',
    soft: 'bg-warning-soft',
  },
  strong: {
    label: 'Forte',
    rule: `${STRENGTH_THRESHOLDS.strong} bit o più: adatta anche a email, banca e lavoro`,
    filled: 3,
    text: 'text-success',
    bar: 'bg-success',
    soft: 'bg-success-soft',
  },
};

const ORDER: readonly PasswordStrengthLevel[] = ['weak', 'fair', 'strong'];

export function StrengthMeter({ strength }: { strength: PasswordStrength }) {
  const current = LEVELS[strength.level];

  return (
    <div className="flex flex-col gap-4" data-testid="password-strength" data-level={strength.level}>
      <div className="flex flex-col gap-2.5">
        <p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1" aria-live="polite">
          <span className="text-sm text-fg-muted">
            Sicurezza: <strong className={cn('text-base font-semibold', current.text)}>{current.label}</strong>
          </span>
          <span className="tabular text-[13px] text-fg-muted">≈ {strength.entropyBits} bit di entropia</span>
        </p>
        <div className="grid grid-cols-3 gap-1.5" aria-hidden>
          {ORDER.map((level, index) => (
            <span
              key={level}
              className={cn(
                'h-2 rounded-full transition-colors duration-300',
                index < current.filled ? current.bar : 'bg-border',
              )}
            />
          ))}
        </div>
        {strength.lengthForStrong !== null && (
          <p className="text-[13px] text-fg-muted">
            Per una password forte con questi caratteri servono almeno {strength.lengthForStrong} caratteri.
          </p>
        )}
        {strength.level !== 'strong' && strength.lengthForStrong === null && (
          <p className="text-[13px] text-fg-muted">Per una password forte aggiungi altri tipi di caratteri.</p>
        )}
      </div>

      <dl className="grid gap-2 border-t border-border pt-4 text-[13px] sm:grid-cols-3" aria-label="Legenda della sicurezza">
        {ORDER.map((level) => {
          const style = LEVELS[level];
          const active = level === strength.level;
          return (
            <div
              key={level}
              className={cn('flex items-start gap-2.5 rounded-lg px-3 py-2', active && style.soft)}
              aria-current={active ? 'true' : undefined}
            >
              <span className={cn('mt-1 size-2.5 shrink-0 rounded-full', style.bar)} aria-hidden />
              <div className="flex flex-col">
                <dt className={cn('font-semibold', active ? style.text : 'text-fg')}>{style.label}</dt>
                <dd className="text-fg-muted">{style.rule}</dd>
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
