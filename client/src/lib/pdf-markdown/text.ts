/** Normalizza il testo estratto: legature (ﬁ → fi), caratteri di controllo e spazi multipli. */
export const normalizeText = (value: string): string =>
  value
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f­​-‍﻿]/g, '')
    .replace(/\s+/g, ' ');

const BLOCK_SYNTAX = /^(#{1,6}\s|>|[-*+]\s|\d+[.)]\s|```|---|\|)/;

/** Evita che un paragrafo venga interpretato come sintassi Markdown (titolo, lista, citazione...). */
export const escapeBlockStart = (value: string): string => (BLOCK_SYNTAX.test(value) ? `\\${value}` : value);

/** Unisce due righe dello stesso paragrafo, ricomponendo le parole sillabate a fine riga. */
export const joinLines = (previous: string, next: string): string => {
  if (/\p{L}-$/u.test(previous) && /^\p{Ll}/u.test(next)) return previous.slice(0, -1) + next;
  return `${previous} ${next}`;
};
