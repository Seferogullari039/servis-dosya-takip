import { createClient } from "@/lib/supabase/server";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import type {
  WorkOrderImage,
  WorkOrderImageCategory,
  WorkOrderImageStats,
} from "@/types/work-order-image";

function mapRow(row: {
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

export async function listWorkOrderImages(
  workOrderId: string
): Promise<DataResult<WorkOrderImage[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("work_order_images")
      .select("*")
      .eq("work_order_id", workOrderId)
      .order("created_at", { ascending: false });

    if (error) {
      return fail(error.message || "Görseller yüklenemedi.");
    }

    return ok((data ?? []).map(mapRow));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Görseller yüklenemedi.");
  }
}

function todayStartIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getWorkOrderImageDashboardStats(): Promise<
  DataResult<WorkOrderImageStats>
> {
  try {
    const supabase = await createClient();
    const todayStart = todayStartIso();

    const [totalRes, todayRes, ordersRes, withImageRes] = await Promise.all([
      supabase.from("work_order_images").select("id", { count: "exact", head: true }),
      supabase
        .from("work_order_images")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart),
      supabase
        .from("work_orders")
        .select("id")
        .neq("vehicle_status", "Teslim Edildi"),
      supabase.from("work_order_images").select("work_order_id"),
    ]);

    if (totalRes.error) return fail(totalRes.error.message);
    if (todayRes.error) return fail(todayRes.error.message);
    if (ordersRes.error) return fail(ordersRes.error.message);
    if (withImageRes.error) return fail(withImageRes.error.message);

    const withImageIds = new Set(
      (withImageRes.data ?? []).map((r) => r.work_order_id as string)
    );
    const activeOrders = ordersRes.data ?? [];
    const eksikFotografliDosya = activeOrders.filter(
      (o) => !withImageIds.has(o.id as string)
    ).length;

    return ok({
      toplamGorsel: totalRes.count ?? 0,
      bugunYuklenen: todayRes.count ?? 0,
      eksikFotografliDosya,
    });
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : "Görsel istatistikleri yüklenemedi."
    );
  }
}
