import { useCallback, useEffect, useRef, useState } from 'react';
import { validateSpreadsheet } from '../lib/validateSpreadsheet';
import type { ExcelConversionErrorCode, ExcelConversionState } from '../models/excel';
import { ExcelConversionError, convertSpreadsheet } from '../services/excel/excelWorkerClient';

const MESSAGES: Record<Exclude<ExcelConversionErrorCode, 'invalid-file' | 'too-large'>, string> = {
  password:
    'Il file è protetto da password. Aprilo in Excel, rimuovi la protezione (File › Informazioni › Proteggi cartella di lavoro) e riprova.',
  'no-data': 'Il file non contiene dati: tutti i fogli sono vuoti. Controlla di aver scelto il file giusto.',
  'too-much-data':
    'Il file contiene troppe celle per essere convertito nel browser. Dividi i dati in più file o elimina righe e colonne inutilizzate.',
  unreadable:
    'Non riesco a leggere questo file: potrebbe essere danneggiato o non essere un foglio di calcolo. Prova ad aprirlo e salvarlo di nuovo in Excel.',
};

const errorState = (fileName: string, error: unknown): ExcelConversionState => {
  const code = error instanceof ExcelConversionError ? error.code : 'unreadable';
  return { status: 'error', fileName, code, message: MESSAGES[code] };
};

/**
 * Ciclo di vita della conversione Excel → CSV.
 * Il file resta solo in memoria: niente upload, niente salvataggi; viene rilasciato su reset e allo smontaggio.
 */
export const useExcelConversion = () => {
  const [state, setState] = useState<ExcelConversionState>({ status: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  const cancelRunning = () => {
    abortRef.current?.abort();
    abortRef.current = null;
  };

  const convert = useCallback(async (file: File) => {
    cancelRunning();
    const controller = new AbortController();
    abortRef.current = controller;

    const validation = await validateSpreadsheet(file);
    if (controller.signal.aborted) return;
    if (!validation.ok) {
      setState({ status: 'error', fileName: file.name, code: validation.code, message: validation.message });
      return;
    }

    setState({ status: 'converting', fileName: file.name });
    try {
      const workbook = await convertSpreadsheet(file, validation.container, controller.signal);
      if (!controller.signal.aborted) setState({ status: 'ready', fileName: file.name, workbook });
    } catch (error) {
      if (!controller.signal.aborted) setState(errorState(file.name, error));
    }
  }, []);

  const reset = useCallback(() => {
    cancelRunning();
    setState({ status: 'idle' });
  }, []);

  useEffect(() => cancelRunning, []);

  return { state, convert, reset };
};
