export const IS_EMRI_TIPLERI = [
  "Sigortalı İş",
  "Sigortasız / Müşteri Ödemeli İş",
] as const;

export type IsEmriTipi = (typeof IS_EMRI_TIPLERI)[number];

export const IS_EMRI_DURUMLARI = [
  "Açık",
  "Ödenmedi",
  "Kısmi Ödendi",
  "Ödendi",
  "Kapandı",
] as const;

export type IsEmriDurumu = (typeof IS_EMRI_DURUMLARI)[number];

export const IS_EMRI_ODEME_DURUMLARI = [
  "Ödenmedi",
  "Kısmi Ödendi",
  "Ödendi",
  "Kapandı",
] as const;

export type IsEmriOdemeDurumu = (typeof IS_EMRI_ODEME_DURUMLARI)[number];

export const DEFAULT_IS_EMRI_TIPI: IsEmriTipi = "Sigortalı İş";
export const DEFAULT_IS_EMRI_DURUMU: IsEmriDurumu = "Açık";
export const DEFAULT_IS_EMRI_ODEME_DURUMU: IsEmriOdemeDurumu = "Ödenmedi";

export function isIsEmriTipi(value: string): value is IsEmriTipi {
  return (IS_EMRI_TIPLERI as readonly string[]).includes(value);
}

export function isIsEmriDurumu(value: string): value is IsEmriDurumu {
  return (IS_EMRI_DURUMLARI as readonly string[]).includes(value);
}

export function isIsEmriOdemeDurumu(value: string): value is IsEmriOdemeDurumu {
  return (IS_EMRI_ODEME_DURUMLARI as readonly string[]).includes(value);
}

export function parseIsEmriTipi(value: unknown): IsEmriTipi {
  return typeof value === "string" && isIsEmriTipi(value)
    ? value
    : DEFAULT_IS_EMRI_TIPI;
}

export function parseIsEmriDurumu(value: unknown): IsEmriDurumu {
  return typeof value === "string" && isIsEmriDurumu(value)
    ? value
    : DEFAULT_IS_EMRI_DURUMU;
}

export function parseIsEmriOdemeDurumu(value: unknown): IsEmriOdemeDurumu {
  return typeof value === "string" && isIsEmriOdemeDurumu(value)
    ? value
    : DEFAULT_IS_EMRI_ODEME_DURUMU;
}

/** Ödeme durumuna göre iş emri durumunu senkronize eder */
export function syncIsEmriDurumuFromOdeme(
  odemeDurumu: IsEmriOdemeDurumu,
  current: IsEmriDurumu
): IsEmriDurumu {
  if (odemeDurumu === "Kapandı") return "Kapandı";
  if (odemeDurumu === "Ödendi") return "Ödendi";
  if (odemeDurumu === "Kısmi Ödendi") return "Kısmi Ödendi";
  if (odemeDurumu === "Ödenmedi" && current === "Açık") return "Açık";
  return "Ödenmedi";
}

export function calcKalanTutar(
  genelToplam: number,
  tahsilEdilen: number
): number {
  const kalan = genelToplam - tahsilEdilen;
  return kalan > 0 ? Math.round(kalan * 100) / 100 : 0;
}

export interface OdemeValidationResult {
  ok: boolean;
  error?: string;
  normalizedTahsil?: number;
  normalizedOdemeDurumu?: IsEmriOdemeDurumu;
  normalizedIsEmriDurumu?: IsEmriDurumu;
}

/** Ödeme alanları doğrulama ve otomatik eşitleme */
export function validateWorkOrderPayment(input: {
  genelToplam: number;
  tahsilEdilen: number;
  odemeDurumu: IsEmriOdemeDurumu;
  isEmriDurumu: IsEmriDurumu;
}): OdemeValidationResult {
  const { genelToplam } = input;
  let tahsil = Math.max(0, input.tahsilEdilen);
  let odemeDurumu = input.odemeDurumu;
  let isEmriDurumu = input.isEmriDurumu;

  if (tahsil > genelToplam && genelToplam > 0) {
    return { ok: false, error: "Tahsil edilen tutar genel toplamı aşamaz." };
  }

  if (odemeDurumu === "Kısmi Ödendi") {
    if (genelToplam <= 0) {
      return {
        ok: false,
        error: "Kısmi ödeme için genel toplam tanımlı olmalıdır.",
      };
    }
    if (tahsil <= 0) {
      return {
        ok: false,
        error: "Kısmi ödendi seçildiğinde tahsil edilen tutar zorunludur.",
      };
    }
    if (tahsil >= genelToplam) {
      return {
        ok: false,
        error: "Kısmi ödeme tutarı genel toplamdan küçük olmalıdır.",
      };
    }
  }

  if (odemeDurumu === "Ödendi") {
    if (genelToplam > 0 && tahsil !== genelToplam) {
      tahsil = genelToplam;
    }
  }

  if (odemeDurumu === "Kapandı") {
    const kalan = calcKalanTutar(genelToplam, tahsil);
    if (genelToplam > 0 && kalan > 0) {
      return {
        ok: false,
        error:
          "Kapandı seçildiğinde kalan tutar 0 olmalıdır (tahsilatı güncelleyin).",
      };
    }
    if (genelToplam > 0 && tahsil < genelToplam) {
      tahsil = genelToplam;
    }
  }

  isEmriDurumu = syncIsEmriDurumuFromOdeme(odemeDurumu, isEmriDurumu);

  return {
    ok: true,
    normalizedTahsil: tahsil,
    normalizedOdemeDurumu: odemeDurumu,
    normalizedIsEmriDurumu: isEmriDurumu,
  };
}
