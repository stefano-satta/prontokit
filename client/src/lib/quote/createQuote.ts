import type { Quote, QuoteLine, QuoteParty } from '../../models/quote';
import { todayIso } from './dates';

export const DEFAULT_VALIDITY_DAYS = 30;

export const createParty = (): QuoteParty => ({
  name: '',
  address: '',
  city: '',
  country: '',
  vatNumber: '',
  taxCode: '',
  email: '',
  phone: '',
  website: '',
});

/** Voce nuova con quantità 1: è il caso più frequente. */
export const createLine = (): QuoteLine => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: '1',
  unit: '',
  unitPrice: '',
  discount: '',
});

/** Preventivo vuoto: data di oggi, validità 30 giorni, euro, IVA al 22% e spazio per la firma. */
export const createQuote = (today = todayIso()): Quote => ({
  number: '',
  issueDate: today,
  validityMode: 'days',
  validityDays: String(DEFAULT_VALIDITY_DAYS),
  validUntil: '',
  subject: '',
  currency: 'EUR',
  supplier: createParty(),
  client: createParty(),
  lines: [createLine()],
  discountType: 'percent',
  discountValue: '',
  vatRate: 22,
  vatNote: '',
  paymentTerms: '',
  deliveryTerms: '',
  iban: '',
  notes: '',
  signature: true,
  accentColor: 'blue',
});
