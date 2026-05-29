export interface DispatchPushResult {
  ok: boolean;
  skipped: boolean;
  skipReason?: string;
  event?: string;
  teamTokenCount: number;
  /** Gönderime seçilen benzersiz token sayısı */
  tokensFound: number;
  /** @deprecated tokensFound kullanın */
  targetTokenCount: number;
  sent: number;
  failed: number;
  adminError?: string;
  fcmErrors?: string[];
  serviceRoleAvailable?: boolean;
  queryError?: string;
}

export interface SendPushResult {
  sent: number;
  failed: number;
  ok: boolean;
  adminError?: string;
  fcmErrors?: string[];
}

export interface PushTestResult {
  ok: boolean;
  tokensFound: number;
  sent: number;
  failed: number;
  /** @deprecated tokensFound kullanın */
  tokenCount: number;
  message?: string;
  adminError?: string;
  fcmErrors?: string[];
  serviceRoleAvailable?: boolean;
  queryError?: string;
}
