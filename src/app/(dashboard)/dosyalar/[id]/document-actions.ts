"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { deleteDocument, uploadDocument } from "@/lib/storage/upload";
import { getSignedDocumentUrl } from "@/lib/storage/upload";
import {
  DOCUMENT_CATEGORIES,
  type DocumentCategory,
} from "@/types/documents";

export type UploadDocumentState = {
  error?: string;
  success?: boolean;
};

export async function uploadDocumentAction(
  _prev: UploadDocumentState,
  formData: FormData
): Promise<UploadDocumentState> {
  await requireAuth();

  const serviceFileId = String(formData.get("serviceFileId") ?? "");
  const category = String(formData.get("category") ?? "diger") as DocumentCategory;
  const file = formData.get("file");

  if (!serviceFileId) {
    return { error: "Servis dosyası bulunamadı." };
  }

  if (!DOCUMENT_CATEGORIES.includes(category)) {
    return { error: "Geçersiz kategori." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Lütfen bir dosya seçin." };
  }

  const result = await uploadDocument({
    serviceFileId,
    category,
    file,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath(`/dosyalar/${serviceFileId}`);
  return { success: true };
}

export async function deleteDocumentAction(
  documentId: string,
  serviceFileId: string
): Promise<{ error?: string }> {
  await requireAuth();
  const profile = await getCurrentProfile();

  if (profile?.role !== "admin") {
    return { error: "Evrak silme yalnızca yöneticiler içindir." };
  }

  const result = await deleteDocument(documentId, { hardDeleteStorage: true });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath(`/dosyalar/${serviceFileId}`);
  return {};
}

export async function getDocumentSignedUrlAction(
  storagePath: string
): Promise<{ url?: string; error?: string }> {
  await requireAuth();
  const result = await getSignedDocumentUrl(storagePath);
  if (!result.ok) return { error: result.error };
  return { url: result.data };
}
