import { describe, expect, it } from 'vitest';
import { appendTranscript } from '../src/lib/speech-to-text/formatTranscript';
import { insertPunctuation } from '../src/lib/speech-to-text/punctuation';
import { transcriptFilename } from '../src/lib/speech-to-text/transcriptFilename';

describe('appendTranscript', () => {
  it('mette la maiuscola al primo frammento', () => {
    expect(appendTranscript('', 'ciao a tutti')).toBe('Ciao a tutti');
  });

  it('unisce i frammenti con uno spazio', () => {
    expect(appendTranscript('Ciao a tutti ', '  come state ')).toBe('Ciao a tutti come state');
  });

  it('non converte le parole in punteggiatura', () => {
    expect(appendTranscript('', 'ciao virgola come stai punto')).toBe('Ciao virgola come stai punto');
  });

  it('dopo . ? ! o un a capo il nuovo frammento inizia con la maiuscola', () => {
    expect(appendTranscript('Prima frase.', 'seconda frase')).toBe('Prima frase. Seconda frase');
    expect(appendTranscript('Davvero?', 'sì')).toBe('Davvero? Sì');
    expect(appendTranscript('Riga\n', 'nuova')).toBe('Riga\nNuova');
  });

  it('ignora i frammenti vuoti', () => {
    expect(appendTranscript('Testo', '   ')).toBe('Testo');
  });
});

describe('insertPunctuation', () => {
  it('in fondo al testo attacca il segno e aggiunge uno spazio', () => {
    expect(insertPunctuation('Ciao ', 5, 5, ',')).toEqual({ text: 'Ciao, ', cursor: 6 });
  });

  it('in mezzo al testo non raddoppia lo spazio', () => {
    expect(insertPunctuation('Ciao come stai', 4, 4, ',')).toEqual({ text: 'Ciao, come stai', cursor: 5 });
  });

  it('aggiunge lo spazio se il testo seguente è attaccato', () => {
    expect(insertPunctuation('Finecome', 4, 4, '.')).toEqual({ text: 'Fine. come', cursor: 6 });
  });

  it('sostituisce la selezione', () => {
    expect(insertPunctuation('Ciao XX mondo', 4, 7, '!')).toEqual({ text: 'Ciao! mondo', cursor: 5 });
  });

  it('a capo e nuovo paragrafo tolgono gli spazi attorno', () => {
    expect(insertPunctuation('Riga uno.  Riga due', 9, 9, '\n')).toEqual({ text: 'Riga uno.\nRiga due', cursor: 10 });
    expect(insertPunctuation('Fine. ', 6, 6, '\n\n')).toEqual({ text: 'Fine.\n\n', cursor: 7 });
  });
});

describe('transcriptFilename', () => {
  it('usa data e ora locali', () => {
    expect(transcriptFilename(new Date(2026, 9, 7, 9, 5))).toBe('trascrizione-2026-10-07-0905.txt');
  });
});
