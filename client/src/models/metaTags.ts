export type OgType = 'website' | 'article';

export type TwitterCardType = 'summary' | 'summary_large_image';

/** Valori del modulo così come li scrive l'utente (stringhe vuote = campo non compilato) */
export interface MetaTagsInput {
  title: string;
  description: string;
  keywords: string;
  author: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogImage: string;
  ogImageAlt: string;
  ogType: OgType;
  ogSiteName: string;
  ogLocale: string;
  twitterCard: TwitterCardType;
  twitterSite: string;
  twitterCreator: string;
}

/** Campi che hanno un formato da rispettare */
export type MetaTagsCheckedField = 'canonicalUrl' | 'ogUrl' | 'ogImage' | 'ogLocale' | 'twitterSite' | 'twitterCreator';

export type MetaTagsErrors = Partial<Record<MetaTagsCheckedField, string>>;

export type LengthStatus = 'empty' | 'short' | 'ok' | 'long';

/** Intervallo di caratteri consigliato, estremi inclusi */
export interface LengthRange {
  min: number;
  max: number;
}
