"use client";

import { formatMissingFirebasePublicEnv } from "@/lib/firebase/public-env";
import type { FirebasePublicEnvKey } from "@/lib/firebase/public-env";
import { cn } from "@/lib/utils/cn";

interface PushConfigDebugProps {
  publicFirebaseReady: boolean;
  missingPublicEnv: FirebasePublicEnvKey[];
  serverPushReady: boolean | null;
  className?: string;
}

export function PushConfigDebug({
  publicFirebaseReady,
  missingPublicEnv,
  serverPushReady,
  className,
}: PushConfigDebugProps) {
  return (
    <div className={cn("space-y-2 text-xs", className)}>
      <div className="rounded-lg border border-border bg-surface-muted px-2.5 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
        <p className="font-medium text-ink dark:text-zinc-200">
          Firebase public yapılandırması
        </p>
        {publicFirebaseReady ? (
          <p className="mt-1 text-emerald-700 dark:text-emerald-300">
            Firebase public yapılandırması hazır
          </p>
        ) : (
          <div className="mt-1 space-y-1.5 text-amber-800 dark:text-amber-200">
            <p>Eksik değişkenler: {formatMissingFirebasePublicEnv(missingPublicEnv)}</p>
            <ul className="list-inside list-disc pl-1">
              {missingPublicEnv.map((key) => (
                <li key={key}>
                  <code className="rounded bg-surface px-1 py-0.5 text-[10px] dark:bg-zinc-900">
                    {key}
                  </code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface-muted px-2.5 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
        <p className="font-medium text-ink dark:text-zinc-200">Sunucu push</p>
        {serverPushReady === null ? (
          <p className="mt-1 text-ink-muted dark:text-zinc-400">Kontrol ediliyor…</p>
        ) : serverPushReady ? (
          <p className="mt-1 text-emerald-700 dark:text-emerald-300">
            Sunucu push anahtarı hazır
          </p>
        ) : (
          <p className="mt-1 text-amber-800 dark:text-amber-200">
            Sunucu push anahtarı eksik
            <span className="mt-1 block font-normal text-ink-muted dark:text-zinc-400">
              (FIREBASE_SERVICE_ACCOUNT_JSON — yalnızca sunucu)
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
