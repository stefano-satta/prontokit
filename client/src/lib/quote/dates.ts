const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Data ISO valida (`2026-10-21`), senza correzioni automatiche come il 31 febbraio → 3 marzo. */
export const isIsoDate = (value: string): boolean => {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.getUTCDate() === Number(match[3]) && date.getUTCMonth() + 1 === Number(match[2]);
};

/** Data di oggi nel fuso dell'utente, in formato ISO. */
export const todayIso = (now = new Date()): string =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

/** Somma giorni in UTC, così l'ora legale non sposta la data. */
export const addDays = (iso: string, days: number): string => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/** "21/10/2026", come si scrive in un documento italiano. */
export const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
};
