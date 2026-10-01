import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure CDN worker for reliable Vite web execution
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export interface ConvertedPageImage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

export interface PdfToImageOptions {
  format: 'image/jpeg' | 'image/png';
  quality: number; // 0.1 to 1.0
  scale?: number; // default 2.0 for high resolution
  selectedPages?: number[]; // if undefined, convert all
}

/**
 * Convert PDF pages to JPG or PNG images in the browser
 */
export async function convertPdfToImages(
  file: File,
  options: PdfToImageOptions,
  onProgress?: (percent: number, stepText: string) => void
): Promise<{ pages: ConvertedPageImage[]; zipBlob: Blob }> {
  onProgress?.(10, 'Loading PDF document into memory...');
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  if (numPages === 0) {
    throw new Error('This PDF file contains no pages.');
  }

  const targetPages = options.selectedPages && options.selectedPages.length > 0
    ? options.selectedPages.filter((p) => p >= 1 && p <= numPages)
    : Array.from({ length: numPages }, (_, i) => i + 1);

  const convertedPages: ConvertedPageImage[] = [];
  const zip = new JSZip();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const ext = options.format === 'image/png' ? 'png' : 'jpg';

  const scale = options.scale || 2.0;

  for (let i = 0; i < targetPages.length; i++) {
    const pageNum = targetPages[i];
    const progress = 15 + Math.round((i / targetPages.length) * 75);
    onProgress?.(progress, `Rendering page ${pageNum} (${i + 1} of ${targetPages.length})...`);

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available.');

    // White background for JPG
    if (options.format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    const pageBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error(`Failed to render page ${pageNum}`));
        },
        options.format,
        options.quality
      );
    });

    const dataUrl = canvas.toDataURL(options.format, options.quality);

    convertedPages.push({
      pageNumber: pageNum,
      blob: pageBlob,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
    });

    // Add to ZIP
    const paddedNum = String(pageNum).padStart(3, '0');
    zip.file(`${baseName}_page_${paddedNum}.${ext}`, pageBlob);
  }

  onProgress?.(92, 'Generating ZIP bundle...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  onProgress?.(100, 'Complete');

  return {
    pages: convertedPages,
    zipBlob,
  };
}

/**
 * Generate quick low-res thumbnails of PDF pages for visual split/reorder/delete previews
 */
export async function renderPdfThumbnails(
  file: File,
  maxPages: number = 20
): Promise<{ pageNumber: number; dataUrl: string }[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
    });
    const pdfDoc = await loadingTask.promise;
    const count = Math.min(pdfDoc.numPages, maxPages);
    const thumbs: { pageNumber: number; dataUrl: string }[] = [];

    for (let i = 1; i <= count; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 0.35 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        thumbs.push({ pageNumber: i, dataUrl: canvas.toDataURL('image/jpeg', 0.6) });
      }
    }
    return thumbs;
  } catch (err) {
    console.warn('Could not generate PDF thumbnails:', err);
    return [];
  }
}
