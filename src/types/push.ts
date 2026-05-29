export type PushDeviceType = "ios" | "android" | "web" | "unknown";

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  device_type: PushDeviceType;
  fcm_token: string;
  created_at: string;
  last_seen_at: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url: string;
  tag?: string;
  badge?: number;
}

export type PushPermissionState =
  | "unsupported"
  | "default"
  | "granted"
  | "denied"
  | "loading";

export interface PushDashboardStatus {
  subscriptionCount: number;
  teamTokenCount: number;
  tokenRegistered: boolean;
  /** Tüm NEXT_PUBLIC_FIREBASE_* değişkenleri dolu */
  publicFirebaseReady: boolean;
  missingPublicEnv: string[];
  /** FIREBASE_SERVICE_ACCOUNT_JSON (sunucu) */
  serverPushReady: boolean;
}

export interface PushStatusApiResponse {
  publicFirebaseReady: boolean;
  missingPublicEnv: string[];
  missingPublicEnvLabel: string;
  serverPushReady: boolean;
  subscriptionCount: number;
  teamTokenCount: number;
  tokenRegistered: boolean;
}

export interface PushLastPushDisplay {
  ok: boolean;
  at: string;
  message?: string;
  sent?: number;
  failed?: number;
  adminError?: string;
  fcmErrors?: string[];
}

export interface PushTestApiResponse {
  ok: boolean;
  sent: number;
  failed: number;
  tokenCount: number;
  message?: string;
  adminError?: string;
  fcmErrors?: string[];
}
