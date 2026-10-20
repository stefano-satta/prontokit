import type { SpeechLanguage, SpeechLanguageId } from '../../models/speech';

export const DEFAULT_SPEECH_LANGUAGE: SpeechLanguageId = 'it';

export const SPEECH_LANGUAGES: readonly SpeechLanguage[] = [
  { id: 'it', locale: 'it-IT', label: 'Italiano' },
  { id: 'en', locale: 'en-US', label: 'English' },
  { id: 'fr', locale: 'fr-FR', label: 'Français' },
  { id: 'es', locale: 'es-ES', label: 'Español' },
];

export const getSpeechLanguage = (id: SpeechLanguageId): SpeechLanguage =>
  SPEECH_LANGUAGES.find((language) => language.id === id) ?? SPEECH_LANGUAGES[0];
