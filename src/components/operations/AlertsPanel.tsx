"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getAlertsSummaryAction } from "@/app/(dashboard)/dosyalar/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { AlertSummary } from "@/types/operations";

export function AlertsPanel() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertSummary | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getAlertsSummaryAction();
      setAlerts(data);
    });
  }, []);

  const total = alerts?.total ?? 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-muted",
          total > 0 &&
            "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200"
        )}
        aria-label="Uyarılar"
      >
        Uyarılar
        {total > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Kapat"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-surface p-4 shadow-lg dark:shadow-xl dark:shadow-black/40">
            <p className="mb-3 font-semibold text-ink">Operasyon Uyarıları</p>
            {!alerts ? (
              <p className="text-sm text-ink-muted">Yükleniyor…</p>
            ) : alerts.total === 0 ? (
              <p className="text-sm text-ink-muted">Aktif uyarı yok.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {alerts.kritikCount > 0 && (
                  <li className="rounded-lg bg-red-100 px-3 py-2 text-red-900 dark:bg-red-950 dark:text-red-200">
                    <strong>{alerts.kritikCount}</strong> kritik gecikme (14+ gün)
                  </li>
                )}
                {alerts.riskCount > 0 && (
                  <li className="rounded-lg bg-red-50 px-3 py-2 text-red-800 dark:bg-red-950/80 dark:text-red-300">
                    <strong>{alerts.riskCount}</strong> risk gecikmesi (7+ gün)
                  </li>
                )}
                {alerts.odemeGecikmeCount > 0 && (
                  <li className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200">
                    <strong>{alerts.odemeGecikmeCount}</strong> ödeme bekleyen
                  </li>
                )}
              </ul>
            )}
            <Link href="/ozet" className="mt-3 block">
              <Button variant="secondary" fullWidth onClick={() => setOpen(false)}>
                Dashboard&apos;a git
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
