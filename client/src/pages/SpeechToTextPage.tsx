import { Download, Mic } from 'lucide-react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '../components/common/Button';
import { CopyButton } from '../components/common/CopyButton';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { LanguageSelect } from '../components/features/speech-to-text/LanguageSelect';
import { PunctuationBar } from '../components/features/speech-to-text/PunctuationBar';
import { RecordButton } from '../components/features/speech-to-text/RecordButton';
import { SpeechPrivacyNote } from '../components/features/speech-to-text/SpeechPrivacyNote';
import { TranscriptEditor } from '../components/features/speech-to-text/TranscriptEditor';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { downloadText } from '../lib/downloadFile';
import { SPEECH_ERROR_MESSAGES, UNSUPPORTED_MESSAGE } from '../lib/speech-to-text/errorMessages';
import { appendTranscript } from '../lib/speech-to-text/formatTranscript';
import { DEFAULT_SPEECH_LANGUAGE, getSpeechLanguage } from '../lib/speech-to-text/languages';
import { insertPunctuation, type PunctuationMark } from '../lib/speech-to-text/punctuation';
import { transcriptFilename } from '../lib/speech-to-text/transcriptFilename';
import type { SpeechLanguageId, SpeechStatus } from '../models/speech';

const STATUS_TEXT: Partial<Record<SpeechStatus, string>> = {
  requesting: 'Consenti l’accesso al microfono nella finestra del browser.',
  listening: 'Ti ascolto: parla pure.',
  stopping: 'Sto completando le ultime parole…',
};

export default function SpeechToTextPage() {
  useDocumentTitle('Trascrizione vocale');
  const [languageId, setLanguageId] = useState<SpeechLanguageId>(DEFAULT_SPEECH_LANGUAGE);
  const [text, setText] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  /** Dove rimettere il cursore dopo aver inserito un segno di punteggiatura */
  const pendingCursorRef = useRef<number | null>(null);
  const language = getSpeechLanguage(languageId);

  const handleFinal = useCallback((chunk: string) => setText((previous) => appendTranscript(previous, chunk)), []);
  const { status, interim, error, start, stop } = useSpeechRecognition({ locale: language.locale, onFinal: handleFinal });

  const busy = status === 'requesting' || status === 'listening' || status === 'stopping';
  // Il testo provvisorio si vede in coda, ma entra nel testo solo quando è definitivo
  const displayed = interim ? appendTranscript(text, interim) : text;
  const hasText = text.trim() !== '';

  const insertMark = ({ value }: PunctuationMark) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? text.length;
    const end = textarea?.selectionEnd ?? text.length;
    const result = insertPunctuation(text, start, end, value);
    pendingCursorRef.current = result.cursor;
    setText(result.text);
  };

  // Subito dopo il render, prima di altri tasti: React sposterebbe il cursore in fondo
  useLayoutEffect(() => {
    const cursor = pendingCursorRef.current;
    const textarea = textareaRef.current;
    if (cursor === null || !textarea) return;
    pendingCursorRef.current = null;
    textarea.focus();
    textarea.setSelectionRange(cursor, cursor);
  }, [text]);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        icon={Mic}
        title="Trascrizione vocale"
        description="Premi il pulsante e parla: il testo compare mentre detti, in italiano, inglese, francese o spagnolo. Poi aggiungi la punteggiatura con i tasti, correggi il risultato e scaricalo in .txt."
      />
      <SpeechPrivacyNote />
      <Panel className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <LanguageSelect value={languageId} onChange={setLanguageId} disabled={busy || status === 'unsupported'} />
          <RecordButton status={status} onStart={start} onStop={stop} />
        </div>

        <p className="-mt-2 min-h-5 text-[13px] text-fg-muted" aria-live="polite" data-testid="speech-status">
          {STATUS_TEXT[status]}
        </p>

        {status === 'unsupported' && (
          <p role="alert" className="-mt-4 rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
            {UNSUPPORTED_MESSAGE}
          </p>
        )}
        {error && (
          <p role="alert" className="-mt-4 rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
            {SPEECH_ERROR_MESSAGES[error]}
          </p>
        )}

        <TranscriptEditor value={displayed} onChange={setText} listening={busy} textareaRef={textareaRef} />
        <PunctuationBar onInsert={insertMark} disabled={busy} />

        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            disabled={busy || !hasText}
            onClick={() => downloadText(text, transcriptFilename(), 'text/plain;charset=utf-8')}
            icon={<Download className="size-[18px]" aria-hidden />}
          >
            Scarica .txt
          </Button>
          <CopyButton value={text} label="Copia testo" size="lg" disabled={busy || !hasText} />
        </div>
      </Panel>
    </div>
  );
}
