import type { SpeechErrorCode } from '../../models/speech';

export const SPEECH_ERROR_MESSAGES: Record<SpeechErrorCode, string> = {
  'permission-denied':
    "Accesso al microfono negato. Consentilo dalle impostazioni del sito (l'icona accanto all'indirizzo) e riprova.",
  'no-microphone': "Nessun microfono disponibile. Collegane uno o chiudi le app che lo stanno usando, poi riprova.",
  insecure: 'Il microfono funziona solo su connessioni sicure. Apri la pagina con https e riprova.',
  network: 'Il servizio di riconoscimento vocale del browser non risponde. Controlla la connessione e riprova.',
  language: "Il browser non riconosce questa lingua. Scegline un'altra o prova con Chrome.",
  unknown: 'Il riconoscimento vocale si è interrotto. Riprova.',
};

export const UNSUPPORTED_MESSAGE =
  'Questo browser non supporta il riconoscimento vocale. Apri la pagina con Chrome, Edge o Safari aggiornati.';
