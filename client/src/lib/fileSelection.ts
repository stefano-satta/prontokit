type Check = { ok: true } | { ok: false; reason: string };
type Accepted<C extends Check> = Extract<C, { ok: true }>;
type RejectReason<C extends Check> = Extract<C, { ok: false }>['reason'];

export interface FileSelection<C extends Check, Item> {
  accepted: Item[];
  rejected: { name: string; reason: RejectReason<C> }[];
  /** File validi rimasti fuori perché la selezione era già piena */
  overLimit: string[];
}

/** Divide i file controllati in accettati, scartati (con il motivo) e oltre il limite della selezione. */
export function partitionFiles<C extends Check, Item>(
  checks: readonly { file: File; check: C }[],
  slots: number,
  toItem: (file: File, check: Accepted<C>) => Item,
): FileSelection<C, Item> {
  const selection: FileSelection<C, Item> = { accepted: [], rejected: [], overLimit: [] };
  for (const { file, check } of checks) {
    if (!check.ok) selection.rejected.push({ name: file.name, reason: (check as Extract<C, { ok: false }>).reason });
    else if (selection.accepted.length >= slots) selection.overLimit.push(file.name);
    else selection.accepted.push(toItem(file, check as Accepted<C>));
  }
  return selection;
}

/** `“a.pdf”, “b.pdf” e “c.pdf”`: nomi dei file per gli avvisi. */
export const quoteList = (names: readonly string[]): string => {
  const quoted = names.map((name) => `“${name}”`);
  return quoted.length > 1 ? `${quoted.slice(0, -1).join(', ')} e ${quoted.at(-1)}` : (quoted[0] ?? '');
};
