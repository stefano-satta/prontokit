import { strToU8, zipSync } from 'fflate';

/** Crea uno ZIP in memoria con un CSV per foglio. I nomi devono essere già ripuliti. */
export function createCsvZip(files: readonly { name: string; csv: string }[]): Blob {
  const entries = Object.fromEntries(files.map(({ name, csv }) => [name, strToU8(csv)]));
  const zipped = zipSync(entries, { level: 6 });
  return new Blob([zipped], { type: 'application/zip' });
}
