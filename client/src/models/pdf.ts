/** Frammento di testo estratto da una pagina, in coordinate PDF (origine in basso a sinistra). */
export interface PdfTextFragment {
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
}

export interface PdfPageText {
  pageNumber: number;
  height: number;
  fragments: PdfTextFragment[];
}

export interface PdfDocumentText {
  title: string | null;
  pageCount: number;
  pages: PdfPageText[];
}

export interface MarkdownStats {
  pages: number;
  words: number;
  /** Stima grossolana: ~4 caratteri per token */
  approxTokens: number;
}

export interface MarkdownResult {
  markdown: string;
  filename: string;
  stats: MarkdownStats;
}

export interface ConversionProgress {
  page: number;
  total: number;
}

export type PdfConversionErrorCode = 'invalid-file' | 'too-large' | 'password' | 'no-text' | 'unreadable';

export type PdfConversionState =
  | { status: 'idle' }
  | { status: 'converting'; fileName: string; progress: ConversionProgress | null }
  | { status: 'password'; fileName: string; incorrect: boolean }
  | { status: 'done'; fileName: string; result: MarkdownResult }
  | { status: 'error'; fileName: string | null; code: PdfConversionErrorCode; message: string };
