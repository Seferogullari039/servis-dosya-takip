export const DOCUMENT_CATEGORIES = [
  "eksper",
  "evrak",
  "odeme",
  "fotograf",
  "diger",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  eksper: "Eksper",
  evrak: "Evrak",
  odeme: "Ödeme",
  fotograf: "Fotoğraf",
  diger: "Diğer",
};

export type DocumentFileType = "pdf" | "image";

export interface ServiceFileDocument {
  id: string;
  serviceFileId: string;
  uploadedBy: string;
  uploaderFullName: string;
  fileName: string;
  originalName: string;
  fileType: DocumentFileType;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  category: DocumentCategory;
  createdAt: string;
  signedUrl?: string | null;
}

export interface PaginatedDocuments {
  items: ServiceFileDocument[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export const DEFAULT_DOCUMENTS_PAGE_SIZE = 24;

export const UPLOAD_LIMITS = {
  pdf: 15 * 1024 * 1024,
  image: 10 * 1024 * 1024,
} as const;
