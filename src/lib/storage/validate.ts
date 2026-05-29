import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MIME_TO_FILE_TYPE,
  type AllowedMimeType,
} from "@/lib/storage/constants";
import type { DocumentFileType } from "@/types/documents";

export type FileValidationResult =
  | { ok: true; mimeType: AllowedMimeType; fileType: DocumentFileType }
  | { ok: false; error: string };

export function validateUploadFile(file: {
  name: string;
  type: string;
  size: number;
}): FileValidationResult {
  const mime = file.type.toLowerCase() as AllowedMimeType;

  if (!ALLOWED_MIME_TYPES.includes(mime)) {
    return {
      ok: false,
      error:
        "Desteklenmeyen dosya formatı. İzin verilen: PDF, JPG, JPEG, PNG, WEBP.",
    };
  }

  const fileType = MIME_TO_FILE_TYPE[mime];
  const maxSize = MAX_FILE_SIZE[fileType];

  if (file.size > maxSize) {
    const limitMb = fileType === "pdf" ? 15 : 10;
    return {
      ok: false,
      error: `Dosya çok büyük. Maksimum ${limitMb} MB (${fileType === "pdf" ? "PDF" : "görsel"}).`,
    };
  }

  if (file.size <= 0) {
    return { ok: false, error: "Geçersiz dosya boyutu." };
  }

  return { ok: true, mimeType: mime, fileType };
}

export function sanitizeOriginalName(name: string): string {
  const base = name.replace(/[/\\?%*:|"<>]/g, "-").trim();
  return base.slice(0, 200) || "dosya";
}

export function buildStorageFileName(
  documentId: string,
  originalName: string
): string {
  const ext = originalName.includes(".")
    ? originalName.slice(originalName.lastIndexOf(".")).toLowerCase()
    : "";
  return `${documentId}${ext}`;
}

export function buildStoragePath(
  serviceFileId: string,
  documentId: string,
  fileName: string
): string {
  return `${serviceFileId}/${documentId}/${fileName}`;
}
