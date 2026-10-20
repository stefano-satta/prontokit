import { ChartColumn } from 'lucide-react';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { TextField } from '../components/common/TextField';
import { ChartDataField } from '../components/features/chart-generator/ChartDataField';
import { ChartPreviewPanel } from '../components/features/chart-generator/ChartPreviewPanel';
import { ChartTypeTabs, TAB_PANEL_ID, tabId } from '../components/features/chart-generator/ChartTypeTabs';
import { DataTablePanel } from '../components/features/chart-generator/DataTablePanel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { chartBlocker, parseChartData } from '../lib/chart-generator/parseChartData';
import type { ChartSpec } from '../models/chart';

const SAMPLE_DATA = 'Gennaio;120\nFebbraio;98,5\nMarzo;143\nAprile;110\nMaggio;165';

type Settings = Omit<ChartSpec, 'title' | 'rows'>;

export default function ChartGeneratorPage() {
  useDocumentTitle('Generatore di grafici');
  const [title, setTitle] = useState('Vendite gennaio–maggio');
  const [data, setData] = useState(SAMPLE_DATA);
  const [settings, setSettings] = useState<Settings>({
    kind: 'bar',
    orientation: 'vertical',
    pieStyle: 'pie',
    pieFormat: { mode: 'percent', decimals: 1 },
  });

  // Titolo e dati sono condivisi tra le schede: cambiando tipo non si perde nulla
  const deferredData = useDeferredValue(data);
  const deferredTitle = useDeferredValue(title);
  const parsed = useMemo(() => parseChartData(deferredData), [deferredData]);
  const spec = useMemo<ChartSpec>(() => ({ ...settings, title: deferredTitle, rows: parsed.rows }), [settings, deferredTitle, parsed.rows]);
  const blocker = chartBlocker(spec.kind, spec.rows);
  const updateSpec = useCallback((patch: Partial<Settings>) => setSettings((current) => ({ ...current, ...patch })), []);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        icon={ChartColumn}
        title="Generatore di grafici"
        description="Scegli il tipo di grafico, scrivi i dati e guarda l’anteprima aggiornarsi. Scarica grafico e tabella in PNG o copiali in SVG."
      />

      <div className="flex flex-col gap-6">
        <ChartTypeTabs value={settings.kind} onChange={(kind) => updateSpec({ kind })} />

        <div id={TAB_PANEL_ID} role="tabpanel" aria-labelledby={tabId(settings.kind)} className="flex flex-col gap-6">
          <Panel className="p-6 sm:p-8">
            <form onSubmit={(event) => event.preventDefault()} noValidate className="flex flex-col gap-6">
              <TextField
                label="Titolo"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Es. Vendite del primo semestre"
                maxLength={120}
                optional
              />
              <ChartDataField value={data} onChange={setData} parsed={parsed} />
            </form>
          </Panel>

          <ChartPreviewPanel spec={spec} blocker={blocker} onSpecChange={updateSpec} />
          <DataTablePanel spec={spec} blocker={blocker} />
        </div>
      </div>
    </div>
  );
}
