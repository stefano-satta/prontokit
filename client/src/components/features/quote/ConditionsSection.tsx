import type { Quote } from '../../../models/quote';
import { TextAreaField } from '../../common/TextAreaField';
import { TextField } from '../../common/TextField';
import { inlineError, type FieldErrors } from './fieldErrors';
import { QuoteSection } from './QuoteSection';
import type { QuoteFieldSetter } from './types';

interface ConditionsSectionProps {
  quote: Quote;
  errors: FieldErrors;
  onChange: QuoteFieldSetter;
}

/** Condizioni dell'offerta e firma per accettazione: nel PDF compaiono solo i campi compilati. */
export function ConditionsSection({ quote, errors, onChange }: ConditionsSectionProps) {
  return (
    <QuoteSection title="Condizioni" description="Nel PDF compaiono solo i campi compilati.">
      <TextAreaField
        label="Condizioni di pagamento"
        placeholder="Es. 30% all'ordine, saldo alla consegna con bonifico"
        maxLength={1000}
        optional
        value={quote.paymentTerms}
        onChange={(event) => onChange('paymentTerms', event.target.value)}
      />
      <TextAreaField
        label="Tempi di consegna"
        rows={2}
        placeholder="Es. 4 settimane dalla conferma"
        maxLength={1000}
        optional
        value={quote.deliveryTerms}
        onChange={(event) => onChange('deliveryTerms', event.target.value)}
      />
      <TextField
        label="IBAN"
        placeholder="Es. IT60 X054 2811 1010 0000 0123 456"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={42}
        optional
        value={quote.iban}
        onChange={(event) => onChange('iban', event.target.value)}
        error={inlineError(errors, 'iban', quote.iban)}
      />
      <TextAreaField label="Note" maxLength={2000} optional value={quote.notes} onChange={(event) => onChange('notes', event.target.value)} />
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border-strong px-4 py-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring">
        <input
          type="checkbox"
          checked={quote.signature}
          onChange={(event) => onChange('signature', event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-fg">Spazio per la firma per accettazione</span>
          <span className="text-[13px] text-fg-muted">In fondo al PDF, con data e firma del cliente.</span>
        </span>
      </label>
    </QuoteSection>
  );
}
