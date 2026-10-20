/** Corpo delle risposte di errore del server */
export interface ApiErrorBody {
  error?: { message?: string; details?: unknown };
}
