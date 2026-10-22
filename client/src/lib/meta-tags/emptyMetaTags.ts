import type { MetaTagsInput } from '../../models/metaTags';

/** Modulo iniziale: italiano e card con immagine grande, le scelte più comuni. */
export const EMPTY_META_TAGS: MetaTagsInput = {
  title: '',
  description: '',
  keywords: '',
  author: '',
  canonicalUrl: '',
  ogTitle: '',
  ogDescription: '',
  ogUrl: '',
  ogImage: '',
  ogImageAlt: '',
  ogType: 'website',
  ogSiteName: '',
  ogLocale: 'it_IT',
  twitterCard: 'summary_large_image',
  twitterSite: '',
  twitterCreator: '',
};
