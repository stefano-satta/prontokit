import { FileSignature, Info } from 'lucide-react';
import { useMemo } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { PrivacyNote } from '../components/common/PrivacyNote';
import { AppearanceSection } from '../components/features/quote/AppearanceSection';
import { ConditionsSection } from '../components/features/quote/ConditionsSection';
import { toFieldErrors } from '../components/features/quote/fieldErrors';
import { LineItemsSection } from '../components/features/quote/LineItemsSection';
import { PartySection } from '../components/features/quote/PartySection';
import { QuoteDetailsSection } from '../components/features/quote/QuoteDetailsSection';
import { QuotePreviewPanel } from '../components/features/quote/QuotePreviewPanel';
import { TotalsSection } from '../components/features/quote/TotalsSection';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useQuote } from '../hooks/useQuote';
import { useQuoteLogo } from '../hooks/useQuoteLogo';
import { useQuotePdf } from '../hooks/useQuotePdf';

export default function QuoteGeneratorPage() {
  useDocumentTitle('Generatore di preventivi');
  const { quote, totals, issues, setField, setPartyField, setLineField, addLine, removeLine, moveLine } = useQuote();
  const logo = useQuoteLogo();
  const { preview, download, downloading, downloadError } = useQuotePdf(quote, totals, logo.logo);
  const errors = useMemo(() => toFieldErrors(issues), [issues]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <PageHeader
          icon={FileSignature}
          title="Generatore di preventivi"
          description="Compila i dati, aggiungi le voci e guarda il PDF prendere forma: imponibile, IVA e totale si calcolano da soli."
        />
        <PrivacyNote
          title="I dati non lasciano il tuo dispositivo."
          description="Il PDF si crea nel browser e niente viene salvato: chiudendo la pagina il preventivo si perde, quindi scaricalo prima di uscire."
        />
        <p className="flex items-start gap-3 px-1 text-[13px] text-fg-muted">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          Un preventivo è un'offerta, non una fattura: non ha valore fiscale e non va inviato al Sistema di Interscambio.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
        <form onSubmit={(event) => event.preventDefault()} noValidate className="flex min-w-0 flex-col gap-6" aria-label="Dati del preventivo">
          <QuoteDetailsSection quote={quote} errors={errors} onChange={setField} />
          <PartySection role="supplier" party={quote.supplier} errors={errors} onChange={setPartyField} />
          <PartySection role="client" party={quote.client} errors={errors} onChange={setPartyField} />
          <LineItemsSection
            lines={quote.lines}
            totals={totals.lines}
            currency={quote.currency}
            errors={errors}
            onChange={setLineField}
            onAdd={addLine}
            onRemove={removeLine}
            onMove={moveLine}
          />
          <TotalsSection quote={quote} totals={totals} errors={errors} onChange={setField} />
          <ConditionsSection quote={quote} errors={errors} onChange={setField} />
          <AppearanceSection
            logo={logo.logo}
            logoError={logo.error}
            logoLoading={logo.loading}
            onLogo={logo.choose}
            onRemoveLogo={logo.remove}
            accentColor={quote.accentColor}
            onAccentColor={(id) => setField('accentColor', id)}
          />
        </form>
        <QuotePreviewPanel
          preview={preview}
          issues={issues}
          onDownload={download}
          downloading={downloading}
          downloadError={downloadError}
          className="lg:sticky lg:top-24"
        />
      </div>
    </div>
  );
}
