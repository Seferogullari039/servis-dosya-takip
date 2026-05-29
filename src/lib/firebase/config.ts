import {
  isFirebasePublicConfigured,
  type FirebasePublicEnvKey,
} from "@/lib/firebase/public-env";

export type { FirebasePublicEnvKey };
export {
  FIREBASE_PUBLIC_ENV_KEYS,
  formatMissingFirebasePublicEnv,
  getMissingFirebasePublicEnvVars,
  isFirebasePublicConfigured,
} from "@/lib/firebase/public-env";

export interface FirebasePublicConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
}

export function getFirebasePublicConfig(): FirebasePublicConfig | null {
  if (!isFirebasePublicConfigured()) return null;

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!.trim(),
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!.trim(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!.trim(),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!.trim(),
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!.trim(),
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!.trim(),
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!.trim(),
  };
}

/** @deprecated isFirebasePublicConfigured kullanın */
export function isFirebaseConfigured(): boolean {
  return isFirebasePublicConfigured();
}
