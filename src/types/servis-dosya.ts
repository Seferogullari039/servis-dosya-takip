export const DOSYA_DURUMLARI = [
  "Yeni Açıldı",
  "Evrak Bekleniyor",
  "Eksper Sürecinde",
  "Tedarik Sürecinde",
  "Onarımda",
  "Ödeme Bekleniyor",
  "Tamamlandı",
  "Kapandı",
] as const;

export type DosyaDurumu = (typeof DOSYA_DURUMLARI)[number];

export const ODEME_DURUMLARI = ["Ödenmedi", "Kısmi Ödendi", "Ödendi"] as const;

export type OdemeDurumu = (typeof ODEME_DURUMLARI)[number];

/** Uygulama katmanı modeli (camelCase) */
export interface ServisDosyasi {
  id: string;
  dosyaNo: string;
  plaka: string;
  musteriAdi: string;
  telefon: string;
  aracMarkaModel: string;
  eksperAdi: string;
  /** Sigorta şirketi (liste veya serbest metin) */
  sigortaSirketi: string;
  durum: DosyaDurumu;
  odemeDurumu: OdemeDurumu;
  /** Dosyanın toplam / kapanış tutarı (TL) */
  dosyaTutari: number | null;
  /** Tahsil edilen tutar (TL) */
  odenenTutar: number;
  notlar: string;
  olusturulmaTarihi: string;
}

export type ServisDosyasiForm = Omit<ServisDosyasi, "id" | "olusturulmaTarihi">;

export type ServisDosyasiGuncelleme = Partial<ServisDosyasiForm>;
