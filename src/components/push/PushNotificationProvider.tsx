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
  readPushClientDiagnostics,
  type PushClientDiagnostics,
} from "@/lib/push/client-diagnostics";
import { enablePushNotifications } from "@/lib/push/enable-push";
import { subscribeForegroundMessages } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { EnablePushResult } from "@/lib/push/enable-push";
import type { PushDashboardStatus } from "@/types/push";

export type PushBellStatus = "active" | "off" | "unsupported";

interface PushNotificationContextValue {
  firebaseConfigured: boolean;
  subscriptionCount: number;
  unreadCount: number;
  diagnostics: PushClientDiagnostics;
  bellStatus: PushBellStatus;
  enabling: boolean;
  enableNotifications: () => Promise<EnablePushResult>;
  refreshDiagnostics: () => void;
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
  const [enabling, setEnabling] = useState(false);

  const firebaseConfigured =
    initial.firebaseConfigured || isFirebaseConfigured();

  const [diagnostics, setDiagnostics] = useState(() =>
    readPushClientDiagnostics(initial.subscriptionCount, initial.firebaseConfigured)
  );

  const refreshDiagnostics = useCallback(() => {
    setDiagnostics(
      readPushClientDiagnostics(subscriptionCount, firebaseConfigured)
    );
  }, [subscriptionCount, firebaseConfigured]);

  const bellStatus: PushBellStatus = useMemo(() => {
    if (!firebaseConfigured || diagnostics.permission === "unsupported") {
      return "unsupported";
    }
    if (diagnostics.tokenRegistered) return "active";
    return "off";
  }, [firebaseConfigured, diagnostics]);

  const enableNotifications = useCallback(async () => {
    setEnabling(true);
    try {
      const result = await enablePushNotifications();
      refreshDiagnostics();
      if (result.ok) {
        setSubscriptionCount((c) => Math.max(1, c + 1));
        toast("Bildirimler aktif", "success");
      }
      return result;
    } finally {
      setEnabling(false);
    }
  }, [refreshDiagnostics, toast]);

  useEffect(() => {
    if (!firebaseConfigured) return;
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
  }, [firebaseConfigured, toast]);

  useEffect(() => {
    refreshDiagnostics();
  }, [refreshDiagnostics, subscriptionCount, firebaseConfigured]);

  const value = useMemo(
    () => ({
      firebaseConfigured,
      subscriptionCount,
      unreadCount: 0,
      diagnostics,
      bellStatus,
      enabling,
      enableNotifications,
      refreshDiagnostics,
    }),
    [
      firebaseConfigured,
      subscriptionCount,
      diagnostics,
      bellStatus,
      enabling,
      enableNotifications,
      refreshDiagnostics,
    ]
  );

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
}
