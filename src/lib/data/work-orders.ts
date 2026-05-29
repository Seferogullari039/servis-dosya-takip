import {
  generateWorkOrderNo,
  mapFormToWorkOrderInsert,
  mapRowToIsEmriKayit,
  mapRowToIsEmriOzet,
} from "@/lib/data/map-work-order";
import { createClient } from "@/lib/supabase/server";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import type {
  IsEmriFormState,
  IsEmriKayit,
  IsEmriListFilters,
  IsEmriOzet,
} from "@/types/is-emri";
import { isAracDurumu, type AracDurumu } from "@/types/vehicle-status";

function supabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.code === "23505") {
    return "Bu iş emri numarası zaten kayıtlı.";
  }
  return error.message || "Veritabanı işlemi başarısız oldu.";
}

function buildSearchPattern(arama: string): string {
  const cleaned = arama.trim().replace(/\s+/g, "%");
  return `%${cleaned}%`;
}

export async function listeleIsEmirleri(
  filters?: IsEmriListFilters
): Promise<DataResult<IsEmriOzet[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("work_orders")
      .select("*")
      .order("created_at", { ascending: false });

    const term = filters?.arama?.trim();
    if (term) {
      const pattern = buildSearchPattern(term);
      query = query.or(
        `plate.ilike."${pattern}",customer_name.ilike."${pattern}",work_order_no.ilike."${pattern}"`
      );
    }

    if (filters?.aracDurumu && isAracDurumu(filters.aracDurumu)) {
      query = query.eq("vehicle_status", filters.aracDurumu);
    }

    if (filters?.baslangic) {
      query = query.gte("entry_date", filters.baslangic);
    }
    if (filters?.bitis) {
      query = query.lte("entry_date", filters.bitis);
    }

    const { data, error } = await query;

    if (error) return fail(supabaseErrorMessage(error));
    return ok((data ?? []).map((row) => mapRowToIsEmriOzet(row)));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İş emirleri yüklenemedi.");
  }
}

export async function getIsEmriById(
  id: string
): Promise<DataResult<IsEmriKayit | null>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("work_orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return fail(supabaseErrorMessage(error));
    if (!data) return ok(null);
    return ok(mapRowToIsEmriKayit(data));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İş emri yüklenemedi.");
  }
}

export async function olusturIsEmri(
  form: IsEmriFormState
): Promise<DataResult<IsEmriKayit>> {
  if (!form.ruhsatSahibi.trim()) {
    return fail("Ruhsat sahibi / müşteri adı zorunludur.");
  }
  if (!form.plaka.trim()) {
    return fail("Plaka zorunludur.");
  }

  try {
    const supabase = await createClient();
    const workOrderNo = generateWorkOrderNo();
    const { data, error } = await supabase
      .from("work_orders")
      .insert(mapFormToWorkOrderInsert(form, workOrderNo))
      .select("*")
      .single();

    if (error) return fail(supabaseErrorMessage(error));
    if (!data) return fail("İş emri oluşturuldu ancak yanıt alınamadı.");
    return ok(mapRowToIsEmriKayit(data));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İş emri kaydedilemedi.");
  }
}

export async function guncelleIsEmri(
  id: string,
  form: IsEmriFormState
): Promise<DataResult<IsEmriKayit>> {
  if (!form.ruhsatSahibi.trim()) {
    return fail("Ruhsat sahibi / müşteri adı zorunludur.");
  }
  if (!form.plaka.trim()) {
    return fail("Plaka zorunludur.");
  }

  try {
    const supabase = await createClient();
    const existing = await supabase
      .from("work_orders")
      .select("work_order_no")
      .eq("id", id)
      .maybeSingle();

    if (existing.error) return fail(supabaseErrorMessage(existing.error));
    if (!existing.data) return fail("İş emri bulunamadı.");

    const workOrderNo = existing.data.work_order_no;
    const { data, error } = await supabase
      .from("work_orders")
      .update(mapFormToWorkOrderInsert(form, workOrderNo))
      .eq("id", id)
      .select("*")
      .single();

    if (error) return fail(supabaseErrorMessage(error));
    if (!data) return fail("İş emri bulunamadı.");
    return ok(mapRowToIsEmriKayit(data));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İş emri güncellenemedi.");
  }
}

export async function guncelleAracDurumu(
  id: string,
  aracDurumu: AracDurumu
): Promise<DataResult<IsEmriOzet>> {
  if (!isAracDurumu(aracDurumu)) {
    return fail("Geçersiz araç durumu.");
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("work_orders")
      .update({ vehicle_status: aracDurumu })
      .eq("id", id)
      .select("*")
      .single();

    if (error) return fail(supabaseErrorMessage(error));
    if (!data) return fail("İş emri bulunamadı.");
    return ok(mapRowToIsEmriOzet(data));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Durum güncellenemedi.");
  }
}

export async function silIsEmri(id: string): Promise<DataResult<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("work_orders").delete().eq("id", id);

    if (error) return fail(supabaseErrorMessage(error));
    return ok(null);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İş emri silinemedi.");
  }
}
