/** Righe di codice con i tag principali, per il box della home. */
export function MetaTagsPreview() {
  return (
    <div
      className="flex w-full max-w-60 flex-col gap-1.5 rounded-lg border border-border bg-surface px-3 py-3 font-mono text-[11px] leading-4 shadow-[0_1px_2px_rgb(15_23_42/0.05)]"
      aria-hidden
    >
      <span className="truncate">
        <span className="text-primary-text">&lt;title&gt;</span>Home<span className="text-primary-text">&lt;/title&gt;</span>
      </span>
      <span className="truncate">
        <span className="text-primary-text">&lt;meta</span> <span className="text-accent">name</span>="description"
      </span>
      <span className="truncate">
        <span className="text-primary-text">&lt;meta</span> <span className="text-accent">property</span>="og:title"
      </span>
      <span className="truncate">
        <span className="text-primary-text">&lt;meta</span> <span className="text-accent">name</span>="twitter:card"
      </span>
    </div>
  );
}
