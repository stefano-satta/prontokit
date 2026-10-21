/** Valute disponibili: gli importi si formattano sempre all'italiana. */
export type QuoteCurrency = 'EUR' | 'USD' | 'GBP' | 'CHF';

/** Aliquote IVA italiane: lo 0% richiede una nota che ne spieghi il motivo. */
export type VatRate = 22 | 10 | 5 | 4 | 0;

export type DiscountType = 'percent' | 'amount';

export type ValidityMode = 'days' | 'date';

export type AccentColorId = 'blue' | 'slate' | 'green' | 'teal' | 'violet' | 'red' | 'amber' | 'black';

/** Fornitore o cliente: solo il nome è obbligatorio. */
export interface QuoteParty {
  name: string;
  address: string;
  /** CAP, città e provincia su una riga, es. "20121 Milano (MI)" */
  city: string;
  country: string;
  vatNumber: string;
  taxCode: string;
  email: string;
  phone: string;
  website: string;
}

/** Voce del preventivo come la scrive l'utente: i numeri restano testo finché non si calcolano. */
export interface QuoteLine {
  id: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  /** Sconto di riga in percentuale, facoltativo */
  discount: string;
}

export interface QuoteLogo {
  /** Byte PNG o JPG pronti per pdf-lib (gli altri formati vengono convertiti in PNG) */
  bytes: Uint8Array<ArrayBuffer>;
  format: 'png' | 'jpeg';
  width: number;
  height: number;
  /** URL blob: per l'anteprima in pagina */
  url: string;
}

export interface Quote {
  number: string;
  /** Date in formato ISO `2026-10-21` */
  issueDate: string;
  validityMode: ValidityMode;
  validityDays: string;
  validUntil: string;
  subject: string;
  currency: QuoteCurrency;
  supplier: QuoteParty;
  client: QuoteParty;
  lines: QuoteLine[];
  discountType: DiscountType;
  discountValue: string;
  vatRate: VatRate;
  /** Motivo dell'IVA allo 0%, es. regime forfettario */
  vatNote: string;
  paymentTerms: string;
  deliveryTerms: string;
  iban: string;
  notes: string;
  signature: boolean;
  accentColor: AccentColorId;
}

export type QuotePartyRole = 'supplier' | 'client';

/** Importi in centesimi: niente errori di arrotondamento dei numeri in virgola mobile. */
export interface QuoteLineTotal {
  id: string;
  /** Riga con almeno un campo compilato: quelle vuote non vanno nel PDF */
  filled: boolean;
  quantity: number | null;
  /** Prezzo unitario in unità di valuta, con fino a 4 decimali */
  unitPrice: number | null;
  discountPercent: number;
  totalCents: number;
}

export interface QuoteTotals {
  lines: QuoteLineTotal[];
  subtotalCents: number;
  discountCents: number;
  taxableCents: number;
  vatCents: number;
  totalCents: number;
}

export interface QuoteIssue {
  /** Campo o voce a cui si riferisce, per collegare il messaggio */
  field: string;
  message: string;
}
