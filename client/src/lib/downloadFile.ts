/** Avvia il download di un file a partire da un URL (data: o blob:). */
export const downloadFile = (href: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const downloadText = (content: string, filename: string, type: string): void =>
  downloadBlob(new Blob([content], { type }), filename);
