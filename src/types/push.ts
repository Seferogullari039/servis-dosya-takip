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
  /** Service role ile kullanıcı token sayısı */
  subscriptionCount: number;
  /** Service role ile ekip toplam token */
  teamTokenCount: number;
  tokenRegistered: boolean;
  publicFirebaseReady: boolean;
  missingPublicEnv: string[];
  serverPushReady: boolean;
  serviceRoleAvailable: boolean;
  serviceRoleConfigured: boolean;
  queryError?: string;
}

export interface PushStatusApiResponse {
  publicFirebaseReady: boolean;
  missingPublicEnv: string[];
  missingPublicEnvLabel: string;
  serverPushReady: boolean;
  subscriptionCount: number;
  teamTokenCount: number;
  tokenRegistered: boolean;
  serviceRoleAvailable: boolean;
  serviceRoleConfigured: boolean;
  queryError?: string;
}

export interface PushLastPushDisplay {
  ok: boolean;
  at: string;
  message?: string;
  tokensFound?: number;
  sent?: number;
  failed?: number;
  adminError?: string;
  fcmErrors?: string[];
  queryError?: string;
}

export interface PushTestApiResponse {
  ok: boolean;
  tokensFound: number;
  sent: number;
  failed: number;
  tokenCount: number;
  message?: string;
  adminError?: string;
  fcmErrors?: string[];
  serviceRoleAvailable?: boolean;
  queryError?: string;
}
