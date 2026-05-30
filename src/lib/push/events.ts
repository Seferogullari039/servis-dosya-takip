import { BRAND } from "@/lib/brand";
import { dispatchTeamPush } from "@/lib/push/dispatch";
import {
  buildVehicleStatusPushDebug,
  buildWorkOrderSavePushDebug,
  dispatchResultToSummary,
} from "@/lib/push/push-debug";
import { logPush } from "@/lib/push/logger";
import {
  diffIscilikLines,
  diffParcaLines,
  expertiseChecklistChanged,
  hasWorkOrderChanges,
  workOrderHeaderFieldsChanged,
} from "@/lib/push/work-order-diff";
import type { PushDispatchSummary } from "@/types/push-debug";
import type {
  VehicleStatusPushDebug,
  WorkOrderSavePushDebug,
} from "@/types/push-debug";
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

/** Vercel / sunucu loglarında action izleme */
export function logPushAction(
  action: string,
  details: {
    workOrderId?: string;
    previous?: unknown;
    next?: unknown;
    extra?: Record<string, unknown>;
  }
): void {
  console.log(`[push:action] ${action}`, {
    workOrderId: details.workOrderId ?? null,
    previous: details.previous ?? null,
    next: details.next ?? null,
    ...details.extra,
  });
}

async function emitPushEventAwait(
  opts: EmitOptions & {
    debugAction?: string;
    previous?: unknown;
    next?: unknown;
  }
): Promise<PushDispatchSummary> {
  console.log(`[push:event] ${opts.event}`, {
    action: opts.debugAction ?? null,
    previous: opts.previous ?? null,
    next: opts.next ?? null,
    body: opts.body,
    workOrderId: opts.workOrderId ?? null,
  });

  logPush("event", opts.event, {
    body: opts.body,
    url: opts.url,
    tag: opts.tag,
    workOrderId: opts.workOrderId ?? null,
    excludeUserId: opts.excludeUserId ?? null,
    debugAction: opts.debugAction ?? null,
    previous: opts.previous ?? null,
    next: opts.next ?? null,
  });

  const result = await dispatchTeamPush(
    {
      title: PUSH_TITLE,
      body: opts.body,
      url: opts.url,
      tag: opts.tag,
      workOrderId: opts.workOrderId,
    },
    { event: opts.event, excludeUserId: opts.excludeUserId }
  );

  return dispatchResultToSummary(opts.event, result);
}

/** Güvenlik olayları ve diğer modüller için */
export function emitPushEvent(
  opts: EmitOptions & {
    debugAction?: string;
    previous?: unknown;
    next?: unknown;
  }
): void {
  void emitPushEventAwait(opts);
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
  debugAction?: string;
}): void {
  const plaka = formatPlaka(params.plaka);
  emitPushEvent({
    event: "work_order_updated",
    debugAction: params.debugAction ?? "notifyWorkOrderUpdated",
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

export async function notifyVehicleStatusChanged(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
  status: AracDurumu;
  previousStatus?: AracDurumu;
  excludeUserId?: string;
  debugAction?: string;
}): Promise<VehicleStatusPushDebug> {
  const actionName = params.debugAction ?? "notifyVehicleStatusChanged";
  const changeDetected =
    params.previousStatus === undefined ||
    params.previousStatus !== params.status;

  if (!changeDetected) {
    console.log("[push:event] vehicle_status_changed skipped", {
      action: actionName,
      previous: params.previousStatus,
      next: params.status,
      reason: "unchanged",
    });
    logPush("event", "vehicle_status_changed_skipped", {
      reason: "unchanged",
      status: params.status,
    });
    return buildVehicleStatusPushDebug({
      actionName,
      previousVehicleStatus: params.previousStatus ?? null,
      newVehicleStatus: params.status,
      changeDetected: false,
      notifyCalled: false,
      dispatches: [],
    });
  }

  const plaka = formatPlaka(params.plaka);
  const dispatch = await emitPushEventAwait({
    event: "vehicle_status_changed",
    debugAction: actionName,
    previous: params.previousStatus ?? null,
    next: params.status,
    body: `${plaka} plakalı araç ${params.status} durumuna alındı. (İş Emri: ${params.workOrderNo})`,
    url: `/is-emirleri/${params.workOrderId}`,
    tag: `wo-vehicle-${params.workOrderId}-${params.status}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });

  return buildVehicleStatusPushDebug({
    actionName,
    previousVehicleStatus: params.previousStatus ?? null,
    newVehicleStatus: params.status,
    changeDetected: true,
    notifyCalled: true,
    dispatches: [dispatch],
  });
}

/** @deprecated notifyVehicleStatusChanged kullanın */
export function notifyWorkOrderVehicleStatus(
  params: Parameters<typeof notifyVehicleStatusChanged>[0]
): void {
  void notifyVehicleStatusChanged(params);
}

/** İş emri kaydı güncellendiğinde parça / işçilik / üst bilgi diff */
export async function notifyWorkOrderChanges(params: {
  before: IsEmriKayit;
  after: IsEmriKayit;
  excludeUserId?: string;
  debugAction?: string;
}): Promise<WorkOrderSavePushDebug> {
  const { before, after, excludeUserId } = params;
  const action = params.debugAction ?? "guncelleIsEmriKayitAction";
  const vehicleChangeDetected = before.aracDurumu !== after.aracDurumu;
  const anyChangeDetected = hasWorkOrderChanges(before, after);

  logPushAction(action, {
    workOrderId: after.id,
    extra: {
      phase: "notifyWorkOrderChanges_start",
      vehicleChangeDetected,
      anyChangeDetected,
    },
  });

  if (!anyChangeDetected) {
    return buildWorkOrderSavePushDebug({
      actionName: action,
      previousVehicleStatus: before.aracDurumu,
      newVehicleStatus: after.aracDurumu,
      vehicleChangeDetected: false,
      anyChangeDetected: false,
      notifyCalled: false,
      dispatches: [],
    });
  }

  const dispatches: PushDispatchSummary[] = [];
  const base = {
    workOrderId: after.id,
    workOrderNo: after.isEmriNo,
    plaka: after.plaka,
    excludeUserId,
    debugAction: action,
  };

  if (vehicleChangeDetected) {
    const vehicleDebug = await notifyVehicleStatusChanged({
      ...base,
      status: after.aracDurumu,
      previousStatus: before.aracDurumu,
      debugAction: `${action} → notifyVehicleStatusChanged`,
    });
    dispatches.push(...vehicleDebug.dispatches);
  }

  const plaka = formatPlaka(after.plaka);
  const parcaDiff = diffParcaLines(before.parcalar, after.parcalar);
  for (const row of parcaDiff.added) {
    const ad = row.parcaAdi.trim() || "Parça";
    dispatches.push(
      await emitPushEventAwait({
        event: "part_line_added",
        debugAction: action,
        body: `${plaka} plakalı iş emrine yeni parça satırı eklendi: ${ad}`,
        url: `/is-emirleri/${after.id}`,
        tag: `wo-part-add-${after.id}-${row.id}`,
        workOrderId: after.id,
        excludeUserId,
      })
    );
    dispatches.push(
      await emitPushEventAwait({
        event: "procurement_status_changed",
        debugAction: action,
        previous: null,
        next: row.tedarikDurumu,
        body: `${plaka} plakalı araç için tedarik durumu ${row.tedarikDurumu} olarak güncellendi. (${ad})`,
        url: `/tedarik`,
        tag: `tedarik-${after.id}-${row.tedarikDurumu}-${ad.slice(0, 24)}`,
        workOrderId: after.id,
        excludeUserId,
      })
    );
  }
  for (const row of parcaDiff.removed) {
    const ad = row.parcaAdi.trim() || "Parça";
    dispatches.push(
      await emitPushEventAwait({
        event: "part_line_removed",
        debugAction: action,
        body: `${plaka} plakalı iş emrinden parça satırı silindi: ${ad}`,
        url: `/is-emirleri/${after.id}`,
        tag: `wo-part-del-${after.id}-${Date.now()}`,
        workOrderId: after.id,
        excludeUserId,
      })
    );
  }
  for (const { before: prev, after: next } of parcaDiff.updated) {
    if (prev.tedarikDurumu !== next.tedarikDurumu) {
      const ad = next.parcaAdi.trim() || "Parça";
      dispatches.push(
        await emitPushEventAwait({
          event: "procurement_status_changed",
          debugAction: action,
          previous: prev.tedarikDurumu,
          next: next.tedarikDurumu,
          body: `${plaka} plakalı araç için tedarik durumu ${next.tedarikDurumu} olarak güncellendi. (${ad})`,
          url: `/tedarik`,
          tag: `tedarik-${after.id}-${next.tedarikDurumu}-${ad.slice(0, 24)}`,
          workOrderId: after.id,
          excludeUserId,
        })
      );
    }
    if (
      prev.parcaAdi !== next.parcaAdi ||
      prev.adet !== next.adet ||
      prev.birimFiyat !== next.birimFiyat
    ) {
      const ad = next.parcaAdi.trim() || "Parça";
      dispatches.push(
        await emitPushEventAwait({
          event: "part_line_updated",
          debugAction: action,
          body: `${plaka} plakalı iş emrinde parça satırı güncellendi: ${ad}`,
          url: `/is-emirleri/${after.id}`,
          tag: `wo-part-upd-${after.id}-${Date.now()}`,
          workOrderId: after.id,
          excludeUserId,
        })
      );
    }
  }

  const iscilikDiff = diffIscilikLines(before.iscilikSatirlari, after.iscilikSatirlari);
  for (const row of iscilikDiff.added) {
    const aciklama = row.aciklama.trim() || "İşçilik";
    dispatches.push(
      await emitPushEventAwait({
        event: "labor_line_added",
        debugAction: action,
        body: `${plaka} plakalı iş emrine yeni işçilik satırı eklendi: ${aciklama}`,
        url: `/is-emirleri/${after.id}`,
        tag: `wo-labor-add-${after.id}-${Date.now()}`,
        workOrderId: after.id,
        excludeUserId,
      })
    );
  }
  for (const row of iscilikDiff.removed) {
    const aciklama = row.aciklama.trim() || "İşçilik";
    dispatches.push(
      await emitPushEventAwait({
        event: "labor_line_removed",
        debugAction: action,
        body: `${plaka} plakalı iş emrinden işçilik satırı silindi: ${aciklama}`,
        url: `/is-emirleri/${after.id}`,
        tag: `wo-labor-del-${after.id}-${Date.now()}`,
        workOrderId: after.id,
        excludeUserId,
      })
    );
  }
  for (const { after: next } of iscilikDiff.updated) {
    const aciklama = next.aciklama.trim() || "İşçilik";
    dispatches.push(
      await emitPushEventAwait({
        event: "labor_line_updated",
        debugAction: action,
        body: `${plaka} plakalı iş emrinde işçilik satırı güncellendi: ${aciklama}`,
        url: `/is-emirleri/${after.id}`,
        tag: `wo-labor-upd-${after.id}-${Date.now()}`,
        workOrderId: after.id,
        excludeUserId,
      })
    );
  }

  if (expertiseChecklistChanged(before, after)) {
    dispatches.push(
      await emitPushEventAwait({
        event: "expertise_checklist_changed",
        debugAction: action,
        body: `${plaka} plakalı iş emrinde ekspertiz kontrol listesi güncellendi. (${after.isEmriNo})`,
        url: `/is-emirleri/${after.id}`,
        tag: `wo-checklist-${after.id}-${Date.now()}`,
        workOrderId: after.id,
        excludeUserId,
      })
    );
  }

  if (workOrderHeaderFieldsChanged(before, after)) {
    dispatches.push(
      await emitPushEventAwait({
        event: "work_order_updated",
        debugAction: action,
        body: `İş emri güncellendi. İş Emri No: ${after.isEmriNo} · ${plaka}`,
        url: `/is-emirleri/${after.id}`,
        tag: `wo-updated-${after.id}-${Date.now()}`,
        workOrderId: after.id,
        excludeUserId,
      })
    );
  }

  return buildWorkOrderSavePushDebug({
    actionName: action,
    previousVehicleStatus: before.aracDurumu,
    newVehicleStatus: after.aracDurumu,
    vehicleChangeDetected,
    anyChangeDetected: true,
    notifyCalled: true,
    dispatches,
  });
}

export function notifyExpertiseChecklistChanged(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
  excludeUserId?: string;
  debugAction?: string;
}): void {
  const plaka = formatPlaka(params.plaka);
  emitPushEvent({
    event: "expertise_checklist_changed",
    debugAction: params.debugAction ?? "notifyExpertiseChecklistChanged",
    body: `${plaka} plakalı iş emrinde ekspertiz kontrol listesi güncellendi. (${params.workOrderNo})`,
    url: `/is-emirleri/${params.workOrderId}`,
    tag: `wo-checklist-${params.workOrderId}-${Date.now()}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });
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

export function notifyProcurementStatusChanged(params: {
  workOrderId: string;
  plaka: string;
  parcaAdi: string;
  durum: TedarikDurumu;
  previousDurum?: TedarikDurumu;
  excludeUserId?: string;
  debugAction?: string;
}): void {
  if (params.previousDurum !== undefined && params.previousDurum === params.durum) {
    console.log("[push:event] procurement_status_changed skipped", {
      action: params.debugAction ?? "notifyProcurementStatusChanged",
      previous: params.previousDurum,
      next: params.durum,
      reason: "unchanged",
    });
    logPush("event", "procurement_status_changed_skipped", {
      reason: "unchanged",
      durum: params.durum,
    });
    return;
  }

  const plaka = formatPlaka(params.plaka);
  const parca = params.parcaAdi.trim() || "Parça";
  emitPushEvent({
    event: "procurement_status_changed",
    debugAction: params.debugAction ?? "notifyProcurementStatusChanged",
    previous: params.previousDurum ?? null,
    next: params.durum,
    body: `${plaka} plakalı araç için tedarik durumu ${params.durum} olarak güncellendi. (${parca})`,
    url: `/tedarik`,
    tag: `tedarik-${params.workOrderId}-${params.durum}-${parca.slice(0, 24)}`,
    workOrderId: params.workOrderId,
    excludeUserId: params.excludeUserId,
  });
}

/** @deprecated notifyProcurementStatusChanged kullanın */
export function notifyProcurementStatus(
  params: Parameters<typeof notifyProcurementStatusChanged>[0]
): void {
  notifyProcurementStatusChanged(params);
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
    notifyProcurementStatusChanged({
      workOrderId: params.workOrderId,
      plaka: params.plaka,
      parcaAdi: parca.parcaAdi,
      durum: parca.tedarikDurumu,
      excludeUserId: params.excludeUserId,
      debugAction: "notifyProcurementStatusesOnCreate",
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
