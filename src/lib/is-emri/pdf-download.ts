import { isEmriPdfFilename } from "@/lib/is-emri/pdf-filename";
import {
  onCloneForPdfCapture,
  prepareIsEmriElementForPdfCapture,
  validatePdfCanvas,
  waitForPrintDocumentReady,
} from "@/lib/is-emri/pdf-capture";

export interface DownloadIsEmriPdfOptions {
  element: HTMLElement | null;
  workOrderNo: string;
  onProgress?: (percent: number) => void;
}

interface Html2PdfWorkerInternal {
  prop: { canvas?: HTMLCanvasElement };
  toCanvas: () => Promise<Html2PdfWorkerInternal>;
  toPdf: () => Promise<Html2PdfWorkerInternal>;
  save: () => Promise<void>;
}

/**
 * Yazdırma belgesinden A4 PDF oluşturur.
 * Belge body'ye portal edilir, html2canvas onclone ile yakalanır, canvas doğrulanır.
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
  onProgress?.(20);

  const restoreCapture = prepareIsEmriElementForPdfCapture(element);
  await waitForPrintDocumentReady();
  onProgress?.(35);

  try {
    const html2pdf = (await import("html2pdf.js")).default;
    onProgress?.(45);

    const filename = isEmriPdfFilename(workOrderNo);

    const worker = html2pdf()
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
          backgroundColor: "#ffffff",
          onclone: onCloneForPdfCapture,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(element) as unknown as Html2PdfWorkerInternal;

    await worker.toCanvas();
    onProgress?.(70);

    const canvas = worker.prop.canvas;
    if (!canvas) {
      throw new Error("PDF oluşturulamadı — canvas oluşturulamadı.");
    }

    validatePdfCanvas(canvas);
    onProgress?.(85);

    await worker.toPdf().then((w) => w.save());
    onProgress?.(100);
  } finally {
    restoreCapture();
  }
}
