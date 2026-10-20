import { Combine } from 'lucide-react';
import { Button } from '../components/common/Button';
import { FileDropzone } from '../components/common/FileDropzone';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { PrivacyNote } from '../components/common/PrivacyNote';
import { Spinner } from '../components/common/Spinner';
import { PdfMergeResult } from '../components/features/pdf-merge/PdfMergeResult';
import { SelectedPdfList } from '../components/features/pdf-merge/SelectedPdfList';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePdfMerge } from '../hooks/usePdfMerge';
import { formatBytes } from '../lib/formatBytes';
import { MAX_PDFS, MIN_PDFS, PDF_ACCEPT } from '../lib/pdf-merge/selectPdfs';
import { MAX_PDF_BYTES } from '../lib/validatePdf';

export default function PdfMergePage() {
  useDocumentTitle('Unisci PDF');
  const { pdfs, phase, notices, checking, addFiles, removePdf, movePdf, merge, reset } = usePdfMerge();
  const merging = phase.status === 'merging';
  const busy = merging || checking;
  const full = pdfs.length >= MAX_PDFS;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        icon={Combine}
        title="Unisci PDF"
        description="Trascina fino a 5 PDF, mettili nell’ordine che preferisci e scarica un unico PDF con tutte le pagine."
      />
      <PrivacyNote
        title="I documenti non lasciano il tuo dispositivo."
        description="L’unione avviene interamente nel browser: niente upload, niente copie sui server, niente cronologia."
      />
      {phase.status === 'done' ? (
        <PdfMergeResult result={phase.result} onReset={reset} />
      ) : (
        <Panel className="p-6 sm:p-8">
          <div className="flex flex-col gap-6" data-testid="merge-card" data-status={phase.status}>
            <FileDropzone
              multiple
              accept={PDF_ACCEPT}
              title={full ? `Hai aggiunto ${MAX_PDFS} PDF, il massimo` : 'Trascina qui i tuoi PDF'}
              hint={full ? 'Rimuovine uno per aggiungerne un altro.' : `Fino a ${MAX_PDFS} file da ${formatBytes(MAX_PDF_BYTES)} · niente PDF protetti da password`}
              onFiles={addFiles}
              disabled={full || busy}
              className={pdfs.length ? 'py-8' : undefined}
            />
            {checking && (
              <p className="flex items-center gap-2 text-sm text-fg-muted" role="status">
                <Spinner label="Controllo dei PDF" /> Controllo dei PDF…
              </p>
            )}
            {notices.length > 0 && (
              <div role="alert" className="flex flex-col gap-1 rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger" data-testid="notices">
                {notices.map((notice) => (
                  <p key={notice}>{notice}</p>
                ))}
              </div>
            )}
            {pdfs.length > 0 && (
              <>
                <section aria-labelledby="selected-title" className="flex flex-col gap-3">
                  <h2 id="selected-title" className="text-[15px] font-semibold">
                    PDF da unire <span className="tabular font-normal text-fg-muted">({pdfs.length} di {MAX_PDFS})</span>
                  </h2>
                  <SelectedPdfList pdfs={pdfs} onMove={movePdf} onRemove={removePdf} disabled={busy} />
                  <p className="text-[13px] text-fg-muted">Le pagine vengono unite in quest’ordine: usa le frecce per cambiarlo.</p>
                </section>
                {phase.status === 'error' && (
                  <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
                    {phase.message}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    onClick={merge}
                    disabled={busy || pdfs.length < MIN_PDFS}
                    icon={merging ? <Spinner label="Unione in corso" /> : <Combine className="size-[18px]" aria-hidden />}
                  >
                    {merging ? 'Unione in corso…' : 'Unisci PDF'}
                  </Button>
                  <Button size="lg" variant="ghost" onClick={reset} disabled={merging}>
                    Svuota
                  </Button>
                </div>
                {pdfs.length < MIN_PDFS && (
                  <p className="text-[13px] text-fg-muted" data-testid="min-hint">
                    Aggiungi almeno un altro PDF per poterli unire.
                  </p>
                )}
              </>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}
