// Polyfill Promise.try for environments/browsers that do not support ES2025 Promise.try
if (typeof (Promise as any).try !== 'function') {
  (Promise as any).try = function(fn: any, ...args: any[]) {
    return new Promise(resolve => resolve(fn(...args)));
  };
}

// Import robust legacy build of PDF.js
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { disposeCanvas, isMobileDevice, getDeviceMemoryProfile } from './memoryOptimizer';

// Configure Web Worker from local origin (avoids unpkg network lag and offloads processing from UI thread)
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  } catch (e) {
    console.warn('[PDF.js] Worker setup notice:', e);
  }
}

export interface LoadedPdf {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  numPages: number;
  title?: string;
  fileSize?: number;
}

export interface RenderPdfOptions {
  maxDimension?: number;
  quality?: number;
  lowMemoryMode?: boolean;
}

// Track active render task to allow immediate cancellation if user switches pages
let currentActiveRenderTask: { cancel: () => void } | null = null;

/**
 * Loads a PDF document from File, ArrayBuffer, or URL with timeout, memory limits, and abort support
 */
export async function loadPdfDocument(
  source: File | ArrayBuffer | string,
  abortSignal?: AbortSignal
): Promise<LoadedPdf> {
  console.log('[PDF.js] Loading PDF document with memory guards...');
  let loadingTask: pdfjsLib.PDFDocumentLoadingTask;

  const docParams = {
    disableFontFace: true,
    useSystemFonts: true,
    cMapPacked: true,
    // Limit memory allocation for huge embedded images inside PDF
    maxImageSize: 4 * 1024 * 1024
  };

  if (typeof source === 'string') {
    loadingTask = pdfjsLib.getDocument({
      url: source,
      ...docParams
    } as any);
  } else if (source instanceof File) {
    const buffer = await source.arrayBuffer();
    loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      ...docParams
    } as any);
  } else {
    loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(source),
      ...docParams
    } as any);
  }

  // Handle abort signal
  if (abortSignal) {
    abortSignal.addEventListener('abort', () => {
      try {
        (loadingTask as any).destroy();
      } catch {}
    });
  }

  // Safety timeout of 15 seconds
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('انتهت مهلة قراءة ملف PDF. قد يكون الملف كبيراً جداً أو معقداً.'));
    }, 15000);
    if (abortSignal) {
      abortSignal.addEventListener('abort', () => clearTimeout(timer));
    }
  });

  const pdfDoc = await Promise.race([loadingTask.promise, timeoutPromise]);
  console.log(`[PDF.js] Successfully opened PDF: ${pdfDoc.numPages} pages`);

  return {
    pdfDoc,
    numPages: pdfDoc.numPages
  };
}

/**
 * Cancels any currently ongoing page render task to immediately release CPU and memory
 */
export function cancelActivePdfRender(): void {
  if (currentActiveRenderTask) {
    try {
      currentActiveRenderTask.cancel();
      console.log('[PDF.js] Cancelled active page render task');
    } catch {}
    currentActiveRenderTask = null;
  }
}

/**
 * Cleanly releases all PDF document streams and internal caches
 */
export function destroyLoadedPdf(pdf: LoadedPdf | null | undefined): void {
  if (!pdf || !pdf.pdfDoc) return;
  cancelActivePdfRender();
  try {
    pdf.pdfDoc.cleanup();
  } catch {}
}

/**
 * Renders a specific single page of a PDF document with strict memory bounds:
 * - Dynamic max-dimension clamping (prevents multi-megapixel OOM crashes on Android)
 * - Single-task concurrency lock (cancels any previously active page render)
 * - Efficient JPEG encoding (5x-10x smaller memory footprint than PNG)
 * - Immediate canvas and page resource disposal
 */
export async function renderPdfPageToDataUrl(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  options?: RenderPdfOptions
): Promise<{ dataUrl: string; width: number; height: number }> {
  // Cancel any prior in-flight render task immediately
  cancelActivePdfRender();

  const memoryProfile = getDeviceMemoryProfile();
  const isLowMemory = options?.lowMemoryMode ?? memoryProfile.isLowMemoryDevice;
  
  // Safe max pixel dimension: 1400px on mobile/low memory, 2048px on desktop
  const maxAllowedDim = options?.maxDimension || (isLowMemory ? 1400 : 2048);
  const jpegQuality = options?.quality || (isLowMemory ? 0.82 : 0.88);

  const page = await pdfDoc.getPage(pageNumber);

  try {
    // 1. Calculate natural page bounds at scale 1.0
    const baseViewport = page.getViewport({ scale: 1.0 });
    const maxNaturalDim = Math.max(baseViewport.width, baseViewport.height);

    // 2. Compute safe adaptive scale so canvas never exceeds maxAllowedDim
    // Even if an engineering PDF is A1/A0 size (3000pt+), it will be safely bounded
    const scaleFactor = Math.min(2.0, maxAllowedDim / (maxNaturalDim || 1));
    const safeScale = Math.max(0.3, Math.min(2.0, scaleFactor));

    const viewport = page.getViewport({ scale: safeScale });
    const targetW = Math.round(viewport.width);
    const targetH = Math.round(viewport.height);

    console.log(`[PDF.js] Rendering page ${pageNumber} at safe bounds: ${targetW}x${targetH} px (scale: ${safeScale.toFixed(2)})`);

    // 3. Create canvas for this page render
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;

    const context = canvas.getContext('2d', { 
      willReadFrequently: false,
      alpha: false // Disable alpha channel to save 25% GPU memory
    });

    if (!context) {
      throw new Error('تعذر إنشاء مساحة الرسم (Canvas 2D Context)');
    }

    // Fill white background for transparent electrical schematics
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, targetW, targetH);

    const renderTask = (page.render as any)({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas
    });

    currentActiveRenderTask = renderTask;

    await renderTask.promise;
    currentActiveRenderTask = null;

    // 4. Convert to compressed JPEG (drastically reduces JS heap footprint from 40MB PNG to ~1MB JPEG)
    const dataUrl = canvas.toDataURL('image/jpeg', jpegQuality);

    // 5. Clean up Canvas and Page immediately
    disposeCanvas(canvas);
    try {
      page.cleanup();
    } catch {}

    return {
      dataUrl,
      width: targetW,
      height: targetH
    };
  } catch (err: any) {
    // Check if error was due to intentional cancellation
    if (err?.name === 'RenderingCancelledException') {
      console.log(`[PDF.js] Page ${pageNumber} render was cancelled`);
      throw new Error('تم إلغاء معالجة الصفحة');
    }
    try {
      page.cleanup();
    } catch {}
    throw err;
  }
}

/**
 * On-demand single thumbnail generator for a specific page only.
 * Never runs as a 15-page loop; renders a tiny 120px preview only when explicitly requested.
 */
export async function renderSinglePageThumbnail(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number
): Promise<{ dataUrl: string; width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  try {
    const baseViewport = page.getViewport({ scale: 1.0 });
    const thumbMaxDim = 120;
    const scale = Math.min(0.25, thumbMaxDim / Math.max(baseViewport.width, baseViewport.height));
    const viewport = page.getViewport({ scale: Math.max(0.12, scale) });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Context error');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await (page.render as any)({
      canvasContext: context,
      viewport,
      canvas
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.70);
    const result = {
      dataUrl,
      width: canvas.width,
      height: canvas.height
    };

    disposeCanvas(canvas);
    page.cleanup();

    return result;
  } catch (e) {
    try { page.cleanup(); } catch {}
    throw e;
  }
}
