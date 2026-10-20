import { Mic, Square } from 'lucide-react';
import type { SpeechStatus } from '../../../models/speech';
import { Button } from '../../common/Button';
import { Spinner } from '../../common/Spinner';

interface RecordButtonProps {
  status: SpeechStatus;
  onStart: () => void;
  onStop: () => void;
}

export function RecordButton({ status, onStart, onStop }: RecordButtonProps) {
  if (status === 'listening') {
    return (
      <Button size="lg" variant="secondary" onClick={onStop} icon={<Square className="size-4 fill-current text-danger" aria-hidden />}>
        <span className="relative mr-0.5 flex size-2.5" aria-hidden>
          <span className="absolute inline-flex size-full rounded-full bg-danger opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex size-2.5 rounded-full bg-danger" />
        </span>
        Ferma registrazione
      </Button>
    );
  }

  const busy = status === 'requesting' || status === 'stopping';
  return (
    <Button
      size="lg"
      onClick={onStart}
      disabled={busy || status === 'unsupported'}
      aria-busy={busy}
      icon={busy ? <Spinner label="Attendere" /> : <Mic className="size-[18px]" aria-hidden />}
    >
      {status === 'requesting' ? 'Accesso al microfono…' : status === 'stopping' ? 'Ultime parole…' : 'Inizia a parlare'}
    </Button>
  );
}
