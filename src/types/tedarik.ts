export type TedarikDurumu =
  | "Sigortadan Bekleniyor"
  | "Sipariş Verildi"
  | "Tedarik Yola Çıktı"
  | "Kargoda"
  | "Geldi"
  | "Takıldı"
  | "Stokta Yok"
  | "Servis Satın Aldı";

export const TEDARIK_DURUMLARI: TedarikDurumu[] = [
  "Sigortadan Bekleniyor",
  "Sipariş Verildi",
  "Tedarik Yola Çıktı",
  "Kargoda",
  "Geldi",
  "Takıldı",
  "Stokta Yok",
  "Servis Satın Aldı",
];

export const DEFAULT_TEDARIK_DURUMU: TedarikDurumu = "Sigortadan Bekleniyor";

export const TEDARIK_BEKLEYEN: TedarikDurumu[] = [
  "Sigortadan Bekleniyor",
  "Sipariş Verildi",
];

export const TEDARIK_YOLDA: TedarikDurumu[] = [
  "Tedarik Yola Çıktı",
  "Kargoda",
];

export const TEDARIK_GELEN: TedarikDurumu[] = ["Geldi", "Takıldı"];

export function isTedarikDurumu(value: unknown): value is TedarikDurumu {
  return (
    typeof value === "string" &&
    (TEDARIK_DURUMLARI as string[]).includes(value)
  );
}

export function parseTedarikDurumu(
  value: unknown,
  fallback: TedarikDurumu = DEFAULT_TEDARIK_DURUMU
): TedarikDurumu {
  return isTedarikDurumu(value) ? value : fallback;
}

/** Eski parça durumları → sigorta tedarik durumu */
export function migrateLegacyParcaDurumu(
  legacy: unknown,
  geldi?: boolean
): TedarikDurumu {
  if (isTedarikDurumu(legacy)) return legacy;
  const s = String(legacy ?? "");
  if (s === "Bekleniyor") return "Sigortadan Bekleniyor";
  if (s === "Sipariş Verildi") return "Sipariş Verildi";
  if (s === "Geldi" || geldi) return "Geldi";
  if (s === "Takıldı") return "Takıldı";
  return DEFAULT_TEDARIK_DURUMU;
}

export interface TedarikListFilters {
  arama?: string;
  tedarikDurumu?: TedarikDurumu;
  baslangic?: string;
  bitis?: string;
}

export interface TedarikParcaKayit {
  partId: string;
  workOrderId: string;
  isEmriNo: string;
  plaka: string;
  musteriAdi: string;
  entryDate: string;
  parcaAdi: string;
  adet: string;
  birimFiyat: number;
  toplamFiyat: number;
  tedarikDurumu: TedarikDurumu;
  tedarikTarihi: string;
  geldiTarihi: string;
  servisSatinAldi: boolean;
  tedarikNotu: string;
}

export type TedarikPanelKey =
  | "bekleyen"
  | "yolda"
  | "gelen"
  | "stoktaYok"
  | "servisSatin";

export function panelKeyForDurum(durum: TedarikDurumu): TedarikPanelKey {
  if (TEDARIK_BEKLEYEN.includes(durum)) return "bekleyen";
  if (TEDARIK_YOLDA.includes(durum)) return "yolda";
  if (TEDARIK_GELEN.includes(durum)) return "gelen";
  if (durum === "Stokta Yok") return "stoktaYok";
  if (durum === "Servis Satın Aldı") return "servisSatin";
  return "bekleyen";
}
