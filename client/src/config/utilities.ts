import { ChartColumn, Combine, FileDiff, FileSignature, FileSpreadsheet, FileText, ImageUp, KeyRound, Link2, Mic, QrCode, Tags } from 'lucide-react';
import { ChartGeneratorPreview } from '../components/features/chart-generator/ChartGeneratorPreview';
import { ExcelCsvPreview } from '../components/features/excel-csv/ExcelCsvPreview';
import { ImageConverterPreview } from '../components/features/image-converter/ImageConverterPreview';
import { JsonDiffPreview } from '../components/features/json-diff/JsonDiffPreview';
import { MetaTagsPreview } from '../components/features/meta-tags/MetaTagsPreview';
import { PdfMarkdownPreview } from '../components/features/pdf-markdown/PdfMarkdownPreview';
import { PasswordGeneratorPreview } from '../components/features/password-generator/PasswordGeneratorPreview';
import { PdfMergePreview } from '../components/features/pdf-merge/PdfMergePreview';
import { QrPreview } from '../components/features/qr/QrPreview';
import { QuoteGeneratorPreview } from '../components/features/quote/QuoteGeneratorPreview';
import { ShortUrlPreview } from '../components/features/short-url/ShortUrlPreview';
import { SpeechToTextPreview } from '../components/features/speech-to-text/SpeechToTextPreview';
import type { Utility } from '../models/utility';

/**
 * Unica fonte di verità delle utility: navbar, home e router leggono da qui.
 * Per aggiungere una utility basta aggiungere una voce.
 */
const ALL_UTILITIES: readonly Utility[] = [
  {
    id: 'quote-generator',
    path: '/quote-generator',
    navLabel: 'Preventivi',
    title: 'Generatore di preventivi',
    description: 'Crea un preventivo con voci, sconti e IVA calcolati da soli, con il tuo logo e i tuoi colori. Scaricalo in PDF.',
    icon: FileSignature,
    preview: QuoteGeneratorPreview,
    loadPage: () => import('../pages/QuoteGeneratorPage'),
  },
  {
    id: 'qr-code',
    path: '/qr-code',
    navLabel: 'QR code',
    title: 'Generatore di QR code',
    description: 'Incolla un link e ottieni un QR code pronto da stampare o condividere, in PNG o SVG.',
    icon: QrCode,
    preview: QrPreview,
    loadPage: () => import('../pages/QrCodePage'),
  },
  {
    id: 'short-url',
    path: '/short-url',
    navLabel: 'Short URL',
    title: 'Short URL',
    description: 'Trasforma un link lungo in uno breve, con alias personalizzato facoltativo.',
    icon: Link2,
    preview: ShortUrlPreview,
    loadPage: () => import('../pages/ShortUrlPage'),
    // Serve il backend (archiviato fuori dal progetto): il sito per ora è solo frontend
    enabled: false,
  },
  {
    id: 'pdf-markdown',
    path: '/pdf-markdown',
    navLabel: 'PDF → Markdown',
    title: 'PDF in Markdown',
    description: 'Converti un PDF in Markdown ottimizzato per gli LLM.',
    icon: FileText,
    preview: PdfMarkdownPreview,
    loadPage: () => import('../pages/PdfToMarkdownPage'),
  },
  {
    id: 'excel-csv',
    path: '/excel-csv',
    navLabel: 'Excel → CSV',
    title: 'Excel in CSV',
    description: 'Converti i fogli di un file Excel in CSV con i valori finali, senza formule.',
    icon: FileSpreadsheet,
    preview: ExcelCsvPreview,
    loadPage: () => import('../pages/ExcelToCsvPage'),
  },
  {
    id: 'speech-to-text',
    path: '/speech-to-text',
    navLabel: 'Voce → Testo',
    title: 'Trascrizione vocale',
    description: 'Parla e guarda il testo comparire mentre detti, in italiano, inglese, francese o spagnolo. Poi correggilo e scaricalo in .txt.',
    icon: Mic,
    preview: SpeechToTextPreview,
    loadPage: () => import('../pages/SpeechToTextPage'),
  },
  {
    id: 'chart-generator',
    path: '/chart-generator',
    navLabel: 'Grafici',
    title: 'Generatore di grafici',
    description: 'Crea grafici a barre, a torta o a linee da un elenco di etichette e valori. Scarica grafico e tabella in PNG o copiali in SVG.',
    icon: ChartColumn,
    preview: ChartGeneratorPreview,
    loadPage: () => import('../pages/ChartGeneratorPage'),
  },
  {
    id: 'json-diff',
    path: '/json-diff',
    navLabel: 'JSON diff',
    title: 'Confronto JSON',
    description: 'Confronta due JSON e trova le righe diverse e gli errori di sintassi. Formatta o minifica, poi scarica o copia il risultato.',
    icon: FileDiff,
    preview: JsonDiffPreview,
    loadPage: () => import('../pages/JsonDiffPage'),
  },
  {
    id: 'image-converter',
    path: '/image-converter',
    navLabel: 'Immagini',
    title: 'Convertitore di immagini',
    description: 'Converti fino a 5 immagini JPG, PNG, WebP, AVIF o BMP in PNG, JPG o WebP.',
    icon: ImageUp,
    preview: ImageConverterPreview,
    loadPage: () => import('../pages/ImageConverterPage'),
  },
  {
    id: 'pdf-merge',
    path: '/pdf-merge',
    navLabel: 'Unisci PDF',
    title: 'Unisci PDF',
    description: 'Unisci fino a 5 PDF in un unico file, nell’ordine che scegli.',
    icon: Combine,
    preview: PdfMergePreview,
    loadPage: () => import('../pages/PdfMergePage'),
  },
  {
    id: 'password-generator',
    path: '/password-generator',
    navLabel: 'Password',
    title: 'Generatore di password',
    description: 'Crea password casuali da 10 a 30 caratteri e scopri subito se sono deboli, accettabili o forti.',
    icon: KeyRound,
    preview: PasswordGeneratorPreview,
    loadPage: () => import('../pages/PasswordGeneratorPage'),
  },
  {
    id: 'meta-tags',
    path: '/meta-tags',
    navLabel: 'Meta tag SEO',
    title: 'Generatore di meta tag SEO',
    description: 'Inserisci titolo, descrizione, Open Graph e card di X e copia i meta tag HTML pronti per il <head>.',
    icon: Tags,
    preview: MetaTagsPreview,
    loadPage: () => import('../pages/MetaTagsPage'),
  },
];

/** Utility attive: le disattivate non compaiono in navbar e home e non hanno una route. */
export const UTILITIES: readonly Utility[] = ALL_UTILITIES.filter(({ enabled = true }) => enabled);
