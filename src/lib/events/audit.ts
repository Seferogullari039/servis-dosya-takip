import {
  logExpertAssigned,
  logNoteAdded,
  logPaymentChanged,
  logStatusChanged,
  logUpdated,
} from "@/lib/events/logger";
import { snapshotFromRow } from "@/lib/events/messages";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import type { ServisDosyasiRow } from "@/types/supabase";
import type { ServisDosyasi } from "@/types/servis-dosya";

const TRACKED_FIELDS = [
  "dosya_no",
  "plaka",
  "musteri_adi",
  "telefon",
  "arac_marka_model",
] as const;

/** Güncelleme sonrası alan farklarını audit event olarak yazar (paralel, idempotent). */
export async function auditDosyaUpdate(
  serviceFileId: string,
  oldRow: ServisDosyasiRow,
  newDosya: ServisDosyasi
): Promise<DataResult<void>> {
  const oldSnap = snapshotFromRow(oldRow);
  const newSnap = snapshotFromRow({
    dosya_no: newDosya.dosyaNo,
    plaka: newDosya.plaka,
    musteri_adi: newDosya.musteriAdi,
    telefon: newDosya.telefon || null,
    arac_marka_model: newDosya.aracMarkaModel || null,
    eksper_adi: newDosya.eksperAdi || null,
    durum: newDosya.durum,
    odeme_durumu: newDosya.odemeDurumu,
    notlar: newDosya.notlar || null,
  });

  const tasks: Promise<DataResult<void>>[] = [
    logStatusChanged(serviceFileId, oldSnap.durum ?? "", newSnap.durum ?? ""),
    logPaymentChanged(
      serviceFileId,
      oldSnap.odeme_durumu ?? "",
      newSnap.odeme_durumu ?? ""
    ),
    logNoteAdded(serviceFileId, oldSnap.notlar, newSnap.notlar),
    logExpertAssigned(
      serviceFileId,
      oldSnap.eksper_adi,
      newSnap.eksper_adi
    ),
  ];

  for (const field of TRACKED_FIELDS) {
    const oldVal = oldSnap[field] ?? null;
    const newVal = newSnap[field] ?? null;
    if (oldVal !== newVal) {
      tasks.push(logUpdated(serviceFileId, field, oldVal, newVal));
    }
  }

  const results = await Promise.all(tasks);
  const errors = results.filter((r) => !r.ok).map((r) => r.error);

  if (errors.length > 0) {
    return fail(errors[0] ?? "Audit kaydı tamamlanamadı.");
  }

  return ok(undefined);
}
