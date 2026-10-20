import { CopyButton } from '../../common/CopyButton';

const PREVIEW_LINES = 40;

export function MarkdownPreview({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n');
  const preview = lines.slice(0, PREVIEW_LINES).join('\n');
  const truncated = lines.length > PREVIEW_LINES;

  return (
    <section aria-labelledby="preview-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 id="preview-title" className="text-lg font-semibold tracking-[-0.01em]">
          Anteprima
        </h2>
        <CopyButton value={markdown} label="Copia tutto" />
      </div>
      <pre
        className="max-h-[28rem] overflow-auto rounded-xl border border-border bg-surface p-5 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-fg"
        data-testid="markdown-preview"
        tabIndex={0}
      >
        {preview}
        {truncated && <span className="text-fg-muted">{`\n\n… altre ${lines.length - PREVIEW_LINES} righe nel file scaricato`}</span>}
      </pre>
    </section>
  );
}
