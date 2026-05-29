/** Supabase numeric → number */
export function parseTutar(
  value: number | string | null | undefined
): number {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function parseTutarOptional(
  value: number | string | null | undefined
): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Form / modal girişi: "12.500,50" veya "12500.5" */
export function parseTutarInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

export function formatPara(amount: number | null | undefined): string {
  const n = amount == null ? 0 : amount;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatParaOzet(
  odenen: number,
  dosyaTutari: number | null
): string {
  if (dosyaTutari != null && dosyaTutari > 0) {
    return `${formatPara(odenen)} / ${formatPara(dosyaTutari)}`;
  }
  if (odenen > 0) return formatPara(odenen);
  return "—";
}
