/**
 * Memory Optimizer & Device Resource Protection for Mobile and Low-End Environments.
 * Detects low-memory thresholds, mobile viewports, clamps canvas sizes, and releases resources.
 */

export interface DeviceMemoryProfile {
  isMobile: boolean;
  isLowMemoryDevice: boolean;
  estimatedMemoryGB?: number;
  recommendedMaxDimension: number;
  recommendedQuality: number;
  modeLabel: string;
}

/**
 * Detects whether the current device is a mobile phone/tablet or constrained environment
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(userAgent);
  const isSmallScreen = window.innerWidth <= 840 || window.innerHeight <= 840;
  const hasTouch = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;

  return isMobileUA || (isSmallScreen && hasTouch);
}

/**
 * Gets device hardware memory profile and recommended image/canvas bounds
 */
export function getDeviceMemoryProfile(): DeviceMemoryProfile {
  const isMobile = isMobileDevice();
  const navMemory = (navigator as any).deviceMemory; // Available in Chromium / Chrome Android
  
  // Under 4GB RAM or mobile device is classified as memory-constrained
  const isLowMemory = isMobile || (typeof navMemory === 'number' && navMemory <= 4);

  return {
    isMobile,
    isLowMemoryDevice: isLowMemory,
    estimatedMemoryGB: typeof navMemory === 'number' ? navMemory : undefined,
    // Safe maximum canvas dimension in pixels (width or height) to prevent GPU backing-store OOM
    recommendedMaxDimension: isLowMemory ? 1400 : 2200,
    // Optimal JPEG/WebP compression quality (0.82 provides pristine line clarity at 10x smaller footprint)
    recommendedQuality: isLowMemory ? 0.82 : 0.90,
    modeLabel: isLowMemory ? 'نمط توفير الذاكرة للهواتف' : 'نمط الدقة العادية'
  };
}

/**
 * Safely disposes of an HTMLCanvasElement by zeroing out its dimensions,
 * which signals modern browser engines (Blink, WebKit) to immediately deallocate the GPU backing store.
 */
export function disposeCanvas(canvas: HTMLCanvasElement | null | undefined): void {
  if (!canvas) return;
  try {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    canvas.width = 0;
    canvas.height = 0;
  } catch (err) {
    // Ignore context already destroyed
  }
}

/**
 * Revokes a Blob URL safely without throwing
 */
export function safeRevokeBlobUrl(url: string | null | undefined): void {
  if (!url || !url.startsWith('blob:')) return;
  try {
    URL.revokeObjectURL(url);
  } catch {}
}

/**
 * Formats byte size to human readable MB / KB
 */
export function formatByteSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
  return Math.round(bytes / 1024) + ' KB';
}
