"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { downloadIsEmriPdf } from "@/lib/is-emri/pdf-download";
import { buildIsEmriWhatsAppUrl } from "@/lib/is-emri/whatsapp";
import { cn } from "@/lib/utils/cn";

interface IsEmriActionBarProps {
  workOrderId: string;
  workOrderNo: string;
  phone: string;
  plaka: string;
  printRootRef: React.RefObject<HTMLElement | null>;
  imageUrls?: string[];
  className?: string;
}

export function IsEmriActionBar({
  workOrderId,
  workOrderNo,
  phone,
  plaka,
  printRootRef,
  imageUrls = [],
  className,
}: IsEmriActionBarProps) {
  const { toast } = useToast();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  const handlePrint = () => window.print();

  const handlePdf = useCallback(async () => {
    const el = printRootRef.current;
    if (!el) {
      toast("Form alanı bulunamadı.", "error");
      return;
    }
    setPdfLoading(true);
    setPdfProgress(5);
    try {
      await downloadIsEmriPdf({
        element: el,
        workOrderNo,
        onProgress: setPdfProgress,
      });
      toast("PDF indirildi.", "success");
    } catch (e) {
      toast(
        e instanceof Error ? e.message : "PDF oluşturulamadı.",
        "error"
      );
    } finally {
      setPdfLoading(false);
      setTimeout(() => setPdfProgress(0), 500);
    }
  }, [printRootRef, toast, workOrderNo]);

  const handleWhatsApp = () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const detailUrl = `${origin}/is-emirleri/${workOrderId}`;
    const pdfUrl = `${detailUrl}?pdf=1`;
    const url = buildIsEmriWhatsAppUrl({
      phone,
      workOrderNo,
      plaka,
      detailUrl,
      pdfUrl,
      imageUrls,
    });
    if (!url) {
      toast("Geçerli bir müşteri telefonu girin.", "error");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "no-print rounded-xl border border-border bg-surface p-4 shadow-sm",
        className
      )}
    >
      <p className="text-sm font-semibold text-ink">İşlemler</p>
      <p className="mt-0.5 text-xs text-ink-muted">
        Yazdır, PDF indir veya WhatsApp ile paylaşın.
      </p>

      {pdfLoading ? (
        <div className="mt-3 space-y-1">
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${Math.max(pdfProgress, 15)}%` }}
            />
          </div>
          <p className="text-xs text-ink-muted">PDF oluşturuluyor…</p>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button
          type="button"
          variant="secondary"
          className="col-span-1 min-h-11"
          disabled={pdfLoading}
          onClick={handlePrint}
        >
          Yazdır
        </Button>
        <Button
          type="button"
          className="col-span-1 min-h-11"
          disabled={pdfLoading}
          onClick={handlePdf}
        >
          {pdfLoading ? "PDF…" : "PDF İndir"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="col-span-2 min-h-11 sm:col-span-1"
          disabled={pdfLoading}
          onClick={handleWhatsApp}
        >
          WhatsApp Gönder
        </Button>
        <Link href="/is-emirleri" className="col-span-2 sm:col-span-1">
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-full text-sm"
            disabled={pdfLoading}
          >
            ← Liste
          </Button>
        </Link>
      </div>
    </div>
  );
}
