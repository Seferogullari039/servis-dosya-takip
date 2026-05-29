import { getDosyaById } from "@/lib/data/dosyalar";
import { listDocumentsByServiceFileId } from "@/lib/data/documents";
import { listEventsByServiceFileId } from "@/lib/data/events";
import type { PdfOperationData, PdfSummaryData } from "@/lib/pdf/types";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";

const PDF_EVENT_LIMIT = 20;

/** Yalnızca özet PDF için gerekli veri */
export async function fetchPdfSummaryData(
  serviceFileId: string
): Promise<DataResult<PdfSummaryData>> {
  const dosyaResult = await getDosyaById(serviceFileId);
  if (!dosyaResult.ok) return dosyaResult;
  if (!dosyaResult.data) return fail("Servis dosyası bulunamadı.");

  return ok({
    dosya: dosyaResult.data,
    generatedAt: new Date().toISOString(),
  });
}

/** Operasyon PDF: dosya + son 20 hareket + evrak listesi (signed URL yok) */
export async function fetchPdfOperationData(
  serviceFileId: string
): Promise<DataResult<PdfOperationData>> {
  const [dosyaResult, eventsResult, documentsResult] = await Promise.all([
    getDosyaById(serviceFileId),
    listEventsByServiceFileId(serviceFileId, {
      page: 1,
      pageSize: PDF_EVENT_LIMIT,
    }),
    listDocumentsByServiceFileId(serviceFileId, {
      page: 1,
      pageSize: 100,
      includeSignedUrls: false,
    }),
  ]);

  if (!dosyaResult.ok) return dosyaResult;
  if (!dosyaResult.data) return fail("Servis dosyası bulunamadı.");
  if (!eventsResult.ok) return eventsResult;
  if (!documentsResult.ok) return documentsResult;

  return ok({
    dosya: dosyaResult.data,
    generatedAt: new Date().toISOString(),
    events: eventsResult.data.items,
    documents: documentsResult.data.items.map((d) => ({
      originalName: d.originalName,
      category: d.category,
      uploaderFullName: d.uploaderFullName,
      createdAt: d.createdAt,
      fileSize: d.fileSize,
      fileType: d.fileType,
    })),
  });
}
