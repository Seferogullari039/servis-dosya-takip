export interface PushTokenDebugState {
  permission: NotificationPermission | "unsupported";
  hasLocalToken: boolean;
  localTokenPreview: string | null;
  dbSubscriptionCount: number;
  issueMessage: string | null;
  canPushTest: boolean;
  pushTestBlockReason: string | null;
}

export function buildTokenPreview(token: string | null): string | null {
  if (!token) return null;
  return token.length <= 20 ? token : `${token.slice(0, 20)}…`;
}

export function resolvePushTokenIssues(params: {
  permission: NotificationPermission | "unsupported";
  localToken: string | null;
  dbSubscriptionCount: number;
  publicFirebaseReady: boolean;
}): Pick<
  PushTokenDebugState,
  "issueMessage" | "canPushTest" | "pushTestBlockReason" | "hasLocalToken" | "localTokenPreview"
> {
  const hasLocalToken = Boolean(params.localToken?.trim());
  const localTokenPreview = buildTokenPreview(params.localToken);

  if (!params.publicFirebaseReady) {
    return {
      hasLocalToken,
      localTokenPreview,
      issueMessage: null,
      canPushTest: false,
      pushTestBlockReason: "Public Firebase env eksik. Eksik değişkenleri kontrol edin.",
    };
  }

  if (params.permission === "unsupported") {
    return {
      hasLocalToken,
      localTokenPreview,
      issueMessage: null,
      canPushTest: false,
      pushTestBlockReason: "Bu tarayıcı bildirimleri desteklemiyor.",
    };
  }

  if (params.permission !== "granted") {
    return {
      hasLocalToken,
      localTokenPreview,
      issueMessage: null,
      canPushTest: false,
      pushTestBlockReason:
        params.permission === "denied"
          ? "Bildirim izni reddedildi. Önce Bildirimleri Aç veya tarayıcı ayarlarından izin verin."
          : "Bildirim izni henüz verilmedi. Önce Bildirimleri Aç butonuna basın.",
    };
  }

  if (!hasLocalToken) {
    return {
      hasLocalToken: false,
      localTokenPreview: null,
      issueMessage: "FCM token oluşturulamadı",
      canPushTest: false,
      pushTestBlockReason:
        "FCM token oluşturulamadı. Token Yeniden Oluştur deneyin veya sayfayı yenileyin.",
    };
  }

  if (params.dbSubscriptionCount === 0) {
    return {
      hasLocalToken: true,
      localTokenPreview,
      issueMessage: "Token veritabanına kaydedilemedi",
      canPushTest: false,
      pushTestBlockReason:
        "Cihazda FCM token var ama Supabase kaydı yok. Token Yeniden Oluştur ile tekrar kaydedin.",
    };
  }

  return {
    hasLocalToken: true,
    localTokenPreview,
    issueMessage: null,
    canPushTest: true,
    pushTestBlockReason: null,
  };
}

export function buildPushTokenDebugState(params: {
  permission: NotificationPermission | "unsupported";
  localToken: string | null;
  dbSubscriptionCount: number;
  publicFirebaseReady: boolean;
}): PushTokenDebugState {
  const resolved = resolvePushTokenIssues(params);
  return {
    permission: params.permission,
    dbSubscriptionCount: params.dbSubscriptionCount,
    ...resolved,
  };
}
