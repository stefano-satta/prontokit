import type { JsonAnalysis, JsonPunctuation, JsonSyntaxError, JsonToken } from '../../models/jsonDiff';

/** Oltre questa profondità il JSON è quasi certamente un errore, e la ricorsione rischierebbe lo stack. */
export const MAX_JSON_DEPTH = 1000;

const WHITESPACE = new Set([' ', '\t', '\n', '\r']);
const ESCAPES = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't']);
const HEX = /^[0-9a-fA-F]{4}$/;
// Sticky: leggono dalla posizione corrente senza copiare il resto del testo
const NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const WORD = /[A-Za-z_$][\w$]*/y;
const LITERALS = new Set(['true', 'false', 'null']);
/** Parole di altri linguaggi che capita di incollare al posto dei letterali JSON */
const FOREIGN_LITERALS: Record<string, string> = {
  True: 'true',
  False: 'false',
  TRUE: 'true',
  FALSE: 'false',
  None: 'null',
  NULL: 'null',
  Null: 'null',
  undefined: 'null',
};

class JsonSyntaxFailure extends Error {
  constructor(
    readonly offset: number,
    message: string,
  ) {
    super(message);
  }
}

/** Riga e colonna (da 1) di una posizione nel testo. */
export const lineColumnAt = (text: string, offset: number): { line: number; column: number } => {
  let line = 1;
  let lineStart = 0;
  for (let index = 0; index < offset && index < text.length; index++) {
    if (text[index] === '\n') {
      line++;
      lineStart = index + 1;
    }
  }
  return { line, column: offset - lineStart + 1 };
};

const describe = (char: string | undefined) => (char === undefined ? 'la fine del testo' : `«${char}»`);

/** Lettura a discesa ricorsiva: valida e produce i token, con messaggi che dicono come correggere. */
class JsonReader {
  private pos = 0;
  /** Fine dell'ultimo valore letto: una virgola mancante si segnala lì, non all'inizio della riga dopo */
  private valueEnd = 0;
  readonly tokens: JsonToken[] = [];
  /** Posizioni subito dopo ogni ":" con il nome della chiave: servono a capire se manca una { o una [ */
  readonly colons: { at: number; key: string }[] = [];

  constructor(private readonly text: string) {
    // Il BOM di alcuni editor non è un errore dell'utente
    if (text.charCodeAt(0) === 0xfeff) this.pos = 1;
  }

  read(): JsonToken[] {
    this.skipBlank();
    if (this.pos >= this.text.length) this.fail('Il testo non contiene un JSON: incolla un oggetto { } o un array [ ].');
    this.value(0);
    this.skipBlank();
    if (this.pos < this.text.length) {
      this.fail(
        this.peek() === ','
          ? 'Virgola di troppo dopo la fine del JSON: eliminala.'
          : `Il JSON è già chiuso, ma qui continua con ${describe(this.peek())}: elimina il testo in più.`,
      );
    }
    return this.tokens;
  }

  private matchAt(pattern: RegExp): string | undefined {
    pattern.lastIndex = this.pos;
    return pattern.exec(this.text)?.[0];
  }

  private peek(): string | undefined {
    return this.text[this.pos];
  }

  private fail(message: string, offset = this.pos): never {
    throw new JsonSyntaxFailure(Math.min(offset, this.text.length), message);
  }

  private push(kind: 'punct', value: JsonPunctuation): void;
  private push(kind: 'scalar', value: string): void;
  private push(kind: 'punct' | 'scalar', value: string) {
    this.tokens.push({ kind, value } as JsonToken);
    this.valueEnd = this.pos;
  }

  private skipBlank() {
    while (this.pos < this.text.length) {
      const char = this.text[this.pos];
      if (WHITESPACE.has(char)) {
        this.pos++;
      } else if (char === '/' && (this.text[this.pos + 1] === '/' || this.text[this.pos + 1] === '*')) {
        this.fail('I commenti non sono ammessi in JSON: eliminali.');
      } else {
        return;
      }
    }
  }

  private value(depth: number) {
    if (depth > MAX_JSON_DEPTH) this.fail(`Troppi livelli annidati: il massimo è ${MAX_JSON_DEPTH}.`);
    const char = this.peek();
    if (char === '{') return this.object(depth);
    if (char === '[') return this.array(depth);
    if (char === '"') return this.string();
    if (char === '-' || (char !== undefined && char >= '0' && char <= '9')) return this.number();
    const word = this.matchAt(WORD);
    if (word && LITERALS.has(word)) {
      this.pos += word.length;
      this.push('scalar', word);
      return;
    }
    this.invalidValue(word);
  }

  private invalidValue(word: string | undefined): never {
    const char = this.peek();
    if (char === undefined) this.fail('Il JSON finisce troppo presto: manca un valore.');
    if (char === "'") this.fail('Le stringhe vanno tra virgolette doppie " ", non singole.');
    if (char === '+') this.fail('Il segno + non è ammesso davanti ai numeri: eliminalo.');
    if (char === '.') this.fail('Un numero non può iniziare con il punto: scrivi 0.5 invece di .5.');
    if (char === '}' || char === ']') this.fail(`Manca un valore prima di ${describe(char)}.`);
    if (char === ',') this.fail('Manca un valore prima della virgola, oppure c’è una virgola di troppo.');
    if (word && FOREIGN_LITERALS[word]) this.fail(`«${word}» non è valido in JSON: scrivi ${FOREIGN_LITERALS[word]}.`);
    if (word === 'NaN' || word === 'Infinity') this.fail(`«${word}» non è un numero valido in JSON: usa null o una stringa.`);
    if (word) this.fail(`«${word}» non è un valore valido: se è testo, mettilo tra virgolette doppie.`);
    this.fail(`Carattere non valido ${describe(char)}: qui serve un valore.`);
  }

  private object(depth: number) {
    this.pos++;
    this.push('punct', '{');
    this.skipBlank();
    if (this.peek() === '}') {
      this.pos++;
      this.push('punct', '}');
      return;
    }
    for (;;) {
      this.key();
      this.skipBlank();
      if (this.peek() !== ':') this.fail('Mancano i due punti : dopo il nome della chiave.');
      this.colons.push({ at: this.pos + 1, key: this.tokens[this.tokens.length - 1].value });
      this.pos++;
      this.push('punct', ':');
      this.skipBlank();
      this.value(depth + 1);
      this.skipBlank();
      const next = this.peek();
      if (next === '}') {
        this.pos++;
        this.push('punct', '}');
        return;
      }
      if (next === ',') {
        const comma = this.pos;
        this.pos++;
        this.skipBlank();
        if (this.peek() === '}') this.fail('Virgola di troppo prima di }: eliminala.', comma);
        this.push('punct', ',');
        continue;
      }
      if (next === undefined) this.fail('Il JSON è incompleto: alla fine manca la } che chiude l’oggetto.');
      // La virgola manca di sicuro solo se dopo c'è davvero una chiave ("nome": ...); altrimenti la causa
      // può essere un'altra (ad esempio una virgoletta mancante prima) e diciamo solo cosa non va qui
      if (this.keyFollows()) this.fail('Manca una virgola dopo questo valore, prima della chiave successiva.', this.valueEnd);
      this.unexpected(next, '}');
    }
  }

  private key() {
    const char = this.peek();
    if (char === '"') return this.string();
    if (char === "'") this.fail('I nomi delle chiavi vanno tra virgolette doppie " ", non singole.');
    if (char === undefined) this.fail('Il JSON è incompleto: alla fine manca la } che chiude l’oggetto.');
    const word = this.matchAt(WORD);
    if (word && this.colonAt(this.pos + word.length)) this.fail(`La chiave «${word}» va scritta tra virgolette doppie: "${word}".`);
    this.fail(`Qui serve il nome di una chiave tra virgolette doppie, non ${describe(char)}.`);
  }

  /** Errore generico, quando la causa non è certa: diciamo solo cosa c'è e cosa ci si aspettava */
  private unexpected(char: string, closer: '}' | ']'): never {
    this.fail(`Carattere inatteso ${describe(char)}: qui serve una virgola o la ${closer} di chiusura.`);
  }

  /** Dalla posizione corrente inizia una chiave completa: "nome" seguito da due punti. */
  private keyFollows(): boolean {
    if (this.peek() !== '"') return false;
    const end = this.text.indexOf('"', this.pos + 1);
    if (end < 0) return false;
    const name = this.text.slice(this.pos + 1, end);
    return !name.includes('\n') && !name.includes('\\') && this.colonAt(end + 1);
  }

  /** Dalla posizione corrente inizia un valore riconoscibile: due elementi di fila senza virgola. */
  private valueFollows(): boolean {
    const char = this.peek() ?? '';
    if (/["\d{[-]/.test(char)) return true;
    const word = this.matchAt(WORD);
    return word !== undefined && LITERALS.has(word);
  }

  /** Due punti alla posizione data, saltando gli spazi. */
  private colonAt(offset: number): boolean {
    let index = offset;
    while (index < this.text.length && WHITESPACE.has(this.text[index])) index++;
    return this.text[index] === ':';
  }

  private array(depth: number) {
    this.pos++;
    this.push('punct', '[');
    this.skipBlank();
    if (this.peek() === ']') {
      this.pos++;
      this.push('punct', ']');
      return;
    }
    for (;;) {
      this.value(depth + 1);
      this.skipBlank();
      const next = this.peek();
      if (next === ']') {
        this.pos++;
        this.push('punct', ']');
        return;
      }
      if (next === ',') {
        const comma = this.pos;
        this.pos++;
        this.skipBlank();
        if (this.peek() === ']') this.fail('Virgola di troppo prima di ]: eliminala.', comma);
        this.push('punct', ',');
        continue;
      }
      if (next === undefined) this.fail('Il JSON è incompleto: alla fine manca la ] che chiude l’array.');
      if (this.valueFollows()) this.fail('Manca una virgola dopo questo elemento dell’array.', this.valueEnd);
      this.unexpected(next, ']');
    }
  }

  private string() {
    const start = this.pos;
    this.pos++;
    while (this.pos < this.text.length) {
      const char = this.text[this.pos];
      if (char === '"') {
        this.pos++;
        this.push('scalar', this.text.slice(start, this.pos));
        return;
      }
      if (char === '\\') {
        const escape = this.text[this.pos + 1];
        if (escape === 'u') {
          if (!HEX.test(this.text.slice(this.pos + 2, this.pos + 6))) {
            this.fail('Sequenza \\u non valida: servono 4 cifre esadecimali, es. \\u00e8.');
          }
          this.pos += 6;
          continue;
        }
        if (escape === undefined || !ESCAPES.has(escape)) {
          this.fail(`Sequenza di escape non valida «\\${escape ?? ''}»: per una barra rovesciata scrivi \\\\.`);
        }
        this.pos += 2;
        continue;
      }
      if (char === '\n' || char === '\r') this.fail('Stringa non chiusa: manca la virgoletta " finale, oppure usa \\n per andare a capo.', start);
      if (char < ' ') this.fail('Carattere di controllo nella stringa: usa \\t per la tabulazione.');
      this.pos++;
    }
    this.fail('Stringa non chiusa: manca la virgoletta " finale.', start);
  }

  private number() {
    const match = this.matchAt(NUMBER);
    if (!match) this.fail('Dopo il segno - serve una cifra.');
    const end = this.pos + match.length;
    const after = this.text[end];
    if (/\d/.test(after ?? '') && /^-?0$/.test(match)) {
      this.fail('I numeri non possono iniziare con 0: elimina gli zeri iniziali o usa una stringa.');
    }
    if (after === '.') this.fail('Dopo il punto decimale servono delle cifre, es. 1.0.', end);
    if (after === 'e' || after === 'E') this.fail('Esponente non valido: scrivi ad esempio 1e5 o 1.2E-3.', end);
    if (after !== undefined && /[\w.]/.test(after)) this.fail(`Numero non valido: carattere inatteso ${describe(after)}.`, end);
    this.pos = end;
    this.push('scalar', match);
  }
}

type Attempt = { ok: true } | { ok: false; offset: number };

const attempt = (text: string): Attempt => {
  try {
    new JsonReader(text).read();
    return { ok: true };
  } catch (error) {
    if (!(error instanceof JsonSyntaxFailure)) throw error;
    return { ok: false, offset: error.offset };
  }
};

interface Repair {
  /** Dove inserire il carattere mancante */
  at: number;
  insert: string;
  /** Dove segnalare l'errore all'utente */
  reportAt: number;
  message: string;
}

/** Quante delle ultime chiavi provare come punto in cui manca una { o una [ */
const RECENT_KEYS = 3;

/**
 * L'errore che il parser incontra spesso non è dove sbaglia l'utente: con `"a": "x", "y"]` il parser
 * se ne accorge solo alla seconda stringa, ma manca la [ dopo i due punti. Proviamo le correzioni più
 * probabili sul testo e ne diamo una come causa solo se rende il JSON valido: altrimenti resta il
 * messaggio del parser, che dice solo cosa non va in quel punto.
 */
const diagnose = (text: string, reader: JsonReader, failure: JsonSyntaxFailure): { offset: number; message: string } => {
  const repairs: Repair[] = [];
  const recent = reader.colons.filter((colon) => colon.at <= failure.offset).slice(-RECENT_KEYS).reverse();
  for (const { at, key } of recent) {
    repairs.push(
      { at, insert: '[', reportAt: at, message: `Manca la [ che apre l’array dopo ${key}:` },
      { at, insert: '{', reportAt: at, message: `Manca la { che apre l’oggetto dopo ${key}:` },
    );
  }
  const start = text.search(/\S/);
  if (start >= 0 && start < failure.offset) {
    repairs.push(
      { at: start, insert: '[', reportAt: start, message: 'Manca la [ che apre l’array all’inizio del JSON.' },
      { at: start, insert: '{', reportAt: start, message: 'Manca la { che apre l’oggetto all’inizio del JSON.' },
    );
  }
  // A fine testo il messaggio del parser ("alla fine manca la }") è già preciso
  for (const closer of failure.offset < text.length ? [']', '}'] : []) {
    repairs.push({
      at: failure.offset,
      insert: closer,
      reportAt: failure.offset,
      message: `Manca la ${closer} che chiude ${closer === ']' ? 'l’array' : 'l’oggetto'} prima di questo punto.`,
    });
  }

  const fixed = repairs.find(({ at, insert }) => attempt(text.slice(0, at) + insert + text.slice(at)).ok);
  return fixed ? { offset: fixed.reportAt, message: fixed.message } : { offset: failure.offset, message: failure.message };
};

/** Valida un testo JSON e ne restituisce i token, oppure il primo errore con riga, colonna e un suggerimento. */
export const analyzeJson = (text: string): JsonAnalysis => {
  const reader = new JsonReader(text);
  try {
    return { ok: true, tokens: reader.read() };
  } catch (error) {
    if (!(error instanceof JsonSyntaxFailure)) throw error;
    const { offset, message } = diagnose(text, reader, error);
    const { line, column } = lineColumnAt(text, offset);
    const syntaxError: JsonSyntaxError = { line, column, offset, message };
    return { ok: false, error: syntaxError };
  }
};
