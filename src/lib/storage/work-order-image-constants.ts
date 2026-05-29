export const WORK_ORDER_IMAGE_BUCKET = "work-order-images";

/** İstemci optimize sonrası beklenen üst sınır */
export const MAX_WORK_ORDER_IMAGE_UPLOAD_BYTES = 2 * 1024 * 1024;

/** Ham dosya (optimizasyon öncesi) üst sınır — istemci zaten küçültür */
export const MAX_WORK_ORDER_IMAGE_BYTES = 25 * 1024 * 1024;

export const WORK_ORDER_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
] as const;
