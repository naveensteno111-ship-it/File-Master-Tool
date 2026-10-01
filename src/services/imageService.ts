export interface CompressOptions {
  level: 'low' | 'medium' | 'high' | 'custom';
  customQuality?: number; // 0.1 to 1.0
  maxWidthOrHeight?: number;
}

export interface ResizeOptions {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  quality?: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Load HTMLImageElement safely from a File or Blob
 */
export function loadImageFromFile(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file.'));
    };
    img.src = url;
  });
}

/**
 * Convert Image format (e.g. JPG to PNG, PNG to JPG, JPG to WEBP, etc.)
 */
export async function convertImageFormat(
  file: File,
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp',
  quality: number = 0.92,
  backgroundColor: string = '#ffffff'
): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available.');

  // If converting to JPEG or WEBP without alpha, paint background
  if (targetFormat === 'image/jpeg') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Image conversion failed.'));
      },
      targetFormat,
      quality
    );
  });
}

/**
 * Compress an image with specified quality and dimension bounds
 */
export async function compressImage(
  file: File,
  options: CompressOptions
): Promise<{ blob: Blob; originalSize: number; compressedSize: number; savingsPercentage: number }> {
  const originalSize = file.size;
  const img = await loadImageFromFile(file);

  let quality = 0.8;
  let maxDimension = 3840; // 4K max

  switch (options.level) {
    case 'low':
      quality = 0.88;
      maxDimension = 2800;
      break;
    case 'medium':
      quality = 0.70;
      maxDimension = 2048;
      break;
    case 'high':
      quality = 0.45;
      maxDimension = 1440;
      break;
    case 'custom':
      quality = options.customQuality ?? 0.70;
      maxDimension = options.maxWidthOrHeight ?? 2048;
      break;
  }

  // Calculate scaled dimensions
  let { naturalWidth: width, naturalHeight: height } = img;
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available.');

  // Determine output MIME
  let outputMime = file.type;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(outputMime)) {
    outputMime = 'image/jpeg';
  }

  if (outputMime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  // Use crisp interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  const compressedBlob = await new Promise<Blob>((resolve, reject) => {
    // If output is PNG, PNG toBlob doesn't take quality param in most browsers, so convert to WEBP or JPEG if high compression needed, or retain PNG
    const finalMime = (outputMime === 'image/png' && options.level !== 'low') ? 'image/webp' : outputMime;
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode compressed image.'));
      },
      finalMime,
      quality
    );
  });

  const compressedSize = compressedBlob.size;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savingsPercentage = Math.round((savedBytes / originalSize) * 100);

  return {
    blob: compressedBlob,
    originalSize,
    compressedSize,
    savingsPercentage,
  };
}

/**
 * Resize an image
 */
export async function resizeImage(file: File, options: ResizeOptions): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available.');

  const format = options.format || (file.type as any) || 'image/jpeg';
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, options.width, options.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Resize failed.'));
      },
      format,
      options.quality ?? 0.92
    );
  });
}

/**
 * Crop an image
 */
export async function cropImage(
  file: File,
  cropArea: CropArea,
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available.');

  if (targetFormat === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(
    img,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Crop failed.'));
      },
      targetFormat,
      0.95
    );
  });
}

/**
 * Rotate an image by 90, 180, or 270 degrees
 */
export async function rotateImage(file: File, angleDegrees: 90 | 180 | 270): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  if (angleDegrees === 90 || angleDegrees === 270) {
    canvas.width = img.naturalHeight;
    canvas.height = img.naturalWidth;
  } else {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angleDegrees * Math.PI) / 180);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  const format = file.type || 'image/jpeg';
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Rotate failed.'));
      },
      format,
      0.92
    );
  });
}
