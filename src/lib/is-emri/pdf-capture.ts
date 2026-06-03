/** PDF yakalama — body portal, kesin ölçüler, canvas doğrulama */

export const PDF_WIDTH_PX = 794;
export const PDF_MIN_HEIGHT_PX = 1123;

const PDF_CAPTURE_ROOT_CLASS = "is-emri-print-document-capture";
export const PDF_CAPTURE_WRAPPER_CLASS = "is-emri-pdf-capture-wrapper";

export async function waitForPrintDocumentReady(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  await new Promise((r) => setTimeout(r, 100));
}

function findPrintDocumentRoot(node: HTMLElement): HTMLElement {
  if (node.classList.contains("is-emri-print-document")) return node;
  const inner = node.querySelector(".is-emri-print-document");
  return (inner as HTMLElement | null) ?? node;
}

function applyCaptureWrapperStyles(wrapper: HTMLElement): void {
  wrapper.style.position = "fixed";
  wrapper.style.left = "0";
  wrapper.style.top = "0";
  wrapper.style.width = `${PDF_WIDTH_PX}px`;
  wrapper.style.minHeight = `${PDF_MIN_HEIGHT_PX}px`;
  wrapper.style.zIndex = "999999";
  wrapper.style.background = "#ffffff";
  wrapper.style.pointerEvents = "none";
  wrapper.style.overflow = "visible";
  wrapper.style.boxSizing = "border-box";
}

/** Yakalama anında uygulanan inline + sınıf stilleri */
export function applyPdfCaptureStyles(element: HTMLElement): void {
  element.classList.remove("is-emri-print-document-screen");
  element.classList.add(PDF_CAPTURE_ROOT_CLASS);
  element.style.width = `${PDF_WIDTH_PX}px`;
  element.style.minHeight = `${PDF_MIN_HEIGHT_PX}px`;
  element.style.height = "auto";
  element.style.display = "block";
  element.style.boxSizing = "border-box";
  element.style.visibility = "visible";
  element.style.opacity = "1";
  element.style.background = "#ffffff";
  element.style.pointerEvents = "none";
  element.style.margin = "0";
  element.style.padding = "0";
  element.style.maxWidth = `${PDF_WIDTH_PX}px`;
}

/** html2canvas onclone — klonlanmış belge + wrapper'a aynı yakalama stilleri */
export function onCloneForPdfCapture(
  _clonedDoc: Document,
  clonedNode: HTMLElement
): void {
  if (clonedNode.classList.contains(PDF_CAPTURE_WRAPPER_CLASS)) {
    applyCaptureWrapperStyles(clonedNode);
    const inner = clonedNode.querySelector(".is-emri-print-document");
    if (inner instanceof HTMLElement) {
      applyPdfCaptureStyles(inner);
    }
    return;
  }

  const root = findPrintDocumentRoot(clonedNode);
  applyPdfCaptureStyles(root);

  const wrapper = root.parentElement;
  if (wrapper?.classList.contains(PDF_CAPTURE_WRAPPER_CLASS)) {
    applyCaptureWrapperStyles(wrapper);
  }
}

export function logPdfElementLayout(element: HTMLElement, label: string): void {
  const rect = element.getBoundingClientRect();
  const computed = window.getComputedStyle(element);

  console.log(`[pdf] layout ${label}`, {
    rect: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    },
    offsetWidth: element.offsetWidth,
    offsetHeight: element.offsetHeight,
    scrollWidth: element.scrollWidth,
    scrollHeight: element.scrollHeight,
    computed: {
      display: computed.display,
      position: computed.position,
      width: computed.width,
      height: computed.height,
    },
  });
}

export function hasZeroPdfLayout(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    element.offsetWidth === 0 ||
    element.offsetHeight === 0 ||
    rect.width === 0 ||
    rect.height === 0
  );
}

export function createStandalonePdfClone(source: HTMLElement): {
  wrapper: HTMLDivElement;
  element: HTMLElement;
  cleanup: () => void;
} {
  const wrapper = document.createElement("div");
  wrapper.className = PDF_CAPTURE_WRAPPER_CLASS;
  applyCaptureWrapperStyles(wrapper);

  const clone = source.cloneNode(true) as HTMLElement;
  applyPdfCaptureStyles(clone);
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);
  void clone.offsetHeight;

  return {
    wrapper,
    element: findPrintDocumentRoot(clone),
    cleanup: () => {
      wrapper.remove();
    },
  };
}

export function validatePdfCanvas(canvas: HTMLCanvasElement): void {
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  console.log("[pdf] canvas", {
    width: canvas.width,
    height: canvas.height,
    dataUrlLength: dataUrl.length,
  });

  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error("PDF oluşturulamadı — canvas boyutu geçersiz (0×0).");
  }
}

interface ElementStyleSnapshot {
  position: string;
  left: string;
  top: string;
  visibility: string;
  opacity: string;
  zIndex: string;
  pointerEvents: string;
  width: string;
  maxWidth: string;
  minHeight: string;
  height: string;
  margin: string;
  padding: string;
  background: string;
  display: string;
  boxSizing: string;
}

function snapshotElementStyle(element: HTMLElement): ElementStyleSnapshot {
  const style = element.style;
  return {
    position: style.position,
    left: style.left,
    top: style.top,
    visibility: style.visibility,
    opacity: style.opacity,
    zIndex: style.zIndex,
    pointerEvents: style.pointerEvents,
    width: style.width,
    maxWidth: style.maxWidth,
    minHeight: style.minHeight,
    height: style.height,
    margin: style.margin,
    padding: style.padding,
    background: style.background,
    display: style.display,
    boxSizing: style.boxSizing,
  };
}

function restoreElementStyle(
  element: HTMLElement,
  prev: ElementStyleSnapshot
): void {
  const style = element.style;
  style.position = prev.position;
  style.left = prev.left;
  style.top = prev.top;
  style.visibility = prev.visibility;
  style.opacity = prev.opacity;
  style.zIndex = prev.zIndex;
  style.pointerEvents = prev.pointerEvents;
  style.width = prev.width;
  style.maxWidth = prev.maxWidth;
  style.minHeight = prev.minHeight;
  style.height = prev.height;
  style.margin = prev.margin;
  style.padding = prev.padding;
  style.background = prev.background;
  style.display = prev.display;
  style.boxSizing = prev.boxSizing;
}

export interface PdfCaptureSession {
  captureElement: HTMLElement;
  captureTarget: HTMLElement;
  restore: () => void;
}

/**
 * Belgeyi capture wrapper içine alır, kesin px ölçüleri uygular.
 * Capture bitince wrapper kaldırılır, element eski konumuna döner.
 */
export function prepareIsEmriElementForPdfCapture(
  element: HTMLElement
): PdfCaptureSession {
  const captureElement = findPrintDocumentRoot(element);
  const prev = snapshotElementStyle(captureElement);
  const hadScreenClass = captureElement.classList.contains(
    "is-emri-print-document-screen"
  );
  const hadCaptureClass = captureElement.classList.contains(
    PDF_CAPTURE_ROOT_CLASS
  );

  const parent = captureElement.parentNode;
  const wrapper = document.createElement("div");
  wrapper.className = PDF_CAPTURE_WRAPPER_CLASS;
  applyCaptureWrapperStyles(wrapper);

  if (parent) {
    parent.insertBefore(wrapper, captureElement);
    wrapper.appendChild(captureElement);
  } else {
    document.body.appendChild(wrapper);
    wrapper.appendChild(captureElement);
  }

  applyPdfCaptureStyles(captureElement);
  void captureElement.offsetHeight;
  void wrapper.offsetHeight;

  return {
    captureElement,
    captureTarget: wrapper,
    restore: () => {
      captureElement.classList.remove(PDF_CAPTURE_ROOT_CLASS);
      if (hadScreenClass) {
        captureElement.classList.add("is-emri-print-document-screen");
      }
      if (hadCaptureClass) {
        captureElement.classList.add(PDF_CAPTURE_ROOT_CLASS);
      }

      restoreElementStyle(captureElement, prev);

      if (wrapper.isConnected) {
        const wrapperParent = wrapper.parentNode;
        if (wrapperParent) {
          wrapperParent.insertBefore(captureElement, wrapper);
        }
        wrapper.remove();
      }
    },
  };
}

export function resolvePdfCaptureTarget(session: PdfCaptureSession): {
  captureTarget: HTMLElement;
  measureElement: HTMLElement;
  cleanupClone: (() => void) | null;
} {
  logPdfElementLayout(session.captureElement, "pre-capture");

  if (!hasZeroPdfLayout(session.captureElement)) {
    return {
      captureTarget: session.captureTarget,
      measureElement: session.captureElement,
      cleanupClone: null,
    };
  }

  console.warn(
    "[pdf] layout sıfır — standalone clone ile yeniden denenecek."
  );
  const standalone = createStandalonePdfClone(session.captureElement);
  logPdfElementLayout(standalone.element, "standalone-clone");

  return {
    captureTarget: standalone.wrapper,
    measureElement: standalone.element,
    cleanupClone: standalone.cleanup,
  };
}

export function getPdfCanvasDimensions(element: HTMLElement): {
  width: number;
  height: number;
} {
  return {
    width: element.scrollWidth || PDF_WIDTH_PX,
    height: element.scrollHeight || PDF_MIN_HEIGHT_PX,
  };
}
