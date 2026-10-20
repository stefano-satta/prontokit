import type { JsonToken } from '../../models/jsonDiff';

export const JSON_INDENT = '  ';

const isOpen = (token: JsonToken | undefined) => token?.kind === 'punct' && (token.value === '{' || token.value === '[');
const isClose = (token: JsonToken | undefined) => token?.kind === 'punct' && (token.value === '}' || token.value === ']');

/**
 * Riscrive i token con 2 spazi di rientro. Stringhe e numeri restano come scritti:
 * a differenza di JSON.parse + stringify non si perdono cifre di numeri grandi né chiavi duplicate.
 */
export const beautifyTokens = (tokens: readonly JsonToken[]): string => {
  let out = '';
  let depth = 0;
  const newline = () => `\n${JSON_INDENT.repeat(depth)}`;

  tokens.forEach((token, index) => {
    if (token.kind === 'scalar') {
      out += token.value;
      return;
    }
    switch (token.value) {
      case '{':
      case '[':
        out += token.value;
        // Oggetti e array vuoti restano su una riga: {} e []
        if (isClose(tokens[index + 1])) return;
        depth++;
        out += newline();
        return;
      case '}':
      case ']':
        if (!isOpen(tokens[index - 1])) {
          depth--;
          out += newline();
        }
        out += token.value;
        return;
      case ':':
        out += ': ';
        return;
      case ',':
        out += `,${newline()}`;
    }
  });
  return out;
};

/** Tutto su una riga, senza spazi fuori dalle stringhe. */
export const minifyTokens = (tokens: readonly JsonToken[]): string => tokens.map((token) => token.value).join('');
