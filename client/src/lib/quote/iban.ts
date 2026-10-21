/** IBAN senza spazi e in maiuscolo. */
export const normalizeIban = (input: string): string => input.replace(/[\s-]/g, '').toUpperCase();

/** Controllo ISO 13616: struttura e cifra di controllo mod 97 (lunghezza da 15 a 34 caratteri). */
export function isValidIban(input: string): boolean {
  const iban = normalizeIban(input);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const digits = /\d/.test(char) ? char : String(char.charCodeAt(0) - 55);
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

/** IBAN a gruppi di 4 caratteri, più facile da leggere e ricopiare. */
export const formatIban = (input: string): string => normalizeIban(input).replace(/(.{4})(?=.)/g, '$1 ');
