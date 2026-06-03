import type { IsEmriKayit } from "@/types/is-emri";
import { parseTutarInput } from "@/lib/utils/para";

export function workOrderPaymentFieldsChanged(
  before: IsEmriKayit,
  after: IsEmriKayit
): boolean {
  const beforeTahsil = parseTutarInput(before.tahsilEdilenTutar) ?? 0;
  const afterTahsil = parseTutarInput(after.tahsilEdilenTutar) ?? 0;
  return (
    before.isEmriTipi !== after.isEmriTipi ||
    before.isEmriDurumu !== after.isEmriDurumu ||
    before.odemeDurumu !== after.odemeDurumu ||
    beforeTahsil !== afterTahsil ||
    before.odemeNotu !== after.odemeNotu
  );
}
