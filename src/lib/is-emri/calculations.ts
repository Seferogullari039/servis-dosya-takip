import { parseTutarInput } from "@/lib/utils/para";
import type { IscilikSatir, ParcaSatir } from "@/types/is-emri";

export function calcParcaSatirToplam(row: ParcaSatir): number {
  const stored = parseTutarInput(row.toplamFiyat);
  if (stored !== null && stored > 0) return stored;
  const adet = Number.parseFloat(row.adet.replace(",", ".")) || 0;
  const birim = parseTutarInput(row.birimFiyat) ?? 0;
  return adet * birim;
}

export function syncParcaToplamFiyat(row: ParcaSatir): ParcaSatir {
  const adet = Number.parseFloat(row.adet.replace(",", ".")) || 0;
  const birim = parseTutarInput(row.birimFiyat) ?? 0;
  const total = adet * birim;
  return {
    ...row,
    toplamFiyat: total > 0 ? String(total) : "",
  };
}

export function calcParcaToplam(parcalar: ParcaSatir[]): number {
  return parcalar.reduce((sum, row) => sum + calcParcaSatirToplam(row), 0);
}

export function calcServisSatinAlmaToplam(parcalar: ParcaSatir[]): number {
  return parcalar
    .filter((row) => row.servisSatinAldi)
    .reduce((sum, row) => sum + calcParcaSatirToplam(row), 0);
}

export function calcIscilikToplam(satirlar: IscilikSatir[]): number {
  return satirlar.reduce(
    (sum, row) => sum + (parseTutarInput(row.tutar) ?? 0),
    0
  );
}

export function calcGenelToplam(
  parcalar: ParcaSatir[],
  iscilikSatirlari: IscilikSatir[]
): number {
  return calcParcaToplam(parcalar) + calcIscilikToplam(iscilikSatirlari);
}
