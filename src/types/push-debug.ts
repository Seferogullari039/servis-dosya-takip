/** Tek bir push event gönderim özeti */
export interface PushDispatchSummary {
  event: string;
  dispatched: boolean;
  skipped: boolean;
  skipReason?: string;
  sent: number;
  failed: number;
  adminError?: string;
  serviceRoleAvailable?: boolean;
  teamTokenCount?: number;
  tokensFound?: number;
  queryError?: string;
}

/** Araç durumu anlık kayıt (guncelleAracDurumuAction) */
export interface VehicleStatusPushDebug {
  actionRan: boolean;
  actionName: string;
  guncelleAracDurumuActionRan: boolean;
  previousVehicleStatus: string | null;
  newVehicleStatus: string;
  changeDetected: boolean;
  notifyVehicleStatusChangedCalled: boolean;
  sameValueNoPush: boolean;
  message: string;
  dispatches: PushDispatchSummary[];
  totals: { sent: number; failed: number; skipped: number };
}

/** İş emri Kaydet (guncelleIsEmriKayitAction) */
export interface WorkOrderSavePushDebug {
  actionRan: boolean;
  actionName: string;
  guncelleIsEmriKayitActionRan: boolean;
  previousVehicleStatus: string;
  newVehicleStatus: string;
  vehicleChangeDetected: boolean;
  anyChangeDetected: boolean;
  notifyWorkOrderChangesCalled: boolean;
  sameValueNoPush: boolean;
  message: string;
  dispatches: PushDispatchSummary[];
  totals: { sent: number; failed: number; skipped: number };
}

export type GuncelleIsEmriKayitResult =
  | { ok: true; pushDebug: WorkOrderSavePushDebug }
  | { ok: false; error: string };

export type GuncelleAracDurumuResult =
  | { ok: true; pushDebug: VehicleStatusPushDebug }
  | { ok: false; error: string };
