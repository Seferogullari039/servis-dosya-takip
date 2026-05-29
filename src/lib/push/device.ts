export type PushDeviceKind = "ios" | "android" | "web" | "unknown";

export interface DeviceDetectionDebug {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  standaloneMode: boolean;
  displayMode: string;
  isIOS: boolean;
  isSafari: boolean;
  isPWA: boolean;
  isTouchDevice: boolean;
  detectedDeviceType: PushDeviceKind;
}

function emptyDeviceDebug(): DeviceDetectionDebug {
  return {
    userAgent: "",
    platform: "",
    maxTouchPoints: 0,
    standaloneMode: false,
    displayMode: "unknown",
    isIOS: false,
    isSafari: false,
    isPWA: false,
    isTouchDevice: false,
    detectedDeviceType: "unknown",
  };
}

/** Dokunmatik cihaz (iPhone / iPad dahil) */
export function isTouchDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.maxTouchPoints > 0;
}

/**
 * iOS cihaz — klasik UA veya iPadOS masaüstü UA (MacIntel + çoklu dokunma).
 */
export function isIOSUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  return navigator.maxTouchPoints > 1 && navigator.platform === "MacIntel";
}

export function isSafariBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
}

export function isNavigatorStandalone(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

export function isDisplayModeStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
}

/** PWA: iOS navigator.standalone veya display-mode: standalone */
export function isPWA(): boolean {
  return isNavigatorStandalone() || isDisplayModeStandalone();
}

/** @deprecated isPWA ile aynı — geriye uyumluluk */
export function isIosStandalonePwa(): boolean {
  return isPWA();
}

function resolveDisplayMode(): string {
  if (typeof window === "undefined") return "unknown";
  const modes = ["standalone", "fullscreen", "minimal-ui", "browser"] as const;
  for (const mode of modes) {
    if (window.matchMedia(`(display-mode: ${mode})`).matches) return mode;
  }
  return "unknown";
}

export function readDeviceDetectionDebug(): DeviceDetectionDebug {
  if (typeof navigator === "undefined") {
    return emptyDeviceDebug();
  }

  const detectedDeviceType = detectPushDeviceType();

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    standaloneMode: isNavigatorStandalone(),
    displayMode: resolveDisplayMode(),
    isIOS: isIOSUserAgent(),
    isSafari: isSafariBrowser(),
    isPWA: isPWA(),
    isTouchDevice: isTouchDevice(),
    detectedDeviceType,
  };
}

export function detectPushDeviceType(): PushDeviceKind {
  if (typeof navigator === "undefined") return "unknown";

  const iosUa = isIOSUserAgent();
  const touch = isTouchDevice();
  const standalone = isPWA();

  if (touch && iosUa && standalone) return "ios";
  if (iosUa) return "ios";

  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  return "web";
}

export function isPushEnvironmentSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

export function canRequestPushPermissionOnDevice(): boolean {
  if (detectPushDeviceType() === "ios" && !isPWA()) {
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
