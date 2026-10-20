import { useCallback, useEffect, useRef, useState } from 'react';

const RESET_MS = 2000;

/** Copia testo negli appunti ed espone uno stato "copiato" temporaneo. */
export const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), RESET_MS);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { copied, copy };
};
