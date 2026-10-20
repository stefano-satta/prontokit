const pad = (value: number) => String(value).padStart(2, '0');

/** Nome del file scaricato, con data e ora locali: "json-2026-10-20-0905.json". */
export const jsonDiffFilename = (date: Date = new Date()): string =>
  `json-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}.json`;
