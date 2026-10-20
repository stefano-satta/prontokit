import { ExternalLink } from 'lucide-react';
import { buttonClasses } from '../../common/Button';
import { CopyButton } from '../../common/CopyButton';
import type { ShortUrl } from '../../../models/shortUrl';

export function ShortUrlResult({ item }: { item: ShortUrl }) {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-success/30 bg-success-soft p-5 animate-[result-in_500ms_var(--ease-out-expo)]"
      role="status"
      data-testid="short-url-result"
    >
      <p className="text-sm font-medium text-success">Link creato</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={item.shortUrl}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 flex-1 truncate font-mono text-[19px] font-semibold text-fg hover:underline"
        >
          {item.shortUrl}
        </a>
        <div className="flex gap-2">
          <CopyButton value={item.shortUrl} variant="primary" />
          <a
            href={item.shortUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonClasses('secondary', 'md', 'w-10 px-0')}
            aria-label="Apri il link in una nuova scheda"
          >
            <ExternalLink className="size-4" aria-hidden />
          </a>
        </div>
      </div>
      <p className="truncate text-[13px] text-fg-muted">
        Porta a <span className="font-mono">{item.originalUrl}</span>
      </p>
    </div>
  );
}
