/**
 * Cerca il dizionario `/Encrypt` nel trailer o nel dizionario dello stream xref.
 * Serve quando il parser non riesce a leggere il file: in un PDF cifrato anche gli
 * object stream sono cifrati, quindi l'errore può arrivare prima del controllo sulla cifratura.
 */
export const hasEncryptEntry = (pdfText: string): boolean => /\/Encrypt\s*(?:\d+\s+\d+\s+R|<<)/.test(pdfText);
