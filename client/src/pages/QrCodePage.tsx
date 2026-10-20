import { Download, FileCode2, QrCode } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Panel } from '../components/common/Panel';
import { TextField } from '../components/common/TextField';
import { QrViewfinder } from '../components/features/qr/QrViewfinder';
import { useQrCode } from '../hooks/useQrCode';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { downloadFile, downloadText } from '../lib/downloadFile';
import { validateUrl } from '../lib/validateUrl';

const filenameFor = (url: string) => {
  const host = new URL(url).hostname.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, '');
  return `qr-${host || 'code'}`;
};

export default function QrCodePage() {
  useDocumentTitle('Generatore di QR code');
  const [input, setInput] = useState('');
  const [touched, setTouched] = useState(false);

  const deferredInput = useDeferredValue(input);
  const validation = validateUrl(deferredInput);
  const qr = useQrCode(validation.ok ? validation.url : null);

  const showError = touched && input.trim() !== '' && !validation.ok;
  const ready = qr.status === 'ready';

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        icon={QrCode}
        title="Generatore di QR code"
        description="Incolla l'indirizzo di un sito: il QR code si aggiorna mentre scrivi. Scaricalo in PNG per il web o in SVG per la stampa."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Panel className="flex flex-col gap-6 p-6 sm:p-8">
          <form onSubmit={(event) => event.preventDefault()} noValidate>
            <TextField
              label="URL del sito"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://www.esempio.it"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onBlur={() => setTouched(true)}
              error={showError && !validation.ok ? validation.error : null}
              hint="Se ometti https:// lo aggiungiamo noi."
              autoFocus
            />
          </form>

          {ready && (
            <dl className="flex flex-col gap-1 rounded-lg bg-surface-muted px-4 py-3 text-sm">
              <dt className="text-fg-muted">Il QR code apre</dt>
              <dd className="font-mono break-all text-fg" data-testid="qr-target">
                {qr.text}
              </dd>
            </dl>
          )}

          <div className="mt-auto flex flex-wrap gap-3">
            <Button
              size="lg"
              disabled={!ready}
              icon={<Download className="size-[18px]" aria-hidden />}
              onClick={() => ready && downloadFile(qr.result.pngDataUrl, `${filenameFor(qr.text)}.png`)}
            >
              Scarica PNG
            </Button>
            <Button
              size="lg"
              variant="secondary"
              disabled={!ready}
              icon={<FileCode2 className="size-[18px]" aria-hidden />}
              onClick={() => ready && downloadText(qr.result.svg, `${filenameFor(qr.text)}.svg`, 'image/svg+xml')}
            >
              Scarica SVG
            </Button>
          </div>
        </Panel>

        <Panel className="flex flex-col items-center justify-center gap-4 p-6 sm:p-8" aria-label="Anteprima QR code">
          <QrViewfinder active={ready}>
            {ready ? (
              <img
                src={qr.result.pngDataUrl}
                alt={`QR code che apre ${qr.text}`}
                className="size-full bg-white"
                data-testid="qr-image"
              />
            ) : (
              <div className="grid size-full place-items-center rounded-lg border border-dashed border-border-strong bg-surface-muted p-6 text-center text-sm text-fg-muted">
                {qr.status === 'error' ? qr.message : 'L’anteprima apparirà qui appena inserisci un URL valido.'}
              </div>
            )}
          </QrViewfinder>
          <p className="text-[13px] text-fg-muted" aria-live="polite">
            {ready ? 'Pronto. Inquadralo con la fotocamera per provarlo.' : 'In attesa di un URL'}
          </p>
        </Panel>
      </div>
    </div>
  );
}
