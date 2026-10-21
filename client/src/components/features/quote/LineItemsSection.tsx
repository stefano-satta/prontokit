import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { currencySymbol, formatMoney } from '../../../lib/quote/format';
import { lineField } from '../../../lib/quote/validateQuote';
import type { QuoteCurrency, QuoteLine, QuoteLineTotal } from '../../../models/quote';
import { Button } from '../../common/Button';
import { TextAreaField } from '../../common/TextAreaField';
import { TextField } from '../../common/TextField';
import { inlineError, type FieldErrors } from './fieldErrors';
import { QuoteSection } from './QuoteSection';

type LineField = Exclude<keyof QuoteLine, 'id'>;

interface LineItemsSectionProps {
  lines: readonly QuoteLine[];
  totals: readonly QuoteLineTotal[];
  currency: QuoteCurrency;
  errors: FieldErrors;
  onChange: (id: string, key: LineField, value: string) => void;
  onAdd: () => string;
  onRemove: (id: string) => void;
  onMove: (id: string, offset: -1 | 1) => void;
}

/** Voci del preventivo, senza limite: ognuna con descrizione, quantità, unità, prezzo e sconto facoltativo. */
export function LineItemsSection({ lines, totals, currency, errors, onChange, onAdd, onRemove, onMove }: LineItemsSectionProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  // Dopo "Aggiungi voce" il cursore va nella descrizione della voce nuova
  useEffect(() => {
    if (!focusId) return;
    listRef.current?.querySelector<HTMLTextAreaElement>(`[data-line="${focusId}"] textarea`)?.focus();
    setFocusId(null);
  }, [focusId]);

  return (
    <QuoteSection title="Voci" description="Prodotti o servizi offerti. I prezzi sono senza IVA: l'IVA si aggiunge nei totali.">
      <ol ref={listRef} className="flex flex-col gap-4" data-testid="quote-lines">
        {lines.map((line, index) => {
          const total = totals[index]!;
          const error = (key: LineField) => inlineError(errors, lineField(line, key), line[key]);
          const label = `voce ${index + 1}`;
          return (
            <li key={line.id} data-line={line.id} data-testid="quote-line" className="flex flex-col gap-4 rounded-xl border border-border bg-surface-muted/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">Voce {index + 1}</h3>
                <div className="flex items-center">
                  <Button variant="ghost" className="size-9 px-0" onClick={() => onMove(line.id, -1)} disabled={index === 0} aria-label={`Sposta su la ${label}`} icon={<ArrowUp className="size-4" aria-hidden />} />
                  <Button variant="ghost" className="size-9 px-0" onClick={() => onMove(line.id, 1)} disabled={index === lines.length - 1} aria-label={`Sposta giù la ${label}`} icon={<ArrowDown className="size-4" aria-hidden />} />
                  <Button variant="ghost" className="size-9 px-0" onClick={() => onRemove(line.id)} aria-label={lines.length > 1 ? `Elimina la ${label}` : `Svuota la ${label}`} icon={<Trash2 className="size-4" aria-hidden />} />
                </div>
              </div>
              <TextAreaField
                label="Descrizione"
                rows={2}
                value={line.description}
                onChange={(event) => onChange(line.id, 'description', event.target.value)}
                placeholder="Es. Sviluppo del sito web, 5 pagine"
                maxLength={2000}
              />
              <div className="grid grid-cols-2 gap-4 @2xl:grid-cols-4">
                <TextField label="Quantità" inputMode="decimal" value={line.quantity} onChange={(event) => onChange(line.id, 'quantity', event.target.value)} error={error('quantity')} />
                <TextField label="Unità" placeholder="pz, h, gg" maxLength={12} optional value={line.unit} onChange={(event) => onChange(line.id, 'unit', event.target.value)} />
                <TextField label="Prezzo unitario" inputMode="decimal" prefix={currencySymbol(currency)} placeholder="0,00" value={line.unitPrice} onChange={(event) => onChange(line.id, 'unitPrice', event.target.value)} error={error('unitPrice')} />
                <TextField label="Sconto" inputMode="decimal" prefix="%" placeholder="0" optional value={line.discount} onChange={(event) => onChange(line.id, 'discount', event.target.value)} error={error('discount')} />
              </div>
              <p className="flex items-baseline justify-end gap-2 text-sm text-fg-muted">
                Importo
                <span className="tabular text-[15px] font-semibold text-fg" data-testid="line-total">
                  {formatMoney(total.totalCents, currency)}
                </span>
              </p>
            </li>
          );
        })}
      </ol>
      <Button variant="secondary" className="self-start" onClick={() => setFocusId(onAdd())} icon={<Plus className="size-4" aria-hidden />}>
        Aggiungi voce
      </Button>
    </QuoteSection>
  );
}
