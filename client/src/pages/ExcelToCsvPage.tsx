import { FileSpreadsheet } from 'lucide-react';
import { FileDropzone } from '../components/common/FileDropzone';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { PrivacyNote } from '../components/common/PrivacyNote';
import { ExcelResult } from '../components/features/excel-csv/ExcelResult';
import { ExcelStatusCard } from '../components/features/excel-csv/ExcelStatusCard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useExcelConversion } from '../hooks/useExcelConversion';
import { formatBytes } from '../lib/formatBytes';
import { MAX_SPREADSHEET_BYTES, SPREADSHEET_ACCEPT } from '../lib/validateSpreadsheet';

export default function ExcelToCsvPage() {
  useDocumentTitle('Excel in CSV');
  const { state, convert, reset } = useExcelConversion();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        icon={FileSpreadsheet}
        title="Excel in CSV"
        description="Carica un file Excel, scegli quale foglio convertire e scarica in formato CSV."
      />
      <PrivacyNote />
      {state.status === 'ready' ? (
        <ExcelResult key={state.fileName} fileName={state.fileName} workbook={state.workbook} onReset={reset} />
      ) : (
        <Panel className="p-6 sm:p-8">
          {state.status === 'idle' ? (
            <FileDropzone
              accept={SPREADSHEET_ACCEPT}
              title="Trascina qui il tuo file Excel"
              hint={`.xlsx, .xlsm, .xlsb, .xls o .ods · massimo ${formatBytes(MAX_SPREADSHEET_BYTES)}`}
              onFile={convert}
            />
          ) : (
            <ExcelStatusCard state={state} onReset={reset} />
          )}
        </Panel>
      )}
    </div>
  );
}
