import { describe, expect, it } from 'vitest';
import { toMarkdownFilename } from '../src/lib/fileName';

describe('toMarkdownFilename', () => {
  it.each([
    ['Relazione finale.pdf', 'Relazione finale.md'],
    ['REPORT.PDF', 'REPORT.md'],
    ['../../etc/passwd.pdf', 'passwd.md'],
    ['C:\\Users\\me\\doc?.pdf', 'doc.md'],
    ['<>:"|?*.pdf', 'documento.md'],
  ])('%s → %s', (input, expected) => {
    expect(toMarkdownFilename(input)).toBe(expected);
  });
});
