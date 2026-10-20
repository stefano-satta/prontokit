export type SpeechLanguageId = 'it' | 'en' | 'fr' | 'es';

export interface SpeechLanguage {
  id: SpeechLanguageId;
  /** Codice BCP 47 passato al riconoscimento vocale */
  locale: string;
  label: string;
}

export type SpeechStatus = 'unsupported' | 'idle' | 'requesting' | 'listening' | 'stopping';

export type SpeechErrorCode = 'permission-denied' | 'no-microphone' | 'insecure' | 'network' | 'language' | 'unknown';

/* Tipi minimi della Web Speech API: la lib DOM di TypeScript non dichiara SpeechRecognition. */
export interface SpeechRecognitionErrorLike extends Event {
  error: string;
}

export interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
