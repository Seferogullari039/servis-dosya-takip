export type PushDeviceKind = "ios" | "android" | "web" | "unknown";

export function detectPushDeviceType(): PushDeviceKind {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "web";
}

export function isIosStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function isPushEnvironmentSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

export function canRequestPushPermissionOnDevice(): boolean {
  if (detectPushDeviceType() === "ios" && !isIosStandalonePwa()) {
    return false;
  }
  return true;
}

export function getDeviceLabel(): string {
  const t = detectPushDeviceType();
  if (t === "ios") return "iOS";
  if (t === "android") return "Android";
  if (t === "web") return "Desktop";
  return "Bilinmiyor";
}
