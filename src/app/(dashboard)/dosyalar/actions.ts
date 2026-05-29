"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  guncelleDosya,
  getDosyaById,
  olusturDosya,
} from "@/lib/data/dosyalar";
import {
  assertOperationAccess,
  canEditExpert,
  canSetStatus,
} from "@/lib/operations/auth-action";
import { parseTutarInput } from "@/lib/utils/para";
import {
  DOSYA_DURUMLARI,
  ODEME_DURUMLARI,
  type DosyaDurumu,
  type OdemeDurumu,
  type ServisDosyasiForm,
  type ServisDosyasiGuncelleme,
} from "@/types/servis-dosya";
import type { OperationResult } from "@/types/operations";
import type { Profile } from "@/lib/auth/types";

import { getCachedAlertSummary } from "@/lib/data/dashboard";
import { listEventsByServiceFileId } from "@/lib/data/events";
import { invalidateDashboardCache } from "@/lib/cache";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { assertProductWriteAccess } from "@/lib/system/feature-freeze";
import { assertSafeModeOperation } from "@/lib/system/freeze";

function revalidateDosya(id: string) {
  invalidateDashboardCache();
  revalidatePath("/dosyalar");
  revalidatePath(`/dosyalar/${id}`);
  revalidatePath("/");
}

export async function updateStatus(
  id: string,
  durum: DosyaDurumu
): Promise<OperationResult> {
  const auth = await assertOperationAccess();
  if (!auth.ok) return { ok: false, error: auth.error };

  const result = await applyStatusUpdate(id, durum, auth);
  if (!result.ok) return result;

  revalidateDosya(id);
  return result;
}

async function applyStatusUpdate(
  id: string,
  durum: DosyaDurumu,
  auth: { ok: true; profile: Profile }
): Promise<OperationResult> {
  if (!DOSYA_DURUMLARI.includes(durum)) {
    return { ok: false, error: "Geçersiz durum." };
  }
  if (!canSetStatus(auth.profile, durum)) {
    return { ok: false, error: "Dosya kapatma yalnızca yönetici içindir." };
  }
  const result = await guncelleDosya(id, { durum });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, data: result.data };
}

async function applyNoteUpdate(
  id: string,
  noteText: string
): Promise<OperationResult> {
  const trimmed = noteText.trim();
  if (!trimmed) return { ok: false, error: "Not boş olamaz." };

  const current = await getDosyaById(id);
  if (!current.ok || !current.data) {
    return { ok: false, error: "Dosya bulunamadı." };
  }

  const stamp = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const prefix = current.data.notlar.trim();
  const notlar = prefix
    ? `${prefix}\n[${stamp}] ${trimmed}`
    : `[${stamp}] ${trimmed}`;

  const result = await guncelleDosya(id, { notlar });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, data: result.data };
}

export async function updatePayment(
  id: string,
  odemeDurumu: OdemeDurumu,
  tutar?: number | null
): Promise<OperationResult> {
  const auth = await assertOperationAccess();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!ODEME_DURUMLARI.includes(odemeDurumu)) {
    return { ok: false, error: "Geçersiz ödeme durumu." };
  }

  const patch: ServisDosyasiGuncelleme = { odemeDurumu };

  if (odemeDurumu === "Ödenmedi") {
    patch.odenenTutar = 0;
  } else if (odemeDurumu === "Ödendi") {
    if (tutar == null || tutar <= 0) {
      return { ok: false, error: "Ödendi için dosya tutarını girin." };
    }
    patch.dosyaTutari = tutar;
    patch.odenenTutar = tutar;
  } else if (odemeDurumu === "Kısmi Ödendi") {
    if (tutar == null || tutar < 0) {
      return { ok: false, error: "Kısmi ödeme için ödenen tutarı girin." };
    }
    patch.odenenTutar = tutar;
    const current = await getDosyaById(id);
    if (current.ok && current.data?.dosyaTutari != null && tutar > current.data.dosyaTutari) {
      return {
        ok: false,
        error: "Ödenen tutar, dosya tutarından büyük olamaz.",
      };
    }
  }

  const result = await guncelleDosya(id, patch);
  if (!result.ok) return { ok: false, error: result.error };

  revalidateDosya(id);
  return { ok: true, data: result.data };
}

export async function addNote(
  id: string,
  noteText: string
): Promise<OperationResult> {
  const auth = await assertOperationAccess();
  if (!auth.ok) return { ok: false, error: auth.error };

  const result = await applyNoteUpdate(id, noteText);
  if (!result.ok) return result;

  revalidateDosya(id);
  return result;
}

export async function updateExpert(
  id: string,
  eksperAdi: string
): Promise<OperationResult> {
  const auth = await assertOperationAccess();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!canEditExpert(auth.profile)) {
    return { ok: false, error: "Eksper değişikliği yalnızca yönetici içindir." };
  }

  const result = await guncelleDosya(id, { eksperAdi: eksperAdi.trim() });
  if (!result.ok) return { ok: false, error: result.error };

  revalidateDosya(id);
  return { ok: true, data: result.data };
}

export async function bulkUpdateStatus(
  ids: string[],
  durum: DosyaDurumu
): Promise<OperationResult & { updated?: number; failed?: number }> {
  const auth = await assertOperationAccess();
  if (!auth.ok) return { ok: false, error: auth.error };
  const safe = assertSafeModeOperation("durum güncelleme", { allowBulk: true });
  if (!safe.ok) return { ok: false, error: safe.error };
  if (ids.length === 0) return { ok: false, error: "Dosya seçilmedi." };

  let updated = 0;
  let failed = 0;
  for (const id of ids) {
    const res = await applyStatusUpdate(id, durum, auth);
    if (res.ok) updated++;
    else failed++;
  }

  invalidateDashboardCache();
  revalidatePath("/dosyalar");
  revalidatePath("/");

  if (failed > 0 && updated === 0) {
    return { ok: false, error: "Toplu güncelleme başarısız." };
  }

  return { ok: true, updated, failed };
}

export async function bulkAddNote(
  ids: string[],
  noteText: string
): Promise<OperationResult & { updated?: number; failed?: number }> {
  const auth = await assertOperationAccess();
  if (!auth.ok) return { ok: false, error: auth.error };
  const safe = assertSafeModeOperation("not ekleme", { allowBulk: true });
  if (!safe.ok) return { ok: false, error: safe.error };
  if (ids.length === 0) return { ok: false, error: "Dosya seçilmedi." };

  let updated = 0;
  let failed = 0;
  for (const id of ids) {
    const res = await applyNoteUpdate(id, noteText);
    if (res.ok) updated++;
    else failed++;
  }

  invalidateDashboardCache();
  revalidatePath("/dosyalar");
  revalidatePath("/");

  if (failed > 0 && updated === 0) {
    return { ok: false, error: "Toplu not ekleme başarısız." };
  }

  return { ok: true, updated, failed };
}

export type CreateDosyaState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof ServisDosyasiForm, string>>;
};

function parseForm(formData: FormData): ServisDosyasiForm {
  return {
    dosyaNo: String(formData.get("dosyaNo") ?? ""),
    plaka: String(formData.get("plaka") ?? ""),
    musteriAdi: String(formData.get("musteriAdi") ?? ""),
    telefon: String(formData.get("telefon") ?? ""),
    aracMarkaModel: String(formData.get("aracMarkaModel") ?? ""),
    eksperAdi: String(formData.get("eksperAdi") ?? ""),
    durum: String(formData.get("durum") ?? "Yeni Açıldı") as DosyaDurumu,
    odemeDurumu: String(
      formData.get("odemeDurumu") ?? "Ödenmedi"
    ) as OdemeDurumu,
    dosyaTutari: parseTutarInput(String(formData.get("dosyaTutari") ?? "")),
    odenenTutar: 0,
    notlar: String(formData.get("notlar") ?? ""),
  };
}

function validate(form: ServisDosyasiForm): CreateDosyaState["fieldErrors"] {
  const errors: NonNullable<CreateDosyaState["fieldErrors"]> = {};
  if (!form.dosyaNo.trim()) errors.dosyaNo = "Dosya numarası zorunludur.";
  if (!form.plaka.trim()) errors.plaka = "Plaka zorunludur.";
  if (!form.musteriAdi.trim()) errors.musteriAdi = "Müşteri adı zorunludur.";
  if (!form.telefon.trim()) errors.telefon = "Telefon zorunludur.";
  if (!DOSYA_DURUMLARI.includes(form.durum)) errors.durum = "Geçersiz durum.";
  if (!ODEME_DURUMLARI.includes(form.odemeDurumu))
    errors.odemeDurumu = "Geçersiz ödeme durumu.";
  return Object.keys(errors).length > 0 ? errors : undefined;
}

export async function createDosyaAction(
  _prev: CreateDosyaState,
  formData: FormData
): Promise<CreateDosyaState> {
  const profile = await getCurrentProfile();
  if (!profile?.is_active) {
    return { error: "Aktif oturum gerekli." };
  }
  const writeAccess = assertProductWriteAccess(profile, "yeni dosya oluşturma");
  if (!writeAccess.ok) return { error: writeAccess.error };

  const form = parseForm(formData);
  const fieldErrors = validate(form);
  if (fieldErrors) return { fieldErrors };

  const result = await olusturDosya(form);
  if (!result.ok) return { error: result.error };

  redirect(`/dosyalar/${result.data.id}`);
}

export async function getAlertsSummaryAction() {
  const { getCachedAlertSummary } = await import("@/lib/data/dashboard");
  return getCachedAlertSummary();
}

/** Infinite scroll altyapısı — UI entegrasyonu opsiyonel. */
export async function loadMoreEventsAction(
  serviceFileId: string,
  page: number,
  pageSize?: number
) {
  return listEventsByServiceFileId(serviceFileId, { page, pageSize });
}
