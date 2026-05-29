/** Tarayıcıda kontrol edilen Firebase public env anahtarları */
export const FIREBASE_PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_FIREBASE_VAPID_KEY",
] as const;

export type FirebasePublicEnvKey = (typeof FIREBASE_PUBLIC_ENV_KEYS)[number];

function readPublicEnv(key: FirebasePublicEnvKey): string {
  const values: Record<FirebasePublicEnvKey, string | undefined> = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  };
  return values[key]?.trim() ?? "";
}

export function getMissingFirebasePublicEnvVars(): FirebasePublicEnvKey[] {
  return FIREBASE_PUBLIC_ENV_KEYS.filter((key) => !readPublicEnv(key));
}

export function isFirebasePublicConfigured(): boolean {
  return getMissingFirebasePublicEnvVars().length === 0;
}

export function formatMissingFirebasePublicEnv(
  missing: FirebasePublicEnvKey[]
): string {
  return missing.join(", ");
}
