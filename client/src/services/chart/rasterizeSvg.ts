import { TABLE_FONT_FAMILY, TABLE_FONT_SIZE, type MeasureText } from '../../lib/chart-generator/tableSvg';

/** Converte un SVG in PNG (data URL) passando da un'immagine e un canvas. */
export const rasterizeSvg = async (svg: string, width: number, height: number, scale = 2): Promise<string> => {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas non disponibile in questo browser.');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
};

/** Misuratore di testo con lo stesso font dell'SVG della tabella. */
export const createTextMeasurer = (): MeasureText => {
  const ctx = document.createElement('canvas').getContext('2d');
  return (text, weight) => {
    if (!ctx) return text.length * TABLE_FONT_SIZE * 0.6;
    ctx.font = `${weight === 'bold' ? 600 : 400} ${TABLE_FONT_SIZE}px ${TABLE_FONT_FAMILY}`;
    // Margine per le piccole differenze di rendering tra canvas e SVG
    return ctx.measureText(text).width * 1.04;
  };
};
