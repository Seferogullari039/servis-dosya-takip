"use client";

import { WorkOrderImageGallery } from "@/components/is-emri/WorkOrderImageGallery";
import { WorkOrderImageUpload } from "@/components/is-emri/WorkOrderImageUpload";
import type { WorkOrderImage } from "@/types/work-order-image";

interface WorkOrderHasarGorselleriSectionProps {
  workOrderId: string;
  images: WorkOrderImage[];
  isAdmin?: boolean;
}

export function WorkOrderHasarGorselleriSection({
  workOrderId,
  images,
  isAdmin,
}: WorkOrderHasarGorselleriSectionProps) {
  return (
    <section className="no-print space-y-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div>
        <h2 className="text-base font-semibold text-ink">Hasar görsel yönetimi</h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          Hasar, araç genel, ekspertiz ve parça fotoğrafları — mobil kamera destekli.
        </p>
      </div>
      <WorkOrderImageUpload workOrderId={workOrderId} />
      <WorkOrderImageGallery
        workOrderId={workOrderId}
        images={images}
        isAdmin={isAdmin}
      />
    </section>
  );
}
