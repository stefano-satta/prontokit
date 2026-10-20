import type { PDFDocument } from 'pdf-lib';

export type PdfRejectReason = 'empty' | 'too-large' | 'invalid' | 'protected' | 'unreadable';

export interface SelectedPdf {
  id: string;
  file: File;
  pageCount: number;
  /** Documento già analizzato: all'unione non serve rileggerlo */
  document: PDFDocument;
}

export interface MergedPdf {
  blob: Blob;
  filename: string;
  fileCount: number;
  pageCount: number;
}

export type PdfMergePhase =
  | { status: 'selecting' }
  | { status: 'merging' }
  | { status: 'done'; result: MergedPdf }
  | { status: 'error'; message: string };
