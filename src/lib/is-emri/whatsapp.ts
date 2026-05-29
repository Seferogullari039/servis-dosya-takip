/** Türkiye cep numarası → wa.me formatı (90XXXXXXXXXX) */
export function normalizeTrPhoneForWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("90") && digits.length >= 12) return digits;
  if (digits.startsWith("0") && digits.length === 11) return `90${digits.slice(1)}`;
  if (digits.length === 10) return `90${digits}`;
  if (digits.length >= 11) return digits;
  return null;
}

export interface IsEmriWhatsAppShareInput {
  phone: string;
  workOrderNo: string;
  plaka: string;
  detailUrl: string;
  pdfUrl?: string;
  /** Public görsel URL'leri (en fazla 8 paylaşılır) */
  imageUrls?: string[];
}

export function buildIsEmriWhatsAppMessage(input: IsEmriWhatsAppShareInput): string {
  const lines = [
    "Seferoğulları Otomotiv İş Emriniz Hazır",
    "",
    `İş emri: ${input.workOrderNo}`,
    `Plaka: ${input.plaka}`,
    `Görüntüle: ${input.detailUrl}`,
  ];
  if (input.pdfUrl) {
    lines.push(`PDF indir: ${input.pdfUrl}`);
  }
  const urls = (input.imageUrls ?? []).filter(Boolean).slice(0, 8);
  if (urls.length > 0) {
    lines.push("", "Görseller:");
    for (const url of urls) {
      lines.push(url);
    }
  }
  return lines.join("\n");
}

export function buildIsEmriWhatsAppUrl(input: IsEmriWhatsAppShareInput): string | null {
  const normalized = normalizeTrPhoneForWhatsApp(input.phone);
  if (!normalized) return null;
  const text = encodeURIComponent(buildIsEmriWhatsAppMessage(input));
  return `https://wa.me/${normalized}?text=${text}`;
}
