import { describe, expect, it } from 'vitest';
import { HISTORY_LIMIT, addToHistory, parseHistory } from '../src/lib/short-url/history';
import type { ShortUrl } from '../src/models/shortUrl';

const link = (code: string): ShortUrl => ({
  code,
  shortUrl: `http://sho.rt/${code}`,
  originalUrl: `https://example.com/${code}`,
  createdAt: '2026-10-19T10:00:00.000Z',
});

describe('addToHistory', () => {
  it('mette il nuovo link in testa', () => {
    expect(addToHistory([link('a')], link('b')).map((i) => i.code)).toEqual(['b', 'a']);
  });

  it(`tiene solo gli ultimi ${HISTORY_LIMIT}`, () => {
    let history: ShortUrl[] = [];
    for (const code of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) history = addToHistory(history, link(code));
    expect(history.map((i) => i.code)).toEqual(['g', 'f', 'e', 'd', 'c']);
  });

  it('non duplica lo stesso codice', () => {
    expect(addToHistory([link('a'), link('b')], link('b')).map((i) => i.code)).toEqual(['b', 'a']);
  });
});

describe('parseHistory', () => {
  it('rilegge quanto salvato', () => {
    const items = [link('a'), link('b')];
    expect(parseHistory(JSON.stringify(items))).toEqual(items);
  });

  it.each([[null], [''], ['non json'], ['{"code":"a"}'], ['42']])('restituisce [] per %j', (raw) => {
    expect(parseHistory(raw)).toEqual([]);
  });

  it('scarta le voci malformate, i campi in più e oltre il limite', () => {
    const raw = JSON.stringify([{ ...link('a'), clicks: 3 }, { code: 'x' }, null, ...['b', 'c', 'd', 'e', 'f'].map(link)]);
    const parsed = parseHistory(raw);
    expect(parsed.map((i) => i.code)).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(parsed[0]).not.toHaveProperty('clicks');
  });
});
