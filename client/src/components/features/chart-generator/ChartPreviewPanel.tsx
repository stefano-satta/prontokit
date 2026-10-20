import { Chart as ReactChart } from 'react-chartjs-2';
import { useMemo } from 'react';
import { useChartPalette } from '../../../hooks/useChartPalette';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion';
import { buildChartConfig, describeChart } from '../../../lib/chart-generator/chartConfig';
import { chartFileBase, svgFromPng } from '../../../lib/chart-generator/exportNames';
import { downloadFile } from '../../../lib/downloadFile';
import type { ChartSpec } from '../../../models/chart';
import { EXPORT_HEIGHT, EXPORT_WIDTH, renderChartPng } from '../../../services/chart/chartExport';
import '../../../services/chart/chartSetup';
import { Panel } from '../../common/Panel';
import { ChartOptions } from './ChartOptions';
import { ExportActions } from './ExportActions';
import { DataLegend } from './DataLegend';
import { PreviewPlaceholder } from './PreviewPlaceholder';

interface ChartPreviewPanelProps {
  spec: ChartSpec;
  blocker: string | null;
  onSpecChange: (patch: Partial<ChartSpec>) => void;
}

export function ChartPreviewPanel({ spec, blocker, onSpecChange }: ChartPreviewPanelProps) {
  const palette = useChartPalette();
  const reducedMotion = usePrefersReducedMotion();
  const config = useMemo(() => buildChartConfig(spec, palette, !reducedMotion), [spec, palette, reducedMotion]);
  // Plugin e asse principale non si aggiornano bene in corsa: si ricrea il grafico quando cambiano tipo, asse, formato o tema
  const chartKey = [config.type, spec.orientation, spec.pieFormat.mode, spec.pieFormat.decimals, palette.surface].join('|');

  return (
    <Panel className="flex flex-col gap-6 p-6 sm:p-8" aria-labelledby="chart-preview-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 id="chart-preview-title" className="text-lg font-semibold tracking-[-0.01em]">
          Anteprima del grafico
        </h2>
        <ChartOptions spec={spec} onSpecChange={onSpecChange} />
      </div>

      {blocker ? (
        <PreviewPlaceholder message={blocker} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(13rem,18rem)] md:items-center">
          <div className="relative h-[340px] w-full sm:h-[420px]" data-testid="chart-preview">
            <ReactChart
              key={chartKey}
              type={config.type}
              data={config.data}
              options={config.options}
              plugins={config.plugins}
              role="img"
              aria-label={describeChart(spec)}
            />
          </div>
          <DataLegend spec={spec} palette={palette} />
        </div>
      )}

      <ExportActions
        subject="del grafico"
        disabled={blocker !== null}
        onDownloadPng={() => downloadFile(renderChartPng(spec), `${chartFileBase(spec.title, spec.kind)}.png`)}
        getSvg={() => svgFromPng(renderChartPng(spec), EXPORT_WIDTH, EXPORT_HEIGHT, spec.title)}
      />
    </Panel>
  );
}
