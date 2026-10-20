import { zipSync } from 'fflate';

/** ZIP in memoria delle immagini convertite. Niente compressione: JPG, PNG e WebP sono già compressi. */
export async function createImagesZip(files: readonly { name: string; blob: Blob }[]): Promise<Blob> {
  const entries = Object.fromEntries(
    await Promise.all(files.map(async ({ name, blob }) => [name, new Uint8Array(await blob.arrayBuffer())] as const)),
  );
  return new Blob([zipSync(entries, { level: 0 })], { type: 'application/zip' });
}
