import { DARK_CHART_PALETTE, LIGHT_CHART_PALETTE } from '../lib/chart-generator/palette';
import type { ChartPalette } from '../models/chart';
import { useTheme } from './useTheme';

/** Colori del grafico in pagina, allineati al tema corrente. */
export const useChartPalette = (): ChartPalette => (useTheme().theme === 'dark' ? DARK_CHART_PALETTE : LIGHT_CHART_PALETTE);
