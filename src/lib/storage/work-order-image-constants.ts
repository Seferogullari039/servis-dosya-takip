export const WORK_ORDER_IMAGE_BUCKET = "work-order-images";

export const MAX_WORK_ORDER_IMAGE_BYTES = 10 * 1024 * 1024;

export const WORK_ORDER_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
] as const;
