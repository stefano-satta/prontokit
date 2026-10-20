import type { SheetCsv } from '../../../models/excel';

/** Anteprima delle prime righe così come finiranno nel CSV. */
export function CsvPreview({ sheet }: { sheet: SheetCsv }) {
  const truncatedRows = sheet.rows > sheet.preview.length;
  const shownColumns = sheet.preview[0]?.length ?? 0;
  const truncatedColumns = sheet.columns > shownColumns;

  return (
    <section aria-labelledby="csv-preview-title" className="flex flex-col gap-3">
      <h2 id="csv-preview-title" className="text-lg font-semibold tracking-[-0.01em]">
        Anteprima di “{sheet.name}”
      </h2>
      <div
        className="max-h-[28rem] overflow-auto rounded-xl border border-border bg-surface"
        tabIndex={0}
        role="region"
        aria-label={`Anteprima del foglio ${sheet.name}`}
        data-testid="csv-preview"
      >
        <table className="w-full border-collapse font-mono text-[13px]">
          <tbody>
            {sheet.preview.map((row, r) => (
              <tr key={r} className="border-b border-border last:border-b-0">
                <th scope="row" className="sticky left-0 bg-surface-muted px-3 py-2 text-right font-normal text-fg-muted">
                  {r + 1}
                </th>
                {row.map((value, c) => (
                  <td key={c} className="max-w-[16rem] truncate border-l border-border px-3 py-2 whitespace-pre text-fg" title={value}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(truncatedRows || truncatedColumns) && (
        <p className="text-[13px] text-fg-muted">
          Sono mostrate le prime {sheet.preview.length} righe e {shownColumns} colonne: il file scaricato le contiene tutte.
        </p>
      )}
    </section>
  );
}
