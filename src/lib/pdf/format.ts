import { DOCUMENT_CATEGORY_LABELS, type DocumentCategory } from "@/types/documents";

export function pdfFormatTarih(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function pdfFormatTarihSaat(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function pdfFormatBoyut(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function pdfCategoryLabel(category: DocumentCategory): string {
  return DOCUMENT_CATEGORY_LABELS[category];
}

const EVENT_LABELS: Record<string, string> = {
  created: "Oluşturma",
  updated: "Güncelleme",
  status_changed: "Durum",
  payment_changed: "Ödeme",
  note_added: "Not",
  expert_assigned: "Eksper",
  document_uploaded: "Evrak",
};

export function pdfEventTypeLabel(type: string): string {
  return EVENT_LABELS[type] ?? type;
}

/** PDF fontunda ₺ glifi eksik olabildiği için "TL" kullanılır */
export function pdfFormatPara(amount: number | null | undefined): string {
  if (amount == null) return "—";
  const n = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${n} TL`;
}

export function pdfFormatParaOzet(
  odenen: number,
  dosyaTutari: number | null
): string {
  if (dosyaTutari != null && dosyaTutari > 0) {
    return `${pdfFormatPara(odenen)} / ${pdfFormatPara(dosyaTutari)}`;
  }
  if (odenen > 0) return pdfFormatPara(odenen);
  return "—";
}
