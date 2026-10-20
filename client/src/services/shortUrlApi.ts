import { http } from '../lib/http';
import type { CreateShortUrlInput, ShortUrl, ShortUrlStats } from '../models/shortUrl';

const BASE = '/api/short-urls';

export const shortUrlApi = {
  stats: () => http<ShortUrlStats>(`${BASE}/stats`),
  create: (input: CreateShortUrlInput) => http<ShortUrl>(BASE, { method: 'POST', body: JSON.stringify(input) }),
};
