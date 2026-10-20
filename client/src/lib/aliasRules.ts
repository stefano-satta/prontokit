/** Stesse regole del server (shortUrl.schemas.ts), per un feedback immediato. */
export const ALIAS_PATTERN = /^[a-zA-Z0-9_-]{3,32}$/;
const RESERVED = new Set(['api', 'health', 'assets', 'qr-code', 'short-url']);

export const validateAlias = (alias: string): string | null => {
  if (!alias) return null;
  if (!ALIAS_PATTERN.test(alias)) return 'Usa da 3 a 32 caratteri: lettere, numeri, trattino o underscore.';
  if (RESERVED.has(alias.toLowerCase())) return 'Questo alias è riservato, scegline un altro.';
  return null;
};
