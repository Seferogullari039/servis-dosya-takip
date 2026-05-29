"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useToast } from "@/components/ui/ToastProvider";
import {
  getMissingFirebasePublicEnvVars,
  type FirebasePublicEnvKey,
} from "@/lib/firebase/public-env";
import {
  readPushClientDiagnostics,
  type PushClientDiagnostics,
} from "@/lib/push/client-diagnostics";
import { enablePushNotifications } from "@/lib/push/enable-push";
import { subscribeForegroundMessages } from "@/lib/firebase/client";
import type { EnablePushResult } from "@/lib/push/enable-push";
import type {
  PushDashboardStatus,
  PushLastPushDisplay,
  PushStatusApiResponse,
} from "@/types/push";

export type PushBellStatus = "active" | "off" | "unsupported";

interface PushNotificationContextValue {
  publicFirebaseReady: boolean;
  missingPublicEnv: FirebasePublicEnvKey[];
  serverPushReady: boolean | null;
  subscriptionCount: number;
  teamTokenCount: number;
  tokenRegistered: boolean;
  unreadCount: number;
  diagnostics: PushClientDiagnostics;
  bellStatus: PushBellStatus;
  enabling: boolean;
  lastPushResult: PushLastPushDisplay | null;
  enableNotifications: () => Promise<EnablePushResult>;
  refreshDiagnostics: () => void;
  refreshPushStatus: () => Promise<void>;
  setLastPushResult: (result: PushLastPushDisplay | null) => void;
}

const PushNotificationContext = createContext<PushNotificationContextValue | null>(
  null
);

export function usePushNotifications(): PushNotificationContextValue {
  const ctx = useContext(PushNotificationContext);
  if (!ctx) {
    throw new Error("usePushNotifications PushNotificationProvider içinde kullanılmalı");
  }
  return ctx;
}

interface PushNotificationProviderProps {
  initial: PushDashboardStatus;
  children: React.ReactNode;
}

export function PushNotificationProvider({
  initial,
  children,
}: PushNotificationProviderProps) {
  const { toast } = useToast();
  const [subscriptionCount, setSubscriptionCount] = useState(
    initial.subscriptionCount
  );
  const [teamTokenCount, setTeamTokenCount] = useState(initial.teamTokenCount);
  const [tokenRegistered, setTokenRegistered] = useState(initial.tokenRegistered);
  const [lastPushResult, setLastPushResult] = useState<PushLastPushDisplay | null>(
    null
  );
  const [enabling, setEnabling] = useState(false);
  const [missingPublicEnv, setMissingPublicEnv] = useState<
    FirebasePublicEnvKey[]
  >(initial.missingPublicEnv as FirebasePublicEnvKey[]);
  const [serverPushReady, setServerPushReady] = useState<boolean | null>(
    initial.serverPushReady
  );

  const publicFirebaseReady = missingPublicEnv.length === 0;

  const [diagnostics, setDiagnostics] = useState(() =>
    readPushClientDiagnostics(
      initial.subscriptionCount,
      initial.publicFirebaseReady
    )
  );

  const refreshDiagnostics = useCallback(() => {
    setDiagnostics(
      readPushClientDiagnostics(subscriptionCount, publicFirebaseReady)
    );
  }, [subscriptionCount, publicFirebaseReady]);

  const refreshPushStatus = useCallback(async () => {
    const clientMissing = getMissingFirebasePublicEnvVars();
    setMissingPublicEnv(clientMissing);

    try {
      const res = await fetch("/api/push/status", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as PushStatusApiResponse;
      setMissingPublicEnv(data.missingPublicEnv as FirebasePublicEnvKey[]);
      setServerPushReady(data.serverPushReady);
      setSubscriptionCount(data.subscriptionCount);
      setTeamTokenCount(data.teamTokenCount);
      setTokenRegistered(data.tokenRegistered);
    } catch {
      /* ignore */
    }
  }, []);

  const bellStatus: PushBellStatus = useMemo(() => {
    if (!publicFirebaseReady || diagnostics.permission === "unsupported") {
      return "unsupported";
    }
    if (diagnostics.tokenRegistered) return "active";
    return "off";
  }, [publicFirebaseReady, diagnostics]);

  const enableNotifications = useCallback(async () => {
    setEnabling(true);
    try {
      const result = await enablePushNotifications();
      refreshDiagnostics();
      if (result.ok) {
        setSubscriptionCount((c) => Math.max(1, c + 1));
        toast("Bildirimler aktif", "success");
        void refreshPushStatus();
      }
      return result;
    } finally {
      setEnabling(false);
    }
  }, [refreshDiagnostics, refreshPushStatus, toast]);

  useEffect(() => {
    if (!publicFirebaseReady) return;
    const unsub = subscribeForegroundMessages((payload) => {
      toast(`${payload.title}: ${payload.body}`, "success");
      if (payload.url && typeof window !== "undefined") {
        const path = payload.url.startsWith("/")
          ? payload.url
          : `/${payload.url}`;
        window.setTimeout(() => {
          window.location.href = path;
        }, 800);
      }
    });
    return () => unsub?.();
  }, [publicFirebaseReady, toast]);

  useEffect(() => {
    refreshDiagnostics();
  }, [refreshDiagnostics, subscriptionCount, publicFirebaseReady]);

  useEffect(() => {
    void refreshPushStatus();
  }, [refreshPushStatus]);

  const value = useMemo(
    () => ({
      publicFirebaseReady,
      missingPublicEnv,
      serverPushReady,
      subscriptionCount,
      teamTokenCount,
      tokenRegistered,
      unreadCount: 0,
      diagnostics,
      bellStatus,
      enabling,
      lastPushResult,
      enableNotifications,
      refreshDiagnostics,
      refreshPushStatus,
      setLastPushResult,
    }),
    [
      publicFirebaseReady,
      missingPublicEnv,
      serverPushReady,
      subscriptionCount,
      teamTokenCount,
      tokenRegistered,
      diagnostics,
      bellStatus,
      enabling,
      lastPushResult,
      enableNotifications,
      refreshDiagnostics,
      refreshPushStatus,
    ]
  );

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
}
