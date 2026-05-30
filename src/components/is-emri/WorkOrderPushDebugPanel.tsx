"use client";

import type {
  VehicleStatusPushDebug,
  WorkOrderSavePushDebug,
} from "@/types/push-debug";
import { cn } from "@/lib/utils/cn";

function BoolRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-ink-muted dark:text-zinc-400">{label}</span>
      <span
        className={cn(
          "font-semibold",
          value
            ? "text-emerald-700 dark:text-emerald-300"
            : "text-zinc-600 dark:text-zinc-400"
        )}
      >
        {value ? "Evet" : "Hayır"}
      </span>
    </div>
  );
}

function DispatchTable({
  dispatches,
  totals,
}: {
  dispatches: WorkOrderSavePushDebug["dispatches"];
  totals: WorkOrderSavePushDebug["totals"];
}) {
  if (dispatches.length === 0) {
    return (
      <p className="text-xs text-ink-muted dark:text-zinc-400">
        dispatchTeamPush kaydı yok
      </p>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-ink dark:text-zinc-200">
        dispatchTeamPush: sent {totals.sent} · failed {totals.failed} · skipped{" "}
        {totals.skipped}
      </p>
      <ul className="max-h-40 space-y-1 overflow-y-auto text-[11px] font-mono">
        {dispatches.map((d, i) => (
          <li
            key={`${d.event}-${i}`}
            className="rounded bg-surface-muted/80 px-2 py-1 dark:bg-zinc-800/80"
          >
            <div>
              {d.event} · sent={d.sent} failed={d.failed}
              {d.skipped ? ` · skipped (${d.skipReason ?? "—"})` : ""}
            </div>
            <div className="mt-0.5 text-[10px] text-ink-muted dark:text-zinc-500">
              SR={d.serviceRoleAvailable === false ? "hayır" : "evet"} · ekip=
              {d.teamTokenCount ?? "—"} · tokens={d.tokensFound ?? "—"}
              {d.queryError ? ` · err=${d.queryError}` : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WorkOrderPushDebugPanel({
  saveDebug,
  vehicleDebug,
}: {
  saveDebug: WorkOrderSavePushDebug | null;
  vehicleDebug: VehicleStatusPushDebug | null;
}) {
  return (
    <aside
      className="no-print is-emri-no-print rounded-lg border border-dashed border-violet-400/50 bg-violet-50/50 p-3 dark:border-violet-500/40 dark:bg-violet-950/20"
      data-push-debug
      aria-label="Push debug"
    >
      <h3 className="text-xs font-bold uppercase tracking-wide text-violet-900 dark:text-violet-200">
        Push Debug (admin)
      </h3>

      <section className="mt-3 space-y-2 border-b border-violet-200/60 pb-3 dark:border-violet-800/60">
        <p className="text-[11px] font-semibold text-violet-800 dark:text-violet-300">
          Son Kaydet (guncelleIsEmriKayitAction)
        </p>
        {saveDebug ? (
          <>
            <BoolRow
              label="guncelleIsEmriKayitAction çalıştı"
              value={saveDebug.guncelleIsEmriKayitActionRan}
            />
            <div className="text-xs">
              <span className="text-ink-muted">Önceki araç durumu: </span>
              <span className="font-medium">{saveDebug.previousVehicleStatus}</span>
            </div>
            <div className="text-xs">
              <span className="text-ink-muted">Yeni araç durumu: </span>
              <span className="font-medium">{saveDebug.newVehicleStatus}</span>
            </div>
            <BoolRow
              label="Değişiklik algılandı"
              value={saveDebug.anyChangeDetected}
            />
            <BoolRow
              label="notifyWorkOrderChanges çağrıldı"
              value={saveDebug.notifyWorkOrderChangesCalled}
            />
            <p
              className={cn(
                "text-xs font-medium",
                saveDebug.sameValueNoPush
                  ? "text-amber-800 dark:text-amber-300"
                  : "text-ink dark:text-zinc-200"
              )}
            >
              {saveDebug.message}
            </p>
            <DispatchTable
              dispatches={saveDebug.dispatches}
              totals={saveDebug.totals}
            />
          </>
        ) : (
          <p className="text-xs text-ink-muted">Henüz Kaydet denenmedi</p>
        )}
      </section>

      <section className="space-y-2">
        <p className="text-[11px] font-semibold text-violet-800 dark:text-violet-300">
          Son araç durumu (guncelleAracDurumuAction)
        </p>
        {vehicleDebug ? (
          <>
            <BoolRow
              label="guncelleAracDurumuAction çalıştı"
              value={vehicleDebug.guncelleAracDurumuActionRan}
            />
            <div className="text-xs">
              <span className="text-ink-muted">Önceki: </span>
              <span className="font-medium">
                {vehicleDebug.previousVehicleStatus ?? "—"}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-ink-muted">Yeni: </span>
              <span className="font-medium">{vehicleDebug.newVehicleStatus}</span>
            </div>
            <BoolRow
              label="Değişiklik algılandı"
              value={vehicleDebug.changeDetected}
            />
            <BoolRow
              label="notifyVehicleStatusChanged çağrıldı"
              value={vehicleDebug.notifyVehicleStatusChangedCalled}
            />
            <p
              className={cn(
                "text-xs font-medium",
                vehicleDebug.sameValueNoPush
                  ? "text-amber-800 dark:text-amber-300"
                  : "text-ink dark:text-zinc-200"
              )}
            >
              {vehicleDebug.message}
            </p>
            <DispatchTable
              dispatches={vehicleDebug.dispatches}
              totals={vehicleDebug.totals}
            />
          </>
        ) : (
          <p className="text-xs text-ink-muted">
            Henüz araç durumu değiştirilmedi
          </p>
        )}
      </section>
    </aside>
  );
}
