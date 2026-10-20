import type { Page } from '@playwright/test';

/** BMP 24 bit non compresso: il canvas non sa crearlo, quindi lo si scrive a mano. */
export function createBmp(width = 4, height = 3): Buffer {
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelBytes = rowSize * height;
  const buffer = Buffer.alloc(54 + pixelBytes);
  buffer.write('BM', 0, 'ascii');
  buffer.writeUInt32LE(buffer.length, 2);
  buffer.writeUInt32LE(54, 10);
  buffer.writeUInt32LE(40, 14);
  buffer.writeInt32LE(width, 18);
  buffer.writeInt32LE(height, 22);
  buffer.writeUInt16LE(1, 26);
  buffer.writeUInt16LE(24, 28);
  buffer.writeUInt32LE(pixelBytes, 34);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) buffer.set([200, 80, 30], 54 + y * rowSize + x * 3);
  }
  return buffer;
}

/** Immagine reale codificata dal browser stesso (PNG, JPG, WebP), con un'area trasparente. */
export async function encodeInBrowser(page: Page, mime: string, width = 40, height = 30): Promise<Buffer> {
  const data = await page.evaluate(
    async ({ mime, width, height }) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d')!;
      context.fillStyle = '#2563eb';
      context.fillRect(0, 0, width / 2, height);
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), mime, 0.9));
      return [...new Uint8Array(await blob.arrayBuffer())];
    },
    { mime, width, height },
  );
  return Buffer.from(data);
}
