"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { guncelleAracDurumuAction } from "@/app/(dashboard)/is-emirleri/actions";
import { guncelleIsEmriKayitAction } from "@/app/(dashboard)/is-emirleri/[id]/actions";
import { IsEmriActionBar } from "@/components/is-emri/IsEmriActionBar";
import { IsEmriForm } from "@/components/is-emri/IsEmriForm";
import { WorkOrderHasarGorselleriSection } from "@/components/is-emri/WorkOrderHasarGorselleriSection";
import { VehicleStatusBadge } from "@/components/is-emri/VehicleStatusBadge";
import { WorkOrderPushDebugPanel } from "@/components/is-emri/WorkOrderPushDebugPanel";
import type {
  VehicleStatusPushDebug,
  WorkOrderSavePushDebug,
} from "@/types/push-debug";
import { useToast } from "@/components/ui/ToastProvider";
import { filterImagesForPdf } from "@/types/work-order-image";
import { downloadIsEmriPdf } from "@/lib/is-emri/pdf-download";
import { isEmriKayitToFormState } from "@/lib/data/map-work-order";
import type { IsEmriFormState, IsEmriKayit } from "@/types/is-emri";
import type { WorkOrderImage } from "@/types/work-order-image";
import type { AracDurumu } from "@/types/vehicle-status";

interface IsEmriDetayClientProps {
  kayit: IsEmriKayit;
  images: WorkOrderImage[];
  isAdmin?: boolean;
  autoPrint?: boolean;
}

export function IsEmriDetayClient({
  kayit,
  images,
  isAdmin = false,
  autoPrint = false,
}: IsEmriDetayClientProps) {
  const printRef = useRef<HTMLElement | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [savePushDebug, setSavePushDebug] =
    useState<WorkOrderSavePushDebug | null>(null);
  const [vehiclePushDebug, setVehiclePushDebug] =
    useState<VehicleStatusPushDebug | null>(null);

  const initialForm = useMemo(() => isEmriKayitToFormState(kayit), [kayit]);

  const printImages = useMemo(() => filterImagesForPdf(images), [images]);
  const imageUrls = useMemo(
    () => images.map((img) => img.imageUrl),
    [images]
  );

  useEffect(() => {
    if (searchParams.get("kaydedildi") === "1") {
      toast("İş emri başarıyla kaydedildi.", "success");
      const url = new URL(window.location.href);
      url.searchParams.delete("kaydedildi");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (autoPrint) {
      const t = window.setTimeout(() => window.print(), 400);
      return () => window.clearTimeout(t);
    }
  }, [autoPrint]);

  useEffect(() => {
    if (searchParams.get("pdf") !== "1") return;
    const el = printRef.current;
    if (!el) return;

    let cancelled = false;
    (async () => {
      try {
        await downloadIsEmriPdf({
          element: el,
          workOrderNo: kayit.isEmriNo,
        });
        if (!cancelled) toast("PDF indirildi.", "success");
      } catch (e) {
        if (!cancelled) {
          toast(
            e instanceof Error ? e.message : "PDF oluşturulamadı.",
            "error"
          );
        }
      } finally {
        const url = new URL(window.location.href);
        url.searchParams.delete("pdf");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, kayit.isEmriNo, toast]);

  const handleVehicleStatusPersist = useCallback(
    async (aracDurumu: AracDurumu): Promise<boolean> => {
      const result = await guncelleAracDurumuAction(kayit.id, aracDurumu);
      if (!result.ok) {
        toast(result.error ?? "Araç durumu kaydedilemedi.", "error");
        return false;
      }
      if (isAdmin && result.pushDebug) {
        setVehiclePushDebug(result.pushDebug);
      }
      toast(
        result.pushDebug?.sameValueNoPush
          ? "Aynı değer — push gönderilmedi."
          : "Araç durumu güncellendi.",
        result.pushDebug?.sameValueNoPush ? "info" : "success"
      );
      router.refresh();
      return true;
    },
    [isAdmin, kayit.id, router, toast]
  );

  const handleSave = useCallback(
    (form: IsEmriFormState) => {
      startTransition(async () => {
        const result = await guncelleIsEmriKayitAction(kayit.id, form);
        if (!result.ok) {
          toast(result.error ?? "Kayıt güncellenemedi.", "error");
          return;
        }
        if (isAdmin) {
          setSavePushDebug(result.pushDebug);
        }
        toast(
          result.pushDebug.sameValueNoPush
            ? "Kayıt aynı — push gönderilmedi."
            : "İş emri güncellendi.",
          result.pushDebug.sameValueNoPush ? "info" : "success"
        );
        router.refresh();
      });
    },
    [isAdmin, kayit.id, router, toast]
  );

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="no-print flex flex-wrap items-center gap-2">
        <VehicleStatusBadge durum={kayit.aracDurumu} />
      </div>
      <div className="no-print">
      <IsEmriActionBar
        workOrderId={kayit.id}
        workOrderNo={kayit.isEmriNo}
        phone={kayit.telefon}
        plaka={kayit.plaka}
        printRootRef={printRef}
        imageUrls={imageUrls}
      />
      <WorkOrderHasarGorselleriSection
        workOrderId={kayit.id}
        images={images}
        isAdmin={isAdmin}
      />
      {isAdmin ? (
        <WorkOrderPushDebugPanel
          saveDebug={savePushDebug}
          vehicleDebug={vehiclePushDebug}
        />
      ) : null}
      </div>
      <IsEmriForm
        mode="edit"
        initialForm={initialForm}
        workOrderId={kayit.id}
        workOrderNo={kayit.isEmriNo}
        printRef={printRef}
        printImages={printImages}
        autoPrint={false}
        onSave={handleSave}
        onVehicleStatusPersist={handleVehicleStatusPersist}
        saving={pending}
      />
    </div>
  );
}
