import { useCallback, useEffect, useState } from 'react';
import { formatBytes } from '../lib/formatBytes';
import type { QuoteLogo } from '../models/quote';
import { LogoError, MAX_LOGO_BYTES, loadLogo } from '../services/quote/loadLogo';

const LOGO_ERRORS: Record<LogoError['code'], string> = {
  'too-large': `Il logo supera ${formatBytes(MAX_LOGO_BYTES)}: usa un'immagine più leggera.`,
  unsupported: 'Formato non riconosciuto: usa un logo PNG, JPG, WebP, AVIF o BMP.',
  undecodable: "Non riesco a leggere l'immagine: potrebbe essere danneggiata. Prova a salvarla di nuovo in PNG.",
};

/** Logo del preventivo, letto e preparato nel browser. L'URL blob dell'anteprima si libera quando cambia. */
export function useQuoteLogo() {
  const [logo, setLogo] = useState<QuoteLogo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => () => {
    if (logo) URL.revokeObjectURL(logo.url);
  }, [logo]);

  const choose = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      setLogo(await loadLogo(file));
    } catch (cause) {
      setError(cause instanceof LogoError ? LOGO_ERRORS[cause.code] : LOGO_ERRORS.undecodable);
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(() => {
    setLogo(null);
    setError(null);
  }, []);

  return { logo, error, loading, choose, remove };
}
