import { CopyButton } from '../../common/CopyButton';
import { HISTORY_LIMIT } from '../../../lib/short-url/history';
import type { ShortUrl } from '../../../models/shortUrl';

const dateFormatter = new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short' });

export function ShortUrlHistory({ items }: { items: readonly ShortUrl[] }) {
  return (
    <section aria-labelledby="history-title" className="flex flex-col gap-4">
      <div>
        <h2 id="history-title" className="text-lg font-semibold tracking-[-0.01em]">
          I tuoi ultimi link
        </h2>
        <p className="text-[13px] text-fg-muted">
          Gli ultimi {HISTORY_LIMIT} creati da questo browser, dal più recente. Restano solo su questo dispositivo.
        </p>
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-strong px-5 py-8 text-center text-sm text-fg-muted">
          Nessun link ancora. Il primo che accorci comparirà qui.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full table-fixed text-sm" data-testid="short-url-table">
            <thead className="bg-surface-muted text-left text-[12px] font-medium text-fg-muted">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">Short URL</th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">Destinazione</th>
                <th scope="col" className="hidden w-44 px-4 py-2.5 font-medium lg:table-cell">Creato</th>
                <th scope="col" className="w-16 px-4 py-2.5"><span className="sr-only">Azioni</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <HistoryRow key={item.code} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function HistoryRow({ item }: { item: ShortUrl }) {
  return (
    <tr className="transition-colors hover:bg-surface-muted/60" data-code={item.code}>
      <td className="px-4 py-3">
        <a href={item.shortUrl} target="_blank" rel="noreferrer" className="block truncate font-mono font-medium text-primary-text hover:underline">
          /{item.code}
        </a>
        <span className="block truncate text-[12px] text-fg-muted md:hidden">{item.originalUrl}</span>
      </td>
      <td className="hidden truncate px-4 py-3 text-fg-muted md:table-cell" title={item.originalUrl}>
        {item.originalUrl}
      </td>
      <td className="tabular hidden px-4 py-3 text-fg-muted lg:table-cell">
        {dateFormatter.format(new Date(item.createdAt))}
      </td>
      <td className="px-3 py-2 text-right">
        <CopyButton value={item.shortUrl} variant="ghost" compact label="Copia short URL" />
      </td>
    </tr>
  );
}
