"use server";

import { revalidatePath } from "next/cache";
import { guncelleAracDurumu, silIsEmri } from "@/lib/data/work-orders";
import { notifyWorkOrderVehicleStatus } from "@/lib/push/events";
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

  const result = await silIsEmri(id);
  if (!result.ok) return { ok: false, error: result.error };

  revalidateIsEmriPaths();
  return { ok: true };
}

export async function guncelleAracDurumuAction(
  id: string,
  aracDurumu: AracDurumu
): Promise<OperationResult> {
  const auth = await assertOperationAccess();
  if (!auth.ok) return { ok: false, error: auth.error };

  const result = await guncelleAracDurumu(id, aracDurumu);
  if (!result.ok) return { ok: false, error: result.error };

  notifyWorkOrderVehicleStatus({
    workOrderId: id,
    workOrderNo: result.data.isEmriNo,
    plaka: result.data.plaka,
    status: aracDurumu,
    excludeUserId: auth.profile.id,
  });

  revalidateIsEmriPaths();
  revalidatePath(`/is-emirleri/${id}`);
  return { ok: true };
}
