import { AUDIT_ACTIONS } from "@/lib/audit/types";
import { recordAuditWithProfile } from "@/lib/audit/record";
import type { Profile } from "@/lib/auth/types";
import { parseTutarInput } from "@/lib/utils/para";
import type { IsEmriKayit } from "@/types/is-emri";

export async function recordWorkOrderFieldAudits(
  profile: Profile,
  before: IsEmriKayit,
  after: IsEmriKayit
): Promise<void> {
  const base = {
    entity_type: "work_order" as const,
    entity_id: after.id,
    entity_label: after.isEmriNo,
  };

  if (before.isEmriTipi !== after.isEmriTipi) {
    await recordAuditWithProfile(profile, {
      action: AUDIT_ACTIONS.WORK_ORDER_TYPE_CHANGED,
      ...base,
      old_value: { is_emri_tipi: before.isEmriTipi },
      new_value: { is_emri_tipi: after.isEmriTipi },
    });
  }

  if (before.odemeDurumu !== after.odemeDurumu) {
    await recordAuditWithProfile(profile, {
      action: AUDIT_ACTIONS.WORK_ORDER_PAYMENT_STATUS,
      ...base,
      old_value: { odeme_durumu: before.odemeDurumu },
      new_value: { odeme_durumu: after.odemeDurumu },
    });
  }

  const beforeTahsil = parseTutarInput(before.tahsilEdilenTutar) ?? 0;
  const afterTahsil = parseTutarInput(after.tahsilEdilenTutar) ?? 0;
  if (beforeTahsil !== afterTahsil) {
    await recordAuditWithProfile(profile, {
      action: AUDIT_ACTIONS.WORK_ORDER_PAYMENT_AMOUNT,
      ...base,
      old_value: { tahsil_edilen_tutar: beforeTahsil },
      new_value: { tahsil_edilen_tutar: afterTahsil },
    });
  }

  if (before.isEmriDurumu !== "Kapandı" && after.isEmriDurumu === "Kapandı") {
    await recordAuditWithProfile(profile, {
      action: AUDIT_ACTIONS.WORK_ORDER_CLOSED,
      ...base,
      old_value: { is_emri_durumu: before.isEmriDurumu },
      new_value: { is_emri_durumu: after.isEmriDurumu },
    });
  }

  if (before.odemeNotu !== after.odemeNotu) {
    await recordAuditWithProfile(profile, {
      action: AUDIT_ACTIONS.WORK_ORDER_PAYMENT_NOTE,
      ...base,
      old_value: { odeme_notu: before.odemeNotu || null },
      new_value: { odeme_notu: after.odemeNotu || null },
    });
  }
}
