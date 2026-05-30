import { mapRowToServisDosya } from "@/lib/data/map-dosya";
import { mapRowToIsEmriKayit } from "@/lib/data/map-work-order";
import { listeleTedarikParcalari } from "@/lib/data/tedarik";
import { rowsToCsv } from "@/lib/export/csv";
import {
  isServiceRoleConfigured,
  tryCreateAdminClient,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";

async function getExportClient() {
  if (isServiceRoleConfigured()) {
    const admin = tryCreateAdminClient();
    if (admin) return admin;
  }
  return createClient();
}

export async function buildDosyalarCsv(): Promise<DataResult<string>> {
  try {
    const supabase = await getExportClient();
    const { data, error } = await supabase
      .from("servis_dosyalari")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return fail(error.message);

    const headers = [
      "dosya_no",
      "plaka",
      "musteri",
      "sigorta",
      "dosya_durumu",
      "odeme_durumu",
      "dosya_tutari",
      "odenen_tutar",
      "created_at",
    ];

    const rows = (data ?? []).map((row) => {
      const d = mapRowToServisDosya(row);
      return [
        d.dosyaNo,
        d.plaka,
        d.musteriAdi,
        d.eksperAdi,
        d.durum,
        d.odemeDurumu,
        d.dosyaTutari ?? "",
        d.odenenTutar,
        d.olusturulmaTarihi,
      ];
    });

    return ok(rowsToCsv(headers, rows));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Dosyalar dışa aktarılamadı.");
  }
}

export async function buildIsEmirleriCsv(): Promise<DataResult<string>> {
  try {
    const supabase = await getExportClient();
    const { data, error } = await supabase
      .from("work_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return fail(error.message);

    const headers = [
      "is_emri_no",
      "musteri",
      "telefon",
      "plaka",
      "marka",
      "model",
      "arac_durumu",
      "toplam_tutar",
      "created_at",
    ];

    const rows = (data ?? []).map((row) => {
      const k = mapRowToIsEmriKayit(row);
      return [
        k.isEmriNo,
        k.ruhsatSahibi,
        k.telefon,
        k.plaka,
        k.marka,
        k.model,
        k.aracDurumu,
        k.toplamTutar,
        k.createdAt,
      ];
    });

    return ok(rowsToCsv(headers, rows));
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : "İş emirleri dışa aktarılamadı."
    );
  }
}

export async function buildTedarikCsv(): Promise<DataResult<string>> {
  const result = await listeleTedarikParcalari();
  if (!result.ok) return fail(result.error);

  const headers = [
    "is_emri_no",
    "plaka",
    "parca_adi",
    "tedarik_durumu",
    "adet",
    "birim_fiyat",
    "toplam_fiyat",
    "tedarik_tarihi",
    "geldi_tarihi",
  ];

  const rows = result.data.map((p) => [
    p.isEmriNo,
    p.plaka,
    p.parcaAdi,
    p.tedarikDurumu,
    p.adet,
    p.birimFiyat,
    p.toplamFiyat,
    p.tedarikTarihi,
    p.geldiTarihi,
  ]);

  return ok(rowsToCsv(headers, rows));
}

export async function buildGorsellerCsv(): Promise<DataResult<string>> {
  try {
    const supabase = await getExportClient();
    const { data, error } = await supabase
      .from("work_order_images")
      .select(
        `
        id,
        work_order_id,
        image_url,
        storage_path,
        category,
        note,
        created_at,
        work_orders ( work_order_no, plate )
      `
      )
      .order("created_at", { ascending: false });

    if (error) return fail(error.message);

    const headers = [
      "gorsel_id",
      "is_emri_no",
      "plaka",
      "kategori",
      "not",
      "image_url",
      "storage_path",
      "created_at",
    ];

    const rows = (data ?? []).map((row) => {
      const wo = row.work_orders as
        | { work_order_no: string; plate: string }
        | null
        | { work_order_no: string; plate: string }[];
      const order = Array.isArray(wo) ? wo[0] : wo;
      return [
        row.id,
        order?.work_order_no ?? "",
        order?.plate ?? "",
        row.category,
        row.note ?? "",
        row.image_url,
        row.storage_path,
        row.created_at,
      ];
    });

    return ok(rowsToCsv(headers, rows));
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : "Görsel listesi dışa aktarılamadı."
    );
  }
}

export async function buildTumYedekJson(): Promise<DataResult<Record<string, unknown>>> {
  const [dosyalarRes, isEmirleriRes, tedarikRes, gorsellerRes] =
    await Promise.all([
      (async () => {
        const supabase = await getExportClient();
        return supabase
          .from("servis_dosyalari")
          .select("*")
          .order("created_at", { ascending: false });
      })(),
      (async () => {
        const supabase = await getExportClient();
        return supabase
          .from("work_orders")
          .select("*")
          .order("created_at", { ascending: false });
      })(),
      listeleTedarikParcalari(),
      (async () => {
        const supabase = await getExportClient();
        return supabase
          .from("work_order_images")
          .select("*")
          .order("created_at", { ascending: false });
      })(),
    ]);

  if (dosyalarRes.error) return fail(dosyalarRes.error.message);
  if (isEmirleriRes.error) return fail(isEmirleriRes.error.message);
  if (!tedarikRes.ok) return fail(tedarikRes.error);
  if (gorsellerRes.error) return fail(gorsellerRes.error.message);

  return ok({
    exportedAt: new Date().toISOString(),
    dosyalar: (dosyalarRes.data ?? []).map(mapRowToServisDosya),
    isEmirleri: (isEmirleriRes.data ?? []).map(mapRowToIsEmriKayit),
    tedarik: tedarikRes.data,
    gorseller: gorsellerRes.data ?? [],
  });
}
