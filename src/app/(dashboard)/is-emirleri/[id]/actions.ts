"use server";

import { revalidatePath } from "next/cache";
import { getIsEmriById, guncelleIsEmri } from "@/lib/data/work-orders";
import { logPushAction, notifyWorkOrderChanges } from "@/lib/push/events";
import { assertOperationAccess } from "@/lib/operations/auth-action";
import type { IsEmriFormState } from "@/types/is-emri";
import type { GuncelleIsEmriKayitResult } from "@/types/push-debug";

function revalidateIsEmriPaths(id: string) {
  revalidatePath("/is-emirleri");
  revalidatePath("/is-emri");
  revalidatePath("/dashboard");
  revalidatePath("/tedarik");
  revalidatePath(`/is-emirleri/${id}`);
}

export async function guncelleIsEmriKayitAction(
  id: string,
  form: IsEmriFormState
): Promise<GuncelleIsEmriKayitResult> {
  const auth = await assertOperationAccess();
  if (!auth.ok) return { ok: false, error: auth.error };

  const beforeResult = await getIsEmriById(id);
  if (!beforeResult.ok) {
    return { ok: false, error: beforeResult.error };
  }
  if (!beforeResult.data) {
    return { ok: false, error: "İş emri bulunamadı." };
  }

  logPushAction("guncelleIsEmriKayitAction", {
    workOrderId: id,
    previous: beforeResult.data.aracDurumu,
    next: form.aracDurumu,
    extra: {
      plaka: form.plaka,
      parcaCount: form.parcalar.length,
      iscilikCount: form.iscilikSatirlari.length,
    },
  });

  const updateResult = await guncelleIsEmri(id, form);
  if (!updateResult.ok) return { ok: false, error: updateResult.error };

  const pushDebug = await notifyWorkOrderChanges({
    before: beforeResult.data,
    after: updateResult.data,
    excludeUserId: auth.profile.id,
    debugAction: "guncelleIsEmriKayitAction",
  });

  console.log("[push:action] guncelleIsEmriKayitAction complete", pushDebug);

  revalidateIsEmriPaths(id);
  return { ok: true, pushDebug };
}
