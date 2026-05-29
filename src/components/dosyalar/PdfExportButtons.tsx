"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/DataState";
import { Card } from "@/components/ui/Card";

type PdfExportKind = "summary" | "operation";

interface PdfExportButtonsProps {
  serviceFileId: string;
  dosyaNo: string;
}

export function PdfExportButtons({
  serviceFileId,
  dosyaNo,
}: PdfExportButtonsProps) {
  const [loading, setLoading] = useState<PdfExportKind | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function generatePdf(kind: PdfExportKind, download: boolean) {
    setLoading(kind);
    setError(null);
    setProgress(15);

    try {
      const path =
        kind === "summary"
          ? `/api/pdf/summary/${serviceFileId}`
          : `/api/pdf/operation/${serviceFileId}`;

      setProgress(40);
      const response = await fetch(path);

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            (body as { error?: string }).error ?? "Yetkisiz erişim."
          );
        }
        if (response.status === 404) {
          throw new Error("Servis dosyası bulunamadı.");
        }
        throw new Error(
          (body as { error?: string }).error ?? "PDF oluşturulamadı."
        );
      }

      setProgress(75);
      const blob = await response.blob();
      const safeNo = dosyaNo.replace(/\s+/g, "-");
      const filename =
        kind === "summary"
          ? `servis-dosyasi-${safeNo}.pdf`
          : `servis-dosyasi-${safeNo}-operasyon.pdf`;

      const url = URL.createObjectURL(blob);
      setProgress(100);

      if (download) {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF oluşturulamadı.");
      setProgress(0);
    } finally {
      setLoading(null);
      setTimeout(() => setProgress(0), 600);
    }
  }

  const busy = loading !== null;

  return (
    <Card className="p-4">
      <p className="text-sm font-semibold text-ink">PDF Oluştur</p>
      <p className="mt-1 text-xs text-ink-muted">
        A4 formatında yazdırılabilir rapor (Türkçe karakter destekli)
      </p>

      {error && (
        <div className="mt-3">
          <ErrorState title="PDF hatası" description={error} />
        </div>
      )}

      {busy && (
        <div className="mt-3 space-y-1">
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${Math.max(progress, 20)}%` }}
            />
          </div>
          <p className="text-xs text-ink-muted">
            PDF oluşturuluyor…
            {loading === "summary" ? " (Servis Özeti)" : " (Operasyon)"}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          className="flex-1 sm:flex-none"
          onClick={() => generatePdf("summary", false)}
        >
          {loading === "summary" ? "Oluşturuluyor…" : "Servis Özeti PDF"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          className="flex-1 sm:flex-none"
          onClick={() => generatePdf("operation", false)}
        >
          {loading === "operation" ? "Oluşturuluyor…" : "Operasyon PDF"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          className="flex-1 text-sm sm:flex-none"
          onClick={() => generatePdf("summary", true)}
        >
          Özeti İndir
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          className="flex-1 text-sm sm:flex-none"
          onClick={() => generatePdf("operation", true)}
        >
          Operasyonu İndir
        </Button>
      </div>
    </Card>
  );
}
