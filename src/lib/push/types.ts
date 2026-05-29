export interface DispatchPushResult {
  ok: boolean;
  skipped: boolean;
  skipReason?: string;
  event?: string;
  teamTokenCount: number;
  targetTokenCount: number;
  sent: number;
  failed: number;
  adminError?: string;
  fcmErrors?: string[];
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
  sent: number;
  failed: number;
  tokenCount: number;
  message?: string;
  adminError?: string;
  fcmErrors?: string[];
}
