import type { IscilikSatir, IsEmriKayit, ParcaSatir } from "@/types/is-emri";

export function diffParcaLines(before: ParcaSatir[], after: ParcaSatir[]) {
  const beforeById = new Map(before.map((p) => [p.id, p]));
  const afterById = new Map(after.map((p) => [p.id, p]));

  const added = after.filter((p) => !beforeById.has(p.id));
  const removed = before.filter((p) => !afterById.has(p.id));
  const updated: { before: ParcaSatir; after: ParcaSatir }[] = [];

  for (const row of after) {
    const prev = beforeById.get(row.id);
    if (prev && parcaChanged(prev, row)) {
      updated.push({ before: prev, after: row });
    }
  }

  return { added, removed, updated };
}

export function diffIscilikLines(before: IscilikSatir[], after: IscilikSatir[]) {
  const beforeById = new Map(before.map((p) => [p.id, p]));
  const afterById = new Map(after.map((p) => [p.id, p]));

  const added = after.filter((p) => !beforeById.has(p.id));
  const removed = before.filter((p) => !afterById.has(p.id));
  const updated: { before: IscilikSatir; after: IscilikSatir }[] = [];

  for (const row of after) {
    const prev = beforeById.get(row.id);
    if (prev && iscilikChanged(prev, row)) {
      updated.push({ before: prev, after: row });
    }
  }

  return { added, removed, updated };
}

function parcaChanged(a: ParcaSatir, b: ParcaSatir): boolean {
  return (
    a.parcaAdi !== b.parcaAdi ||
    a.adet !== b.adet ||
    a.birimFiyat !== b.birimFiyat ||
    a.tedarikDurumu !== b.tedarikDurumu ||
    a.tedarikTarihi !== b.tedarikTarihi ||
    a.geldiTarihi !== b.geldiTarihi ||
    a.servisSatinAldi !== b.servisSatinAldi ||
    a.tedarikNotu !== b.tedarikNotu
  );
}

function iscilikChanged(a: IscilikSatir, b: IscilikSatir): boolean {
  return a.aciklama !== b.aciklama || a.tutar !== b.tutar;
}

export function expertiseChecklistChanged(
  before: IsEmriKayit,
  after: IsEmriKayit
): boolean {
  return (
    JSON.stringify(before.ekspertizChecklist) !==
    JSON.stringify(after.ekspertizChecklist)
  );
}

export function workOrderHeaderFieldsChanged(
  before: IsEmriKayit,
  after: IsEmriKayit
): boolean {
  return (
    before.ruhsatSahibi !== after.ruhsatSahibi ||
    before.telefon !== after.telefon ||
    before.plaka !== after.plaka ||
    before.marka !== after.marka ||
    before.model !== after.model ||
    before.km !== after.km ||
    before.serviseGirisTarihi !== after.serviseGirisTarihi ||
    before.ekspertizAlani !== after.ekspertizAlani ||
    before.yapilacakIslemler !== after.yapilacakIslemler
  );
}
