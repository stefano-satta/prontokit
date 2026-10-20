import { CircleAlert, CircleCheck, Download, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { downloadBlob } from '../../../lib/downloadFile';
import { imagesZipFilename } from '../../../lib/image-converter/imageFileNames';
import { FORMAT_INFO } from '../../../lib/image-converter/imageFormats';
import type { ImageOutputFormat, ImageResult } from '../../../models/imageConverter';
import { createImagesZip } from '../../../services/image/imageArchive';
import { Button } from '../../common/Button';
import { Panel } from '../../common/Panel';
import { ImageResultTable } from './ImageResultTable';

interface ImageConversionResultProps {
  target: ImageOutputFormat;
  results: readonly ImageResult[];
  onReset: () => void;
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function summary(results: readonly ImageResult[], target: ImageOutputFormat): string {
  const label = FORMAT_INFO[target].label;
  const converted = results.filter((r) => r.status === 'converted').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const failed = results.filter((r) => r.status === 'error').length;
  const parts = [`${count(converted, 'immagine convertita', 'immagini convertite')} in ${label}`];
  if (skipped) parts.push(`${skipped} già in ${label}, non ${skipped === 1 ? 'convertita' : 'convertite'}`);
  if (failed) parts.push(count(failed, 'non riuscita', 'non riuscite'));
  return parts.join(' · ');
}

export function ImageConversionResult({ target, results, onReset }: ImageConversionResultProps) {
  const converted = results.filter((r) => r.status === 'converted');
  const [zipping, setZipping] = useState(false);
  const ok = converted.length > 0;

  const download = async () => {
    if (converted.length === 1) {
      downloadBlob(converted[0]!.blob, converted[0]!.filename);
      return;
    }
    setZipping(true);
    try {
      downloadBlob(await createImagesZip(converted.map((r) => ({ name: r.filename, blob: r.blob }))), imagesZipFilename(target));
    } finally {
      setZipping(false);
    }
  };

  return (
    <Panel className="p-6 sm:p-8">
      <div className="flex flex-col gap-6" data-testid="conversion-card" data-status="done">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-muted">
            {ok ? <CircleCheck className="size-5 text-success" aria-hidden /> : <CircleAlert className="size-5 text-danger" aria-hidden />}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-medium text-fg">{ok ? 'Conversione completata' : 'Conversione non riuscita'}</h2>
            <p className="text-[13px] text-fg-muted" aria-live="polite" data-testid="result-summary">
              {summary(results, target)}
            </p>
          </div>
        </div>
        <ImageResultTable results={results} />
        <div className="flex flex-wrap gap-3">
          {ok && (
            <Button size="lg" onClick={download} disabled={zipping} icon={<Download className="size-[18px]" aria-hidden />}>
              {converted.length > 1 ? `Scarica ZIP (${converted.length} immagini)` : `Scarica ${FORMAT_INFO[target].label}`}
            </Button>
          )}
          <Button size="lg" variant="secondary" onClick={onReset} icon={<RotateCcw className="size-[18px]" aria-hidden />}>
            Converti altre immagini
          </Button>
        </div>
      </div>
    </Panel>
  );
}
