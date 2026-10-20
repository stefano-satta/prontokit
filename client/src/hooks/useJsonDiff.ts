import { useDeferredValue, useMemo } from 'react';
import { compareJson } from '../lib/json-diff/compareJson';

/** Confronto rinviato: con JSON grandi la digitazione resta fluida e il risultato arriva subito dopo. */
export const useJsonDiff = (left: string, right: string) => {
  const deferredLeft = useDeferredValue(left);
  const deferredRight = useDeferredValue(right);
  const comparison = useMemo(() => compareJson(deferredLeft, deferredRight), [deferredLeft, deferredRight]);
  return { comparison, pending: deferredLeft !== left || deferredRight !== right };
};
