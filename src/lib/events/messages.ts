import {
  DOCUMENT_CATEGORY_LABELS,
  type DocumentCategory,
} from "@/types/documents";
import type { ServisDosyasi } from "@/types/servis-dosya";

const FIELD_LABELS: Record<string, string> = {
  dosya_no: "Dosya numarası",
  plaka: "Plaka",
  musteri_adi: "Müşteri adı",
  telefon: "Telefon",
  arac_marka_model: "Araç marka/model",
  eksper_adi: "Eksper adı",
  durum: "Durum",
  odeme_durumu: "Ödeme durumu",
  notlar: "Notlar",
};

export function fieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

export function messageCreated(): { title: string; description: string } {
  return {
    title: "Dosya oluşturuldu",
    description: "Servis dosyası sisteme kaydedildi.",
  };
}

export function messageStatusChanged(
  oldStatus: string,
  newStatus: string
): { title: string; description: string } {
  return {
    title: "Durum güncellendi",
    description: `Durum '${newStatus}' olarak güncellendi.`,
  };
}

export function messagePaymentChanged(
  oldPayment: string,
  newPayment: string
): { title: string; description: string } {
  return {
    title: "Ödeme durumu değiştirildi",
    description: `Ödeme durumu '${oldPayment}' → '${newPayment}' olarak güncellendi.`,
  };
}

export function messageNoteAdded(): { title: string; description: string } {
  return {
    title: "Not güncellendi",
    description: "Dosya notları güncellendi.",
  };
}

export function messageExpertAssigned(
  expertName: string
): { title: string; description: string } {
  return {
    title: "Eksper atandı",
    description: `Eksper '${expertName}' olarak atandı.`,
  };
}

export function messageFieldUpdated(
  field: string,
  newValue: string
): { title: string; description: string } {
  const label = fieldLabel(field);
  return {
    title: `${label} güncellendi`,
    description: `${label} '${newValue}' olarak güncellendi.`,
  };
}

export function snapshotFromDomain(
  dosya: ServisDosyasi
): Record<string, string | null> {
  return {
    dosya_no: dosya.dosyaNo,
    plaka: dosya.plaka,
    musteri_adi: dosya.musteriAdi,
    telefon: dosya.telefon || null,
    arac_marka_model: dosya.aracMarkaModel || null,
    eksper_adi: dosya.eksperAdi || null,
    durum: dosya.durum,
    odeme_durumu: dosya.odemeDurumu,
    notlar: dosya.notlar || null,
  };
}

export function messageDocumentUploaded(
  category: DocumentCategory,
  fileName: string
): { title: string; description: string } {
  const label = DOCUMENT_CATEGORY_LABELS[category];
  return {
    title: `${label} evrağı yüklendi`,
    description: `"${fileName}" dosyası eklendi.`,
  };
}

export function snapshotFromRow(row: {
  dosya_no: string;
  plaka: string;
  musteri_adi: string;
  telefon: string | null;
  arac_marka_model: string | null;
  eksper_adi: string | null;
  durum: string;
  odeme_durumu: string;
  notlar: string | null;
}): Record<string, string | null> {
  return {
    dosya_no: row.dosya_no,
    plaka: row.plaka,
    musteri_adi: row.musteri_adi,
    telefon: row.telefon,
    arac_marka_model: row.arac_marka_model,
    eksper_adi: row.eksper_adi,
    durum: row.durum,
    odeme_durumu: row.odeme_durumu,
    notlar: row.notlar,
  };
}
