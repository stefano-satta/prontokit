export interface ShortUrl {
  code: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
}

export interface ShortUrlStats {
  totalCreated: number;
}

export interface CreateShortUrlInput {
  url: string;
  alias?: string;
}
