import { Info } from 'lucide-react';

/** Il riconoscimento è del browser: diciamo con onestà dove può finire l'audio. */
export function SpeechPrivacyNote() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm">
      <Info className="mt-0.5 size-[18px] shrink-0 text-primary-text" aria-hidden />
      <p className="text-fg">
        <span className="font-semibold">Non salviamo né l'audio né il testo.</span>{' '}
        <span className="text-fg-muted">
          La trascrizione la fa il riconoscimento vocale del browser: su Chrome ed Edge l'audio può essere elaborato dai
          server di Google o Microsoft, su Safari da Apple. Funziona su Chrome, Edge e Safari, non su Firefox.
        </span>
      </p>
    </div>
  );
}
