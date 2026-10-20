import { useCallback, useSyncExternalStore } from 'react';
import { addToHistory, parseHistory } from '../lib/short-url/history';
import type { ShortUrl } from '../models/shortUrl';

const STORAGE_KEY = 'short-url-history';
const EMPTY: ShortUrl[] = [];
const listeners = new Set<() => void>();

const readRaw = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

// useSyncExternalStore vuole lo stesso riferimento finché i dati non cambiano
let cache: { raw: string | null; items: ShortUrl[] } = { raw: null, items: EMPTY };
const getSnapshot = (): ShortUrl[] => {
  const raw = readRaw();
  if (raw !== cache.raw) cache = { raw, items: parseHistory(raw) };
  return cache.items;
};

const notify = () => listeners.forEach((listener) => listener());

const onStorage = (event: StorageEvent) => {
  if (event.key === STORAGE_KEY || event.key === null) notify();
};

const subscribe = (listener: () => void) => {
  if (listeners.size === 0) window.addEventListener('storage', onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
};

/** Ultimi link creati da questo browser, salvati in localStorage e sincronizzati tra le schede. */
export const useShortUrlHistory = () => {
  const history = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const add = useCallback((item: ShortUrl) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addToHistory(getSnapshot(), item)));
    } catch {
      // storage pieno o non disponibile: il link è creato comunque, solo non resta in cronologia
    }
    notify();
  }, []);

  return { history, add };
};
