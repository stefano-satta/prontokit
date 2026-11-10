import { describe, expect, it } from 'vitest';
import { toMarkdownFilename } from '../src/lib/pdf-markdown/markdownFilename';
import { timestampedFilename, uniqueFilenames } from '../src/lib/fileName';

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

describe('timestampedFilename', () => {
  it('usa data e ora locali con gli zeri iniziali', () => {
    expect(timestampedFilename('report', 'txt', new Date(2026, 0, 3, 7, 4))).toBe('report-2026-01-03-0704.txt');
  });
});

describe('uniqueFilenames', () => {
  it('numera i doppioni senza distinguere maiuscole', () => {
    expect(uniqueFilenames(['foto', 'Foto', 'altro', 'foto'], 'png')).toEqual(['foto.png', 'Foto (2).png', 'altro.png', 'foto (3).png']);
  });

  it('non tocca un nome che coincide già con un doppione numerato', () => {
    expect(uniqueFilenames(['a (2)', 'a', 'a'], 'csv')).toEqual(['a (2).csv', 'a.csv', 'a (3).csv']);
  });
});
