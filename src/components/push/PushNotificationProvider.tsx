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
import {
  readLocalFcmToken,
  readNotificationPermission,
  regeneratePushToken,
} from "@/lib/push/client-token";
import { enablePushNotifications } from "@/lib/push/enable-push";
import {
  buildPushTokenDebugState,
  type PushTokenDebugState,
} from "@/lib/push/token-debug";
import { subscribeForegroundMessages } from "@/lib/firebase/client";
import {
  readFcmServiceWorkerDebug,
  type FcmServiceWorkerDebug,
} from "@/lib/push/fcm-sw-debug";
import type { EnablePushResult } from "@/lib/push/enable-push";
import type {
  PushDashboardStatus,
  PushLastPushDisplay,
  PushRegisterApiResponse,
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
  serviceRoleAvailable: boolean;
  unreadCount: number;
  diagnostics: PushClientDiagnostics;
  bellStatus: PushBellStatus;
  enabling: boolean;
  regenerating: boolean;
  tokenDebug: PushTokenDebugState;
  lastPushResult: PushLastPushDisplay | null;
  lastRegisterResponse: PushRegisterApiResponse | null;
  setLastRegisterResponse: (response: PushRegisterApiResponse | null) => void;
  enableNotifications: () => Promise<EnablePushResult>;
  regenerateToken: () => Promise<EnablePushResult>;
  refreshDiagnostics: () => void;
  refreshPushStatus: () => Promise<PushStatusApiResponse | null>;
  refreshTokenDebug: () => Promise<PushTokenDebugState>;
  refreshFcmSwDebug: () => Promise<FcmServiceWorkerDebug>;
  fcmSwDebug: FcmServiceWorkerDebug;
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
  const [lastRegisterResponse, setLastRegisterResponse] =
    useState<PushRegisterApiResponse | null>(null);
  const [enabling, setEnabling] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [tokenDebug, setTokenDebug] = useState<PushTokenDebugState>(() =>
    buildPushTokenDebugState({
      permission: "default",
      localToken: null,
      dbSubscriptionCount: initial.subscriptionCount,
      teamTokenCount: initial.teamTokenCount,
      publicFirebaseReady: initial.publicFirebaseReady,
      serviceRoleAvailable: initial.serviceRoleAvailable,
    })
  );
  const [missingPublicEnv, setMissingPublicEnv] = useState<
    FirebasePublicEnvKey[]
  >(initial.missingPublicEnv as FirebasePublicEnvKey[]);
  const [serverPushReady, setServerPushReady] = useState<boolean | null>(
    initial.serverPushReady
  );
  const [serviceRoleAvailable, setServiceRoleAvailable] = useState(
    initial.serviceRoleAvailable
  );
  const [registerApiError, setRegisterApiError] = useState<string | null>(null);
  const [fcmSwDebug, setFcmSwDebug] = useState<FcmServiceWorkerDebug>(() => ({
    fcmSwReachable: false,
    fcmMessagingSwRegistered: false,
    fcmMessagingSwScriptUrl: null,
    controllingSwScriptUrl: null,
    pushHandlerInWorkboxSw: false,
    lastBackgroundPayload: null,
    lastBackgroundReadError: null,
  }));

  const publicFirebaseReady = missingPublicEnv.length === 0;

  const refreshFcmSwDebug = useCallback(async () => {
    const debug = await readFcmServiceWorkerDebug();
    setFcmSwDebug(debug);
    return debug;
  }, []);

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

  const refreshPushStatus = useCallback(async (): Promise<PushStatusApiResponse | null> => {
    const clientMissing = getMissingFirebasePublicEnvVars();
    setMissingPublicEnv(clientMissing);

    try {
      const res = await fetch("/api/push/status", { cache: "no-store" });
      if (!res.ok) return null;
      const data = (await res.json()) as PushStatusApiResponse;
      setMissingPublicEnv(data.missingPublicEnv as FirebasePublicEnvKey[]);
      setServerPushReady(data.serverPushReady);
      setSubscriptionCount(data.subscriptionCount);
      setTeamTokenCount(data.teamTokenCount);
      setTokenRegistered(data.tokenRegistered);
      setServiceRoleAvailable(data.serviceRoleAvailable);
      return data;
    } catch {
      return null;
    }
  }, []);

  const refreshTokenDebug = useCallback(async (): Promise<PushTokenDebugState> => {
    const status = await refreshPushStatus();
    const dbCount = status?.subscriptionCount ?? subscriptionCount;
    const team = status?.teamTokenCount ?? teamTokenCount;
    const srAvailable = status?.serviceRoleAvailable ?? serviceRoleAvailable;
    const permission = readNotificationPermission();
    const { token } = await readLocalFcmToken();
    const ready = getMissingFirebasePublicEnvVars().length === 0;
    const next = buildPushTokenDebugState({
      permission,
      localToken: token,
      dbSubscriptionCount: dbCount,
      teamTokenCount: team,
      publicFirebaseReady: ready,
      serviceRoleAvailable: srAvailable,
      registerApiError,
    });
    setTokenDebug(next);
    return next;
  }, [
    refreshPushStatus,
    subscriptionCount,
    teamTokenCount,
    serviceRoleAvailable,
    registerApiError,
  ]);

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
        setRegisterApiError(null);
        if (result.registerApi) setLastRegisterResponse(result.registerApi);
        setSubscriptionCount((c) => Math.max(1, c + 1));
        toast("Bildirimler aktif", "success");
        await refreshTokenDebug();
      } else {
        if (result.registerApi) setLastRegisterResponse(result.registerApi);
        if (result.registerErrorDetail) {
          setRegisterApiError(result.registerErrorDetail);
        }
        await refreshTokenDebug();
      }
      return result;
    } finally {
      setEnabling(false);
    }
  }, [refreshDiagnostics, refreshTokenDebug, toast]);

  const regenerateToken = useCallback(async () => {
    setRegenerating(true);
    try {
      const result = await regeneratePushToken();
      refreshDiagnostics();
      if (result.ok) {
        setRegisterApiError(null);
        if (result.registerApi) setLastRegisterResponse(result.registerApi);
        setSubscriptionCount((c) => Math.max(1, c));
        await refreshTokenDebug();
      } else {
        if (result.registerApi) setLastRegisterResponse(result.registerApi);
        setRegisterApiError(result.registerErrorDetail ?? result.message);
        await refreshTokenDebug();
      }
      return result;
    } finally {
      setRegenerating(false);
    }
  }, [refreshDiagnostics, refreshTokenDebug]);

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
    void refreshTokenDebug();
  }, [refreshTokenDebug]);

  useEffect(() => {
    void refreshFcmSwDebug();
  }, [refreshFcmSwDebug]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshFcmSwDebug();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshFcmSwDebug]);

  const value = useMemo(
    () => ({
      publicFirebaseReady,
      missingPublicEnv,
      serverPushReady,
      subscriptionCount,
      teamTokenCount,
      tokenRegistered,
      serviceRoleAvailable,
      unreadCount: 0,
      diagnostics,
      bellStatus,
      enabling,
      regenerating,
      tokenDebug,
      lastPushResult,
      lastRegisterResponse,
      setLastRegisterResponse,
      enableNotifications,
      regenerateToken,
      refreshDiagnostics,
      refreshPushStatus,
      refreshTokenDebug,
      refreshFcmSwDebug,
      fcmSwDebug,
      setLastPushResult,
    }),
    [
      publicFirebaseReady,
      missingPublicEnv,
      serverPushReady,
      subscriptionCount,
      teamTokenCount,
      tokenRegistered,
      serviceRoleAvailable,
      diagnostics,
      bellStatus,
      enabling,
      regenerating,
      tokenDebug,
      lastPushResult,
      lastRegisterResponse,
      enableNotifications,
      regenerateToken,
      refreshDiagnostics,
      refreshPushStatus,
      refreshTokenDebug,
      refreshFcmSwDebug,
      fcmSwDebug,
    ]
  );

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
}
