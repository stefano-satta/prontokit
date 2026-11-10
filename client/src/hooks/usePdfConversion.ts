import { useCallback, useRef, useState } from 'react';
import { validatePdf } from '../lib/validatePdf';
import type { PdfConversionState } from '../models/pdf';
import { PdfPasswordError } from '../services/pdf/pdfTextExtractor';
import { convertPdfToMarkdown, PdfNoTextError } from '../services/pdf/pdfToMarkdown';
import { useLatestTask } from './useLatestTask';

const errorState = (fileName: string, error: unknown): PdfConversionState => {
  if (error instanceof PdfNoTextError) {
    return {
      status: 'error',
      fileName,
      code: 'no-text',
      message: 'Il PDF non contiene testo selezionabile: probabilmente è una scansione o un\'immagine.',
    };
  }
  return {
    status: 'error',
    fileName,
    code: 'unreadable',
    message: 'Non riesco a leggere questo PDF: potrebbe essere danneggiato o in un formato non supportato.',
  };
};

/**
 * Gestisce il ciclo di vita della conversione PDF → Markdown.
 * Il file resta solo in memoria: viene rilasciato a fine conversione, su reset e allo smontaggio.
 */
export const usePdfConversion = () => {
  const [state, setState] = useState<PdfConversionState>({ status: 'idle' });
  const fileRef = useRef<File | null>(null);
  const task = useLatestTask();

  const run = useCallback(async (file: File, signal: AbortSignal, password?: string) => {
    setState({ status: 'converting', fileName: file.name, progress: null });

    try {
      const result = await convertPdfToMarkdown(file, {
        password,
        signal,
        onProgress: (progress) => {
          if (!signal.aborted) setState({ status: 'converting', fileName: file.name, progress });
        },
      });
      if (signal.aborted) return;
      fileRef.current = null;
      setState({ status: 'done', fileName: file.name, result });
    } catch (error) {
      if (signal.aborted) return;
      if (error instanceof PdfPasswordError) {
        setState({ status: 'password', fileName: file.name, incorrect: error.incorrect });
        return;
      }
      fileRef.current = null;
      setState(errorState(file.name, error));
    }
  }, []);

  const convert = useCallback(
    async (file: File) => {
      // Il segnale nasce prima della validazione: un file scelto subito dopo scarta questo, anche se finisce prima
      const signal = task.start();
      const validation = await validatePdf(file);
      if (signal.aborted) return;
      if (!validation.ok) {
        fileRef.current = null;
        setState({ status: 'error', fileName: file.name, code: validation.code, message: validation.message });
        return;
      }
      fileRef.current = file;
      await run(file, signal);
    },
    [run, task],
  );

  const submitPassword = useCallback(
    (password: string) => {
      if (fileRef.current) void run(fileRef.current, task.start(), password);
    },
    [run, task],
  );

  const reset = useCallback(() => {
    task.cancel();
    fileRef.current = null;
    setState({ status: 'idle' });
  }, [task]);

  return { state, convert, submitPassword, reset };
};
