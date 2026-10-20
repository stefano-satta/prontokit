import { ArrowRight, Download } from 'lucide-react';
import { buttonClasses } from '../../common/Button';
import { formatBytes } from '../../../lib/formatBytes';
import { FORMAT_INFO } from '../../../lib/image-converter/imageFormats';
import type { ImageResult } from '../../../models/imageConverter';
import { ImageThumbnail } from './ImageThumbnail';

const percent = new Intl.NumberFormat('it-IT', { style: 'percent', maximumFractionDigits: 0, signDisplay: 'exceptZero' });

function FormatCell({ result }: { result: ImageResult }) {
  const source = FORMAT_INFO[result.sourceFormat].label;
  if (result.status === 'skipped') return <span>Già {source}, non convertita</span>;
  if (result.status === 'error') return <span>{source} · non convertita</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      {source}
      <ArrowRight className="size-3.5 text-fg-muted" aria-label="convertito in" />
      <span className="font-semibold">{FORMAT_INFO[result.outputFormat].label}</span>
    </span>
  );
}

function SizeCell({ result }: { result: ImageResult }) {
  if (result.status !== 'converted') return <span>{formatBytes(result.sourceSize)}</span>;
  const change = result.blob.size / result.sourceSize - 1;
  return (
    <span className="flex flex-col">
      <span className="font-medium text-fg">{formatBytes(result.blob.size)}</span>
      <span className="text-[13px] text-fg-muted">
        da {formatBytes(result.sourceSize)} ({percent.format(change)})
      </span>
    </span>
  );
}

/** Esito per immagine: miniatura, nome, formato di partenza e di arrivo, peso e download singolo. */
export function ImageResultTable({ results }: { results: readonly ImageResult[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full table-fixed border-collapse text-left text-sm" data-testid="result-table">
        <caption className="sr-only">Immagini convertite</caption>
        <thead className="bg-surface-muted text-[13px] text-fg-muted">
          <tr>
            <th scope="col" className="w-[4.5rem] px-3 py-2.5 font-medium">
              <span className="sr-only">Anteprima</span>
            </th>
            <th scope="col" className="px-3 py-2.5 font-medium">
              File
            </th>
            <th scope="col" className="hidden w-48 px-3 py-2.5 font-medium sm:table-cell">
              Formato
            </th>
            <th scope="col" className="hidden w-40 px-3 py-2.5 font-medium sm:table-cell">
              Peso
            </th>
            <th scope="col" className="w-16 px-3 py-2.5 font-medium">
              <span className="sr-only">Download</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {results.map((result) => (
            <tr key={result.id} data-testid="result-row" data-status={result.status} className="align-middle">
              <td className="px-3 py-3">
                <ImageThumbnail src={result.status === 'error' ? undefined : result.url} />
              </td>
              <td className="px-3 py-3">
                <p className="truncate font-medium text-fg" title={result.fileName}>
                  {result.status === 'converted' ? result.filename : result.fileName}
                </p>
                {result.status === 'converted' && (
                  <p className="truncate text-[13px] text-fg-muted" title={result.fileName}>
                    da {result.fileName}
                  </p>
                )}
                <div className="mt-1 flex flex-col gap-0.5 text-[13px] text-fg-muted sm:hidden">
                  <FormatCell result={result} />
                  <span className="tabular">
                    {result.status === 'converted'
                      ? `${formatBytes(result.blob.size)} · da ${formatBytes(result.sourceSize)}`
                      : formatBytes(result.sourceSize)}
                  </span>
                </div>
                {result.status === 'error' && <p className="mt-1 text-[13px] font-medium text-danger">{result.message}</p>}
                {result.status === 'converted' && result.animated && (
                  <p className="mt-1 text-[13px] text-fg-muted">Immagine animata: è stato convertito solo il primo fotogramma.</p>
                )}
              </td>
              <td className="hidden px-3 py-3 text-fg sm:table-cell" data-testid="result-format">
                <FormatCell result={result} />
              </td>
              <td className="tabular hidden px-3 py-3 text-fg-muted sm:table-cell" data-testid="result-size">
                <SizeCell result={result} />
              </td>
              <td className="px-3 py-3 text-right">
                {result.status === 'converted' && (
                  <a
                    href={result.url}
                    download={result.filename}
                    className={buttonClasses('ghost', 'md', 'size-10 px-0')}
                    aria-label={`Scarica ${result.filename}`}
                  >
                    <Download className="size-[18px]" aria-hidden />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
