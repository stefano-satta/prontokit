import { buildChartConfig, dataLegendPlugin, LEGEND_WIDTH, surfacePlugin } from '../../lib/chart-generator/chartConfig';
import { LIGHT_CHART_PALETTE } from '../../lib/chart-generator/palette';
import type { ChartSpec } from '../../models/chart';
import { Chart } from './chartSetup';

export const EXPORT_WIDTH = 1200;
export const EXPORT_HEIGHT = 750;
const EXPORT_SCALE = 2;

/**
 * Ridisegna il grafico fuori schermo a dimensione fissa e in tema chiaro,
 * così il file non dipende dalla finestra né dal tema scelto.
 */
export const renderChartPng = (spec: ChartSpec): string => {
  const canvas = document.createElement('canvas');
  canvas.width = EXPORT_WIDTH * EXPORT_SCALE;
  canvas.height = EXPORT_HEIGHT * EXPORT_SCALE;
  const config = buildChartConfig(spec, LIGHT_CHART_PALETTE, false);
  // La legenda a destra c'è per tutti i tipi, come in pagina
  const padding = { top: 32, left: 32, bottom: 32, right: LEGEND_WIDTH + 32 };
  const chart = new Chart(canvas, {
    ...config,
    options: { ...config.options, responsive: false, devicePixelRatio: EXPORT_SCALE, layout: { padding } },
    plugins: [
      ...(config.plugins ?? []),
      dataLegendPlugin(spec, LIGHT_CHART_PALETTE),
      surfacePlugin(LIGHT_CHART_PALETTE.surface),
    ],
  });
  canvas.style.width = `${EXPORT_WIDTH}px`;
  canvas.style.height = `${EXPORT_HEIGHT}px`;
  chart.resize(EXPORT_WIDTH, EXPORT_HEIGHT);
  try {
    return chart.toBase64Image('image/png');
  } finally {
    chart.destroy();
  }
};
