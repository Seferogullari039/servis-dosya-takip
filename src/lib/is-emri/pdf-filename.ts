/** İş emri PDF dosya adı: IE-{iş_emri_no}.pdf */
export function isEmriPdfFilename(workOrderNo: string): string {
  const safe = workOrderNo.trim().replace(/[/\\?%*:|"<>]/g, "-");
  if (!safe) return "IE-is-emri.pdf";
  if (safe.toLowerCase().endsWith(".pdf")) return safe;
  if (safe.startsWith("IE-")) return `${safe}.pdf`;
  return `IE-${safe}.pdf`;
}
