import type { Worker } from 'tesseract.js';

let worker: Worker | null = null;
let activeLanguage = '';

export async function recognizeImage(
  image: string,
  language: string,
  onProgress: (value: number) => void,
): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  if (!worker || activeLanguage !== language) {
    if (worker) await worker.terminate();
    worker = await createWorker(language, 1, {
      langPath: '/ocr',
      workerPath: '/ocr/worker.min.js',
      corePath: '/ocr/core/tesseract-core.wasm.js',
      logger: (event) => {
        if (event.status === 'recognizing text') onProgress(event.progress);
      },
    });
    activeLanguage = language;
  }
  const result = await worker.recognize(image);
  return result.data.text;
}
