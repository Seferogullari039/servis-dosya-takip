/** Sunucu tarafı push (FCM gönderimi) — yalnızca server runtime */
export function isServerPushConfigured(): boolean {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  return Boolean(json);
}
