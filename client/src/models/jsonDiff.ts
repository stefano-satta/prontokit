export type JsonSide = 'left' | 'right';

export type JsonPunctuation = '{' | '}' | '[' | ']' | ':' | ',';

/** Token di un JSON valido: stringhe e numeri restano come scritti, così la formattazione non altera i dati. */
export type JsonToken = { kind: 'punct'; value: JsonPunctuation } | { kind: 'scalar'; value: string };

export interface JsonSyntaxError {
  /** Riga e colonna da 1, come le mostra l'editor */
  line: number;
  column: number;
  /** Posizione nel testo, per spostare il cursore sull'errore */
  offset: number;
  message: string;
}

export type JsonAnalysis = { ok: true; tokens: JsonToken[] } | { ok: false; error: JsonSyntaxError };

/** Blocco di righe diverse; gli intervalli sono 0-based con fine esclusa (vuoto se le righe esistono da un solo lato). */
export interface DiffHunk {
  leftStart: number;
  leftEnd: number;
  rightStart: number;
  rightEnd: number;
}

export interface LineDiff {
  /** Indici 0-based delle righe che esistono solo a sinistra o solo a destra */
  leftChanged: ReadonlySet<number>;
  rightChanged: ReadonlySet<number>;
  hunks: DiffHunk[];
}

export interface SideState {
  text: string;
  empty: boolean;
  /** null se il riquadro è vuoto */
  analysis: JsonAnalysis | null;
}

/**
 * Esito del confronto:
 * - `empty`/`waiting`: mancano uno o entrambi i JSON;
 * - `invalid`: almeno un lato non è JSON valido (le differenze di righe restano visibili);
 * - `identical`: testo uguale;
 * - `equivalent`: stessi dati, cambia la forma (spazi, a capo, ordine delle chiavi);
 * - `different`: dati diversi.
 */
export type CompareVerdict = 'empty' | 'waiting' | 'invalid' | 'identical' | 'equivalent' | 'different';

export interface JsonComparison {
  left: SideState;
  right: SideState;
  verdict: CompareVerdict;
  diff: LineDiff;
}
