import { syncParcaToplamFiyat } from "@/lib/is-emri/calculations";
import { createEmptyParcaSatir, type ParcaSatir } from "@/types/is-emri";
import type { TedarikDurumu } from "@/types/tedarik";

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isEmptyParcaSatir(row: ParcaSatir): boolean {
  return (
    !row.parcaAdi.trim() &&
    !row.birimFiyat.trim() &&
    !row.toplamFiyat.trim()
  );
}

export function applyParcaTedarikPatch(
  row: ParcaSatir,
  patch: Partial<ParcaSatir>
): ParcaSatir {
  let next = { ...row, ...patch };

  if (patch.servisSatinAldi === true) {
    next.tedarikDurumu = "Servis Satın Aldı";
  }
  if (patch.tedarikDurumu === "Servis Satın Aldı") {
    next.servisSatinAldi = true;
  }
  if (
    patch.tedarikDurumu === "Geldi" ||
    (patch.tedarikDurumu && next.tedarikDurumu === "Geldi")
  ) {
    if (!next.geldiTarihi) next.geldiTarihi = todayIsoDate();
  }

  return syncParcaToplamFiyat(next);
}

export function buildParcaSatirFromQuickEntry(input: {
  parcaAdi: string;
  adet: string;
  birimFiyat: string;
  geldi: boolean;
  tedarikDurumu: TedarikDurumu;
  tedarikNotu: string;
}): ParcaSatir | null {
  if (!input.parcaAdi.trim()) return null;

  let row = createEmptyParcaSatir();
  row.parcaAdi = input.parcaAdi.trim();
  row.adet = input.adet.trim() || "1";
  row.birimFiyat = input.birimFiyat.trim();
  row.tedarikNotu = input.tedarikNotu.trim();
  row.tedarikDurumu = input.tedarikDurumu;

  if (input.geldi) {
    row = applyParcaTedarikPatch(row, { tedarikDurumu: "Geldi" });
  } else {
    row = applyParcaTedarikPatch(row, { tedarikDurumu: input.tedarikDurumu });
  }

  return row;
}

export function buildParcaSatirFromBulkLine(input: {
  parcaAdi: string;
  adet: string;
  birimFiyat: string;
}): ParcaSatir {
  const row = createEmptyParcaSatir();
  return syncParcaToplamFiyat(
    applyParcaTedarikPatch(row, {
      parcaAdi: input.parcaAdi.trim(),
      adet: input.adet.trim() || "1",
      birimFiyat: input.birimFiyat.trim(),
    })
  );
}
