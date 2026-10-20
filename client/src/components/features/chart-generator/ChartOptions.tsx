import type { BarOrientation, ChartSpec, PieDecimals, PieStyle, PieValueMode } from '../../../models/chart';
import { SegmentedControl } from '../../common/SegmentedControl';

const ORIENTATIONS = [
  { value: 'vertical', label: 'Verticali' },
  { value: 'horizontal', label: 'Orizzontali' },
] as const satisfies readonly { value: BarOrientation; label: string }[];

const PIE_STYLES = [
  { value: 'pie', label: 'Torta' },
  { value: 'doughnut', label: 'Ciambella' },
] as const satisfies readonly { value: PieStyle; label: string }[];

const VALUE_MODES = [
  { value: 'value', label: 'Valore' },
  { value: 'percent', label: 'Percentuale' },
] as const satisfies readonly { value: PieValueMode; label: string }[];

const DECIMALS = [
  { value: 1, label: '1 cifra' },
  { value: 2, label: '2 cifre' },
] as const satisfies readonly { value: PieDecimals; label: string }[];

interface ChartOptionsProps {
  spec: ChartSpec;
  onSpecChange: (patch: Partial<ChartSpec>) => void;
}

/** Opzioni specifiche del tipo di grafico: orientamento per le barre, stile e formato per la torta. */
export function ChartOptions({ spec, onSpecChange }: ChartOptionsProps) {
  if (spec.kind === 'bar') {
    return (
      <SegmentedControl
        legend="Barre"
        options={ORIENTATIONS}
        value={spec.orientation}
        onChange={(orientation) => onSpecChange({ orientation })}
      />
    );
  }
  if (spec.kind === 'pie') {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-6">
        <SegmentedControl legend="Stile" options={PIE_STYLES} value={spec.pieStyle} onChange={(pieStyle) => onSpecChange({ pieStyle })} />
        <SegmentedControl
          legend="Mostra"
          options={VALUE_MODES}
          value={spec.pieFormat.mode}
          onChange={(mode) => onSpecChange({ pieFormat: { ...spec.pieFormat, mode } })}
        />
        <SegmentedControl
          legend="Decimali"
          options={DECIMALS}
          value={spec.pieFormat.decimals}
          onChange={(decimals) => onSpecChange({ pieFormat: { ...spec.pieFormat, decimals } })}
        />
      </div>
    );
  }
  return null;
}
