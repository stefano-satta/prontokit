import { Code } from 'lucide-react';
import { CopyButton } from '../../common/CopyButton';
import { Panel } from '../../common/Panel';

/** Riquadro finale con i tag pronti da incollare nel `<head>`. */
export function GeneratedTags({ html }: { html: string }) {
  const count = html ? html.split('\n').filter((line) => line.startsWith('<') && !line.startsWith('<!--')).length : 0;

  return (
    <Panel className="flex flex-col gap-4 p-5 sm:p-7" aria-labelledby="generated-tags-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 id="generated-tags-title" className="text-[17px] font-semibold tracking-[-0.01em]">
            Tag generati
          </h2>
          <p className="text-[13px] text-fg-muted" aria-live="polite">
            {count === 0 ? 'Nessun tag ancora' : count === 1 ? '1 tag da incollare nel <head>' : `${count} tag da incollare nel <head>`}
          </p>
        </div>
        <CopyButton value={html} label="Copia tag" variant="primary" disabled={!html} />
      </div>

      {html ? (
        <pre
          data-testid="generated-tags"
          tabIndex={0}
          aria-label="Codice HTML dei tag generati"
          className="max-h-[32rem] overflow-auto rounded-lg border border-border bg-surface-muted p-4 font-mono text-[13px] leading-6 whitespace-pre-wrap wrap-anywhere text-fg"
        >
          <code>{html}</code>
        </pre>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-strong px-4 py-10 text-center">
          <Code className="size-6 text-fg-muted" aria-hidden />
          <p className="text-sm text-fg-muted">Compila almeno il titolo della pagina: i tag compaiono qui mentre scrivi.</p>
        </div>
      )}
    </Panel>
  );
}
