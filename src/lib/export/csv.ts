import { formatTarih, formatTarihSaat } from "@/lib/utils/format";

/** Türkçe Excel varsayılan liste ayırıcısı */
export const CSV_DELIMITER = ";";

const UTF8_BOM = "\uFEFF";

/** CSV hücre kaçışı (noktalı virgül ayırıcı) */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[";\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function rowsToCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map(escapeCsvCell).join(CSV_DELIMITER),
    ...rows.map((row) => row.map(escapeCsvCell).join(CSV_DELIMITER)),
  ];
  return `${UTF8_BOM}${lines.join("\r\n")}`;
}

/** Tarih+saat alanları — örn. created_at */
export function formatCsvDateTime(
  value: string | null | undefined
): string {
  if (!value?.trim()) return "";
  try {
    return formatTarihSaat(value);
  } catch {
    return value;
  }
}

/** Yalnızca tarih alanları — örn. tedarik_tarihi */
export function formatCsvDate(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  try {
    const iso = value.includes("T") ? value : `${value}T12:00:00`;
    return formatTarih(iso);
  } catch {
    return value;
  }
}

export function exportDateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
