import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpeechErrorCode, SpeechRecognitionLike, SpeechStatus } from '../models/speech';
import {
  getSpeechRecognition,
  microphoneErrorCode,
  recognitionErrorCode,
  requestMicrophoneAccess,
} from '../services/speechRecognition';

/** Se il browser non chiude la sessione dopo stop(), la chiudiamo noi per non bloccare il download. */
const STOP_TIMEOUT_MS = 3000;

interface UseSpeechRecognitionOptions {
  locale: string;
  /** Chiamata per ogni frammento definitivo */
  onFinal: (transcript: string) => void;
}

/**
 * Dettatura continua con la Web Speech API: testo provvisorio in `interim`, frammenti definitivi a `onFinal`.
 * Il browser chiude la sessione dopo qualche secondo di silenzio: finché l'utente non preme stop, si riparte.
 */
export const useSpeechRecognition = ({ locale, onFinal }: UseSpeechRecognitionOptions) => {
  const [status, setStatus] = useState<SpeechStatus>(() => (getSpeechRecognition() ? 'idle' : 'unsupported'));
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<SpeechErrorCode | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const keepListeningRef = useRef(false);
  const interimRef = useRef('');
  const stopTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const updateInterim = (text: string) => {
    interimRef.current = text;
    setInterim(text);
  };

  const finish = useCallback(() => {
    clearTimeout(stopTimerRef.current);
    recognitionRef.current = null;
    keepListeningRef.current = false;
    updateInterim('');
    setStatus('idle');
  }, []);

  const start = useCallback(async () => {
    const Recognition = getSpeechRecognition();
    if (!Recognition || recognitionRef.current) return;
    setError(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError('insecure');
      return;
    }

    setStatus('requesting');
    try {
      await requestMicrophoneAccess();
    } catch (cause) {
      setError(microphoneErrorCode(cause));
      setStatus('idle');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = locale;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      if (recognitionRef.current !== recognition) return;
      let pending = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result.isFinal) pending += result[0].transcript;
        else if (i >= event.resultIndex) onFinalRef.current(result[0].transcript);
      }
      updateInterim(pending);
    };

    recognition.onerror = (event) => {
      if (recognitionRef.current !== recognition) return;
      const code = recognitionErrorCode(event.error);
      if (code) {
        keepListeningRef.current = false;
        setError(code);
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      // Testo provvisorio mai confermato (sessione chiusa all'improvviso): lo teniamo
      if (interimRef.current.trim()) onFinalRef.current(interimRef.current);
      updateInterim('');
      if (keepListeningRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          // Ripartenza non riuscita: chiudiamo la sessione
        }
      }
      finish();
    };

    recognitionRef.current = recognition;
    keepListeningRef.current = true;
    try {
      recognition.start();
      setStatus('listening');
    } catch {
      setError('unknown');
      finish();
    }
  }, [locale, finish]);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    keepListeningRef.current = false;
    setStatus('stopping');
    // stop() (non abort()) lascia arrivare l'ultimo frammento definitivo
    recognition.stop();
    stopTimerRef.current = setTimeout(() => {
      if (recognitionRef.current !== recognition) return;
      if (interimRef.current.trim()) onFinalRef.current(interimRef.current);
      recognition.abort();
      finish();
    }, STOP_TIMEOUT_MS);
  }, [finish]);

  useEffect(
    () => () => {
      clearTimeout(stopTimerRef.current);
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      keepListeningRef.current = false;
      recognition?.abort();
    },
    [],
  );

  return { status, interim, error, start, stop };
};
