import type { ReactNode } from 'react';

/** Cornice "mirino" attorno al QR: angoli che si chiudono quando il codice è pronto. */
export function QrViewfinder({ active, children }: { active: boolean; children: ReactNode }) {
  const corner =
    'absolute size-7 border-primary transition-[inset,opacity] duration-500 ease-out-expo motion-reduce:transition-none';
  const inset = active ? '0px' : '14px';

  return (
    <div className="relative aspect-square w-full max-w-[320px] p-4">
      <span className={`${corner} rounded-tl-xl border-t-[3px] border-l-[3px]`} style={{ top: inset, left: inset }} />
      <span className={`${corner} rounded-tr-xl border-t-[3px] border-r-[3px]`} style={{ top: inset, right: inset }} />
      <span className={`${corner} rounded-bl-xl border-b-[3px] border-l-[3px]`} style={{ bottom: inset, left: inset }} />
      <span className={`${corner} rounded-br-xl border-r-[3px] border-b-[3px]`} style={{ bottom: inset, right: inset }} />
      <div className="relative size-full overflow-hidden rounded-lg">{children}</div>
    </div>
  );
}
