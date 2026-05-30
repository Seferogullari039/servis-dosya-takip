import {
  olusturDosyaWithServiceRole,
  type OlusturDosyaResult,
} from "@/lib/data/servis-dosya-create";
import { mapRowToServisDosya } from "@/lib/data/map-dosya";
import { auditDosyaUpdate } from "@/lib/events/audit";
import { STORAGE_BUCKET } from "@/lib/storage/constants";
import {
  isServiceRoleConfigured,
  tryCreateAdminClient,
} from "@/lib/supabase/admin";
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
  if (error.code === "23503") {
    return "Bu dosyaya bağlı kayıtlar olduğu için silinemez.";
  }
  return error.message || "Veritabanı işlemi başarısız oldu.";
}

const DOSYA_SILINEMEDI = "Dosya silinemedi.";

/** Soft delete sonrası kalıcı silme gecikmesi (ms) */
export const SOFT_DELETE_GRACE_MS = 10_000;

/** Evrak storage nesnelerini siler (DB satırı cascade ile gider). */
async function purgeServiceFileDocumentStorage(
  serviceFileId: string
): Promise<void> {
  if (!isServiceRoleConfigured()) return;

  const admin = tryCreateAdminClient();
  if (!admin) return;

  const { data: docs, error } = await admin
    .from("service_file_documents")
    .select("storage_path")
    .eq("service_file_id", serviceFileId);

  if (error) {
    console.warn("[dosya] evrak listesi okunamadı:", error.message);
    return;
  }

  const paths = (docs ?? [])
    .map((d) => d.storage_path)
    .filter((p): p is string => Boolean(p?.trim()));

  if (paths.length === 0) return;

  const { error: removeError } = await admin.storage
    .from(STORAGE_BUCKET)
    .remove(paths);

  if (removeError) {
    console.warn("[dosya] storage purge:", removeError.message);
  }
}

/** Süresi dolmuş soft-delete kayıtlarını kalıcı siler. */
export async function purgeExpiredSoftDeletedDosyalar(): Promise<void> {
  if (!isServiceRoleConfigured()) return;

  const admin = tryCreateAdminClient();
  if (!admin) return;

  const cutoff = new Date(Date.now() - SOFT_DELETE_GRACE_MS).toISOString();
  const { data, error } = await admin
    .from("servis_dosyalari")
    .select("id")
    .not("deleted_at", "is", null)
    .lt("deleted_at", cutoff);

  if (error || !data?.length) return;

  for (const row of data) {
    const result = await kaliciSilDosya(row.id, admin);
    if (!result.ok) {
      console.warn("[dosya] purge failed", row.id, result.error);
    }
  }
}

/** Tüm dosyaları listeler; arama plaka ve dosya_no üzerinde (ilike). */
export async function listeleDosyalar(
  arama?: string
): Promise<DataResult<ServisDosyasi[]>> {
  try {
    await purgeExpiredSoftDeletedDosyalar();

    const supabase = await createClient();
    let query = supabase
      .from("servis_dosyalari")
      .select("*")
      .is("deleted_at", null)
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
      .is("deleted_at", null)
      .maybeSingle();

    if (error) return fail(supabaseErrorMessage(error));
    if (!data) return ok(null);
    return ok(mapRowToServisDosya(data));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Dosya yüklenemedi.");
  }
}

/** Yeni servis dosyası — yalnızca service role insert (createDosyaAction yolu). */
export async function olusturDosya(
  form: ServisDosyasiForm
): Promise<OlusturDosyaResult> {
  return olusturDosyaWithServiceRole(form, mapFormToInsert);
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
      .is("deleted_at", null)
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

/** Soft delete — 10 sn içinde geri alınabilir. */
export async function softSilDosya(id: string): Promise<DataResult<null>> {
  try {
    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("servis_dosyalari")
      .select("id, deleted_at")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) return fail(supabaseErrorMessage(fetchError));
    if (!existing) return fail("Dosya bulunamadı.");
    if (existing.deleted_at) return ok(null);

    const { error } = await supabase
      .from("servis_dosyalari")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return fail(supabaseErrorMessage(error));

    return ok(null);
  } catch (e) {
    return fail(e instanceof Error ? e.message : DOSYA_SILINEMEDI);
  }
}

/** Soft delete geri al */
export async function restoreDosya(id: string): Promise<DataResult<null>> {
  try {
    const client = isServiceRoleConfigured()
      ? tryCreateAdminClient() ?? (await createClient())
      : await createClient();

    const { data: existing, error: fetchError } = await client
      .from("servis_dosyalari")
      .select("id, deleted_at")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) return fail(supabaseErrorMessage(fetchError));
    if (!existing) return fail("Dosya bulunamadı.");
    if (!existing.deleted_at) return ok(null);

    const { error } = await client
      .from("servis_dosyalari")
      .update({ deleted_at: null })
      .eq("id", id);

    if (error) return fail(supabaseErrorMessage(error));

    return ok(null);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Dosya geri alınamadı.");
  }
}

/** Kalıcı silme + evrak storage temizliği */
export async function kaliciSilDosya(
  id: string,
  client?: Awaited<ReturnType<typeof createClient>>
): Promise<DataResult<null>> {
  try {
    const supabase = client ?? (await createClient());

    const { data: existing, error: fetchError } = await supabase
      .from("servis_dosyalari")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) return fail(supabaseErrorMessage(fetchError));
    if (!existing) return ok(null);

    await purgeServiceFileDocumentStorage(id);

    const { error } = await supabase
      .from("servis_dosyalari")
      .delete()
      .eq("id", id);

    if (error) return fail(supabaseErrorMessage(error));

    return ok(null);
  } catch (e) {
    return fail(e instanceof Error ? e.message : DOSYA_SILINEMEDI);
  }
}

/** @deprecated softSilDosya kullanın */
export async function silDosya(id: string): Promise<DataResult<null>> {
  return softSilDosya(id);
}
