import { describe, expect, it } from 'vitest';
import { partitionFiles, quoteList } from '../src/lib/fileSelection';
import { startsWithBytes } from '../src/lib/fileSignature';

type Check = { ok: true; pages: number } | { ok: false; reason: 'empty' | 'invalid' };

const file = (name: string) => new File(['x'], name);

describe('partitionFiles', () => {
  it('separa accettati, scartati e file oltre il limite', () => {
    const checks: { file: File; check: Check }[] = [
      { file: file('a.pdf'), check: { ok: true, pages: 1 } },
      { file: file('b.pdf'), check: { ok: false, reason: 'invalid' } },
      { file: file('c.pdf'), check: { ok: true, pages: 3 } },
      { file: file('d.pdf'), check: { ok: true, pages: 2 } },
    ];
    const selection = partitionFiles(checks, 2, (f, check) => `${f.name}:${check.pages}`);
    expect(selection).toEqual({
      accepted: ['a.pdf:1', 'c.pdf:3'],
      rejected: [{ name: 'b.pdf', reason: 'invalid' }],
      overLimit: ['d.pdf'],
    });
  });

  it('con la selezione piena non accetta niente', () => {
    const selection = partitionFiles([{ file: file('a.pdf'), check: { ok: true, pages: 1 } as Check }], 0, (f) => f.name);
    expect(selection.accepted).toEqual([]);
    expect(selection.overLimit).toEqual(['a.pdf']);
  });
});

describe('quoteList', () => {
  it.each([
    [[], ''],
    [['a'], '“a”'],
    [['a', 'b'], '“a” e “b”'],
    [['a', 'b', 'c'], '“a”, “b” e “c”'],
  ])('%j → %s', (names, expected) => {
    expect(quoteList(names)).toBe(expected);
  });
});

describe('startsWithBytes', () => {
  it('confronta solo i byte della firma', () => {
    expect(startsWithBytes(new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0xff]), [0x50, 0x4b, 0x03, 0x04])).toBe(true);
    expect(startsWithBytes(new Uint8Array([0x50, 0x4b]), [0x50, 0x4b, 0x03, 0x04])).toBe(false);
  });
});
