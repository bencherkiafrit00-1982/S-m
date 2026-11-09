/**
 * Image processing utilities for electrical diagram scanning and editing.
 * Optimized with memory guards, canvas disposal, and adaptive dimension downscaling.
 */
import { disposeCanvas, isMobileDevice, getDeviceMemoryProfile } from './memoryOptimizer';

export interface ImageCropRect {
  x: number; // percentage 0-100 or pixels
  y: number;
  width: number;
  height: number;
}

export interface ImageFilters {
  brightness: number; // 0.5 to 1.5 (default 1.0)
  contrast: number; // 0.5 to 2.0 (default 1.0)
  invert: boolean;
  grayscale: boolean;
  highContrastDoc: boolean;
  rotation: number; // 0, 90, 180, 270
}

/**
 * Loads an HTMLImageElement from a dataUrl or blob url safely
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin on remote HTTP/HTTPS URLs (never on data: or blob: URLs)
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.error('[ImageProcessing] Failed to load image element:', e);
      reject(new Error('تعذر قراءة بيانات الصورة. تأكد من أن الملف سليم ومدعوم.'));
    };
    img.src = src;
  });
}

/**
 * Applies rotation, crop and image filters to an image source with strict memory bounds.
 * Automatically downscales ultra-high-resolution smartphone photos (e.g. 12MP/48MP)
 * to a safe canvas size (max 1600px on mobile, 2200px on desktop) to avoid OOM crashes.
 */
export async function processDiagramImage(
  imageSrc: string,
  filters: Partial<ImageFilters> = {},
  cropRect?: ImageCropRect,
  lowMemoryMode?: boolean
): Promise<{ dataUrl: string; width: number; height: number }> {
  const img = await loadImage(imageSrc);

  const memoryProfile = getDeviceMemoryProfile();
  const isConstrained = lowMemoryMode ?? memoryProfile.isLowMemoryDevice;
  const maxDim = isConstrained ? 1400 : 2200;

  const rotation = (filters.rotation || 0) % 360;
  const is90or270 = rotation === 90 || rotation === 270;

  // Determine natural rotated dimensions
  const naturalW = is90or270 ? img.naturalHeight : img.naturalWidth;
  const naturalH = is90or270 ? img.naturalWidth : img.naturalHeight;

  // Calculate safe downscale ratio if image exceeds safe limits
  const maxNatural = Math.max(naturalW, naturalH);
  const scale = maxNatural > maxDim ? maxDim / maxNatural : 1.0;

  const baseWidth = Math.round(naturalW * scale);
  const baseHeight = Math.round(naturalH * scale);

  console.log(`[ImageProcessing] Processing diagram: ${baseWidth}x${baseHeight} px (scale: ${scale.toFixed(2)})`);

  // Create primary rotated canvas
  const canvas = document.createElement('canvas');
  canvas.width = baseWidth;
  canvas.height = baseHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    disposeCanvas(canvas);
    throw new Error('Canvas 2D context unavailable');
  }

  // Draw rotated & scaled image
  ctx.save();
  ctx.translate(baseWidth / 2, baseHeight / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  const drawW = (is90or270 ? baseHeight : baseWidth);
  const drawH = (is90or270 ? baseWidth : baseHeight);
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  // If cropRect is provided
  let workingCanvas = canvas;
  if (cropRect && cropRect.width > 0 && cropRect.height > 0) {
    const cropX = cropRect.x > 1 ? cropRect.x * scale : cropRect.x * baseWidth;
    const cropY = cropRect.y > 1 ? cropRect.y * scale : cropRect.y * baseHeight;
    const cropW = cropRect.width > 1 ? cropRect.width * scale : cropRect.width * baseWidth;
    const cropH = cropRect.height > 1 ? cropRect.height * scale : cropRect.height * baseHeight;

    const clampedX = Math.max(0, Math.min(baseWidth - 10, cropX));
    const clampedY = Math.max(0, Math.min(baseHeight - 10, cropY));
    const clampedW = Math.max(10, Math.min(baseWidth - clampedX, cropW));
    const clampedH = Math.max(10, Math.min(baseHeight - clampedY, cropH));

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = Math.round(clampedW);
    croppedCanvas.height = Math.round(clampedH);
    const cropCtx = croppedCanvas.getContext('2d', { willReadFrequently: true });
    if (cropCtx) {
      cropCtx.drawImage(
        canvas,
        clampedX, clampedY, clampedW, clampedH,
        0, 0, clampedW, clampedH
      );
      disposeCanvas(canvas);
      workingCanvas = croppedCanvas;
    }
  }

  // Apply Pixel Filters only if necessary
  const finalCtx = workingCanvas.getContext('2d', { willReadFrequently: true });
  if (finalCtx) {
    const brightness = filters.brightness ?? 1.0;
    const contrast = filters.contrast ?? 1.0;
    const invert = filters.invert ?? false;
    const grayscale = filters.grayscale ?? false;
    const highContrastDoc = filters.highContrastDoc ?? false;

    if (brightness !== 1.0 || contrast !== 1.0 || invert || grayscale || highContrastDoc) {
      const imgData = finalCtx.getImageData(0, 0, workingCanvas.width, workingCanvas.height);
      const data = imgData.data;
      const len = data.length;

      // Contrast multiplier
      const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Brightness
        if (brightness !== 1.0) {
          r = Math.min(255, Math.max(0, r * brightness));
          g = Math.min(255, Math.max(0, g * brightness));
          b = Math.min(255, Math.max(0, b * brightness));
        }

        // Contrast
        if (contrast !== 1.0) {
          r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
          g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
          b = Math.min(255, Math.max(0, factor * (g - 128) + 128));
        }

        // Grayscale luminance
        let lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // Document Binarization / Paper shadow removal
        if (highContrastDoc) {
          if (lum > 160) {
            r = 255;
            g = 255;
            b = 255;
          } else {
            r = Math.max(0, r * 0.4);
            g = Math.max(0, g * 0.4);
            b = Math.max(0, b * 0.4);
          }
        } else if (grayscale) {
          r = lum;
          g = lum;
          b = lum;
        }

        // Invert
        if (invert) {
          r = 255 - r;
          g = 255 - g;
          b = 255 - b;
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }

      finalCtx.putImageData(imgData, 0, 0);
    }
  }

  // Encode as efficient JPEG (or WebP if supported) to minimize memory
  const quality = isConstrained ? 0.84 : 0.88;
  const dataUrl = workingCanvas.toDataURL('image/jpeg', quality);
  const result = {
    dataUrl,
    width: workingCanvas.width,
    height: workingCanvas.height
  };

  disposeCanvas(workingCanvas);
  return result;
}

/**
 * File to DataURL helper
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file: ' + file.name));
    reader.readAsDataURL(file);
  });
}
