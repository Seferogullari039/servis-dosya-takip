import { logDocumentUploaded } from "@/lib/events/logger";
import {
  buildStorageFileName,
  buildStoragePath,
  sanitizeOriginalName,
  validateUploadFile,
} from "@/lib/storage/validate";
import {
  SIGNED_URL_EXPIRY_SECONDS,
  STORAGE_BUCKET,
} from "@/lib/storage/constants";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import type {
  DocumentCategory,
  ServiceFileDocument,
} from "@/types/documents";
import type { DocumentCategory as DbDocumentCategory } from "@/types/supabase";

function mapDocumentRow(
  row: {
    id: string;
    service_file_id: string;
    uploaded_by: string;
    file_name: string;
    original_name: string;
    file_type: string;
    mime_type: string;
    file_size: number;
    storage_path: string;
    category: DbDocumentCategory;
    created_at: string;
    profiles: { full_name: string } | null;
  },
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

export async function getSignedDocumentUrl(
  storagePath: string,
  expiresIn = SIGNED_URL_EXPIRY_SECONDS
): Promise<DataResult<string>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresIn);

    if (error || !data?.signedUrl) {
      return fail(error?.message ?? "İndirme bağlantısı oluşturulamadı.");
    }

    return ok(data.signedUrl);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İmzalı URL oluşturulamadı.");
  }
}

export async function uploadDocument(params: {
  serviceFileId: string;
  category: DocumentCategory;
  file: File;
}): Promise<DataResult<ServiceFileDocument>> {
  const validation = validateUploadFile({
    name: params.file.name,
    type: params.file.type,
    size: params.file.size,
  });

  if (!validation.ok) {
    return fail(validation.error);
  }

  const documentId = crypto.randomUUID();
  const originalName = sanitizeOriginalName(params.file.name);
  const fileName = buildStorageFileName(documentId, originalName);
  const storagePath = buildStoragePath(
    params.serviceFileId,
    documentId,
    fileName
  );

  try {
    const supabase = await createClient();
    const buffer = Buffer.from(await params.file.arrayBuffer());

    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: validation.mimeType,
        upsert: false,
      });

    if (storageError) {
      return fail(storageError.message || "Dosya yüklemesi başarısız.");
    }

    const { data: recordId, error: rpcError } = await supabase.rpc(
      "insert_service_file_document",
      {
        p_service_file_id: params.serviceFileId,
        p_file_name: fileName,
        p_original_name: originalName,
        p_file_type: validation.fileType,
        p_mime_type: validation.mimeType,
        p_file_size: params.file.size,
        p_storage_path: storagePath,
        p_category: params.category as DbDocumentCategory,
      }
    );

    if (rpcError) {
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      return fail(rpcError.message);
    }

    const { data: row, error: fetchError } = await supabase
      .from("service_file_documents")
      .select(
        `
        *,
        profiles:uploaded_by ( full_name )
      `
      )
      .eq("id", recordId as string)
      .single();

    if (fetchError || !row) {
      return fail("Evrak kaydı oluşturuldu ancak okunamadı.");
    }

    const signed = await getSignedDocumentUrl(storagePath);
    const document = mapDocumentRow(
      row as Parameters<typeof mapDocumentRow>[0],
      signed.ok ? signed.data : null
    );

    const logResult = await logDocumentUploaded(
      params.serviceFileId,
      params.category,
      originalName
    );
    if (!logResult.ok) {
      console.warn("[audit] document event:", logResult.error);
    }

    return ok(document);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Yükleme başarısız.");
  }
}

/** Soft delete + admin fiziksel storage silme */
export async function deleteDocument(
  documentId: string,
  options?: { hardDeleteStorage?: boolean }
): Promise<DataResult<void>> {
  try {
    const supabase = await createClient();

    const { data: doc, error: fetchError } = await supabase
      .from("service_file_documents")
      .select("id, storage_path, deleted_at")
      .eq("id", documentId)
      .maybeSingle();

    if (fetchError) return fail(fetchError.message);
    if (!doc) return fail("Evrak bulunamadı.");
    if (doc.deleted_at) return ok(undefined);

    const { error: softError } = await supabase.rpc(
      "soft_delete_service_file_document",
      { p_document_id: documentId }
    );

    if (softError) return fail(softError.message);

    if (options?.hardDeleteStorage) {
      const admin = createAdminClient();
      await admin.storage.from(STORAGE_BUCKET).remove([doc.storage_path]);
    }

    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silme başarısız.");
  }
}
