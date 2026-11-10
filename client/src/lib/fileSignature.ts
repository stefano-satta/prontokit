/** Primi byte del file, per riconoscerne il formato dalla firma: estensione e MIME type si possono falsificare. */
export const readFileHead = async (file: Blob, length: number): Promise<Uint8Array> =>
  new Uint8Array(await file.slice(0, length).arrayBuffer());

export const startsWithBytes = (bytes: Uint8Array, signature: readonly number[]): boolean =>
  signature.every((byte, i) => bytes[i] === byte);
