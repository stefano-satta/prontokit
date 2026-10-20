import { Check, Download, FileCode2 } from 'lucide-react';
import { useState } from 'react';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { Button } from '../../common/Button';

interface ExportActionsProps {
  /** Nome leggibile dell'oggetto esportato, per le etichette accessibili */
  subject: string;
  disabled: boolean;
  onDownloadPng: () => Promise<void> | void;
  getSvg: () => string;
}

/** Scarica PNG (principale) e copia SVG negli appunti (secondario). */
export function ExportActions({ subject, disabled, onDownloadPng, getSvg }: ExportActionsProps) {
  const { copied, copy } = useCopyToClipboard();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setError(null);
    setBusy(true);
    try {
      await onDownloadPng();
    } catch {
      setError('Non è stato possibile creare il PNG. Riprova; se il problema resta, aggiorna la pagina.');
    } finally {
      setBusy(false);
    }
  };

  const copySvg = async () => {
    setError(null);
    const ok = await copy(getSvg());
    if (!ok) setError('Il browser non ha permesso di copiare negli appunti. Controlla i permessi del sito e riprova.');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={disabled || busy}
          onClick={download}
          aria-label={`Scarica PNG ${subject}`}
          icon={<Download className="size-[18px]" aria-hidden />}
        >
          Scarica PNG
        </Button>
        <Button
          variant="secondary"
          disabled={disabled}
          onClick={copySvg}
          aria-label={`Copia SVG ${subject}`}
          icon={copied ? <Check className="size-[18px]" aria-hidden /> : <FileCode2 className="size-[18px]" aria-hidden />}
        >
          <span aria-live="polite">{copied ? 'SVG copiato' : 'Copia SVG'}</span>
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-[13px] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
