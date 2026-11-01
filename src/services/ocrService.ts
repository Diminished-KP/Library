import { createWorker } from 'tesseract.js';
import { extractIsbnsFromText } from './isbnExtractor';

let workerPromise: Promise<any> | null = null;

async function getOcrWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker('eng');
      return worker;
    })();
  }
  return workerPromise;
}

/**
 * Recognize text from an HTMLCanvasElement, HTMLVideoElement, Blob, or base64 data URL.
 * Extracts recognized ISBN candidate strings.
 */
export async function recognizeIsbnsFromImage(
  imageSource: HTMLCanvasElement | HTMLVideoElement | Blob | string
): Promise<{ text: string; isbns: string[] }> {
  try {
    const worker = await getOcrWorker();
    const ret = await worker.recognize(imageSource);
    const text = ret?.data?.text || '';
    const isbns = extractIsbnsFromText(text);
    return { text, isbns };
  } catch (err) {
    console.error('OCR recognition error:', err);
    return { text: '', isbns: [] };
  }
}
