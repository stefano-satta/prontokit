import { PDFDocument, StandardFonts } from 'pdf-lib';

/** PDF di prova con titoli, paragrafi, elenco, parola sillabata e intestazione/piè di pagina ripetuti. */
export async function createSamplePdf(): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.setTitle('Guida di prova');
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  for (let n = 1; n <= 3; n++) {
    const page = pdf.addPage([595, 842]);
    page.drawText('Documento interno ACME', { x: 50, y: 810, size: 9, font: regular });
    page.drawText(`Pagina ${n} di 3`, { x: 260, y: 25, size: 9, font: regular });
    if (n === 1) {
      page.drawText('Guida di prova', { x: 50, y: 740, size: 24, font: bold });
      page.drawText('Introduzione', { x: 50, y: 700, size: 16, font: bold });
      page.drawText('Questa guida spiega la conver-', { x: 50, y: 675, size: 11, font: regular });
      page.drawText('sione dei documenti in Markdown.', { x: 50, y: 661, size: 11, font: regular });
      page.drawText('- primo punto', { x: 50, y: 630, size: 11, font: regular });
      page.drawText('- secondo punto', { x: 50, y: 616, size: 11, font: regular });
    } else {
      page.drawText(`Capitolo ${n}`, { x: 50, y: 740, size: 16, font: bold });
      page.drawText(`Contenuto specifico del capitolo numero ${n}.`, { x: 50, y: 715, size: 11, font: regular });
    }
  }
  return Buffer.from(await pdf.save());
}

/** PDF valido ma senza testo, come una scansione. */
export async function createBlankPdf(): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.addPage([595, 842]);
  return Buffer.from(await pdf.save());
}

/** PDF con `count` pagine, ognuna con il proprio testo, per verificare ordine e numero di pagine. */
export async function createPagedPdf(label: string, count: number): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let n = 1; n <= count; n++) pdf.addPage([595, 842]).drawText(`${label} ${n}`, { x: 50, y: 780, size: 14, font });
  return Buffer.from(await pdf.save());
}

/**
 * PDF che dichiara la cifratura nel trailer (`/Encrypt`), come un file protetto da password
 * o con restrizioni. pdf-lib non sa cifrare: basta il dizionario per farlo riconoscere come protetto.
 */
export async function createProtectedPdf(): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.addPage([595, 842]);
  pdf.context.trailerInfo.Encrypt = pdf.context.register(pdf.context.obj({ Filter: 'Standard', V: 1, R: 2, P: -44 }));
  return Buffer.from(await pdf.save({ useObjectStreams: false }));
}
