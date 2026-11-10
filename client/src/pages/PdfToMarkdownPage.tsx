import { FileDropzone } from '../components/common/FileDropzone';
import { UtilityPageHeader } from '../components/common/UtilityPageHeader';
import { Panel } from '../components/common/Panel';
import { PrivacyNote } from '../components/common/PrivacyNote';
import { ConversionCard } from '../components/features/pdf-markdown/ConversionCard';
import { MarkdownPreview } from '../components/features/pdf-markdown/MarkdownPreview';
import { usePdfConversion } from '../hooks/usePdfConversion';
import { formatBytes } from '../lib/formatBytes';
import { MAX_PDF_BYTES } from '../lib/validatePdf';

export default function PdfToMarkdownPage() {
  const { state, convert, submitPassword, reset } = usePdfConversion();

  return (
    <div className="flex flex-col gap-10">
      <UtilityPageHeader
        utilityId="pdf-markdown"
        description="Carica un PDF e ottieni un file Markdown pulito, pronto da dare in pasto a ChatGPT, Claude o al tuo LLM: titoli, paragrafi ed elenchi ricostruiti, intestazioni e numeri di pagina ripetuti rimossi."
      >
        <PrivacyNote />
      </UtilityPageHeader>
      <Panel className="p-6 sm:p-8">
        {state.status === 'idle' ? (
          <FileDropzone
            accept="application/pdf,.pdf"
            title="Trascina qui il tuo PDF"
            hint={`oppure sceglilo dal dispositivo · massimo ${formatBytes(MAX_PDF_BYTES)}`}
            onFile={convert}
          />
        ) : (
          <ConversionCard state={state} onPassword={submitPassword} onReset={reset} />
        )}
      </Panel>
      {state.status === 'done' && <MarkdownPreview markdown={state.result.markdown} />}
    </div>
  );
}
