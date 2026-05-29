/** Galeri grid önizleme */
export const WORK_ORDER_THUMB_GRID = 240;

/** PDF / küçük önizleme */
export const WORK_ORDER_THUMB_PDF = 120;

/** Lightbox — orta çözünürlük */
export const WORK_ORDER_THUMB_LIGHTBOX = 960;

/**
 * Supabase Storage Image Transformation (render) URL.
 * Desteklenmezse orijinal URL döner; Next/Image yine küçük sizes ile yükler.
 */
export function getWorkOrderImageThumbnailUrl(
  publicUrl: string,
  width: number = WORK_ORDER_THUMB_GRID
): string {
  try {
    const url = new URL(publicUrl);
    const marker = "/storage/v1/object/public/";
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return publicUrl;

    const pathAfter = url.pathname.slice(idx + marker.length);
    url.pathname = `/storage/v1/render/image/public/${pathAfter}`;
    url.search = "";
    url.searchParams.set("width", String(width));
    url.searchParams.set("quality", "70");
    return url.toString();
  } catch {
    return publicUrl;
  }
}
