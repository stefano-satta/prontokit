import { useEffect, type RefObject } from 'react';

/** Chiude un pannello aperto con Esc o con un click/tap fuori dal contenitore. */
export const useDismiss = (containerRef: RefObject<HTMLElement | null>, open: boolean, onDismiss: (byKeyboard: boolean) => void) => {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) onDismiss(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss(true);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [containerRef, open, onDismiss]);
};
