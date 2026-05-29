"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils/cn";

type BackupKey = "dosyalar" | "is-emirleri" | "tedarik" | "gorseller" | "tum";

const LAST_DOWNLOAD_KEY = "yedekleme-last-download";

interface BackupCardConfig {
  key: BackupKey;
  title: string;
  description: string;
  endpoint: string;
  filenameHint: string;
}

const cards: BackupCardConfig[] = [
  {
    key: "dosyalar",
    title: "Dosyalar",
    description: "Servis dosyaları CSV (dosya no, plaka, müşteri, durum, ödeme, tutarlar)",
    endpoint: "/api/backup/dosyalar",
    filenameHint: "dosyalar-YYYY-MM-DD.csv",
  },
  {
    key: "is-emirleri",
    title: "İş Emirleri",
    description: "İş emri listesi CSV (no, müşteri, plaka, araç durumu, toplam tutar)",
    endpoint: "/api/backup/is-emirleri",
    filenameHint: "is-emirleri-YYYY-MM-DD.csv",
  },
  {
    key: "tedarik",
    title: "Tedarik",
    description: "Parça / tedarik satırları CSV",
    endpoint: "/api/backup/tedarik",
    filenameHint: "tedarik-YYYY-MM-DD.csv",
  },
  {
    key: "gorseller",
    title: "Görsel Kayıtları",
    description: "İş emri hasar görselleri meta listesi CSV",
    endpoint: "/api/backup/gorseller",
    filenameHint: "gorsel-kayitlari-YYYY-MM-DD.csv",
  },
  {
    key: "tum",
    title: "Tüm Veriler (JSON)",
    description: "Dosyalar, iş emirleri, tedarik ve görseller tek JSON paketi",
    endpoint: "/api/backup/tum",
    filenameHint: "tum-yedek-YYYY-MM-DD.json",
  },
];

function readLastDownloads(): Partial<Record<BackupKey, string>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LAST_DOWNLOAD_KEY);
    return raw ? (JSON.parse(raw) as Partial<Record<BackupKey, string>>) : {};
  } catch {
    return {};
  }
}

function formatLastDownload(iso: string | undefined): string {
  if (!iso) return "Henüz indirilmedi";
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

async function downloadFromApi(endpoint: string): Promise<{
  ok: boolean;
  error?: string;
  filename?: string;
}> {
  const res = await fetch(endpoint);
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: data.error ?? "İndirme başarısız." };
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? "yedek";

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  return { ok: true, filename };
}

export function YedeklemeClient() {
  const { toast } = useToast();
  const [loadingKey, setLoadingKey] = useState<BackupKey | null>(null);
  const [lastDownloads, setLastDownloads] = useState<
    Partial<Record<BackupKey, string>>
  >({});

  useEffect(() => {
    setLastDownloads(readLastDownloads());
  }, []);

  const handleDownload = useCallback(
    async (card: BackupCardConfig) => {
      setLoadingKey(card.key);
      try {
        const result = await downloadFromApi(card.endpoint);
        if (!result.ok) {
          toast(result.error ?? "Yedek indirilemedi.", "error");
          return;
        }

        const next = {
          ...readLastDownloads(),
          [card.key]: new Date().toISOString(),
        };
        localStorage.setItem(LAST_DOWNLOAD_KEY, JSON.stringify(next));
        setLastDownloads(next);
        toast("Yedek dosyası hazırlandı.", "success");
      } finally {
        setLoadingKey(null);
      }
    },
    [toast]
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <Card
          key={card.key}
          className={cn(
            "flex flex-col gap-4 border-border/80 p-5",
            "dark:border-zinc-700/80 dark:bg-zinc-900/40"
          )}
        >
          <div>
            <h2 className="text-base font-semibold text-ink dark:text-zinc-100">
              {card.title}
            </h2>
            <p className="mt-1 text-sm text-ink-muted dark:text-zinc-400">
              {card.description}
            </p>
            <p className="mt-2 font-mono text-[11px] text-ink-faint dark:text-zinc-500">
              {card.filenameHint}
            </p>
          </div>

          <p className="text-xs text-ink-muted dark:text-zinc-500">
            Son indirme: {formatLastDownload(lastDownloads[card.key])}
          </p>

          <Button
            type="button"
            variant={card.key === "tum" ? "primary" : "secondary"}
            className="mt-auto w-full sm:w-auto"
            disabled={loadingKey !== null}
            onClick={() => handleDownload(card)}
          >
            {loadingKey === card.key ? "Hazırlanıyor…" : "İndir"}
          </Button>
        </Card>
      ))}
    </div>
  );
}
