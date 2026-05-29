export interface PushTokenDebugState {
  permission: NotificationPermission | "unsupported";
  hasLocalToken: boolean;
  localTokenPreview: string | null;
  /** Service role ile kullanıcı kayıt sayısı */
  dbSubscriptionCount: number;
  teamTokenCount: number;
  serviceRoleAvailable: boolean;
  tokenQueryMismatch: boolean;
  issueMessage: string | null;
  canPushTest: boolean;
  pushTestBlockReason: string | null;
}

export function buildTokenPreview(token: string | null): string | null {
  if (!token) return null;
  return token.length <= 20 ? token : `${token.slice(0, 20)}…`;
}

const SERVICE_ROLE_MISMATCH_MSG =
  "Token kayıtlı ama gönderim sorgusunda bulunamadı. Service role sorgusu kontrol edilmeli.";

export function resolvePushTokenIssues(params: {
  permission: NotificationPermission | "unsupported";
  localToken: string | null;
  dbSubscriptionCount: number;
  teamTokenCount: number;
  publicFirebaseReady: boolean;
  serviceRoleAvailable: boolean;
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

  if (
    hasLocalToken &&
    params.dbSubscriptionCount === 0 &&
    params.serviceRoleAvailable
  ) {
    return {
      hasLocalToken: true,
      localTokenPreview,
      issueMessage: SERVICE_ROLE_MISMATCH_MSG,
      canPushTest: false,
      pushTestBlockReason: SERVICE_ROLE_MISMATCH_MSG,
    };
  }

  if (!params.serviceRoleAvailable) {
    return {
      hasLocalToken,
      localTokenPreview,
      issueMessage: null,
      canPushTest: false,
      pushTestBlockReason:
        "SUPABASE_SERVICE_ROLE_KEY eksik veya geçersiz. Sunucu token sorgusu çalışmıyor.",
    };
  }

  if (params.dbSubscriptionCount === 0) {
    return {
      hasLocalToken: true,
      localTokenPreview,
      issueMessage: "Token veritabanına kaydedilemedi",
      canPushTest: false,
      pushTestBlockReason:
        "Cihazda FCM token var ama Supabase kaydı yok (service role: 0). Token Yeniden Oluştur ile tekrar kaydedin.",
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
  teamTokenCount: number;
  publicFirebaseReady: boolean;
  serviceRoleAvailable: boolean;
}): PushTokenDebugState {
  const resolved = resolvePushTokenIssues(params);
  const tokenQueryMismatch =
    Boolean(params.localToken?.trim()) &&
    params.dbSubscriptionCount === 0 &&
    params.serviceRoleAvailable;

  return {
    permission: params.permission,
    dbSubscriptionCount: params.dbSubscriptionCount,
    teamTokenCount: params.teamTokenCount,
    serviceRoleAvailable: params.serviceRoleAvailable,
    tokenQueryMismatch,
    ...resolved,
  };
}
