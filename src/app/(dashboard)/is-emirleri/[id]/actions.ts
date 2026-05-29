"use server";

import { revalidatePath } from "next/cache";
import { getIsEmriById, guncelleIsEmri } from "@/lib/data/work-orders";
import { notifyWorkOrderChanges } from "@/lib/push/events";
import { assertOperationAccess } from "@/lib/operations/auth-action";
import type { IsEmriFormState } from "@/types/is-emri";
import type { OperationResult } from "@/types/operations";

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
): Promise<OperationResult> {
  const auth = await assertOperationAccess();
  if (!auth.ok) return { ok: false, error: auth.error };

  const beforeResult = await getIsEmriById(id);
  if (!beforeResult.ok) {
    return { ok: false, error: beforeResult.error };
  }
  if (!beforeResult.data) {
    return { ok: false, error: "İş emri bulunamadı." };
  }

  const updateResult = await guncelleIsEmri(id, form);
  if (!updateResult.ok) return { ok: false, error: updateResult.error };

  notifyWorkOrderChanges({
    before: beforeResult.data,
    after: updateResult.data,
    excludeUserId: auth.profile.id,
  });

  revalidateIsEmriPaths(id);
  return { ok: true };
}
