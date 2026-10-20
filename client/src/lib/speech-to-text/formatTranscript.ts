const capitalizeFirst = (text: string) => text.replace(/^\p{Ll}/u, (letter) => letter.toUpperCase());

/**
 * Accoda un frammento riconosciuto al testo esistente (che l'utente può aver modificato):
 * unisce con uno spazio e mette la maiuscola a inizio testo, dopo . ? ! e dopo un a capo.
 */
export const appendTranscript = (existing: string, chunk: string): string => {
  const piece = chunk.replace(/\s+/g, ' ').trim();
  if (!piece) return existing;

  const base = existing.replace(/[ \t]+$/, '');
  if (base === '') return capitalizeFirst(piece);
  if (base.endsWith('\n')) return base + capitalizeFirst(piece);
  return `${base} ${/[.?!]$/.test(base) ? capitalizeFirst(piece) : piece}`;
};
