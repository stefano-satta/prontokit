import type { QuoteIssue } from '../../../models/quote';

export type FieldErrors = ReadonlyMap<string, string>;

export const toFieldErrors = (issues: readonly QuoteIssue[]): FieldErrors => new Map(issues.map((issue) => [issue.field, issue.message]));

/**
 * Errore da mostrare sotto il campo: solo se l'utente ha già scritto qualcosa.
 * I campi obbligatori ancora vuoti compaiono nell'elenco accanto al download, senza riempire il modulo di rosso.
 */
export const inlineError = (errors: FieldErrors, field: string, value: string): string | null =>
  value.trim() ? (errors.get(field) ?? null) : null;
