import { ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { SPEECH_LANGUAGES } from '../../../lib/speech-to-text/languages';
import type { SpeechLanguageId } from '../../../models/speech';

interface LanguageSelectProps {
  value: SpeechLanguageId;
  onChange: (value: SpeechLanguageId) => void;
  disabled?: boolean;
}

export function LanguageSelect({ value, onChange, disabled }: LanguageSelectProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fg">
        Lingua
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value as SpeechLanguageId)}
          className="h-12 w-full min-w-44 appearance-none rounded-lg border border-border-strong bg-surface pr-10 pl-3.5 text-[15px] text-fg transition-colors outline-none not-disabled:hover:border-fg-muted/60 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {SPEECH_LANGUAGES.map((language) => (
            <option key={language.id} value={language.id} lang={language.locale}>
              {language.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-fg-muted" aria-hidden />
      </div>
    </div>
  );
}
