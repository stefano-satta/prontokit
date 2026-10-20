import { useMemo, type ReactNode } from 'react';
import { useChartPalette } from '../../../hooks/useChartPalette';
import { cn } from '../../../lib/cn';
import { tableFileBase } from '../../../lib/chart-generator/exportNames';
import { seriesColor } from '../../../lib/chart-generator/palette';
import { buildTableModel } from '../../../lib/chart-generator/tableModel';
import { buildTableSvg } from '../../../lib/chart-generator/tableSvg';
import { downloadFile } from '../../../lib/downloadFile';
import type { ChartSpec } from '../../../models/chart';
import { createTextMeasurer, rasterizeSvg } from '../../../services/chart/rasterizeSvg';
import { Panel } from '../../common/Panel';
import { ExportActions } from './ExportActions';
import { PreviewPlaceholder } from './PreviewPlaceholder';

interface DataTablePanelProps {
  spec: ChartSpec;
  blocker: string | null;
}

/** Tabella dei dati inseriti, esportabile come PNG o SVG vettoriale. */
export function DataTablePanel({ spec, blocker }: DataTablePanelProps) {
  const model = useMemo(() => buildTableModel(spec.kind, spec.rows, spec.pieFormat), [spec.kind, spec.rows, spec.pieFormat]);
  const exportSvg = () => buildTableSvg(model, spec.title, createTextMeasurer());
  const palette = useChartPalette();
  const alignClass = (align: 'left' | 'right') => (align === 'right' ? 'text-right tabular' : 'text-left');
  const { meter } = model;

  // Nella colonna della quota sul massimo la barra di avanzamento accompagna la percentuale
  const cellContent = (cell: string, r: number, c: number): ReactNode => {
    if (!meter || c !== meter.column) return cell;
    return (
      // Su mobile la barra va sotto la percentuale, così la tabella sta nei 375px senza scroll
      <span className="flex flex-col-reverse items-end gap-1.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        <span className="h-2 w-full min-w-12 shrink-0 overflow-hidden rounded-full bg-surface-muted sm:w-28 lg:w-40" aria-hidden>
          <span
            className="block h-full rounded-full"
            style={{ width: `${meter.fractions[r] * 100}%`, backgroundColor: seriesColor(palette, meter.colorIndexes[r]) }}
          />
        </span>
        <span className="sm:min-w-[3.75rem]">{cell}</span>
      </span>
    );
  };

  return (
    <Panel className="flex flex-col gap-6 p-6 sm:p-8" aria-labelledby="table-preview-title">
      <h2 id="table-preview-title" className="text-lg font-semibold tracking-[-0.01em]">
        Tabella dei dati
      </h2>

      {blocker ? (
        <PreviewPlaceholder message={blocker} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border" data-testid="table-preview">
          <table className="w-full border-collapse text-sm">
            {spec.title.trim() && <caption className="px-3 pt-4 pb-2 text-left sm:px-4 text-[15px] font-semibold text-fg">{spec.title.trim()}</caption>}
            <thead>
              <tr className="bg-surface-muted">
                {model.columns.map((column) => (
                  <th key={column.label} scope="col" className={cn('px-3 py-2.5 sm:px-4 font-semibold text-fg-muted', alignClass(column.align))}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {model.rows.map((cells, r) => (
                <tr key={r} className="border-t border-border">
                  {cells.map((cell, c) =>
                    c === 0 ? (
                      <th key={c} scope="row" className="px-3 py-2.5 sm:px-4 text-left font-normal break-words text-fg">
                        {cell}
                      </th>
                    ) : (
                      <td key={c} className={cn('px-3 py-2.5 sm:px-4 text-fg', alignClass(model.columns[c].align))}>
                        {cellContent(cell, r, c)}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
            {model.footer && (
              <tfoot>
                <tr className="border-t border-border-strong font-semibold">
                  {model.footer.map((cell, c) =>
                    c === 0 ? (
                      <th key={c} scope="row" className="px-3 py-2.5 sm:px-4 text-left text-fg">
                        {cell}
                      </th>
                    ) : (
                      <td key={c} className={cn('px-3 py-2.5 sm:px-4 text-fg', alignClass(model.columns[c].align))}>
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      <ExportActions
        subject="della tabella"
        disabled={blocker !== null}
        onDownloadPng={async () => {
          const { svg, width, height } = exportSvg();
          downloadFile(await rasterizeSvg(svg, width, height), `${tableFileBase(spec.title)}.png`);
        }}
        getSvg={() => exportSvg().svg}
      />
    </Panel>
  );
}
