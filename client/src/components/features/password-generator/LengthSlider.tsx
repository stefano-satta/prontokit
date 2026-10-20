import { useId } from 'react';
import { PASSWORD_LENGTH } from '../../../lib/password-generator/characterSets';

interface LengthSliderProps {
  value: number;
  onChange: (length: number) => void;
}

export function LengthSlider({ value, onChange }: LengthSliderProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          Lunghezza
        </label>
        <output htmlFor={id} className="tabular text-sm font-semibold text-fg" data-testid="password-length">
          {value} caratteri
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={PASSWORD_LENGTH.min}
        max={PASSWORD_LENGTH.max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={`${value} caratteri`}
        className="h-6 w-full cursor-pointer accent-primary"
      />
      <div className="tabular flex justify-between text-[13px] text-fg-muted" aria-hidden>
        <span>{PASSWORD_LENGTH.min}</span>
        <span>{PASSWORD_LENGTH.max}</span>
      </div>
    </div>
  );
}
