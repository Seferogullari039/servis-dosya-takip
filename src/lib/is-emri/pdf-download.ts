import { isEmriPdfFilename } from "@/lib/is-emri/pdf-filename";
import {
  prepareIsEmriElementForPdfCapture,
  waitForPrintDocumentReady,
} from "@/lib/is-emri/pdf-capture";

export interface DownloadIsEmriPdfOptions {
  element: HTMLElement | null;
  workOrderNo: string;
  onProgress?: (percent: number) => void;
}

/**
 * Yazdırma alanından A4 PDF oluşturur (html2pdf.js).
 * Off-screen belge yakalamadan önce geçici olarak görünür yapılır.
 */
export async function downloadIsEmriPdf({
  element,
  workOrderNo,
  onProgress,
}: DownloadIsEmriPdfOptions): Promise<void> {
  if (!element) {
    throw new Error("PDF oluşturulamadı — yazdırma alanı bulunamadı.");
  }

  onProgress?.(10);
  await waitForPrintDocumentReady();
  onProgress?.(25);

  const restoreCapture = prepareIsEmriElementForPdfCapture(element);
  await waitForPrintDocumentReady();

  try {
    const html2pdf = (await import("html2pdf.js")).default;
    onProgress?.(40);

    const filename = isEmriPdfFilename(workOrderNo);

    await html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename,
        image: { type: "jpeg", quality: 0.92 },
        html2canvas: {
          scale: 1.75,
          useCORS: true,
          logging: false,
          letterRendering: true,
          windowWidth: 794,
          scrollX: 0,
          scrollY: 0,
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
  } finally {
    restoreCapture();
  }
}
