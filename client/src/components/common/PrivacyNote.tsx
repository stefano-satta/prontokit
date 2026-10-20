import { ShieldCheck } from 'lucide-react';

interface PrivacyNoteProps {
  title?: string;
  description?: string;
}

export function PrivacyNote({
  title = 'Il documento non lascia il tuo dispositivo.',
  description = 'La conversione avviene interamente nel browser: niente upload, niente copie sui server, niente cronologia.',
}: PrivacyNoteProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-success/25 bg-success-soft px-4 py-3 text-sm">
      <ShieldCheck className="mt-0.5 size-[18px] shrink-0 text-success" aria-hidden />
      <p className="text-fg">
        <span className="font-semibold">{title}</span> <span className="text-fg-muted">{description}</span>
      </p>
    </div>
  );
}
