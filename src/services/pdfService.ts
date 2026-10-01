import { PDFDocument, rgb, degrees, StandardFonts, PageSizes } from 'pdf-lib';
import JSZip from 'jszip';

export interface ImageToPdfOptions {
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Original';
  orientation: 'portrait' | 'landscape';
  margin: 'none' | 'small' | 'medium' | 'large';
  quality?: number;
}

const PAGE_DIMENSIONS: Record<string, [number, number]> = {
  A4: PageSizes.A4, // [595.28, 841.89]
  A3: PageSizes.A3, // [841.89, 1190.55]
  Letter: PageSizes.Letter, // [612, 792]
  Legal: PageSizes.Legal, // [612, 1008]
};

const MARGIN_VALUES: Record<string, number> = {
  none: 0,
  small: 18, // 0.25 inch
  medium: 36, // 0.5 inch
  large: 54, // 0.75 inch
};

/**
 * Convert multiple image files into a single PDF document
 */
export async function imagesToPdf(
  files: File[],
  options: ImageToPdfOptions,
  onProgress?: (percent: number, stepText: string) => void
): Promise<Blob> {
  if (files.length === 0) {
    throw new Error('Please select at least one image file.');
  }

  onProgress?.(10, 'Initializing PDF engine...');
  const pdfDoc = await PDFDocument.create();

  const margin = MARGIN_VALUES[options.margin] || 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progressBase = 10 + Math.round((i / files.length) * 75);
    onProgress?.(progressBase, `Embedding image ${i + 1} of ${files.length}...`);

    const arrayBuffer = await file.arrayBuffer();
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    const isJpg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');
    const isWebp = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');

    let embeddedImage;

    if (isPng) {
      try {
        embeddedImage = await pdfDoc.embedPng(arrayBuffer);
      } catch {
        // Fallback: draw onto canvas and convert to PNG if non-standard PNG
        const pngBlob = await convertImageToStandardBlob(file, 'image/png');
        const pngBuf = await pngBlob.arrayBuffer();
        embeddedImage = await pdfDoc.embedPng(pngBuf);
      }
    } else if (isJpg) {
      embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
    } else if (isWebp) {
      // WEBP must be rasterized to JPG/PNG for PDF embed
      const jpgBlob = await convertImageToStandardBlob(file, 'image/jpeg');
      const jpgBuf = await jpgBlob.arrayBuffer();
      embeddedImage = await pdfDoc.embedJpg(jpgBuf);
    } else {
      // General image fallback
      const fallbackBlob = await convertImageToStandardBlob(file, 'image/jpeg');
      const fallbackBuf = await fallbackBlob.arrayBuffer();
      embeddedImage = await pdfDoc.embedJpg(fallbackBuf);
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    let pageWidth: number;
    let pageHeight: number;

    if (options.pageSize === 'Original') {
      pageWidth = imgWidth + margin * 2;
      pageHeight = imgHeight + margin * 2;
      if (options.orientation === 'landscape' && pageWidth < pageHeight) {
        [pageWidth, pageHeight] = [pageHeight, pageWidth];
      }
    } else {
      const baseDims = PAGE_DIMENSIONS[options.pageSize] || PageSizes.A4;
      if (options.orientation === 'landscape') {
        pageWidth = Math.max(baseDims[0], baseDims[1]);
        pageHeight = Math.min(baseDims[0], baseDims[1]);
      } else {
        pageWidth = Math.min(baseDims[0], baseDims[1]);
        pageHeight = Math.max(baseDims[0], baseDims[1]);
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    const scale = Math.min(usableWidth / imgWidth, usableHeight / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    const x = margin + (usableWidth - drawWidth) / 2;
    const y = margin + (usableHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  onProgress?.(90, 'Generating final PDF bytes...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.(100, 'Done');

  const uint8 = new Uint8Array(pdfBytes);
  return new Blob([uint8], { type: 'application/pdf' });
}

/**
 * Merge multiple PDF files into one
 */
export async function mergePdfs(
  files: File[],
  onProgress?: (percent: number, stepText: string) => void
): Promise<Blob> {
  if (files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  onProgress?.(10, 'Initializing merge container...');
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progress = 10 + Math.round((i / files.length) * 80);
    onProgress?.(progress, `Merging "${file.name}" (${i + 1} of ${files.length})...`);

    const fileBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  onProgress?.(95, 'Finalizing merged document...');
  const mergedBytes = await mergedPdf.save();
  onProgress?.(100, 'Complete');

  const uint8 = new Uint8Array(mergedBytes);
  return new Blob([uint8], { type: 'application/pdf' });
}

/**
 * Inspect page count of a PDF file
 */
export async function getPdfPageCount(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
  return pdf.getPageCount();
}

/**
 * Split PDF - supports 'all', 'range', or 'extract'
 */
export async function splitPdf(
  file: File,
  mode: 'all' | 'range' | 'extract',
  rangeConfig?: { from?: number; to?: number; customPages?: number[] },
  onProgress?: (percent: number, stepText: string) => void
): Promise<{ singlePdf?: Blob; zipBlob?: Blob; count: number }> {
  onProgress?.(10, 'Reading PDF structure...');
  const buffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  if (totalPages === 0) {
    throw new Error('The PDF has no pages.');
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '');

  if (mode === 'all') {
    onProgress?.(25, `Preparing ${totalPages} individual pages...`);
    const zip = new JSZip();

    for (let i = 0; i < totalPages; i++) {
      const pageDoc = await PDFDocument.create();
      const [copied] = await pageDoc.copyPages(sourcePdf, [i]);
      pageDoc.addPage(copied);
      const bytes = await pageDoc.save();
      zip.file(`${baseName}_page_${i + 1}.pdf`, bytes);
      onProgress?.(25 + Math.round((i / totalPages) * 65), `Splitting page ${i + 1} of ${totalPages}...`);
    }

    onProgress?.(95, 'Zipping files...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    onProgress?.(100, 'Complete');
    return { zipBlob, count: totalPages };
  }

  if (mode === 'range' && rangeConfig?.from && rangeConfig?.to) {
    const from = Math.max(1, rangeConfig.from);
    const to = Math.min(totalPages, rangeConfig.to);
    if (from > to) throw new Error('Start page cannot be greater than end page.');

    onProgress?.(40, `Extracting range pages ${from} to ${to}...`);
    const newDoc = await PDFDocument.create();
    const indices: number[] = [];
    for (let p = from; p <= to; p++) {
      indices.push(p - 1);
    }
    const copied = await newDoc.copyPages(sourcePdf, indices);
    copied.forEach((p) => newDoc.addPage(p));

    const bytes = await newDoc.save();
    onProgress?.(100, 'Complete');
    const uint8 = new Uint8Array(bytes);
    return { singlePdf: new Blob([uint8], { type: 'application/pdf' }), count: indices.length };
  }

  if (mode === 'extract' && rangeConfig?.customPages && rangeConfig.customPages.length > 0) {
    const validPages = rangeConfig.customPages
      .filter((p) => p >= 1 && p <= totalPages)
      .map((p) => p - 1);

    if (validPages.length === 0) {
      throw new Error('No valid pages found in range.');
    }

    onProgress?.(40, `Extracting ${validPages.length} selected pages...`);
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(sourcePdf, validPages);
    copied.forEach((p) => newDoc.addPage(p));

    const bytes = await newDoc.save();
    onProgress?.(100, 'Complete');
    const uint8 = new Uint8Array(bytes);
    return { singlePdf: new Blob([uint8], { type: 'application/pdf' }), count: validPages.length };
  }

  throw new Error('Invalid split configuration.');
}

/**
 * Delete specified pages from PDF
 */
export async function deletePdfPages(
  file: File,
  pagesToDelete: number[], // 1-indexed
  onProgress?: (percent: number, stepText: string) => void
): Promise<Blob> {
  onProgress?.(15, 'Reading PDF structure...');
  const buffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const toDeleteSet = new Set(pagesToDelete);
  const pagesToKeep: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (!toDeleteSet.has(i)) {
      pagesToKeep.push(i - 1);
    }
  }

  if (pagesToKeep.length === 0) {
    throw new Error('Cannot delete all pages from the PDF document.');
  }

  onProgress?.(50, `Creating clean document with ${pagesToKeep.length} pages...`);
  const newDoc = await PDFDocument.create();
  const copied = await newDoc.copyPages(sourcePdf, pagesToKeep);
  copied.forEach((p) => newDoc.addPage(p));

  const bytes = await newDoc.save();
  onProgress?.(100, 'Complete');
  const uint8 = new Uint8Array(bytes);
  return new Blob([uint8], { type: 'application/pdf' });
}

/**
 * Rotate PDF pages
 */
export async function rotatePdf(
  file: File,
  rotationAngle: 90 | 180 | 270,
  pageNumbers?: number[], // if undefined, rotates all
  onProgress?: (percent: number, stepText: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Reading PDF pages...');
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  const targetIndices = pageNumbers ? new Set(pageNumbers.map((p) => p - 1)) : null;

  pages.forEach((page, index) => {
    if (!targetIndices || targetIndices.has(index)) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotationAngle) % 360));
    }
  });

  onProgress?.(80, 'Saving rotated pages...');
  const bytes = await pdfDoc.save();
  onProgress?.(100, 'Complete');
  const uint8 = new Uint8Array(bytes);
  return new Blob([uint8], { type: 'application/pdf' });
}

/**
 * Add text watermark to PDF
 */
export async function watermarkPdf(
  file: File,
  watermarkText: string,
  options?: { opacity?: number; size?: number; color?: { r: number; g: number; b: number } },
  onProgress?: (percent: number, stepText: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Loading PDF document...');
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const opacity = options?.opacity ?? 0.25;
  const size = options?.size ?? 48;
  const color = options?.color ?? { r: 0.5, g: 0.5, b: 0.5 };

  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(watermarkText, size);
    const textHeight = font.heightAtSize(size);

    page.drawText(watermarkText, {
      x: (width - textWidth) / 2,
      y: (height - textHeight) / 2,
      size,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(45),
    });
  });

  onProgress?.(90, 'Finalizing watermarked PDF...');
  const bytes = await pdfDoc.save();
  onProgress?.(100, 'Complete');
  const uint8 = new Uint8Array(bytes);
  return new Blob([uint8], { type: 'application/pdf' });
}

/**
 * Convert plain text to PDF
 */
export async function textToPdf(
  text: string,
  fileName: string = 'document.txt',
  onProgress?: (percent: number, stepText: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Creating PDF document...');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;
  const lineHeight = 16;
  const margin = 50;
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const maxLinesPerPage = Math.floor(usableHeight / lineHeight);

  const lines = text.split('\n');
  const wrappedLines: string[] = [];

  for (const rawLine of lines) {
    if (rawLine.length === 0) {
      wrappedLines.push('');
      continue;
    }
    const words = rawLine.split(' ');
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width < usableWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) wrappedLines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) wrappedLines.push(currentLine);
  }

  const totalPages = Math.ceil(wrappedLines.length / maxLinesPerPage) || 1;

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const startLine = pageIdx * maxLinesPerPage;
    const pageLines = wrappedLines.slice(startLine, startLine + maxLinesPerPage);

    let y = pageHeight - margin - fontSize;
    for (const line of pageLines) {
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= lineHeight;
    }

    // Page number footer
    const footerText = `Page ${pageIdx + 1} of ${totalPages}`;
    const footerWidth = font.widthOfTextAtSize(footerText, 9);
    page.drawText(footerText, {
      x: (pageWidth - footerWidth) / 2,
      y: 25,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  const bytes = await pdfDoc.save();
  onProgress?.(100, 'Complete');
  const uint8 = new Uint8Array(bytes);
  return new Blob([uint8], { type: 'application/pdf' });
}

/**
 * Helper to normalize any image (including WEBP) through canvas to JPG/PNG
 */
function convertImageToStandardBlob(file: File, mimeType: 'image/png' | 'image/jpeg'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available.'));
        return;
      }
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert image to blob.'));
        },
        mimeType,
        0.92
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image "${file.name}".`));
    };
    img.src = url;
  });
}
