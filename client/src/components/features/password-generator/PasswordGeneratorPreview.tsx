/** Campo password e barra di sicurezza piena, per il box della home. */
export function PasswordGeneratorPreview() {
  return (
    <div className="flex w-full max-w-56 flex-col gap-3" aria-hidden>
      <span className="flex h-11 items-center justify-center rounded-lg border border-border bg-surface font-mono text-[15px] font-medium tracking-wide shadow-[0_1px_2px_rgb(15_23_42/0.05)]">
        {'k7'}
        <span className="text-accent">#</span>
        {'Rq'}
        <span className="text-primary-text">2</span>
        {'v'}
        <span className="text-accent">!</span>
        {'Lm'}
        <span className="text-primary-text">9</span>
      </span>
      <span className="grid grid-cols-3 gap-1.5">
        <span className="h-1.5 rounded-full bg-success" />
        <span className="h-1.5 rounded-full bg-success" />
        <span className="h-1.5 rounded-full bg-success" />
      </span>
      <span className="text-center text-[11px] font-semibold text-success">Forte</span>
    </div>
  );
}
