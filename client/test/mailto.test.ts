import { describe, expect, it } from 'vitest';
import { mailtoHref } from '../src/lib/mailto';

describe('mailtoHref', () => {
  it('senza opzioni restituisce il solo indirizzo', () => {
    expect(mailtoHref('a@b.it')).toBe('mailto:a@b.it');
  });

  it('codifica oggetto e testo, con gli spazi come %20', () => {
    expect(mailtoHref('a@b.it', { subject: 'Ciao & grazie', body: 'riga 1\nriga 2' })).toBe(
      'mailto:a@b.it?subject=Ciao%20%26%20grazie&body=riga%201%0Ariga%202',
    );
  });
});
