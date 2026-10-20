/** Due mini riquadri con righe evidenziate, per il box della home. */
const LINES = [
  { left: 'w-14', right: 'w-14' },
  { left: 'w-10', right: 'w-10' },
  { left: 'w-16', right: 'w-12', changed: true },
  { left: 'w-8', right: 'w-8' },
];

export function JsonDiffPreview() {
  return (
    <div className="flex w-full items-center justify-center gap-3" aria-hidden>
      {(['left', 'right'] as const).map((side) => (
        <span
          key={side}
          className="flex h-24 w-28 flex-col gap-2 rounded-lg border border-border bg-surface px-2 py-3 font-mono shadow-[0_1px_2px_rgb(15_23_42/0.05)]"
        >
          {LINES.map((line, index) => (
            <span
              key={index}
              className={`flex h-3 items-center gap-1.5 rounded-sm px-1 ${line.changed ? 'bg-success-soft' : ''}`}
            >
              <span className="text-[8px] leading-none text-fg-muted">{index + 1}</span>
              <span
                className={`h-1.5 rounded-full ${line[side]} ${line.changed ? 'bg-success' : 'bg-border-strong'}`}
              />
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}
