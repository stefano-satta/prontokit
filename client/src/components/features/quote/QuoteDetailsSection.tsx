import { CURRENCIES, MAX_VALIDITY_DAYS } from '../../../lib/quote/options';
import { formatDate } from '../../../lib/quote/dates';
import { validUntilOf } from '../../../lib/quote/validateQuote';
import type { Quote, QuoteCurrency, ValidityMode } from '../../../models/quote';
import { SegmentedControl } from '../../common/SegmentedControl';
import { SelectField } from '../../common/SelectField';
import { TextField } from '../../common/TextField';
import { inlineError, type FieldErrors } from './fieldErrors';
import { QuoteSection } from './QuoteSection';
import type { QuoteFieldSetter } from './types';

interface QuoteDetailsSectionProps {
  quote: Quote;
  errors: FieldErrors;
  onChange: QuoteFieldSetter;
}

const VALIDITY_MODES = [
  { value: 'days', label: 'Giorni' },
  { value: 'date', label: 'Data' },
] as const satisfies readonly { value: ValidityMode; label: string }[];

export function QuoteDetailsSection({ quote, errors, onChange }: QuoteDetailsSectionProps) {
  const validUntil = validUntilOf(quote);
  const validityValue = quote.validityMode === 'days' ? quote.validityDays : quote.validUntil;

  return (
    <QuoteSection title="Preventivo">
      <div className="grid gap-5 @lg:grid-cols-2">
        <TextField
          label="Numero"
          value={quote.number}
          onChange={(event) => onChange('number', event.target.value)}
          placeholder="Es. 2026/001"
          hint="Una numerazione progressiva ti aiuta a ritrovarlo."
          maxLength={30}
        />
        <TextField
          label="Data"
          type="date"
          value={quote.issueDate}
          onChange={(event) => onChange('issueDate', event.target.value)}
          error={inlineError(errors, 'issueDate', quote.issueDate)}
        />
      </div>

      <div className="flex flex-col gap-4">
        <SegmentedControl
          legend="Validità dell'offerta"
          options={VALIDITY_MODES}
          value={quote.validityMode}
          onChange={(mode) => {
            onChange('validityMode', mode);
            // Passando alla data si parte dalla scadenza già calcolata dai giorni
            if (mode === 'date' && !quote.validUntil && validUntil) onChange('validUntil', validUntil);
          }}
        />
        <div className="@lg:max-w-[calc(50%-10px)]">
          {quote.validityMode === 'days' ? (
            <TextField
              label="Giorni di validità"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_VALIDITY_DAYS}
              value={quote.validityDays}
              onChange={(event) => onChange('validityDays', event.target.value)}
              error={inlineError(errors, 'validity', validityValue)}
              hint={validUntil ? `Valido fino al ${formatDate(validUntil)}.` : undefined}
            />
          ) : (
            <TextField
              label="Valido fino al"
              type="date"
              min={quote.issueDate || undefined}
              value={quote.validUntil}
              onChange={(event) => onChange('validUntil', event.target.value)}
              error={inlineError(errors, 'validity', validityValue)}
            />
          )}
        </div>
      </div>

      <div className="grid gap-5 @lg:grid-cols-[minmax(0,1fr)_auto]">
        <TextField
          label="Oggetto"
          value={quote.subject}
          onChange={(event) => onChange('subject', event.target.value)}
          placeholder="Es. Restyling del sito web"
          maxLength={160}
          optional
        />
        <SelectField<QuoteCurrency> label="Valuta" options={CURRENCIES} value={quote.currency} onChange={(currency) => onChange('currency', currency)} className="@lg:min-w-52" />
      </div>
    </QuoteSection>
  );
}
