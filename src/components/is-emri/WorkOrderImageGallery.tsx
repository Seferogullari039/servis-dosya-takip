"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteWorkOrderImageAction } from "@/app/(dashboard)/is-emirleri/[id]/image-actions";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils/cn";
import type { WorkOrderImage } from "@/types/work-order-image";

function formatImageDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

interface WorkOrderImageGalleryProps {
  workOrderId: string;
  images: WorkOrderImage[];
  isAdmin?: boolean;
}

export function WorkOrderImageGallery({
  workOrderId,
  images,
  isAdmin = false,
}: WorkOrderImageGalleryProps) {
  const { toast } = useToast();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...images].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [images]
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) =>
          i === null ? null : (i + 1) % sorted.length
        );
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) =>
          i === null ? null : (i - 1 + sorted.length) % sorted.length
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, sorted.length, closeLightbox]);

  const handleDelete = async (imageId: string) => {
    if (!confirm("Bu görseli silmek istediğinize emin misiniz?")) return;
    setDeletingId(imageId);
    const result = await deleteWorkOrderImageAction(imageId, workOrderId);
    setDeletingId(null);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    toast("Görsel silindi.", "success");
    if (lightboxIndex !== null) closeLightbox();
  };

  if (sorted.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface-muted/30 px-4 py-6 text-center text-sm text-ink-muted">
        Henüz görsel yüklenmedi. Hasar ve ekspertiz fotoğraflarını yukarıdan
        ekleyebilirsiniz.
      </p>
    );
  }

  const active = lightboxIndex !== null ? sorted[lightboxIndex] : null;

  return (
    <>
      <div className="md:hidden -mx-1 overflow-x-auto pb-2">
        <div className="flex snap-x snap-mandatory gap-3 px-1">
          {sorted.map((img, index) => (
            <button
              key={img.id}
              type="button"
              className="w-[72vw] max-w-xs shrink-0 snap-center overflow-hidden rounded-xl border border-border bg-surface text-left shadow-sm"
              onClick={() => setLightboxIndex(index)}
            >
              <div className="relative aspect-[4/3] w-full bg-surface-muted">
                <Image
                  src={img.imageUrl}
                  alt={img.category}
                  fill
                  sizes="72vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-ink">{img.category}</p>
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  {formatImageDate(img.createdAt)}
                </p>
                {img.note ? (
                  <p className="mt-1 line-clamp-2 text-xs text-ink-muted">
                    {img.note}
                  </p>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 md:grid">
        {sorted.map((img, index) => (
          <button
            key={img.id}
            type="button"
            className="group overflow-hidden rounded-xl border border-border bg-surface text-left shadow-sm transition-shadow hover:shadow-md"
            onClick={() => setLightboxIndex(index)}
          >
            <div className="relative aspect-square w-full bg-surface-muted">
              <Image
                src={img.imageUrl}
                alt={img.category}
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                className="object-cover transition-transform group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
            <div className="space-y-0.5 p-2.5">
              <p className="text-xs font-semibold text-ink">{img.category}</p>
              <p className="text-[11px] text-ink-muted">
                {formatImageDate(img.createdAt)}
              </p>
              {img.note ? (
                <p className="line-clamp-2 text-[11px] text-ink-muted">
                  {img.note}
                </p>
              ) : null}
            </div>
          </button>
        ))}
      </div>

      {active && lightboxIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black">
              <Image
                src={active.imageUrl}
                alt={active.category}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-3 rounded-lg bg-surface p-4 text-ink">
              <p className="font-semibold">{active.category}</p>
              <p className="text-sm text-ink-muted">
                {formatImageDate(active.createdAt)}
              </p>
              {active.note ? (
                <p className="mt-2 text-sm">{active.note}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-10"
                  onClick={() =>
                    setLightboxIndex(
                      (lightboxIndex - 1 + sorted.length) % sorted.length
                    )
                  }
                >
                  ← Önceki
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-10"
                  onClick={() =>
                    setLightboxIndex((lightboxIndex + 1) % sorted.length)
                  }
                >
                  Sonraki →
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-10"
                  onClick={closeLightbox}
                >
                  Kapat
                </Button>
                {isAdmin ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "min-h-10 text-red-600 hover:bg-red-50",
                      deletingId === active.id && "opacity-50"
                    )}
                    disabled={deletingId === active.id}
                    onClick={() => handleDelete(active.id)}
                  >
                    Sil
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
