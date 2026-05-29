"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getIsEmriById } from "@/lib/data/work-orders";
import {
  notifyWorkOrderImageDeleted,
  notifyWorkOrderImageUploaded,
} from "@/lib/push/events";
import {
  deleteWorkOrderImage,
  uploadWorkOrderImage,
} from "@/lib/storage/work-order-images";
import {
  isWorkOrderImageCategory,
  type WorkOrderImageCategory,
} from "@/types/work-order-image";

export type UploadWorkOrderImageState = {
  error?: string;
  success?: boolean;
};

export async function uploadWorkOrderImageAction(
  _prev: UploadWorkOrderImageState,
  formData: FormData
): Promise<UploadWorkOrderImageState> {
  await requireAuth();

  const workOrderId = String(formData.get("workOrderId") ?? "");
  const category = String(formData.get("category") ?? "Hasar");
  const note = String(formData.get("note") ?? "");
  const file = formData.get("file");

  if (!workOrderId) {
    return { error: "İş emri bulunamadı." };
  }

  if (!isWorkOrderImageCategory(category)) {
    return { error: "Geçersiz kategori." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Lütfen bir görsel seçin veya çekin." };
  }

  const result = await uploadWorkOrderImage({
    workOrderId,
    category: category as WorkOrderImageCategory,
    note: note || null,
    file,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath(`/is-emirleri/${workOrderId}`);
  return { success: true };
}

export async function deleteWorkOrderImageAction(
  imageId: string,
  workOrderId: string
): Promise<{ error?: string }> {
  await requireAuth();
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    return { error: "Görsel silme yalnızca yöneticiler içindir." };
  }

  const wo = await getIsEmriById(workOrderId);
  const result = await deleteWorkOrderImage(imageId);
  if (!result.ok) {
    return { error: result.error };
  }

  if (wo.ok && wo.data) {
    notifyWorkOrderImageDeleted({
      workOrderId,
      workOrderNo: wo.data.isEmriNo,
      plaka: wo.data.plaka,
      excludeUserId: profile.id,
    });
  }

  revalidatePath(`/is-emirleri/${workOrderId}`);
  return {};
}
