"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils/cn";

type ToastVariant = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  variant?: ToastVariant;
  durationMs?: number;
  action?: ToastAction;
}

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
}

interface ToastContextValue {
  toast: (message: string, variantOrOptions?: ToastVariant | ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-emerald-800 text-white",
  error: "bg-red-700 text-white",
  info: "bg-accent text-white",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variantOrOptions: ToastVariant | ToastOptions = "info") => {
      const options: ToastOptions =
        typeof variantOrOptions === "string"
          ? { variant: variantOrOptions }
          : variantOrOptions;

      const id = crypto.randomUUID();
      const variant = options.variant ?? "info";
      const durationMs = options.durationMs ?? 3500;

      setToasts((prev) => [
        ...prev,
        { id, message, variant, action: options.action },
      ]);

      const timer = setTimeout(() => dismiss(id), durationMs);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 left-4 right-4 z-[100] flex flex-col items-center gap-2 sm:left-auto sm:right-4 sm:items-end"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex max-w-sm flex-wrap items-center gap-2 rounded-lg px-4 py-3 text-sm shadow-lg",
              variantStyles[t.variant]
            )}
          >
            <span className="flex-1">{t.message}</span>
            {t.action ? (
              <button
                type="button"
                className="shrink-0 rounded-md bg-white/20 px-2.5 py-1 text-xs font-bold underline-offset-2 hover:bg-white/30 hover:underline"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast ToastProvider içinde kullanılmalıdır.");
  }
  return ctx;
}
