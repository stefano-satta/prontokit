const pad = (value: number) => String(value).padStart(2, '0');

/** Nome del file .txt scaricato, con data e ora locali: "trascrizione-2026-10-17-1134.txt". */
export const transcriptFilename = (date: Date = new Date()): string =>
  `trascrizione-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}.txt`;
