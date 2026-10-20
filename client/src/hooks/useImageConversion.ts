import { useCallback, useEffect, useRef, useState } from 'react';
import { convertedFilenames } from '../lib/image-converter/imageFileNames';
import { allAlreadyInFormat, freeSlots, rejectionNotices, sameFormatMessage } from '../lib/image-converter/selectImages';
import { validateImage, type ImageRejectReason } from '../lib/validateImage';
import type { ImageConversionPhase, ImageOutputFormat, ImageResult, SelectedImage } from '../models/imageConverter';
import { ImageConversionError, conversionErrorMessage, convertImage } from '../services/image/convertImage';

let nextId = 0;

/**
 * Selezione (fino a 5 immagini), scelta del formato e conversione nel browser.
 * Le immagini restano solo in memoria; gli URL blob: delle miniature vengono rilasciati
 * quando si rimuove un file, su reset e allo smontaggio.
 */
export const useImageConversion = () => {
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [target, setTargetState] = useState<ImageOutputFormat>('png');
  const [phase, setPhase] = useState<ImageConversionPhase>({ status: 'selecting' });
  const [notices, setNotices] = useState<string[]>([]);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  const imagesRef = useRef<SelectedImage[]>([]);
  const urlsRef = useRef(new Set<string>());
  const runRef = useRef(0);

  const createUrl = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urlsRef.current.add(url);
    return url;
  };
  const releaseUrl = (url: string) => {
    URL.revokeObjectURL(url);
    urlsRef.current.delete(url);
  };

  const updateImages = (next: SelectedImage[]) => {
    imagesRef.current = next;
    setImages(next);
    setBlockedMessage(null);
  };

  const addFiles = useCallback(async (files: File[]) => {
    const checks = await Promise.all(files.map(async (file) => ({ file, check: await validateImage(file) })));
    const rejected: { name: string; reason: ImageRejectReason }[] = [];
    const accepted: SelectedImage[] = [];
    const overLimit: string[] = [];
    const slots = freeSlots(imagesRef.current.length);

    for (const { file, check } of checks) {
      if (!check.ok) rejected.push({ name: file.name, reason: check.reason });
      else if (accepted.length >= slots) overLimit.push(file.name);
      else {
        accepted.push({ id: `img-${nextId++}`, file, format: check.format, animated: check.animated, previewUrl: createUrl(file) });
      }
    }
    setNotices(rejectionNotices(rejected, overLimit));
    if (accepted.length) updateImages([...imagesRef.current, ...accepted]);
  }, []);

  const removeImage = useCallback((id: string) => {
    const image = imagesRef.current.find((item) => item.id === id);
    if (image) releaseUrl(image.previewUrl);
    updateImages(imagesRef.current.filter((item) => item.id !== id));
    setNotices([]);
  }, []);

  const setTarget = useCallback((format: ImageOutputFormat) => {
    setTargetState(format);
    setBlockedMessage(null);
  }, []);

  const convert = useCallback(async () => {
    const selected = imagesRef.current;
    if (!selected.length) return;
    if (allAlreadyInFormat(selected.map((image) => image.format), target)) {
      setBlockedMessage(sameFormatMessage(selected.length, target));
      return;
    }

    const run = ++runRef.current;
    const pending = selected.filter((image) => image.format !== target);
    const filenames = convertedFilenames(pending.map((image) => image.file.name), target);
    setNotices([]);
    setPhase({ status: 'converting', done: 0, total: pending.length });

    const results: ImageResult[] = [];
    // Una alla volta: cinque canvas grandi in parallelo possono esaurire la memoria su mobile
    for (const image of selected) {
      const base = { id: image.id, fileName: image.file.name, sourceFormat: image.format, sourceSize: image.file.size };
      if (image.format === target) {
        results.push({ ...base, status: 'skipped', url: image.previewUrl });
        continue;
      }
      try {
        const blob = await convertImage(image.file, target);
        if (run !== runRef.current) return;
        results.push({
          ...base,
          status: 'converted',
          outputFormat: target,
          blob,
          url: createUrl(blob),
          filename: filenames[pending.indexOf(image)]!,
          animated: image.animated,
        });
      } catch (error) {
        if (run !== runRef.current) return;
        const code = error instanceof ImageConversionError ? error.code : 'encode-failed';
        results.push({ ...base, status: 'error', message: conversionErrorMessage(code, image.format, target) });
      }
      setPhase({ status: 'converting', done: results.filter((item) => item.status !== 'skipped').length, total: pending.length });
    }
    setPhase({ status: 'done', target, results });
  }, [target]);

  const reset = useCallback(() => {
    runRef.current++;
    for (const url of [...urlsRef.current]) releaseUrl(url);
    updateImages([]);
    setNotices([]);
    setPhase({ status: 'selecting' });
  }, []);

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      runRef.current++;
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  return { images, target, setTarget, phase, notices, blockedMessage, addFiles, removeImage, convert, reset };
};
