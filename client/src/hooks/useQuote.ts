import { useCallback, useMemo, useState } from 'react';
import { calculateQuote } from '../lib/quote/calculateQuote';
import { createLine, createQuote } from '../lib/quote/createQuote';
import { validateQuote } from '../lib/quote/validateQuote';
import type { Quote, QuoteLine, QuoteParty, QuotePartyRole } from '../models/quote';

type EditableField = Exclude<keyof Quote, 'supplier' | 'client' | 'lines'>;
type LineField = Exclude<keyof QuoteLine, 'id'>;

/** Stato del preventivo con totali e problemi sempre aggiornati. Niente salvataggio: chiusa la pagina, i dati spariscono. */
export function useQuote() {
  const [quote, setQuote] = useState<Quote>(() => createQuote());

  const setField = useCallback(<K extends EditableField>(key: K, value: Quote[K]) => setQuote((current) => ({ ...current, [key]: value })), []);

  const setPartyField = useCallback(
    (role: QuotePartyRole, key: keyof QuoteParty, value: string) =>
      setQuote((current) => ({ ...current, [role]: { ...current[role], [key]: value } })),
    [],
  );

  const setLineField = useCallback(
    (id: string, key: LineField, value: string) =>
      setQuote((current) => ({ ...current, lines: current.lines.map((line) => (line.id === id ? { ...line, [key]: value } : line)) })),
    [],
  );

  const addLine = useCallback(() => {
    const line = createLine();
    setQuote((current) => ({ ...current, lines: [...current.lines, line] }));
    return line.id;
  }, []);

  /** L'ultima voce non si toglie: si svuota, così resta sempre una riga da compilare. */
  const removeLine = useCallback(
    (id: string) =>
      setQuote((current) => ({
        ...current,
        lines: current.lines.length > 1 ? current.lines.filter((line) => line.id !== id) : [createLine()],
      })),
    [],
  );

  const moveLine = useCallback(
    (id: string, offset: -1 | 1) =>
      setQuote((current) => {
        const from = current.lines.findIndex((line) => line.id === id);
        const to = from + offset;
        if (from < 0 || to < 0 || to >= current.lines.length) return current;
        const lines = [...current.lines];
        [lines[from], lines[to]] = [lines[to]!, lines[from]!];
        return { ...current, lines };
      }),
    [],
  );

  const reset = useCallback(() => setQuote(createQuote()), []);

  const totals = useMemo(() => calculateQuote(quote), [quote]);
  const issues = useMemo(() => validateQuote(quote, totals), [quote, totals]);

  return { quote, totals, issues, setField, setPartyField, setLineField, addLine, removeLine, moveLine, reset };
}
