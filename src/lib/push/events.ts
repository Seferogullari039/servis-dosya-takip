import { BRAND } from "@/lib/brand";
import { dispatchTeamPushAsync } from "@/lib/push/dispatch";
import { logPush } from "@/lib/push/logger";
import {
  diffIscilikLines,
  diffParcaLines,
  workOrderHeaderFieldsChanged,
} from "@/lib/push/work-order-diff";
import type { AracDurumu } from "@/types/vehicle-status";
import type { TedarikDurumu } from "@/types/tedarik";
import type { DosyaDurumu } from "@/types/servis-dosya";
import type { IsEmriKayit, ParcaSatir } from "@/types/is-emri";
import type { UserRole } from "@/lib/auth/types";

const PUSH_TITLE = BRAND.companyName;

type EmitOptions = {
  event: string;
  body: string;
  url: string;
  tag: string;
  workOrderId?: string;
  excludeUserId?: string;
};

function formatPlaka(plaka: string): string {
  const p = plaka.trim();
  return p || "—";
}

function emitPushEvent(opts: EmitOptions): void {
  logPush("event", opts.event, {
    body: opts.body,
    url: opts.url,
    tag: opts.tag,
    workOrderId: opts.workOrderId ?? null,
    excludeUserId: opts.excludeUserId ?? null,
  });

  dispatchTeamPushAsync(
    {
      title: PUSH_TITLE,
      body: opts.body,
      url: opts.url,
      tag: opts.tag,
      workOrderId: opts.workOrderId,
    },
    { event: opts.event, excludeUserId: opts.excludeUserId }
  );
}

// ——— İş emri ———

export function notifyWorkOrderCreated(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
}): void {
  const plaka = formatPlaka(params.plaka);
  emitPushEvent({
    event: "work_order_created",
    body: `Yeni iş emri oluşturuldu. İş Emri No: ${params.workOrderNo} · ${plaka}`,
    url: `/is-emirleri/${params.workOrderId}`,
    tag: `wo-created-${params.workOrderId}`,
    workOrderId: params.workOrderId,
  });
}

export function notifyWorkOrderUpdated(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
  excludeUserId?: string;
}): void {
  const plaka = formatPlaka(params.plaka);
  emitPushEvent({
    event: "work_order_updated",
    body: `İş emri güncellendi. İş Emri No: ${params.workOrderNo} · ${plaka}`,
    url: `/is-emirleri/${params.workOrderId}`,
    tag: `wo-updated-${params.workOrderId}-${Date.now()}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });
}

export function notifyWorkOrderDeleted(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
  excludeUserId?: string;
}): void {
  const plaka = formatPlaka(params.plaka);
  emitPushEvent({
    event: "work_order_deleted",
    body: `İş emri silindi. İş Emri No: ${params.workOrderNo} · ${plaka}`,
    url: `/is-emirleri`,
    tag: `wo-deleted-${params.workOrderId}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });
}

export function notifyWorkOrderVehicleStatus(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
  status: AracDurumu;
  previousStatus?: AracDurumu;
  excludeUserId?: string;
}): void {
  if (params.previousStatus !== undefined && params.previousStatus === params.status) {
    logPush("event", "work_order_vehicle_status_skipped", {
      reason: "unchanged",
      status: params.status,
    });
    return;
  }

  const plaka = formatPlaka(params.plaka);
  emitPushEvent({
    event: "work_order_vehicle_status",
    body: `${plaka} plakalı araç ${params.status} durumuna alındı. (İş Emri: ${params.workOrderNo})`,
    url: `/is-emirleri/${params.workOrderId}`,
    tag: `wo-vehicle-${params.workOrderId}-${params.status}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });
}

/** İş emri kaydı güncellendiğinde parça / işçilik / üst bilgi diff */
export function notifyWorkOrderChanges(params: {
  before: IsEmriKayit;
  after: IsEmriKayit;
  excludeUserId?: string;
}): void {
  const { before, after, excludeUserId } = params;
  const base = {
    workOrderId: after.id,
    workOrderNo: after.isEmriNo,
    plaka: after.plaka,
    excludeUserId,
  };

  if (before.aracDurumu !== after.aracDurumu) {
    notifyWorkOrderVehicleStatus({
      ...base,
      status: after.aracDurumu,
      previousStatus: before.aracDurumu,
    });
  }

  const parcaDiff = diffParcaLines(before.parcalar, after.parcalar);
  for (const row of parcaDiff.added) {
    notifyPartLineAdded({ ...base, parca: row });
    notifyProcurementStatus({
      ...base,
      parcaAdi: row.parcaAdi,
      durum: row.tedarikDurumu,
      previousDurum: undefined,
    });
  }
  for (const row of parcaDiff.removed) {
    notifyPartLineRemoved({ ...base, parcaAdi: row.parcaAdi });
  }
  for (const { before: prev, after: next } of parcaDiff.updated) {
    if (prev.tedarikDurumu !== next.tedarikDurumu) {
      notifyProcurementStatus({
        ...base,
        parcaAdi: next.parcaAdi,
        durum: next.tedarikDurumu,
        previousDurum: prev.tedarikDurumu,
      });
    }
    if (
      prev.parcaAdi !== next.parcaAdi ||
      prev.adet !== next.adet ||
      prev.birimFiyat !== next.birimFiyat
    ) {
      notifyPartLineUpdated({ ...base, parcaAdi: next.parcaAdi });
    }
  }

  const iscilikDiff = diffIscilikLines(before.iscilikSatirlari, after.iscilikSatirlari);
  for (const row of iscilikDiff.added) {
    notifyLaborLineAdded({ ...base, aciklama: row.aciklama });
  }
  for (const row of iscilikDiff.removed) {
    notifyLaborLineRemoved({ ...base, aciklama: row.aciklama });
  }
  for (const { after: next } of iscilikDiff.updated) {
    notifyLaborLineUpdated({ ...base, aciklama: next.aciklama });
  }

  if (workOrderHeaderFieldsChanged(before, after)) {
    notifyWorkOrderUpdated(base);
  }
}

// ——— Parça / işçilik satırları ———

export function notifyPartLineAdded(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
  parca: ParcaSatir;
  excludeUserId?: string;
}): void {
  const ad = params.parca.parcaAdi.trim() || "Parça";
  const plaka = formatPlaka(params.plaka);
  emitPushEvent({
    event: "part_line_added",
    body: `${plaka} plakalı iş emrine yeni parça satırı eklendi: ${ad}`,
    url: `/is-emirleri/${params.workOrderId}`,
    tag: `wo-part-add-${params.workOrderId}-${params.parca.id}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });
}

export function notifyPartLineUpdated(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
  parcaAdi: string;
  excludeUserId?: string;
}): void {
  const ad = params.parcaAdi.trim() || "Parça";
  const plaka = formatPlaka(params.plaka);
  emitPushEvent({
    event: "part_line_updated",
    body: `${plaka} plakalı iş emrinde parça satırı güncellendi: ${ad}`,
    url: `/is-emirleri/${params.workOrderId}`,
    tag: `wo-part-upd-${params.workOrderId}-${Date.now()}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });
}

export function notifyPartLineRemoved(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
  parcaAdi: string;
  excludeUserId?: string;
}): void {
  const ad = params.parcaAdi.trim() || "Parça";
  const plaka = formatPlaka(params.plaka);
  emitPushEvent({
    event: "part_line_removed",
    body: `${plaka} plakalı iş emrinden parça satırı silindi: ${ad}`,
    url: `/is-emirleri/${params.workOrderId}`,
    tag: `wo-part-del-${params.workOrderId}-${Date.now()}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });
}

export function notifyLaborLineAdded(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
  aciklama: string;
  excludeUserId?: string;
}): void {
  const plaka = formatPlaka(params.plaka);
  const aciklama = params.aciklama.trim() || "İşçilik";
  emitPushEvent({
    event: "labor_line_added",
    body: `${plaka} plakalı iş emrine yeni işçilik satırı eklendi: ${aciklama}`,
    url: `/is-emirleri/${params.workOrderId}`,
    tag: `wo-labor-add-${params.workOrderId}-${Date.now()}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });
}

export function notifyLaborLineUpdated(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
  aciklama: string;
  excludeUserId?: string;
}): void {
  const plaka = formatPlaka(params.plaka);
  const aciklama = params.aciklama.trim() || "İşçilik";
  emitPushEvent({
    event: "labor_line_updated",
    body: `${plaka} plakalı iş emrinde işçilik satırı güncellendi: ${aciklama}`,
    url: `/is-emirleri/${params.workOrderId}`,
    tag: `wo-labor-upd-${params.workOrderId}-${Date.now()}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });
}

export function notifyLaborLineRemoved(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
  aciklama: string;
  excludeUserId?: string;
}): void {
  const plaka = formatPlaka(params.plaka);
  const aciklama = params.aciklama.trim() || "İşçilik";
  emitPushEvent({
    event: "labor_line_removed",
    body: `${plaka} plakalı iş emrinden işçilik satırı silindi: ${aciklama}`,
    url: `/is-emirleri/${params.workOrderId}`,
    tag: `wo-labor-del-${params.workOrderId}-${Date.now()}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });
}

// ——— Tedarik ———

export function notifyProcurementStatus(params: {
  workOrderId: string;
  plaka: string;
  parcaAdi: string;
  durum: TedarikDurumu;
  previousDurum?: TedarikDurumu;
  excludeUserId?: string;
}): void {
  if (params.previousDurum !== undefined && params.previousDurum === params.durum) {
    logPush("event", "procurement_status_skipped", {
      reason: "unchanged",
      durum: params.durum,
    });
    return;
  }

  const plaka = formatPlaka(params.plaka);
  const parca = params.parcaAdi.trim() || "Parça";
  emitPushEvent({
    event: "procurement_status",
    body: `${plaka} plakalı araç için tedarik durumu ${params.durum} olarak güncellendi. (${parca})`,
    url: `/tedarik`,
    tag: `tedarik-${params.workOrderId}-${params.durum}-${parca.slice(0, 24)}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });
}

export function notifyProcurementStatusesOnCreate(params: {
  workOrderId: string;
  plaka: string;
  parcalar: ParcaSatir[];
  excludeUserId?: string;
}): void {
  for (const parca of params.parcalar) {
    if (!parca.parcaAdi.trim() && parca.tedarikDurumu === "Sigortadan Bekleniyor") {
      continue;
    }
    notifyProcurementStatus({
      workOrderId: params.workOrderId,
      plaka: params.plaka,
      parcaAdi: parca.parcaAdi,
      durum: parca.tedarikDurumu,
      excludeUserId: params.excludeUserId,
    });
  }
}

// ——— Dosya durumu ———

const DOSYA_DURUM_BILDIRIM_ETIKETI: Record<DosyaDurumu, string> = {
  "Yeni Açıldı": "Yeni Açıldı",
  "Evrak Bekleniyor": "Evrak Bekleniyor",
  "Eksper Sürecinde": "Eksper Bekleniyor",
  "Tedarik Sürecinde": "Parça Bekleniyor",
  "Onarımda": "İşlemde",
  "Ödeme Bekleniyor": "Onay Bekleniyor",
  "Tamamlandı": "Hazır",
  "Kapandı": "Kapandı",
};

export function notifyServiceFileStatus(params: {
  fileId: string;
  dosyaNo: string;
  plaka: string;
  durum: DosyaDurumu;
  previousDurum?: DosyaDurumu;
  excludeUserId?: string;
}): void {
  if (params.previousDurum !== undefined && params.previousDurum === params.durum) {
    logPush("event", "service_file_status_skipped", {
      reason: "unchanged",
      durum: params.durum,
    });
    return;
  }

  const etiket = DOSYA_DURUM_BILDIRIM_ETIKETI[params.durum] ?? params.durum;
  const plaka = formatPlaka(params.plaka);
  emitPushEvent({
    event: "service_file_status",
    body: `${plaka} plakalı dosya (${params.dosyaNo}) durumu ${etiket} olarak güncellendi.`,
    url: `/dosyalar/${params.fileId}`,
    tag: `file-status-${params.fileId}-${params.durum}`,
    excludeUserId: params.excludeUserId,
  });
}

// ——— Hasar görselleri ———

export function notifyWorkOrderImageUploaded(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
  category?: string;
  excludeUserId?: string;
}): void {
  const plaka = formatPlaka(params.plaka);
  const kat = params.category?.trim();
  emitPushEvent({
    event: "work_order_image_uploaded",
    body: kat
      ? `${plaka} plakalı iş emri için yeni görsel yüklendi (${kat}).`
      : `${plaka} plakalı iş emri için yeni hasar görseli yüklendi.`,
    url: `/is-emirleri/${params.workOrderId}`,
    tag: `wo-img-up-${params.workOrderId}-${Date.now()}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });
}

export function notifyWorkOrderImageDeleted(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
  excludeUserId?: string;
}): void {
  const plaka = formatPlaka(params.plaka);
  emitPushEvent({
    event: "work_order_image_deleted",
    body: `${plaka} plakalı iş emri için görsel silindi.`,
    url: `/is-emirleri/${params.workOrderId}`,
    tag: `wo-img-del-${params.workOrderId}-${Date.now()}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });
}

// ——— Sistem / kullanıcı ———

export function notifyUserCreated(params: {
  email: string;
  role: UserRole;
  excludeUserId?: string;
}): void {
  emitPushEvent({
    event: "user_created",
    body: `Yeni kullanıcı oluşturuldu: ${params.email} (${params.role})`,
    url: `/dashboard`,
    tag: `user-created-${Date.now()}`,
    excludeUserId: params.excludeUserId,
  });
}

export function notifyUserDeleted(params: {
  email: string;
  excludeUserId?: string;
}): void {
  emitPushEvent({
    event: "user_deleted",
    body: `Kullanıcı silindi: ${params.email}`,
    url: `/dashboard`,
    tag: `user-deleted-${Date.now()}`,
    excludeUserId: params.excludeUserId,
  });
}

export function notifyUserRoleChanged(params: {
  email: string;
  previousRole: UserRole;
  newRole: UserRole;
  excludeUserId?: string;
}): void {
  if (params.previousRole === params.newRole) {
    logPush("event", "user_role_skipped", { reason: "unchanged" });
    return;
  }
  emitPushEvent({
    event: "user_role_changed",
    body: `Kullanıcı rolü değişti: ${params.email} · ${params.previousRole} → ${params.newRole}`,
    url: `/dashboard`,
    tag: `user-role-${Date.now()}`,
    excludeUserId: params.excludeUserId,
  });
}
