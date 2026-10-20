import { useCallback, useEffect, useRef, useState } from 'react';
import { validatePdf } from '../lib/validatePdf';
import type { PdfConversionState } from '../models/pdf';
import { PdfPasswordError } from '../services/pdf/pdfTextExtractor';
import { convertPdfToMarkdown, PdfNoTextError } from '../services/pdf/pdfToMarkdown';

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
  const abortRef = useRef<AbortController | null>(null);

  const cancelRunning = () => {
    abortRef.current?.abort();
    abortRef.current = null;
  };

  const run = useCallback(async (file: File, password?: string) => {
    cancelRunning();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ status: 'converting', fileName: file.name, progress: null });

    try {
      const result = await convertPdfToMarkdown(file, {
        password,
        signal: controller.signal,
        onProgress: (progress) => {
          if (!controller.signal.aborted) setState({ status: 'converting', fileName: file.name, progress });
        },
      });
      if (controller.signal.aborted) return;
      fileRef.current = null;
      setState({ status: 'done', fileName: file.name, result });
    } catch (error) {
      if (controller.signal.aborted) return;
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
      cancelRunning();
      const validation = await validatePdf(file);
      if (!validation.ok) {
        fileRef.current = null;
        setState({ status: 'error', fileName: file.name, code: validation.code, message: validation.message });
        return;
      }
      fileRef.current = file;
      await run(file);
    },
    [run],
  );

  const submitPassword = useCallback(
    (password: string) => {
      if (fileRef.current) void run(fileRef.current, password);
    },
    [run],
  );

  const reset = useCallback(() => {
    cancelRunning();
    fileRef.current = null;
    setState({ status: 'idle' });
  }, []);

  useEffect(() => cancelRunning, []);

  return { state, convert, submitPassword, reset };
};
