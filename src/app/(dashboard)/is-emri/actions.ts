"use server";

import { revalidatePath } from "next/cache";
import { olusturIsEmri } from "@/lib/data/work-orders";
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

  revalidateIsEmriPaths(result.data.id);
  return { ok: true, id: result.data.id };
}
