import { useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * Tiene valido solo l'ultimo lavoro avviato: `start` annulla il precedente e restituisce il segnale del nuovo.
 * Allo smontaggio il lavoro in corso viene annullato.
 */
export const useLatestTask = () => {
  const controllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const start = useCallback((): AbortSignal => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller.signal;
  }, []);

  useEffect(() => cancel, [cancel]);

  return useMemo(() => ({ start, cancel }), [start, cancel]);
};
