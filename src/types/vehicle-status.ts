export type AracDurumu =
  | "Kabul Edildi"
  | "Ekspertizde"
  | "Parça Bekleniyor"
  | "İşlemde"
  | "Hazır"
  | "Teslim Edildi";

export const ARAC_DURUMLARI: AracDurumu[] = [
  "Kabul Edildi",
  "Ekspertizde",
  "Parça Bekleniyor",
  "İşlemde",
  "Hazır",
  "Teslim Edildi",
];

export const DEFAULT_ARAC_DURUMU: AracDurumu = "Kabul Edildi";

export function isAracDurumu(value: unknown): value is AracDurumu {
  return (
    typeof value === "string" &&
    (ARAC_DURUMLARI as string[]).includes(value)
  );
}

export function parseAracDurumu(
  value: unknown,
  fallback: AracDurumu = DEFAULT_ARAC_DURUMU
): AracDurumu {
  return isAracDurumu(value) ? value : fallback;
}
