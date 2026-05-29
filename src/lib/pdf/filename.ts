export function buildPdfFilename(dosyaNo: string, kind: "summary" | "operation"): string {
  const safe = dosyaNo
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\-_.]/g, "")
    .replace(/-+/g, "-");

  const suffix = kind === "operation" ? "-operasyon" : "";
  return `servis-dosyasi-${safe || "rapor"}${suffix}.pdf`;
}
