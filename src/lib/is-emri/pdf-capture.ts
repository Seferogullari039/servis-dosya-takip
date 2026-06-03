/** PDF yakalama — body portal, görünür stiller, canvas doğrulama */

const PDF_CAPTURE_ROOT_CLASS = "is-emri-print-document-capture";

export async function waitForPrintDocumentReady(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  await new Promise((r) => setTimeout(r, 100));
}

/** Yakalama anında uygulanan inline + sınıf stilleri */
export function applyPdfCaptureStyles(element: HTMLElement): void {
  element.classList.remove("is-emri-print-document-screen");
  element.classList.add(PDF_CAPTURE_ROOT_CLASS);
  element.style.position = "fixed";
  element.style.left = "0";
  element.style.top = "0";
  element.style.zIndex = "999999";
  element.style.visibility = "visible";
  element.style.opacity = "1";
  element.style.background = "#ffffff";
  element.style.pointerEvents = "none";
  element.style.width = "210mm";
  element.style.maxWidth = "210mm";
  element.style.margin = "0";
  element.style.padding = "0";
}

function findPrintDocumentRoot(node: HTMLElement): HTMLElement {
  if (node.classList.contains("is-emri-print-document")) return node;
  const inner = node.querySelector(".is-emri-print-document");
  return (inner as HTMLElement | null) ?? node;
}

/** html2canvas onclone — klonlanmış belgeye aynı yakalama stilleri */
export function onCloneForPdfCapture(
  _clonedDoc: Document,
  clonedNode: HTMLElement
): void {
  applyPdfCaptureStyles(findPrintDocumentRoot(clonedNode));
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

interface PortalState {
  parent: Node;
  nextSibling: ChildNode | null;
  placeholder: Comment;
}

/**
 * Belgeyi geçici olarak document.body altına taşır (DOM portal).
 * Capture bitince eski konumuna geri alınır.
 */
export function prepareIsEmriElementForPdfCapture(
  element: HTMLElement
): () => void {
  const style = element.style;
  const prev = {
    position: style.position,
    left: style.left,
    top: style.top,
    visibility: style.visibility,
    opacity: style.opacity,
    zIndex: style.zIndex,
    pointerEvents: style.pointerEvents,
    width: style.width,
    maxWidth: style.maxWidth,
    margin: style.margin,
    padding: style.padding,
    background: style.background,
  };

  const hadScreenClass = element.classList.contains(
    "is-emri-print-document-screen"
  );
  const hadCaptureClass = element.classList.contains(PDF_CAPTURE_ROOT_CLASS);

  const parent = element.parentNode;
  const skipDomPortal = parent === document.body;

  if (!parent || skipDomPortal) {
    applyPdfCaptureStyles(element);
    void element.offsetHeight;
    return () => {
      element.classList.remove(PDF_CAPTURE_ROOT_CLASS);
      if (hadScreenClass) element.classList.add("is-emri-print-document-screen");
      if (hadCaptureClass) element.classList.add(PDF_CAPTURE_ROOT_CLASS);
      style.position = prev.position;
      style.left = prev.left;
      style.top = prev.top;
      style.visibility = prev.visibility;
      style.opacity = prev.opacity;
      style.zIndex = prev.zIndex;
      style.pointerEvents = prev.pointerEvents;
      style.width = prev.width;
      style.maxWidth = prev.maxWidth;
      style.margin = prev.margin;
      style.padding = prev.padding;
      style.background = prev.background;
    };
  }

  const portal: PortalState = {
    parent,
    nextSibling: element.nextSibling,
    placeholder: document.createComment("is-emri-pdf-portal"),
  };

  parent.insertBefore(portal.placeholder, element);
  document.body.appendChild(element);

  applyPdfCaptureStyles(element);
  void element.offsetHeight;

  return () => {
    element.classList.remove(PDF_CAPTURE_ROOT_CLASS);
    if (hadScreenClass) {
      element.classList.add("is-emri-print-document-screen");
    }

    style.position = prev.position;
    style.left = prev.left;
    style.top = prev.top;
    style.visibility = prev.visibility;
    style.opacity = prev.opacity;
    style.zIndex = prev.zIndex;
    style.pointerEvents = prev.pointerEvents;
    style.width = prev.width;
    style.maxWidth = prev.maxWidth;
    style.margin = prev.margin;
    style.padding = prev.padding;
    style.background = prev.background;

    if (portal.placeholder.isConnected) {
      portal.parent.insertBefore(element, portal.placeholder);
      portal.placeholder.remove();
    } else if (element.parentNode === document.body) {
      document.body.removeChild(element);
    }
  };
}
