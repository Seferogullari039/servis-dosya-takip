import { buildParcaSatirFromBulkLine } from "@/lib/is-emri/parca-tedarik-helpers";
import { parseTutarInput } from "@/lib/utils/para";
import type { ParcaSatir } from "@/types/is-emri";

export interface BulkParcaImportError {
  line: number;
  text: string;
  message: string;
}

export interface BulkParcaImportResult {
  rows: ParcaSatir[];
  errors: BulkParcaImportError[];
}

function parseAdet(raw: string): string | null {
  const normalized = raw.replace(",", ".").trim();
  if (!normalized) return null;
  const n = Number.parseFloat(normalized);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Number.isInteger(n) ? String(n) : String(n);
}

function parseBirimFiyat(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = parseTutarInput(trimmed);
  if (n === null || n < 0) return null;
  return trimmed;
}

/**
 * Toplu yapıştırma: her satır `Parça Adı;Adet;Birim Fiyat`
 * Ayırıcı: noktalı virgül (;). Virgül ondalık için kullanılabilir.
 */
export function parseBulkParcaImport(text: string): BulkParcaImportResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rows: ParcaSatir[] = [];
  const errors: BulkParcaImportError[] = [];

  lines.forEach((line, index) => {
    const lineNo = index + 1;
    const parts = line.split(";").map((part) => part.trim());

    if (parts.length < 3) {
      errors.push({
        line: lineNo,
        text: line,
        message: "Satır formatı hatalı — Parça Adı;Adet;Birim Fiyat bekleniyor.",
      });
      return;
    }

    const parcaAdi = parts[0];
    const adetRaw = parts[1];
    const birimRaw = parts[2];

    if (!parcaAdi) {
      errors.push({
        line: lineNo,
        text: line,
        message: "Parça adı boş olamaz.",
      });
      return;
    }

    const adet = parseAdet(adetRaw);
    if (!adet) {
      errors.push({
        line: lineNo,
        text: line,
        message: "Adet geçersiz — pozitif sayı girin.",
      });
      return;
    }

    const birimFiyat = parseBirimFiyat(birimRaw);
    if (birimFiyat === null) {
      errors.push({
        line: lineNo,
        text: line,
        message: "Birim fiyat geçersiz.",
      });
      return;
    }

    rows.push(
      buildParcaSatirFromBulkLine({
        parcaAdi,
        adet,
        birimFiyat,
      })
    );
  });

  return { rows, errors };
}
