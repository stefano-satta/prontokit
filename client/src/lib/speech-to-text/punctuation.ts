export interface PunctuationMark {
  /** Testo inserito nella trascrizione */
  value: string;
  /** Simbolo mostrato sul tasto */
  key: string;
  label: string;
}

export const PUNCTUATION_MARKS: readonly PunctuationMark[] = [
  { value: ',', key: ',', label: 'Virgola' },
  { value: '.', key: '.', label: 'Punto' },
  { value: ':', key: ':', label: 'Due punti' },
  { value: ';', key: ';', label: 'Punto e virgola' },
  { value: '!', key: '!', label: 'Punto esclamativo' },
  { value: '?', key: '?', label: 'Punto di domanda' },
  { value: '\n', key: '↵', label: 'A capo' },
  { value: '\n\n', key: '¶', label: 'Nuovo paragrafo' },
];

export interface InsertResult {
  text: string;
  /** Posizione del cursore dopo l'inserimento */
  cursor: number;
}

/**
 * Inserisce un segno al posto della selezione: toglie gli spazi prima del segno
 * e, dopo un segno di punteggiatura, aggiunge uno spazio se il testo seguente non ne ha già uno.
 */
export const insertPunctuation = (text: string, start: number, end: number, value: string): InsertResult => {
  const before = text.slice(0, start).replace(/[ \t]+$/, '');
  const after = text.slice(end);
  const isBreak = value.startsWith('\n');
  const inserted = isBreak ? value : value + (/^\s/.test(after) ? '' : ' ');
  const rest = isBreak ? after.replace(/^[ \t]+/, '') : after;
  return { text: before + inserted + rest, cursor: before.length + inserted.length };
};
