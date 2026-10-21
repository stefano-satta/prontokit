/** Caratteri di WinAnsi (font standard dei PDF) fuori dal Latin-1: virgolette tipografiche, €, trattini... */
const WIN_ANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ');

/** Sostituti leggibili per i caratteri comuni che il font standard non ha. */
const REPLACEMENTS: Record<string, string> = {
  ' ': ' ',
  ' ': ' ',
  ' ': ' ',
  '​': '',
  '‐': '-',
  '‑': '-',
  '−': '-',
  '′': "'",
  '″': '"',
  '≤': '<=',
  '≥': '>=',
  '→': '->',
  '←': '<-',
};

const isWinAnsi = (char: string) => {
  const code = char.codePointAt(0)!;
  return (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WIN_ANSI_EXTRA.has(char);
};

/**
 * Testo stampabile con Helvetica: le lettere accentate restano, le altre perdono l'accento
 * (ł → l non si scompone e diventa "?"), emoji e simboli non disponibili diventano "?".
 * Gli a capo restano. Senza questo passaggio pdf-lib interromperebbe la creazione del PDF.
 */
export function toPdfText(input: string): string {
  let output = '';
  for (const char of input.normalize('NFC').replace(/\r\n?/g, '\n').replace(/\t/g, ' ')) {
    if (isWinAnsi(char) || char === '\n') output += char;
    else if (char in REPLACEMENTS) output += REPLACEMENTS[char];
    else {
      const base = char.normalize('NFD').replace(/\p{M}/gu, '');
      output += base && [...base].every(isWinAnsi) ? base : '?';
    }
  }
  return output;
}
