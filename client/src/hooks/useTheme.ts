import { useCallback, useSyncExternalStore } from 'react';
import type { Theme } from '../models/theme';

const STORAGE_KEY = 'theme';
const listeners = new Set<() => void>();

const getTheme = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage non disponibile: il tema vale solo per la sessione
  }
  listeners.forEach((listener) => listener());
};

/** Tema corrente (inizializzato in index.html) e toggle persistito. */
export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light' as Theme);
  const toggleTheme = useCallback(() => applyTheme(getTheme() === 'dark' ? 'light' : 'dark'), []);
  return { theme, toggleTheme };
};
