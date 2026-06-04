import { isEmptyParcaSatir } from "@/lib/is-emri/parca-tedarik-helpers";
import {
  createEmptyIscilikSatir,
  createEmptyParcaSatir,
  type IscilikSatir,
  type ParcaSatir,
} from "@/types/is-emri";

function isEmptyIscilikSatir(row: IscilikSatir): boolean {
  return !row.aciklama.trim() && !row.tutar.trim();
}

export function mergeParcaSatirlari(
  existing: ParcaSatir[],
  incoming: ParcaSatir[]
): ParcaSatir[] {
  if (incoming.length === 0) return existing;
  const kept = existing.filter((row) => !isEmptyParcaSatir(row));
  return [...kept, ...incoming];
}

export function mergeIscilikSatirlari(
  existing: IscilikSatir[],
  incoming: IscilikSatir[]
): IscilikSatir[] {
  if (incoming.length === 0) return existing;
  const kept = existing.filter((row) => !isEmptyIscilikSatir(row));
  return [...kept, ...incoming];
}

export function ensureMinimumFormLines(parcalar: ParcaSatir[], iscilik: IscilikSatir[]) {
  return {
    parcalar: parcalar.length > 0 ? parcalar : [createEmptyParcaSatir()],
    iscilikSatirlari:
      iscilik.length > 0 ? iscilik : [createEmptyIscilikSatir()],
  };
}
