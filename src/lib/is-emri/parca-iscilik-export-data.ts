import { formatCsvDate } from "@/lib/export/csv";
import {
  calcGenelToplam,
  calcIscilikToplam,
  calcParcaSatirToplam,
  calcParcaToplam,
} from "@/lib/is-emri/calculations";
import { isEmptyParcaSatir } from "@/lib/is-emri/parca-tedarik-helpers";
import { formatTarihSaat } from "@/lib/utils/format";
import { parseTutarInput } from "@/lib/utils/para";
import type { IscilikSatir, ParcaSatir } from "@/types/is-emri";
import {
  TEDARIK_GELEN,
  type TedarikDurumu,
} from "@/types/tedarik";

export interface ParcaIscilikExportMeta {
  isEmriNo: string;
  dosyaNo: string;
  /** İş emri oluşturulma anı (ISO) */
  tarih: string;
  plaka: string;
  musteri: string;
  telefon: string;
  arac: string;
  sigortaSirketi: string;
}

export interface TedarikOzeti {
  toplamParca: number;
  gelenParca: number;
  bekleyenParca: number;
  servisSatinAldiParca: number;
  sigortadanBeklenenParca: number;
}

export interface ParcaIscilikExportPayload {
  meta: ParcaIscilikExportMeta;
  parcalar: ParcaSatir[];
  iscilikSatirlari: IscilikSatir[];
  parcaToplam: number;
  iscilikToplam: number;
  genelToplam: number;
  tedarikOzeti: TedarikOzeti;
}

function isEmptyIscilikSatir(row: IscilikSatir): boolean {
  return !row.aciklama.trim() && !row.tutar.trim();
}

function isGelenParca(row: ParcaSatir): boolean {
  return (
    TEDARIK_GELEN.includes(row.tedarikDurumu) ||
    row.tedarikDurumu === "Geldi" ||
    Boolean(row.geldiTarihi.trim())
  );
}

function isServisSatinAldiParca(row: ParcaSatir): boolean {
  return row.servisSatinAldi || row.tedarikDurumu === "Servis Satın Aldı";
}

export function calcTedarikOzeti(parcalar: ParcaSatir[]): TedarikOzeti {
  return {
    toplamParca: parcalar.length,
    gelenParca: parcalar.filter(isGelenParca).length,
    bekleyenParca: parcalar.filter(
      (row) => !isGelenParca(row) && !isServisSatinAldiParca(row)
    ).length,
    servisSatinAldiParca: parcalar.filter(isServisSatinAldiParca).length,
    sigortadanBeklenenParca: parcalar.filter(
      (row) => row.tedarikDurumu === "Sigortadan Bekleniyor"
    ).length,
  };
}

/** Excel/CSV: Geldi | Bekleniyor */
export function geldiMiLabel(row: ParcaSatir): string {
  return isGelenParca(row) ? "Geldi" : "Bekleniyor";
}

export function birimFiyatAmount(row: ParcaSatir): number {
  const adet = Number.parseFloat(row.adet.replace(",", ".")) || 1;
  return parseTutarInput(row.birimFiyat) ?? calcParcaSatirToplam(row) / adet;
}

export function iscilikTutarAmount(row: IscilikSatir): number {
  return parseTutarInput(row.tutar) ?? 0;
}

/** 03.06.2026 14:35 */
export function formatExportDateTime(iso: string): string {
  if (!iso?.trim()) return "—";
  try {
    return formatTarihSaat(iso);
  } catch {
    return formatCsvDate(iso) || iso;
  }
}

/** @deprecated CSV uyumu — tarih+saat için formatExportDateTime kullanın */
export function formatExportDate(iso: string): string {
  return formatExportDateTime(iso);
}

export function formatExportSigortaSirketi(value: string): string {
  return value.trim() || "Belirtilmedi";
}

export function formatExportDosyaNo(value: string): string {
  return value.trim() || "—";
}

export function parcaIscilikExportBasename(workOrderNo: string): string {
  const safe = workOrderNo.trim().replace(/[/\\?%*:|"<>]/g, "-");
  if (!safe) return "parca-iscilik";
  return safe.startsWith("IE-") ? safe : `IE-${safe}`;
}

export function tedarikDurumuFillColor(
  durum: TedarikDurumu
): string | undefined {
  const map: Partial<Record<TedarikDurumu, string>> = {
    Geldi: "FFC6EFCE",
    "Sigortadan Bekleniyor": "FFFCE4CC",
    "Sipariş Verildi": "FFBDD7EE",
    Kargoda: "FFE8DAEF",
    "Stokta Yok": "FFF8CBAD",
  };
  return map[durum];
}

export function buildParcaIscilikExportPayload(input: {
  meta: ParcaIscilikExportMeta;
  parcalar: ParcaSatir[];
  iscilikSatirlari: IscilikSatir[];
}): ParcaIscilikExportPayload {
  const parcalar = input.parcalar.filter((row) => !isEmptyParcaSatir(row));
  const iscilikSatirlari = input.iscilikSatirlari.filter(
    (row) => !isEmptyIscilikSatir(row)
  );

  return {
    meta: input.meta,
    parcalar,
    iscilikSatirlari,
    parcaToplam: calcParcaToplam(parcalar),
    iscilikToplam: calcIscilikToplam(iscilikSatirlari),
    genelToplam: calcGenelToplam(parcalar, iscilikSatirlari),
    tedarikOzeti: calcTedarikOzeti(parcalar),
  };
}

export function buildParcaIscilikExportPayloadFromKayit(
  kayit: {
    isEmriNo: string;
    ruhsatSahibi: string;
    telefon: string;
    plaka: string;
    marka: string;
    model: string;
    createdAt: string;
    parcalar: ParcaSatir[];
    iscilikSatirlari: IscilikSatir[];
  },
  dosyaMeta?: { dosyaNo: string; sigortaSirketi: string } | null
): ParcaIscilikExportPayload {
  const arac = [kayit.marka.trim(), kayit.model.trim()].filter(Boolean).join(" ");
  return buildParcaIscilikExportPayload({
    meta: {
      isEmriNo: kayit.isEmriNo,
      dosyaNo: dosyaMeta?.dosyaNo ?? "",
      tarih: kayit.createdAt,
      plaka: kayit.plaka,
      musteri: kayit.ruhsatSahibi,
      telefon: kayit.telefon,
      arac,
      sigortaSirketi: dosyaMeta?.sigortaSirketi ?? "",
    },
    parcalar: kayit.parcalar,
    iscilikSatirlari: kayit.iscilikSatirlari,
  });
}
