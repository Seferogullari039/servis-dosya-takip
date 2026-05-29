import { UPLOAD_LIMITS } from "@/types/documents";

export const STORAGE_BUCKET = "service-documents";

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MIME_TO_FILE_TYPE: Record<AllowedMimeType, "pdf" | "image"> = {
  "application/pdf": "pdf",
  "image/jpeg": "image",
  "image/jpg": "image",
  "image/png": "image",
  "image/webp": "image",
};

export const MAX_FILE_SIZE = {
  pdf: UPLOAD_LIMITS.pdf,
  image: UPLOAD_LIMITS.image,
} as const;

export const SIGNED_URL_EXPIRY_SECONDS = 3600;
