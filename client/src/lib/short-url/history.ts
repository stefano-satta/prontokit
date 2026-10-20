import type { ShortUrl } from '../../models/shortUrl';

/** Quanti link restano nella cronologia del browser */
export const HISTORY_LIMIT = 5;

const isShortUrl = (value: unknown): value is ShortUrl => {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.code === 'string' &&
    typeof item.shortUrl === 'string' &&
    typeof item.originalUrl === 'string' &&
    typeof item.createdAt === 'string'
  );
};

/** Legge la cronologia salvata; dati corrotti o modificati a mano diventano una lista vuota. */
export function parseHistory(raw: string | null): ShortUrl[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value
      .filter(isShortUrl)
      .slice(0, HISTORY_LIMIT)
      .map(({ code, shortUrl, originalUrl, createdAt }) => ({ code, shortUrl, originalUrl, createdAt }));
  } catch {
    return [];
  }
}

/** Mette il nuovo link in testa, senza duplicati, tenendo solo gli ultimi `HISTORY_LIMIT`. */
export function addToHistory(history: readonly ShortUrl[], item: ShortUrl): ShortUrl[] {
  return [item, ...history.filter((entry) => entry.code !== item.code)].slice(0, HISTORY_LIMIT);
}
