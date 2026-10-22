import type { MetaTagsInput } from '../../models/metaTags';
import { cleanText } from './lengthLimits';
import { absoluteUrl, ogLocale, twitterHandle } from './validateMetaTags';

const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeText = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Parole chiave separate da virgola, senza vuoti né doppioni (confronto senza maiuscole). */
export const normalizeKeywords = (value: string) => {
  const seen = new Set<string>();
  return value
    .split(',')
    .map(cleanText)
    .filter((keyword) => {
      const key = keyword.toLowerCase();
      if (!keyword || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(', ');
};

type Attribute = 'name' | 'property';

const meta = (attribute: Attribute, key: string, content: string | null) =>
  content ? `<meta ${attribute}="${key}" content="${escapeAttribute(content)}">` : null;

const compact = (lines: (string | null)[]) => lines.filter((line): line is string => line !== null);

/**
 * Tag HTML pronti per il `<head>`. Solo i campi compilati e validi diventano tag; titolo, descrizione e URL di
 * Open Graph e X, se vuoti, riprendono quelli della pagina, così i campi ripetuti si scrivono una volta sola.
 */
export const buildMetaTags = (input: MetaTagsInput): string => {
  const title = cleanText(input.title);
  const description = cleanText(input.description);
  const canonical = absoluteUrl(input.canonicalUrl);

  const ogTitle = cleanText(input.ogTitle) || title;
  const ogDescription = cleanText(input.ogDescription) || description;
  const ogUrl = absoluteUrl(input.ogUrl) ?? canonical;
  const ogImage = absoluteUrl(input.ogImage);
  const imageAlt = ogImage ? cleanText(input.ogImageAlt) : '';
  const siteName = cleanText(input.ogSiteName);
  const site = twitterHandle(input.twitterSite);
  const creator = twitterHandle(input.twitterCreator);

  const general = compact([
    title ? `<title>${escapeText(title)}</title>` : null,
    meta('name', 'description', description),
    meta('name', 'keywords', normalizeKeywords(input.keywords)),
    meta('name', 'author', cleanText(input.author)),
    canonical ? `<link rel="canonical" href="${escapeAttribute(canonical)}">` : null,
  ]);

  const hasOpenGraph = Boolean(ogTitle || ogDescription || ogUrl || ogImage || siteName);
  const openGraph = hasOpenGraph
    ? compact([
        meta('property', 'og:type', input.ogType),
        meta('property', 'og:title', ogTitle),
        meta('property', 'og:description', ogDescription),
        meta('property', 'og:url', ogUrl),
        meta('property', 'og:site_name', siteName),
        meta('property', 'og:locale', ogLocale(input.ogLocale)),
        meta('property', 'og:image', ogImage),
        meta('property', 'og:image:alt', imageAlt),
      ])
    : [];

  const hasTwitter = Boolean(ogTitle || ogDescription || ogImage || site || creator);
  const twitter = hasTwitter
    ? compact([
        meta('name', 'twitter:card', input.twitterCard),
        meta('name', 'twitter:site', site),
        meta('name', 'twitter:creator', creator),
        meta('name', 'twitter:title', ogTitle),
        meta('name', 'twitter:description', ogDescription),
        meta('name', 'twitter:image', ogImage),
        meta('name', 'twitter:image:alt', imageAlt),
      ])
    : [];

  return [
    general,
    openGraph.length ? ['<!-- Open Graph -->', ...openGraph] : [],
    twitter.length ? ['<!-- Twitter / X -->', ...twitter] : [],
  ]
    .filter((block) => block.length)
    .map((block) => block.join('\n'))
    .join('\n\n');
};
