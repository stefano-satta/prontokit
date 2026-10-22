import type { MetaTagsErrors, MetaTagsInput } from '../../models/metaTags';
import { validateUrl } from '../validateUrl';

const LOCALE = /^[a-z]{2}_[A-Z]{2}$/;
const TWITTER_HANDLE = /^[A-Za-z0-9_]{1,15}$/;

/** Codice lingua_PAESE di Open Graph, `null` se vuoto o non valido. */
export const ogLocale = (value: string): string | null => (LOCALE.test(value.trim()) ? value.trim() : null);

/** URL assoluto normalizzato, `null` se vuoto o non valido. */
export const absoluteUrl = (value: string): string | null => {
  if (!value.trim()) return null;
  const result = validateUrl(value);
  return result.ok ? result.url : null;
};

/** Nome utente X con la @ davanti, `null` se vuoto o non valido. */
export const twitterHandle = (value: string): string | null => {
  const name = value.trim().replace(/^@/, '');
  return TWITTER_HANDLE.test(name) ? `@${name}` : null;
};

const urlError = (value: string) => {
  if (!value.trim()) return undefined;
  const result = validateUrl(value);
  return result.ok ? undefined : result.error;
};

const handleError = (value: string) =>
  value.trim() && !twitterHandle(value)
    ? 'Il nome utente può avere al massimo 15 caratteri tra lettere, numeri e _ (es. @prontokit).'
    : undefined;

/** Errori dei campi con un formato: i campi vuoti sono sempre validi, i non validi restano fuori dai tag. */
export const validateMetaTags = (input: MetaTagsInput): MetaTagsErrors => {
  const errors: MetaTagsErrors = {
    canonicalUrl: urlError(input.canonicalUrl),
    ogUrl: urlError(input.ogUrl),
    ogImage: urlError(input.ogImage),
    ogLocale:
      input.ogLocale.trim() && !ogLocale(input.ogLocale)
        ? 'Usa il formato lingua_PAESE, per esempio it_IT o en_US.'
        : undefined,
    twitterSite: handleError(input.twitterSite),
    twitterCreator: handleError(input.twitterCreator),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, error]) => error)) as MetaTagsErrors;
};
