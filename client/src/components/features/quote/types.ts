import type { Quote } from '../../../models/quote';

export type QuoteFieldSetter = <K extends Exclude<keyof Quote, 'supplier' | 'client' | 'lines'>>(key: K, value: Quote[K]) => void;
