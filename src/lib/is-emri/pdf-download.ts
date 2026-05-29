import { isEmriPdfFilename } from "@/lib/is-emri/pdf-filename";

export interface DownloadIsEmriPdfOptions {
  element: HTMLElement;
  workOrderNo: string;
  onProgress?: (percent: number) => void;
}

/**
 * Yazdırma alanından A4 PDF oluşturur (html2pdf.js).
 */
export async function downloadIsEmriPdf({
  element,
  workOrderNo,
  onProgress,
}: DownloadIsEmriPdfOptions): Promise<void> {
  onProgress?.(10);
  const html2pdf = (await import("html2pdf.js")).default;
  onProgress?.(35);

  const filename = isEmriPdfFilename(workOrderNo);

  await html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      filename,
      image: { type: "jpeg", quality: 0.92 },
      html2canvas: {
        scale: 1.75,
        useCORS: true,
        logging: false,
        letterRendering: true,
        windowWidth: 794,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    })
    .from(element)
    .save();

  onProgress?.(100);
}
