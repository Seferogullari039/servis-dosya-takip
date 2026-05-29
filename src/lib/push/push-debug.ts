import type {
  PushDispatchSummary,
  VehicleStatusPushDebug,
  WorkOrderSavePushDebug,
} from "@/types/push-debug";
import type { DispatchPushResult } from "@/lib/push/types";

export function dispatchResultToSummary(
  event: string,
  result: DispatchPushResult
): PushDispatchSummary {
  return {
    event,
    dispatched: !result.skipped && result.sent > 0,
    skipped: result.skipped,
    skipReason: result.skipReason,
    sent: result.sent,
    failed: result.failed,
    adminError: result.adminError,
    serviceRoleAvailable: result.serviceRoleAvailable,
    teamTokenCount: result.teamTokenCount,
    tokensFound: result.tokensFound,
    queryError: result.queryError,
  };
}

export function aggregateDispatches(dispatches: PushDispatchSummary[]): {
  sent: number;
  failed: number;
  skipped: number;
} {
  return {
    sent: dispatches.reduce((s, d) => s + d.sent, 0),
    failed: dispatches.reduce((s, d) => s + d.failed, 0),
    skipped: dispatches.filter((d) => d.skipped || !d.dispatched).length,
  };
}

export function buildVehicleStatusPushDebug(params: {
  actionName: string;
  previousVehicleStatus: string | null;
  newVehicleStatus: string;
  changeDetected: boolean;
  notifyCalled: boolean;
  dispatches: PushDispatchSummary[];
}): VehicleStatusPushDebug {
  const sameValueNoPush = !params.changeDetected;
  const totals = aggregateDispatches(params.dispatches);
  let message = sameValueNoPush
    ? "Aynı değer, push gönderilmedi"
    : params.notifyCalled
      ? `Push gönderildi · sent ${totals.sent} / failed ${totals.failed}`
      : "Bildirim fonksiyonu çağrılmadı";

  if (params.dispatches.some((d) => d.skipped && d.skipReason)) {
    message += ` · skipped: ${params.dispatches.map((d) => d.skipReason).filter(Boolean).join(", ")}`;
  }

  return {
    actionRan: true,
    actionName: params.actionName,
    guncelleAracDurumuActionRan: true,
    previousVehicleStatus: params.previousVehicleStatus,
    newVehicleStatus: params.newVehicleStatus,
    changeDetected: params.changeDetected,
    notifyVehicleStatusChangedCalled: params.notifyCalled,
    sameValueNoPush,
    message,
    dispatches: params.dispatches,
    totals,
  };
}

export function buildWorkOrderSavePushDebug(params: {
  actionName: string;
  previousVehicleStatus: string;
  newVehicleStatus: string;
  vehicleChangeDetected: boolean;
  anyChangeDetected: boolean;
  notifyCalled: boolean;
  dispatches: PushDispatchSummary[];
}): WorkOrderSavePushDebug {
  const sameValueNoPush = !params.anyChangeDetected;
  const totals = aggregateDispatches(params.dispatches);
  let message = sameValueNoPush
    ? "Aynı değer, push gönderilmedi"
    : !params.notifyCalled
      ? "Aynı değer, push gönderilmedi"
      : `notifyWorkOrderChanges çalıştı · sent ${totals.sent} / failed ${totals.failed} / skipped ${totals.skipped}`;

  return {
    actionRan: true,
    actionName: params.actionName,
    guncelleIsEmriKayitActionRan: true,
    previousVehicleStatus: params.previousVehicleStatus,
    newVehicleStatus: params.newVehicleStatus,
    vehicleChangeDetected: params.vehicleChangeDetected,
    anyChangeDetected: params.anyChangeDetected,
    notifyWorkOrderChangesCalled: params.notifyCalled,
    sameValueNoPush,
    message,
    dispatches: params.dispatches,
    totals,
  };
}
