const pad = (value: number) => String(value).padStart(2, '0');

/** Data nel fuso dell'utente, in formato ISO: `2026-10-21`. */
export const localIsoDate = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Ora e minuti nel fuso dell'utente, senza separatore: `0905`. */
export const localHourMinute = (date: Date): string => `${pad(date.getHours())}${pad(date.getMinutes())}`;
