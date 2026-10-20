import { ImageUp, RefreshCw } from 'lucide-react';
import { Button } from '../components/common/Button';
import { FileDropzone } from '../components/common/FileDropzone';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { PrivacyNote } from '../components/common/PrivacyNote';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { Spinner } from '../components/common/Spinner';
import { ImageConversionResult } from '../components/features/image-converter/ImageConversionResult';
import { SelectedImageList } from '../components/features/image-converter/SelectedImageList';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useImageConversion } from '../hooks/useImageConversion';
import { formatBytes } from '../lib/formatBytes';
import { FORMAT_INFO, IMAGE_ACCEPT, MAX_IMAGE_BYTES, MAX_IMAGES, OUTPUT_FORMATS } from '../lib/image-converter/imageFormats';

const TARGET_OPTIONS = OUTPUT_FORMATS.map((format) => ({ value: format, label: FORMAT_INFO[format].label }));

export default function ImageConverterPage() {
  useDocumentTitle('Convertitore di immagini');
  const { images, target, setTarget, phase, notices, blockedMessage, addFiles, removeImage, convert, reset } = useImageConversion();
  const converting = phase.status === 'converting';
  const full = images.length >= MAX_IMAGES;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        icon={ImageUp}
        title="Convertitore di immagini"
        description="Trascina fino a 5 immagini JPG, PNG, WebP, AVIF o BMP, scegli il formato e scaricale convertite in PNG, JPG o WebP."
      />
      <PrivacyNote
        title="Le immagini non lasciano il tuo dispositivo."
        description="La conversione avviene interamente nel browser: niente upload, niente copie sui server. I metadati, come la posizione GPS, non vengono copiati."
      />
      {phase.status === 'done' ? (
        <ImageConversionResult target={phase.target} results={phase.results} onReset={reset} />
      ) : (
        <Panel className="p-6 sm:p-8">
          <div className="flex flex-col gap-6" data-testid="conversion-card" data-status={phase.status}>
            <FileDropzone
              multiple
              accept={IMAGE_ACCEPT}
              title={full ? `Hai aggiunto ${MAX_IMAGES} immagini, il massimo` : 'Trascina qui le tue immagini'}
              hint={
                full
                  ? 'Rimuovine una per aggiungerne un’altra.'
                  : `JPG, PNG, WebP, AVIF o BMP · fino a ${MAX_IMAGES} file da ${formatBytes(MAX_IMAGE_BYTES)}`
              }
              onFiles={addFiles}
              disabled={full || converting}
              className={images.length ? 'py-8' : undefined}
            />
            {notices.length > 0 && (
              <div role="alert" className="flex flex-col gap-1 rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger" data-testid="notices">
                {notices.map((notice) => (
                  <p key={notice}>{notice}</p>
                ))}
              </div>
            )}
            {images.length > 0 && (
              <>
                <section aria-labelledby="selected-title" className="flex flex-col gap-3">
                  <h2 id="selected-title" className="text-[15px] font-semibold">
                    Immagini da convertire <span className="tabular font-normal text-fg-muted">({images.length} di {MAX_IMAGES})</span>
                  </h2>
                  <SelectedImageList images={images} target={target} onRemove={removeImage} disabled={converting} />
                </section>
                <SegmentedControl legend="Converti in" options={TARGET_OPTIONS} value={target} onChange={setTarget} />
                {blockedMessage && (
                  <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
                    {blockedMessage}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    onClick={convert}
                    disabled={converting}
                    icon={converting ? <Spinner label="Conversione in corso" /> : <RefreshCw className="size-[18px]" aria-hidden />}
                  >
                    {converting ? `Conversione ${Math.min(phase.done + 1, phase.total)} di ${phase.total}…` : 'Converti'}
                  </Button>
                  <Button size="lg" variant="ghost" onClick={reset} disabled={converting}>
                    Svuota
                  </Button>
                </div>
              </>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}
