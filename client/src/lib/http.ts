import type { ApiErrorBody } from '../models/api';

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Wrapper tipizzato su fetch: JSON in/out e messaggi d'errore leggibili. */
export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...init.headers },
    });
  } catch {
    throw new HttpError('Impossibile contattare il server. Riprova tra poco.', 0);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const fallback =
      response.status >= 500 ? 'Il server non risponde. Riprova tra poco.' : 'Qualcosa è andato storto. Riprova.';
    const message = (body as ApiErrorBody | null)?.error?.message ?? fallback;
    throw new HttpError(message, response.status);
  }
  return body as T;
}
