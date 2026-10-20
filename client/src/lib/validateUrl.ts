import type { UrlValidation } from '../models/validation';

/** Valida un URL http(s). Aggiunge https:// se manca il protocollo. */
export const validateUrl = (input: string): UrlValidation => {
  const value = input.trim();
  if (!value) return { ok: false, error: 'Inserisci un URL.' };

  const candidate = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { ok: false, error: "L'URL deve iniziare con http:// o https://." };
    }
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') {
      return { ok: false, error: 'Controlla il dominio: sembra incompleto (es. esempio.it).' };
    }
    return { ok: true, url: url.toString() };
  } catch {
    return { ok: false, error: 'Questo non sembra un URL valido.' };
  }
};
