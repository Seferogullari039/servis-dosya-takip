"use server";

import { revalidatePath } from "next/cache";
import { olusturIsEmri } from "@/lib/data/work-orders";
import { AUDIT_ACTIONS } from "@/lib/audit/types";
import { recordAuditWithProfile } from "@/lib/audit/record";
import {
  notifyProcurementStatusesOnCreate,
  notifyWorkOrderCreated,
} from "@/lib/push/events";
import { assertOperationAccess } from "@/lib/operations/auth-action";
import type { IsEmriFormState } from "@/types/is-emri";

function revalidateIsEmriPaths(id?: string) {
  revalidatePath("/is-emirleri");
  revalidatePath("/is-emri");
  revalidatePath("/dashboard");
  revalidatePath("/tedarik");
  if (id) revalidatePath(`/is-emirleri/${id}`);
}

export type KaydetIsEmriResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function kaydetIsEmri(
  form: IsEmriFormState
): Promise<KaydetIsEmriResult> {
  const auth = await assertOperationAccess();
  if (!auth.ok) return { ok: false, error: auth.error };

  const result = await olusturIsEmri(form);
  if (!result.ok) return { ok: false, error: result.error };

  const kayit = result.data;
  notifyWorkOrderCreated({
    workOrderId: kayit.id,
    workOrderNo: kayit.isEmriNo,
    plaka: kayit.plaka,
  });
  notifyProcurementStatusesOnCreate({
    workOrderId: kayit.id,
    plaka: kayit.plaka,
    parcalar: form.parcalar,
    excludeUserId: auth.profile.id,
  });

  await recordAuditWithProfile(auth.profile, {
    action: AUDIT_ACTIONS.WORK_ORDER_CREATE,
    entity_type: "work_order",
    entity_id: kayit.id,
    entity_label: kayit.isEmriNo,
    new_value: {
      plaka: kayit.plaka,
      aracDurumu: kayit.aracDurumu,
    },
  });

  revalidateIsEmriPaths(kayit.id);
  return { ok: true, id: kayit.id };
}
