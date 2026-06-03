import { isEmriPdfFilename } from "@/lib/is-emri/pdf-filename";
import {
  PDF_MARGINS_ARRAY,
  PDF_WIDTH_PX,
  fitPdfCaptureToContent,
  getHtml2CanvasScale,
  getPdfCanvasDimensions,
  logPdfElementLayout,
  logPdfPagePlan,
  onCloneForPdfCapture,
  prepareIsEmriElementForPdfCapture,
  resolvePdfCaptureTarget,
  trimCanvasToSinglePage,
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
 * Belge body'ye portal edilir, kesin px ölçülerle yakalanır, canvas doğrulanır.
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

  const session = prepareIsEmriElementForPdfCapture(element);
  await waitForPrintDocumentReady();
  onProgress?.(35);

  let cleanupClone: (() => void) | null = null;

  try {
    const resolved = resolvePdfCaptureTarget(session);
    cleanupClone = resolved.cleanupClone;
    const { captureTarget, measureElement } = resolved;

    if (resolved.cleanupClone) {
      fitPdfCaptureToContent(measureElement, captureTarget);
    }

    const pagePlan = logPdfPagePlan(measureElement);
    const { width: captureWidth, height: captureHeight } =
      getPdfCanvasDimensions(measureElement, pagePlan);
    const canvasScale = getHtml2CanvasScale();

    const html2pdf = (await import("html2pdf.js")).default;
    onProgress?.(45);

    const filename = isEmriPdfFilename(workOrderNo);

    const pdfOptions = {
        margin: PDF_MARGINS_ARRAY,
        filename,
        pagebreak:
          pagePlan.pageCount === 1
            ? { mode: [] as string[] }
            : { mode: ["css", "legacy"] as string[] },
        image: { type: "jpeg", quality: 0.92 },
        html2canvas: {
          scale: canvasScale,
          useCORS: true,
          logging: false,
          letterRendering: true,
          width: captureWidth,
          height: captureHeight,
          windowWidth: PDF_WIDTH_PX,
          windowHeight: captureHeight,
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
      };

    const worker = html2pdf()
      .set(pdfOptions as never)
      .from(captureTarget) as unknown as Html2PdfWorkerInternal;

    await worker.toCanvas();
    onProgress?.(70);

    let canvas = worker.prop?.canvas;
    if (!canvas) {
      throw new Error("PDF canvas oluşturulamadı.");
    }

    if (pagePlan.fitsSinglePage) {
      const trimmed = trimCanvasToSinglePage(canvas);
      if (worker.prop) {
        worker.prop.canvas = trimmed;
      }
      canvas = trimmed;
    }

    logPdfElementLayout(measureElement, "pre-validate");
    validatePdfCanvas(canvas);
    onProgress?.(85);

    await worker.toPdf();

    console.log("[pdf] worker before save", {
      worker,
      save: worker.save,
      saveType: typeof worker.save,
      pageCount: pagePlan.pageCount,
    });

    if (typeof worker.save !== "function") {
      throw new Error("PDF oluşturulamadı — worker.save kullanılamıyor.");
    }

    await worker.save();
    onProgress?.(100);
  } finally {
    cleanupClone?.();
    session.restore();
  }
}
