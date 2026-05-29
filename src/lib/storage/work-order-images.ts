import {
  MAX_WORK_ORDER_IMAGE_BYTES,
  MAX_WORK_ORDER_IMAGE_UPLOAD_BYTES,
  WORK_ORDER_IMAGE_BUCKET,
  WORK_ORDER_IMAGE_MIME_TYPES,
} from "@/lib/storage/work-order-image-constants";
import { createClient } from "@/lib/supabase/server";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import type { WorkOrderImage } from "@/types/work-order-image";
import {
  isWorkOrderImageCategory,
  type WorkOrderImageCategory,
} from "@/types/work-order-image";

function extensionFromMime(mime: string): string {
  if (mime.includes("webp")) return "webp";
  if (mime.includes("png")) return "png";
  if (mime.includes("heic")) return "heic";
  return "jpg";
}

function validateImageFile(file: File): DataResult<{ mimeType: string }> {
  if (file.size === 0) return fail("Boş dosya yüklenemez.");
  if (file.size > MAX_WORK_ORDER_IMAGE_BYTES) {
    return fail("Görsel çok büyük. Lütfen tekrar deneyin.");
  }
  if (file.size > MAX_WORK_ORDER_IMAGE_UPLOAD_BYTES) {
    return fail(
      "Optimize edilmiş görsel 2 MB sınırını aşıyor. Tekrar yüklemeyi deneyin."
    );
  }
  const mime = file.type || "image/jpeg";
  if (
    !WORK_ORDER_IMAGE_MIME_TYPES.includes(
      mime as (typeof WORK_ORDER_IMAGE_MIME_TYPES)[number]
    )
  ) {
    return fail("Yalnızca JPG, PNG, WEBP veya HEIC yükleyebilirsiniz.");
  }
  return ok({ mimeType: mime });
}

export function buildWorkOrderImageStoragePath(
  workOrderId: string,
  imageId: string,
  mimeType: string
): string {
  const ext = extensionFromMime(mimeType);
  return `${workOrderId}/${imageId}.${ext}`;
}

export function getWorkOrderImagePublicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/${WORK_ORDER_IMAGE_BUCKET}/${storagePath}`;
}

function mapImageRow(row: {
  id: string;
  work_order_id: string;
  image_url: string;
  storage_path: string;
  category: string;
  note: string | null;
  created_at: string;
}): WorkOrderImage {
  return {
    id: row.id,
    workOrderId: row.work_order_id,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    category: row.category as WorkOrderImageCategory,
    note: row.note,
    createdAt: row.created_at,
  };
}

export async function uploadWorkOrderImage(params: {
  workOrderId: string;
  category: WorkOrderImageCategory;
  note?: string | null;
  file: File;
}): Promise<DataResult<WorkOrderImage>> {
  if (!isWorkOrderImageCategory(params.category)) {
    return fail("Geçersiz görsel kategorisi.");
  }

  const validation = validateImageFile(params.file);
  if (!validation.ok) return validation;

  const imageId = crypto.randomUUID();
  const storagePath = buildWorkOrderImageStoragePath(
    params.workOrderId,
    imageId,
    validation.data.mimeType
  );
  const imageUrl = getWorkOrderImagePublicUrl(storagePath);

  try {
    const supabase = await createClient();
    const buffer = Buffer.from(await params.file.arrayBuffer());

    const { error: storageError } = await supabase.storage
      .from(WORK_ORDER_IMAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: validation.data.mimeType,
        upsert: false,
      });

    if (storageError) {
      return fail(storageError.message || "Görsel yüklemesi başarısız.");
    }

    const { data: row, error: insertError } = await supabase
      .from("work_order_images")
      .insert({
        id: imageId,
        work_order_id: params.workOrderId,
        image_url: imageUrl,
        storage_path: storagePath,
        category: params.category,
        note: params.note?.trim() || null,
      })
      .select("*")
      .single();

    if (insertError || !row) {
      await supabase.storage.from(WORK_ORDER_IMAGE_BUCKET).remove([storagePath]);
      return fail(insertError?.message ?? "Görsel kaydı oluşturulamadı.");
    }

    return ok(mapImageRow(row));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Yükleme başarısız.");
  }
}

export async function deleteWorkOrderImage(
  imageId: string
): Promise<DataResult<void>> {
  try {
    const supabase = await createClient();

    const { data: row, error: fetchError } = await supabase
      .from("work_order_images")
      .select("id, storage_path")
      .eq("id", imageId)
      .maybeSingle();

    if (fetchError) return fail(fetchError.message);
    if (!row) return fail("Görsel bulunamadı.");

    const { error: deleteRowError } = await supabase
      .from("work_order_images")
      .delete()
      .eq("id", imageId);

    if (deleteRowError) return fail(deleteRowError.message);

    const { error: storageError } = await supabase.storage
      .from(WORK_ORDER_IMAGE_BUCKET)
      .remove([row.storage_path]);

    if (storageError) {
      console.warn("[storage] work order image remove:", storageError.message);
    }

    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silme başarısız.");
  }
}
