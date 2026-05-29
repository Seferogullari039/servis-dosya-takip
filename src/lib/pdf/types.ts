import type { ServiceFileDocument } from "@/types/documents";
import type { ServiceFileEvent } from "@/types/events";
import type { ServisDosyasi } from "@/types/servis-dosya";

export interface PdfSummaryData {
  dosya: ServisDosyasi;
  generatedAt: string;
}

export interface PdfOperationData extends PdfSummaryData {
  events: ServiceFileEvent[];
  documents: Pick<
    ServiceFileDocument,
    | "originalName"
    | "category"
    | "uploaderFullName"
    | "createdAt"
    | "fileSize"
    | "fileType"
  >[];
}

export type PdfKind = "summary" | "operation";
