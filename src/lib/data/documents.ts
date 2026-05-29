import { getSignedDocumentUrl } from "@/lib/storage/upload";
import { createClient } from "@/lib/supabase/server";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import {
  DEFAULT_DOCUMENTS_PAGE_SIZE,
  type DocumentCategory,
  type PaginatedDocuments,
  type ServiceFileDocument,
} from "@/types/documents";
import type {
  DocumentCategory as DbDocumentCategory,
  ServiceFileDocumentRow,
} from "@/types/supabase";

type DocumentRowWithProfile = ServiceFileDocumentRow & {
  profiles: { full_name: string } | null;
};

function mapRow(
  row: DocumentRowWithProfile,
  signedUrl?: string | null
): ServiceFileDocument {
  return {
    id: row.id,
    serviceFileId: row.service_file_id,
    uploadedBy: row.uploaded_by,
    uploaderFullName: row.profiles?.full_name ?? "Bilinmeyen",
    fileName: row.file_name,
    originalName: row.original_name,
    fileType: row.file_type as ServiceFileDocument["fileType"],
    mimeType: row.mime_type,
    fileSize: row.file_size,
    storagePath: row.storage_path,
    category: row.category,
    createdAt: row.created_at,
    signedUrl,
  };
}

export interface ListDocumentsOptions {
  page?: number;
  pageSize?: number;
  category?: DocumentCategory;
  includeSignedUrls?: boolean;
}

export async function listDocumentsByServiceFileId(
  serviceFileId: string,
  options: ListDocumentsOptions = {}
): Promise<DataResult<PaginatedDocuments>> {
  try {
    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.min(
      50,
      Math.max(1, options.pageSize ?? DEFAULT_DOCUMENTS_PAGE_SIZE)
    );
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = await createClient();

    let countQuery = supabase
      .from("service_file_documents")
      .select("*", { count: "exact", head: true })
      .eq("service_file_id", serviceFileId)
      .is("deleted_at", null);

    let dataQuery = supabase
      .from("service_file_documents")
      .select(
        `
        *,
        profiles:uploaded_by ( full_name )
      `
      )
      .eq("service_file_id", serviceFileId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (options.category) {
      countQuery = countQuery.eq(
        "category",
        options.category as DbDocumentCategory
      );
      dataQuery = dataQuery.eq(
        "category",
        options.category as DbDocumentCategory
      );
    }

    const [{ count, error: countError }, { data, error }] = await Promise.all([
      countQuery,
      dataQuery,
    ]);

    if (countError) return fail(countError.message);
    if (error) return fail(error.message);

    const rows = (data ?? []) as DocumentRowWithProfile[];
    const items: ServiceFileDocument[] = [];

    for (const row of rows) {
      let signedUrl: string | null = null;
      if (options.includeSignedUrls) {
        const signed = await getSignedDocumentUrl(row.storage_path);
        signedUrl = signed.ok ? signed.data : null;
      }
      items.push(mapRow(row, signedUrl));
    }

    const total = count ?? 0;

    return ok({
      items,
      page,
      pageSize,
      total,
      hasMore: from + items.length < total,
    });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Evraklar yüklenemedi.");
  }
}

export async function getDocumentById(
  documentId: string
): Promise<DataResult<ServiceFileDocument | null>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("service_file_documents")
      .select(
        `
        *,
        profiles:uploaded_by ( full_name )
      `
      )
      .eq("id", documentId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) return fail(error.message);
    if (!data) return ok(null);

    const signed = await getSignedDocumentUrl(data.storage_path);

    return ok(
      mapRow(
        data as DocumentRowWithProfile,
        signed.ok ? signed.data : null
      )
    );
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Evrak yüklenemedi.");
  }
}
