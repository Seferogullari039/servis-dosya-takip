import type { TedarikDurumu } from "@/types/tedarik";
import { DEFAULT_TEDARIK_DURUMU } from "@/types/tedarik";

export type { TedarikDurumu };

export interface ParcaSatir {
  id: string;
  parcaAdi: string;
  adet: string;
  birimFiyat: string;
  /** Otomatik: adet × birim fiyat */
  toplamFiyat: string;
  tedarikDurumu: TedarikDurumu;
  tedarikTarihi: string;
  geldiTarihi: string;
  servisSatinAldi: boolean;
  tedarikNotu: string;
}

export interface EkspertizCheckItem {
  key: string;
  label: string;
  checked: boolean;
  note: string;
}

export interface IscilikSatir {
  id: string;
  aciklama: string;
  tutar: string;
}

import type { AracDurumu } from "@/types/vehicle-status";
import { DEFAULT_ARAC_DURUMU } from "@/types/vehicle-status";
import type {
  IsEmriDurumu,
  IsEmriOdemeDurumu,
  IsEmriTipi,
} from "@/types/work-order-payment";
import {
  DEFAULT_IS_EMRI_DURUMU,
  DEFAULT_IS_EMRI_ODEME_DURUMU,
  DEFAULT_IS_EMRI_TIPI,
} from "@/types/work-order-payment";

export type { AracDurumu, IsEmriDurumu, IsEmriOdemeDurumu, IsEmriTipi };

export interface IsEmriFormState {
  isEmriTipi: IsEmriTipi;
  isEmriDurumu: IsEmriDurumu;
  odemeDurumu: IsEmriOdemeDurumu;
  tahsilEdilenTutar: string;
  odemeNotu: string;
  aracDurumu: AracDurumu;
  ruhsatSahibi: string;
  telefon: string;
  plaka: string;
  marka: string;
  model: string;
  km: string;
  serviseGirisTarihi: string;
  /** Serbest ekspertiz notları */
  ekspertizAlani: string;
  ekspertizChecklist: EkspertizCheckItem[];
  yapilacakIslemler: string;
  parcalar: ParcaSatir[];
  iscilikSatirlari: IscilikSatir[];
  musteriImza: string;
  servisYetkilisi: string;
  customerSignature: string | null;
}

export const DEFAULT_EKSPERTIZ_CHECKLIST: Omit<
  EkspertizCheckItem,
  "checked" | "note"
>[] = [
  { key: "kaporta", label: "Kaporta kontrol edildi" },
  { key: "mekanik", label: "Mekanik kontrol edildi" },
  { key: "elektrik", label: "Elektrik kontrol edildi" },
  { key: "boya", label: "Boya kontrol edildi" },
  { key: "hasar", label: "Hasar tespiti yapıldı" },
  { key: "test_surusu", label: "Test sürüşü yapıldı" },
];

export function createDefaultEkspertizChecklist(): EkspertizCheckItem[] {
  return DEFAULT_EKSPERTIZ_CHECKLIST.map((item) => ({
    ...item,
    checked: false,
    note: "",
  }));
}

export function createEmptyParcaSatir(): ParcaSatir {
  return {
    id: crypto.randomUUID(),
    parcaAdi: "",
    adet: "1",
    birimFiyat: "",
    toplamFiyat: "",
    tedarikDurumu: DEFAULT_TEDARIK_DURUMU,
    tedarikTarihi: "",
    geldiTarihi: "",
    servisSatinAldi: false,
    tedarikNotu: "",
  };
}

export function createEmptyIscilikSatir(): IscilikSatir {
  return {
    id: crypto.randomUUID(),
    aciklama: "",
    tutar: "",
  };
}

export interface IsEmriOzet {
  id: string;
  isEmriNo: string;
  plaka: string;
  musteriAdi: string;
  tarih: string;
  toplamTutar: number;
  tahsilEdilenTutar: number;
  kalanTutar: number;
  isEmriTipi: IsEmriTipi;
  isEmriDurumu: IsEmriDurumu;
  odemeDurumu: IsEmriOdemeDurumu;
  aracDurumu: AracDurumu;
  createdAt: string;
}

export interface IsEmriListFilters {
  arama?: string;
  aracDurumu?: AracDurumu;
  baslangic?: string;
  bitis?: string;
}

export interface IsEmriKayit extends IsEmriFormState {
  id: string;
  isEmriNo: string;
  parcaToplam: number;
  iscilikToplam: number;
  toplamTutar: number;
  /** Genel toplam − tahsil (salt okunur) */
  kalanTutar: number;
  createdAt: string;
}

export function initialIsEmriState(): IsEmriFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    isEmriTipi: DEFAULT_IS_EMRI_TIPI,
    isEmriDurumu: DEFAULT_IS_EMRI_DURUMU,
    odemeDurumu: DEFAULT_IS_EMRI_ODEME_DURUMU,
    tahsilEdilenTutar: "",
    odemeNotu: "",
    aracDurumu: DEFAULT_ARAC_DURUMU,
    ruhsatSahibi: "",
    telefon: "",
    plaka: "",
    marka: "",
    model: "",
    km: "",
    serviseGirisTarihi: today,
    ekspertizAlani: "",
    ekspertizChecklist: createDefaultEkspertizChecklist(),
    yapilacakIslemler: "",
    parcalar: [createEmptyParcaSatir()],
    iscilikSatirlari: [createEmptyIscilikSatir()],
    musteriImza: "",
    servisYetkilisi: "",
    customerSignature: null,
  };
}
