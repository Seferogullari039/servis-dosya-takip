"use server";

import { revalidatePath } from "next/cache";
import { getIsEmriById, guncelleAracDurumu, silIsEmri } from "@/lib/data/work-orders";
import {
  logPushAction,
  notifyVehicleStatusChanged,
  notifyWorkOrderDeleted,
} from "@/lib/push/events";
import { assertOperationAccess } from "@/lib/operations/auth-action";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import type { AracDurumu } from "@/types/vehicle-status";
import type { OperationResult } from "@/types/operations";

function revalidateIsEmriPaths() {
  revalidatePath("/is-emirleri");
  revalidatePath("/is-emri");
  revalidatePath("/dashboard");
  revalidatePath("/tedarik");
}

export async function silIsEmriAction(id: string): Promise<OperationResult> {
  const auth = await assertOperationAccess();
  if (!auth.ok) return { ok: false, error: auth.error };

  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    return {
      ok: false,
      error: "Silme işlemi yalnızca admin tarafından yapılabilir.",
    };
  }

  const existing = await getIsEmriById(id);
  const result = await silIsEmri(id);
  if (!result.ok) return { ok: false, error: result.error };

  if (existing.ok && existing.data) {
    notifyWorkOrderDeleted({
      workOrderId: id,
      workOrderNo: existing.data.isEmriNo,
      plaka: existing.data.plaka,
      excludeUserId: auth.profile.id,
    });
  }

  revalidateIsEmriPaths();
  return { ok: true };
}

export async function guncelleAracDurumuAction(
  id: string,
  aracDurumu: AracDurumu
): Promise<OperationResult> {
  const auth = await assertOperationAccess();
  if (!auth.ok) return { ok: false, error: auth.error };

  const before = await getIsEmriById(id);
  const previousStatus =
    before.ok && before.data ? before.data.aracDurumu : undefined;

  logPushAction("guncelleAracDurumuAction", {
    workOrderId: id,
    previous: previousStatus ?? null,
    next: aracDurumu,
  });

  const result = await guncelleAracDurumu(id, aracDurumu);
  if (!result.ok) return { ok: false, error: result.error };

  notifyVehicleStatusChanged({
    workOrderId: id,
    workOrderNo: result.data.isEmriNo,
    plaka: result.data.plaka,
    status: aracDurumu,
    previousStatus,
    excludeUserId: auth.profile.id,
    debugAction: "guncelleAracDurumuAction",
  });

  revalidateIsEmriPaths();
  revalidatePath(`/is-emirleri/${id}`);
  return { ok: true };
}
