import {
  SIGORTA_SIRKETLERI,
  SIGORTA_SIRKETI_DIGER,
} from "@/lib/constants/sigorta-sirketleri";

export function resolveSigortaSirketiSelect(value?: string): string {
  if (!value?.trim()) return "";
  if ((SIGORTA_SIRKETLERI as readonly string[]).includes(value)) {
    return value;
  }
  return SIGORTA_SIRKETI_DIGER;
}

export function resolveSigortaSirketiDiger(
  value?: string,
  select?: string
): string {
  if (select === SIGORTA_SIRKETI_DIGER) {
    return value?.trim() && value !== SIGORTA_SIRKETI_DIGER ? value : "";
  }
  return "";
}

/** FormData → kayıtlı sigorta şirketi metni (server + client güvenli). */
export function parseSigortaSirketiFromForm(formData: FormData): string {
  const select = String(formData.get("sigortaSirketiSelect") ?? "").trim();
  if (select === SIGORTA_SIRKETI_DIGER) {
    return String(formData.get("sigortaSirketiDiger") ?? "").trim();
  }
  const hidden = String(formData.get("sigortaSirketi") ?? "").trim();
  if (hidden) return hidden;
  return select;
}
