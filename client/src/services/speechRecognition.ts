import type { SpeechErrorCode, SpeechRecognitionConstructor } from '../models/speech';

/** Costruttore del riconoscimento vocale del browser (Chrome, Edge e Safari lo espongono con prefisso webkit). */
export const getSpeechRecognition = (): SpeechRecognitionConstructor | null =>
  typeof window === 'undefined' ? null : (window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null);

/**
 * Chiede esplicitamente il permesso del microfono prima di avviare il riconoscimento,
 * così gli errori di permesso sono chiari. Lo stream viene chiuso subito: lo apre il riconoscimento.
 */
export const requestMicrophoneAccess = async (): Promise<void> => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => track.stop());
};

export const microphoneErrorCode = (error: unknown): SpeechErrorCode => {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'permission-denied';
  if (name === 'NotFoundError' || name === 'NotReadableError' || name === 'OverconstrainedError') return 'no-microphone';
  return 'unknown';
};

/** Errori del riconoscimento; null per quelli transitori (silenzio, interruzione) dopo cui si riparte. */
export const recognitionErrorCode = (error: string): SpeechErrorCode | null => {
  switch (error) {
    case 'no-speech':
    case 'aborted':
      return null;
    case 'not-allowed':
    case 'service-not-allowed':
      return 'permission-denied';
    case 'audio-capture':
      return 'no-microphone';
    case 'network':
      return 'network';
    case 'language-not-supported':
      return 'language';
    default:
      return 'unknown';
  }
};
