import { currencySymbol, formatMoney } from '../../../lib/quote/format';
import { VAT_RATES } from '../../../lib/quote/options';
import type { DiscountType, Quote, QuoteTotals, VatRate } from '../../../models/quote';
import { SegmentedControl } from '../../common/SegmentedControl';
import { SelectField } from '../../common/SelectField';
import { TextField } from '../../common/TextField';
import { inlineError, type FieldErrors } from './fieldErrors';
import { QuoteSection } from './QuoteSection';
import type { QuoteFieldSetter } from './types';

interface TotalsSectionProps {
  quote: Quote;
  totals: QuoteTotals;
  errors: FieldErrors;
  onChange: QuoteFieldSetter;
}

const DISCOUNT_TYPES = [
  { value: 'percent', label: 'Percentuale' },
  { value: 'amount', label: 'Importo' },
] as const satisfies readonly { value: DiscountType; label: string }[];

/** Sconto globale, aliquota IVA e riepilogo: imponibile, IVA da aggiungere e totale da pagare. */
export function TotalsSection({ quote, totals, errors, onChange }: TotalsSectionProps) {
  const money = (cents: number) => formatMoney(cents, quote.currency);
  const rows: [string, string, string][] = [
    ...(totals.discountCents > 0
      ? ([
          ['Totale voci', money(totals.subtotalCents), 'subtotal'],
          ['Sconto', `− ${money(totals.discountCents)}`, 'discount'],
        ] as [string, string, string][])
      : []),
    ['Imponibile (IVA esclusa)', money(totals.taxableCents), 'taxable'],
    [`IVA ${quote.vatRate}%`, money(totals.vatCents), 'vat'],
  ];

  return (
    <QuoteSection title="Sconto e IVA">
      <div className="grid gap-5 @lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <SegmentedControl legend="Sconto sul totale" options={DISCOUNT_TYPES} value={quote.discountType} onChange={(type) => onChange('discountType', type)} />
          <TextField
            label="Valore dello sconto"
            inputMode="decimal"
            prefix={quote.discountType === 'percent' ? '%' : currencySymbol(quote.currency)}
            placeholder="0"
            optional
            value={quote.discountValue}
            onChange={(event) => onChange('discountValue', event.target.value)}
            error={inlineError(errors, 'discount', quote.discountValue)}
          />
        </div>
        <div className="flex flex-col gap-3">
          <SelectField<VatRate> label="Aliquota IVA" options={VAT_RATES} value={quote.vatRate} onChange={(rate) => onChange('vatRate', rate)} />
          {quote.vatRate === 0 && (
            <TextField
              label="Motivo dell'IVA allo 0%"
              placeholder="Es. Operazione senza IVA, regime forfettario"
              hint="Compare sotto il totale del PDF."
              maxLength={240}
              optional
              value={quote.vatNote}
              onChange={(event) => onChange('vatNote', event.target.value)}
            />
          )}
        </div>
      </div>

      <dl className="flex flex-col rounded-xl border border-border text-sm" data-testid="quote-totals">
        {rows.map(([label, value, id]) => (
          <div key={id} className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-2.5" data-testid={`total-${id}`}>
            <dt className="text-fg-muted">{label}</dt>
            <dd className="tabular font-medium text-fg">{value}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 rounded-b-xl bg-primary-soft px-4 py-3" data-testid="total-due">
          <dt className="font-semibold text-fg">Totale da pagare</dt>
          <dd className="tabular text-[17px] font-semibold text-primary-text">{money(totals.totalCents)}</dd>
        </div>
      </dl>
    </QuoteSection>
  );
}
