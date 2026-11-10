import { analyzeJson } from './analyzeJson';
import { beautifyTokens, minifyTokens } from './formatJson';

export type JsonTransform = 'beautify' | 'minify';

const DONE_MESSAGES: Record<JsonTransform, string> = {
  beautify: 'JSON di destra formattato con 2 spazi di rientro.',
  minify: 'JSON di destra minificato su una riga.',
};

/** Formatta o minifica un JSON valido; se non è valido lo lascia com'è e dice perché. */
export const transformJson = (text: string, action: JsonTransform): { next: string; message: string } => {
  const analysis = analyzeJson(text);
  if (!analysis.ok) {
    return { next: text, message: `Correggi prima l’errore alla riga ${analysis.error.line}: un JSON non valido non si può riscrivere.` };
  }
  const next = action === 'beautify' ? beautifyTokens(analysis.tokens) : minifyTokens(analysis.tokens);
  return { next, message: next === text ? 'Nessun cambiamento: il testo era già così.' : DONE_MESSAGES[action] };
};
