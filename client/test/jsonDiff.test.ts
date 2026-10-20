import { describe, expect, it } from 'vitest';
import { analyzeJson } from '../src/lib/json-diff/analyzeJson';
import { compareJson, sameJsonData } from '../src/lib/json-diff/compareJson';
import { jsonDiffFilename } from '../src/lib/json-diff/jsonDiffFilename';
import { beautifyTokens, minifyTokens } from '../src/lib/json-diff/formatJson';
import { diffLines } from '../src/lib/json-diff/lineDiff';

const tokensOf = (text: string) => {
  const result = analyzeJson(text);
  if (!result.ok) throw new Error(result.error.message);
  return result.tokens;
};

const errorOf = (text: string) => {
  const result = analyzeJson(text);
  if (result.ok) throw new Error('atteso un errore');
  return result.error;
};

describe('analyzeJson', () => {
  it.each(['{}', '[]', '"testo"', '0', '-1.5e10', 'true', 'null', '{"a":[1,2,{"b":"\\u00e8\\n"}]}', '﻿{"bom":true}'])(
    'accetta %s',
    (text) => {
      expect(analyzeJson(text).ok).toBe(true);
    },
  );

  it.each([
    ['{"a": 1,}', 'Virgola di troppo prima di }', 1, 8],
    ['[1, 2,]', 'Virgola di troppo prima di ]', 1, 6],
    ['{\n  "a": 1\n  "b": 2\n}', 'Manca una virgola dopo questo valore', 2, 9],
    ['[1 2]', 'Manca una virgola dopo questo elemento', 1, 3],
    ["{'a': 1}", 'virgolette doppie', 1, 2],
    ['{a: 1}', 'La chiave «a» va scritta tra virgolette doppie', 1, 2],
    ['{"a" 1}', 'Mancano i due punti', 1, 6],
    ['{"a": True}', 'scrivi true', 1, 7],
    ['{"a": None}', 'scrivi null', 1, 7],
    ['{"a": 01}', 'non possono iniziare con 0', 1, 7],
    ['{"a": 98,5}', 'Qui serve il nome di una chiave', 1, 10],
    ['{"a": .5}', 'scrivi 0.5', 1, 7],
    ['{"a": "x\n"}', 'Stringa non chiusa', 1, 7],
    ['{"a": "\\x"}', 'escape non valida', 1, 8],
    ['{"a": 1', 'alla fine manca la }', 1, 8],
    ['[1, 2', 'alla fine manca la ]', 1, 6],
    ['{"a": 1} x', 'elimina il testo in più', 1, 10],
    ['// nota\n{}', 'commenti', 1, 1],
    ['   ', 'non contiene un JSON', 1, 4],
  ])('%j → %s (riga %i, colonna %i)', (text, message, line, column) => {
    const error = errorOf(text);
    expect(error.message).toContain(message);
    expect({ line: error.line, column: error.column }).toEqual({ line, column });
  });

  // Quando la causa non è certa il messaggio dice solo cosa non va in quel punto, senza indovinare
  it.each([
    ['{"a": "b"c}', '«c»', 1, 10],
    ['{"a": "abc, "b": 1}', '«b»', 1, 14],
    ['[1 x]', '«x»', 1, 4],
    ['{"a":1 b:2}', '«b»', 1, 8],
  ])('%j → errore generico su %s', (text, char, line, column) => {
    const error = errorOf(text);
    expect(error.message).toBe(`Carattere inatteso ${char}: qui serve una virgola o la ${text.includes('[1') ? ']' : '}'} di chiusura.`);
    expect({ line: error.line, column: error.column }).toEqual({ line, column });
  });

  it('la virgola mancante si segnala solo se dopo c’è davvero una chiave o un elemento', () => {
    expect(errorOf('{"a":"x"\n"b":"y"}').message).toContain('Manca una virgola');
    expect(errorOf('[\n  {"a":1}\n  {"b":2}\n]').message).toContain('Manca una virgola');
  });

  // Il parser se ne accorge più avanti: la causa si dà solo se correggendola il JSON diventa valido
  it.each([
    [
      '{\n  "attivo": true,\n  "utility": "qr-code", "short-url", "grafici", "json-diff"],\n  "limiti": {"a": 1}\n}',
      'Manca la [ che apre l’array dopo "utility":',
      3,
    ],
    [
      '{\n  "id": 1,\n  "owner": \n    "team": "payments",\n    "oncall": "ana.ruiz@harbourline.dev"\n  },\n  "x": [1]\n}',
      'Manca la { che apre l’oggetto dopo "owner":',
      3,
    ],
    ['"a", "b"]', 'Manca la [ che apre l’array all’inizio del JSON.', 1],
    ['{\n "a": 1,\n "b": [1, 2\n}', 'Manca la ] che chiude l’array prima di questo punto.', 4],
  ])('parentesi mancante: %j', (text, message, line) => {
    const error = errorOf(text);
    expect(error.message).toBe(message);
    expect(error.line).toBe(line);
  });

  it('limita la profondità', () => {
    expect(errorOf('['.repeat(1100) + ']'.repeat(1100)).message).toContain('Troppi livelli');
  });

  it('accetta "1,5" in un array come due numeri', () => {
    expect(analyzeJson('[1,5]').ok).toBe(true);
  });
});

describe('beautify e minify', () => {
  it('rientra con 2 spazi e lascia vuoti {} e []', () => {
    expect(beautifyTokens(tokensOf('{"a":1,"b":[],"c":{},"d":[true,{"e":null}]}'))).toBe(
      '{\n  "a": 1,\n  "b": [],\n  "c": {},\n  "d": [\n    true,\n    {\n      "e": null\n    }\n  ]\n}',
    );
  });

  it('minifica senza toccare gli spazi nelle stringhe', () => {
    expect(minifyTokens(tokensOf('{\n  "a b": " c ",\n  "n": [1, 2]\n}'))).toBe('{"a b":" c ","n":[1,2]}');
  });

  it('conserva numeri grandi e scritti come nel testo', () => {
    expect(minifyTokens(tokensOf('[12345678901234567890, 1.0, 1E5]'))).toBe('[12345678901234567890,1.0,1E5]');
  });
});

describe('diffLines', () => {
  it('nessuna differenza per testi uguali, spazi finali e a capo finale', () => {
    expect(diffLines('a\nb', 'a  \nb\n').hunks).toEqual([]);
  });

  it('segna le righe cambiate da ciascun lato', () => {
    const diff = diffLines('a\nb\nc\nd', 'a\nB\nc\nd\ne');
    expect([...diff.leftChanged]).toEqual([1]);
    expect([...diff.rightChanged].sort()).toEqual([1, 4]);
    expect(diff.hunks).toEqual([
      { leftStart: 1, leftEnd: 2, rightStart: 1, rightEnd: 2 },
      { leftStart: 4, leftEnd: 4, rightStart: 4, rightEnd: 5 },
    ]);
  });

  it('righe rimosse', () => {
    const diff = diffLines('a\nx\ny\nb', 'a\nb');
    expect([...diff.leftChanged]).toEqual([1, 2]);
    expect(diff.rightChanged.size).toBe(0);
  });

  it('oltre il limite di modifiche segna tutta la parte centrale', () => {
    const left = Array.from({ length: 50 }, (_, index) => `l${index}`).join('\n');
    const right = Array.from({ length: 50 }, (_, index) => `r${index}`).join('\n');
    const diff = diffLines(`x\n${left}\ny`, `x\n${right}\ny`, 10);
    expect(diff.hunks).toEqual([{ leftStart: 1, leftEnd: 51, rightStart: 1, rightEnd: 51 }]);
  });
});

describe('compareJson', () => {
  it('distingue gli esiti', () => {
    expect(compareJson('', ' ').verdict).toBe('empty');
    expect(compareJson('{}', '').verdict).toBe('waiting');
    expect(compareJson('{"a":1}', '{"a":1}\n').verdict).toBe('identical');
    expect(compareJson('{"a":1,"b":2}', '{\n  "b": 2,\n  "a": 1\n}').verdict).toBe('equivalent');
    expect(compareJson('{"a":1}', '{"a":2}').verdict).toBe('different');
    expect(compareJson('{"a":1}', '{"a":1,}').verdict).toBe('invalid');
  });

  it("l'ordine degli elementi di un array conta", () => {
    expect(sameJsonData([1, 2], [2, 1])).toBe(false);
    expect(sameJsonData({ a: [1, { b: null }] }, { a: [1, { b: null }] })).toBe(true);
    expect(sameJsonData({ a: 1 }, { a: 1, b: undefined })).toBe(false);
  });
});

describe('jsonDiffFilename', () => {
  it('usa data e ora locali', () => {
    expect(jsonDiffFilename(new Date(2026, 9, 20, 9, 5))).toBe('json-2026-10-20-0905.json');
  });
});
