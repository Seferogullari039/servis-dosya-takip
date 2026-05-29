/** Hasar görseli client-side optimizasyon sabitleri */
export const WORK_ORDER_IMAGE_OPTIMIZE = {
  maxWidth: 1600,
  maxHeight: 1600,
  startQuality: 0.72,
  minQuality: 0.6,
  qualityStep: 0.04,
  targetMinBytes: 300 * 1024,
  targetMaxBytes: 600 * 1024,
  hardMaxBytes: 1024 * 1024,
} as const;

export type OptimizePhase = "reading" | "resizing" | "compressing";

export interface OptimizeProgress {
  phase: OptimizePhase;
  percent: number;
}

export interface OptimizeWorkOrderImageResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  optimizedSize: number;
  mimeType: "image/webp" | "image/jpeg";
  width: number;
  height: number;
}

let webpSupportCache: boolean | null = null;

export async function supportsWebpEncode(): Promise<boolean> {
  if (webpSupportCache !== null) return webpSupportCache;
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    const blob = await canvasToBlob(canvas, "image/webp", 0.8);
    webpSupportCache = blob?.type === "image/webp";
  } catch {
    webpSupportCache = false;
  }
  return webpSupportCache;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });
}

function scaleToFit(
  width: number,
  height: number,
  maxW: number,
  maxH: number
): { width: number; height: number } {
  if (width <= maxW && height <= maxH) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  const ratio = Math.min(maxW / width, maxH / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap !== "function") {
    throw new Error("Tarayıcınız görsel işlemeyi desteklemiyor.");
  }
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}

/** Safari / eski tarayıcı: Image + EXIF düzeltmesi createImageBitmap ile */
async function loadViaImageElement(file: File): Promise<{
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  cleanup: () => void;
}> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Görsel okunamadı."));
      el.src = url;
    });
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      draw: (ctx, w, h) => {
        ctx.drawImage(img, 0, 0, w, h);
      },
      cleanup: () => URL.revokeObjectURL(url),
    };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

function buildOutputName(originalName: string, ext: "webp" | "jpg"): string {
  const base = originalName.replace(/\.[^.]+$/, "") || "hasar-gorsel";
  const safe = base.replace(/[^\w.-]+/g, "_").slice(0, 80);
  return `${safe}-opt.${ext}`;
}

async function compressCanvas(
  canvas: HTMLCanvasElement,
  preferWebp: boolean,
  onProgress?: (p: OptimizeProgress) => void
): Promise<{ blob: Blob; mimeType: "image/webp" | "image/jpeg" }> {
  const useWebp = preferWebp && (await supportsWebpEncode());
  const mimeType = useWebp ? "image/webp" : "image/jpeg";
  const ext = useWebp ? "image/webp" : "image/jpeg";

  let quality = WORK_ORDER_IMAGE_OPTIMIZE.startQuality;
  let blob: Blob | null = null;

  while (quality >= WORK_ORDER_IMAGE_OPTIMIZE.minQuality) {
    onProgress?.({ phase: "compressing", percent: 55 + (1 - quality) * 40 });
    blob = await canvasToBlob(canvas, ext, quality);
    if (!blob) break;
    if (blob.size <= WORK_ORDER_IMAGE_OPTIMIZE.targetMaxBytes) {
      return { blob, mimeType };
    }
    quality -= WORK_ORDER_IMAGE_OPTIMIZE.qualityStep;
  }

  if (!blob) {
    throw new Error("Görsel sıkıştırılamadı.");
  }

  if (blob.size > WORK_ORDER_IMAGE_OPTIMIZE.hardMaxBytes) {
    throw new Error(
      "Görsel optimize edilemedi. Daha küçük bir fotoğraf deneyin."
    );
  }

  return { blob, mimeType };
}

/**
 * Mobil / galeri fotoğrafını yükleme öncesi optimize eder (resize + sıkıştırma + EXIF).
 */
export async function optimizeWorkOrderImage(
  file: File,
  onProgress?: (progress: OptimizeProgress) => void
): Promise<OptimizeWorkOrderImageResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Yalnızca görsel dosyası yüklenebilir.");
  }

  onProgress?.({ phase: "reading", percent: 15 });

  const { maxWidth, maxHeight } = WORK_ORDER_IMAGE_OPTIMIZE;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas desteklenmiyor.");

  let outW = 0;
  let outH = 0;

  onProgress?.({ phase: "resizing", percent: 35 });

  try {
    const bitmap = await loadBitmap(file);
    const scaled = scaleToFit(
      bitmap.width,
      bitmap.height,
      maxWidth,
      maxHeight
    );
    outW = scaled.width;
    outH = scaled.height;
    canvas.width = outW;
    canvas.height = outH;
    ctx.drawImage(bitmap, 0, 0, outW, outH);
    bitmap.close();
  } catch {
    const fallback = await loadViaImageElement(file);
    try {
      const scaled = scaleToFit(
        fallback.width,
        fallback.height,
        maxWidth,
        maxHeight
      );
      outW = scaled.width;
      outH = scaled.height;
      canvas.width = outW;
      canvas.height = outH;
      fallback.draw(ctx, outW, outH);
    } finally {
      fallback.cleanup();
    }
  }

  onProgress?.({ phase: "compressing", percent: 55 });

  const preferWebp = await supportsWebpEncode();
  const { blob, mimeType } = await compressCanvas(canvas, preferWebp, onProgress);

  onProgress?.({ phase: "compressing", percent: 95 });

  const ext = mimeType === "image/webp" ? "webp" : "jpg";
  const optimized = new File([blob], buildOutputName(file.name, ext), {
    type: mimeType,
    lastModified: Date.now(),
  });

  const previewUrl = URL.createObjectURL(blob);

  onProgress?.({ phase: "compressing", percent: 100 });

  return {
    file: optimized,
    previewUrl,
    originalSize: file.size,
    optimizedSize: optimized.size,
    mimeType,
    width: outW,
    height: outH,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
