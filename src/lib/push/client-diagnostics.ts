import {
  canRequestPushPermissionOnDevice,
  detectPushDeviceType,
  getDeviceLabel,
  isPWA,
  isPushEnvironmentSupported,
  readDeviceDetectionDebug,
  type DeviceDetectionDebug,
} from "@/lib/push/device";

export interface PushClientDiagnostics {
  device: string;
  pwaMode: boolean;
  permission: NotificationPermission | "unsupported";
  tokenRegistered: boolean;
  canEnable: boolean;
  iosNeedsHomeScreen: boolean;
  deviceDebug: DeviceDetectionDebug;
}

export function readPushClientDiagnostics(
  subscriptionCount: number,
  publicFirebaseReady: boolean
): PushClientDiagnostics {
  const deviceDebug = readDeviceDetectionDebug();
  const iosNeedsHomeScreen =
    typeof window !== "undefined" &&
    detectPushDeviceType() === "ios" &&
    !isPWA();

  if (!isPushEnvironmentSupported()) {
    return {
      device: getDeviceLabel(),
      pwaMode: isPWA(),
      permission: "unsupported",
      tokenRegistered: false,
      canEnable: false,
      iosNeedsHomeScreen,
      deviceDebug,
    };
  }

  const permission = Notification.permission;
  const tokenRegistered =
    publicFirebaseReady && permission === "granted" && subscriptionCount > 0;

  return {
    device: getDeviceLabel(),
    pwaMode: isPWA(),
    permission,
    tokenRegistered,
    canEnable:
      publicFirebaseReady &&
      canRequestPushPermissionOnDevice() &&
      permission !== "granted",
    iosNeedsHomeScreen,
    deviceDebug: readDeviceDetectionDebug(),
  };
}
