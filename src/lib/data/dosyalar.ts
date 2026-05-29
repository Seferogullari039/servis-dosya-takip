import { mapRowToServisDosya } from "@/lib/data/map-dosya";
import { auditDosyaUpdate } from "@/lib/events/audit";
import { logCreated } from "@/lib/events/logger";
import { createClient } from "@/lib/supabase/server";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import type {
  DosyaDurumu,
  OdemeDurumu,
  ServisDosyasi,
  ServisDosyasiForm,
  ServisDosyasiGuncelleme,
} from "@/types/servis-dosya";
import type {
  ServisDosyasiInsert,
  ServisDosyasiRow,
  ServisDosyasiUpdate,
} from "@/types/supabase";

function mapFormToInsert(form: ServisDosyasiForm): ServisDosyasiInsert {
  return {
    dosya_no: form.dosyaNo.trim(),
    plaka: form.plaka.trim(),
    musteri_adi: form.musteriAdi.trim(),
    telefon: form.telefon.trim() || null,
    arac_marka_model: form.aracMarkaModel.trim() || null,
    eksper_adi: form.eksperAdi.trim() || null,
    durum: form.durum,
    odeme_durumu: form.odemeDurumu,
    dosya_tutari: form.dosyaTutari ?? null,
    odenen_tutar: form.odenenTutar ?? 0,
    notlar: form.notlar.trim() || null,
  };
}

function mapGuncellemeToUpdate(
  form: ServisDosyasiGuncelleme
): ServisDosyasiUpdate {
  const update: ServisDosyasiUpdate = {};
  if (form.dosyaNo !== undefined) update.dosya_no = form.dosyaNo.trim();
  if (form.plaka !== undefined) update.plaka = form.plaka.trim();
  if (form.musteriAdi !== undefined) update.musteri_adi = form.musteriAdi.trim();
  if (form.telefon !== undefined) update.telefon = form.telefon.trim() || null;
  if (form.aracMarkaModel !== undefined)
    update.arac_marka_model = form.aracMarkaModel.trim() || null;
  if (form.eksperAdi !== undefined)
    update.eksper_adi = form.eksperAdi.trim() || null;
  if (form.durum !== undefined) update.durum = form.durum;
  if (form.odemeDurumu !== undefined) update.odeme_durumu = form.odemeDurumu;
  if (form.dosyaTutari !== undefined) update.dosya_tutari = form.dosyaTutari;
  if (form.odenenTutar !== undefined) update.odenen_tutar = form.odenenTutar;
  if (form.notlar !== undefined) update.notlar = form.notlar.trim() || null;
  return update;
}

function buildSearchPattern(arama: string): string {
  const cleaned = arama.trim().replace(/\s+/g, "%");
  return `%${cleaned}%`;
}

function supabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.code === "23505") {
    return "Bu dosya numarası zaten kayıtlı.";
  }
  return error.message || "Veritabanı işlemi başarısız oldu.";
}

/** Tüm dosyaları listeler; arama plaka ve dosya_no üzerinde (ilike). */
export async function listeleDosyalar(
  arama?: string
): Promise<DataResult<ServisDosyasi[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("servis_dosyalari")
      .select("*")
      .order("created_at", { ascending: false });

    const term = arama?.trim();
    if (term) {
      const pattern = buildSearchPattern(term);
      query = query.or(
        `plaka.ilike."${pattern}",dosya_no.ilike."${pattern}"`
      );
    }

    const { data, error } = await query;

    if (error) return fail(supabaseErrorMessage(error));
    return ok((data ?? []).map(mapRowToServisDosya));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Dosyalar yüklenemedi.");
  }
}

/** Tek dosya detayı. */
export async function getDosyaById(
  id: string
): Promise<DataResult<ServisDosyasi | null>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("servis_dosyalari")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return fail(supabaseErrorMessage(error));
    if (!data) return ok(null);
    return ok(mapRowToServisDosya(data));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Dosya yüklenemedi.");
  }
}

/** Yeni servis dosyası oluşturur. */
export async function olusturDosya(
  form: ServisDosyasiForm
): Promise<DataResult<ServisDosyasi>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("servis_dosyalari")
      .insert(mapFormToInsert(form))
      .select("*")
      .single();

    if (error) return fail(supabaseErrorMessage(error));
    if (!data) return fail("Dosya oluşturuldu ancak yanıt alınamadı.");

    const dosya = mapRowToServisDosya(data);
    const createdLog = await logCreated(dosya.id, dosya);
    if (!createdLog.ok) {
      console.warn("[audit] created event:", createdLog.error);
    }

    return ok(dosya);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Dosya oluşturulamadı.");
  }
}

/** Mevcut dosyayı günceller. */
export async function guncelleDosya(
  id: string,
  form: ServisDosyasiGuncelleme
): Promise<DataResult<ServisDosyasi>> {
  try {
    const supabase = await createClient();
    const payload = mapGuncellemeToUpdate(form);
    if (Object.keys(payload).length === 0) {
      return fail("Güncellenecek alan bulunamadı.");
    }

    const { data: oldRow, error: fetchError } = await supabase
      .from("servis_dosyalari")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) return fail(supabaseErrorMessage(fetchError));
    if (!oldRow) return fail("Dosya bulunamadı.");

    const { data, error } = await supabase
      .from("servis_dosyalari")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return fail(supabaseErrorMessage(error));
    if (!data) return fail("Dosya bulunamadı.");

    const dosya = mapRowToServisDosya(data);
    const auditResult = await auditDosyaUpdate(id, oldRow, dosya);
    if (!auditResult.ok) {
      console.warn("[audit] update events:", auditResult.error);
    }

    return ok(dosya);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Dosya güncellenemedi.");
  }
}
