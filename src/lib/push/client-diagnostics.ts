import {
  canRequestPushPermissionOnDevice,
  detectPushDeviceType,
  getDeviceLabel,
  isIosStandalonePwa,
  isPushEnvironmentSupported,
} from "@/lib/push/device";

export interface PushClientDiagnostics {
  device: string;
  pwaMode: boolean;
  permission: NotificationPermission | "unsupported";
  tokenRegistered: boolean;
  canEnable: boolean;
  iosNeedsHomeScreen: boolean;
}

export function readPushClientDiagnostics(
  subscriptionCount: number,
  publicFirebaseReady: boolean
): PushClientDiagnostics {
  const iosNeedsHomeScreen =
    typeof window !== "undefined" &&
    detectPushDeviceType() === "ios" &&
    !isIosStandalonePwa();

  if (!isPushEnvironmentSupported()) {
    return {
      device: getDeviceLabel(),
      pwaMode: isIosStandalonePwa(),
      permission: "unsupported",
      tokenRegistered: false,
      canEnable: false,
      iosNeedsHomeScreen,
    };
  }

  const permission = Notification.permission;
  const tokenRegistered =
    publicFirebaseReady && permission === "granted" && subscriptionCount > 0;

  return {
    device: getDeviceLabel(),
    pwaMode: isIosStandalonePwa(),
    permission,
    tokenRegistered,
    canEnable:
      publicFirebaseReady &&
      canRequestPushPermissionOnDevice() &&
      permission !== "granted",
    iosNeedsHomeScreen,
  };
}
