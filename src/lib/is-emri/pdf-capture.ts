/** PDF yakalama öncesi yazdırma belgesini görünür hale getirir */

export async function waitForPrintDocumentReady(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  await new Promise((r) => setTimeout(r, 80));
}

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
  };

  element.classList.remove("is-emri-print-document-screen");
  element.classList.add("is-emri-print-document-capture");
  style.position = "fixed";
  style.left = "0";
  style.top = "0";
  style.visibility = "visible";
  style.opacity = "1";
  style.zIndex = "99999";
  style.pointerEvents = "none";
  style.width = "210mm";

  return () => {
    element.classList.remove("is-emri-print-document-capture");
    element.classList.add("is-emri-print-document-screen");
    style.position = prev.position;
    style.left = prev.left;
    style.top = prev.top;
    style.visibility = prev.visibility;
    style.opacity = prev.opacity;
    style.zIndex = prev.zIndex;
    style.pointerEvents = prev.pointerEvents;
    style.width = prev.width;
  };
}
